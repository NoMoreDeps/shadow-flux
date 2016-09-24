/**
 * The MIT License (MIT)
 * Copyright (c) <2016> <Beewix>
 * Author <François Skorzec>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT
 * OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Import declarations
 */
import {Promise}          from "es6-promise"          ;
import {Store}            from "../Utils/Store"       ;
import {Action}           from "../Utils/Action"      ;
import {Guid}             from "shadow-lib/Text/Guid" ; // Shadow Guid Module

export type traceType = {
  action: Action,
  stores: Array<{
    token: string;
    trace: Object;
    state: Object;
  }>;
}

/**@module Flux */
/**
 * This class aims to handle action dispatch to stores, and ensure that stores are updated in an ordered or unordered way
 * @class Dispatcher
 * @md
 */
export class Dispatcher {
  protected storesHandlerPool : Array<(payload: Action, success: () => void, error: (error: Error) => void) => void>;
  protected storesPoolMap     : {[index: string]: number};
  protected storesMap         : {[index: string]: Store<any>};
  protected actions           : Array<Action>;
  protected withTrace         : boolean;
  protected storeTraces       : Array<Store<Object>>;

  protected _isDispatching    : boolean;
  protected bufferedActions   : Array<Action>;

  protected disptachStoreProcessList: {[index: string]: Promise<void> | number};

  /**
   * @constructor
   * @md
   */
  constructor(withTrace: boolean = false) {
    this.storesHandlerPool = []        ;
    this.storesPoolMap     = {}        ;
    this._isDispatching    = false     ;
    this.bufferedActions   = []        ;
    this.actions           = []        ;
    this.withTrace         = withTrace ;
    this.storeTraces       = []        ;
    this.storesMap         = {}        ;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload.
   * Returns a token that can be used with waitFor().
   * @method register<T>
   * @param {T} store The store instance
   * @param {string} id The id to use. By default, a new Guid will be generated
   * @return {string} The Id
   * @md
   */
  register<T>(store: Store<T>, id?: string): string {
    let storeIdx = this.storesHandlerPool.push(store.dispatchHandler.bind(store)) - 1;
    let guid     = id || new Guid().toString();

    this.storesPoolMap[guid] = storeIdx       ;
    store["_tokenId"]    = guid           ;
    store["_dispatcher"] = this           ;
    store["_withTrace"]  = this.withTrace ;

    this.storesMap[store.tokenId] = store;

    if (this.withTrace) {
      this.storeTraces.push(store);
    }

    return guid;
  }

  getStoreFromTokenId<T>(id: string): T  {
    return (<any>this.storesMap[id]) as T;
  }

  getTraces(): Array<traceType> {
    let res: Array<traceType> = [];
    let i = 0;
    for (let action of this.actions) {
      let trace = {} as traceType;

      trace["action"] = action;
      trace["stores"] = [];

      this.storeTraces.forEach(store => {
        trace["stores"].push({
          token: store.tokenId,
          trace: store["_states"][i],
          state: store["_states"][i + 1] || store["_state"]
        });
      });

      res.push(trace);
    }

    return res;
  }

  // Removes a callback based on its token.
  unregister(id: string): void {
    if (id in this.storesPoolMap) {
      delete this.storesHandlerPool[this.storesPoolMap[id]];
      delete this.storesPoolMap[id];
      delete this.storesMap[id];
      this.storesHandlerPool = this.storesHandlerPool.filter( itm => itm !== void 0);
    }
  }

  // Waits for the callbacks specified to be invoked before continuing execution of the current callback.
  // This method should only be used by a callback in response to a dispatched payload.
  waitFor(ids: Array<string>, action: Action): Promise<void> {
    let pmsList = ids.map<Promise<void>>((tokenId: string) => {
      let res = this.getPromiseFromProcessList(tokenId, action);
      if (res === void 0) {
          res = new Promise<void>((r, x) => {
          console.log("Error", "no token found named", tokenId);
        });
      }
      return res;
    });

    return new Promise<void>( (r, x) => {
      Promise.all(pmsList)
        .then( () => {
          console.log("Promise All has been resolved for ids", ids);
          r();
        });
    });
  }

  private getPromiseFromProcessList(index: string, action: Action): Promise<void> {
    if (typeof(this.disptachStoreProcessList[index]) === "number") {
      let bindedHandler = this.storesHandlerPool[this.storesPoolMap[index]];
      this.disptachStoreProcessList[index] = new Promise<void>((rc, xc) => {
        bindedHandler(action, rc, xc);
      });
    }

    return this.disptachStoreProcessList[index] as Promise<void>;
  }

  private createProcessList(action: Action): Promise<void> {
   return new Promise<void>((r, x) => {
      this.disptachStoreProcessList = {};
      Object.keys(this.storesPoolMap).forEach((index) => {
        this.disptachStoreProcessList[index] = this.storesPoolMap[index];
      });
      r();
    });
  }

  private disptachAction(action: Action) {
    if (this.withTrace) {
      this.actions.push(action);
    }
    this.createProcessList(action).then(() => {

      let pmsList = [] as Array<Promise<void>>;
      Object.keys(this.storesPoolMap).forEach((index) => {
        pmsList.push(this.getPromiseFromProcessList(index, action));
      });

      Promise.all(pmsList).then(() => {
        if (this.bufferedActions.length === 0) {
          console.log("All actions has been solved");
          this._isDispatching = false;
        } else {
          console.log("Current action is solved, but there is another one");
          this.disptachAction(this.bufferedActions.shift());
        }
      }).catch(ex => {
        console.error(ex);
      });
    });
  }

  //  a payload to all registered callbacks.
  dispatch<T>(action: Action & T): void {
    this.bufferedActions.push(action);
    if (!this._isDispatching) {
      this._isDispatching = true;
      this.disptachAction(this.bufferedActions.shift());
    }
  }

  // Is this Dispatcher currently dispatching.
  isDispatching(): boolean {
    return this._isDispatching;
  }
}
/**@endClass */
/**@endModule */
