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
import {BaseStore}        from "../Utils/Store"       ;
import {Action}           from "../Utils/Action"      ;
import * as ShadowLib     from "shadow-lib" ; // Shadow Guid Module
import Guid = ShadowLib.Text.Guid;

/**
 * Defines the trace type
 * @type TraceType
 * @field {Action} action The current action
 */
export type TraceType = {
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
  protected storesMap         : {[index: string]: BaseStore<any>};
  protected actions           : Array<Action>;
  protected withTrace         : boolean;
  protected storeTraces       : Array<BaseStore<Object>>;

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
  register(store: BaseStore<any>, id?: string): string {
    let storeIdx = this.storesHandlerPool.push(store.dispatchHandler.bind(store)) - 1;
    let guid     = id || new Guid().toString();

    this.storesPoolMap[guid] = storeIdx   ;
    store["_tokenId"]    = guid           ;
    store["_dispatcher"] = this           ;
    store["_withTrace"]  = this.withTrace ;

    this.storesMap[store.tokenId] = store;

    if (this.withTrace) {
      this.storeTraces.push(store);
    }

    return guid;
  }

  /**
   * Retreive a store based on the storeTokenId
   * @method getStoreFromTokenId
   * @generic {T} Generic store type
   * @param {string} id The store id
   * @return {T} The corresponding store if available
   */
  getStoreFromTokenId<T>(id: string): T  {
    return (<any>this.storesMap[id]) as T;
  }

  /**
   * Gets all traces for debug purpose
   * @method getTraces
   * @return {Array<TraceType>}
   */
  getTraces(): Array<TraceType> {
    let res: Array<TraceType> = [];
    let i = 0;
    for (let action of this.actions) {
      let trace = {} as TraceType;

      trace["action"] = action;
      trace["stores"] = [];

      this.storeTraces.forEach((store: any) => {
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

  /**
   * Removes a callback based on its token.
   * @method unregister
   * @param {string} id The store id
   * @return {void}
   */
  unregister(id: string): void {
    if (id in this.storesPoolMap) {
      delete this.storesHandlerPool[this.storesPoolMap[id]];
      delete this.storesPoolMap[id];
      delete this.storesMap[id];
      this.storesHandlerPool = this.storesHandlerPool.filter( itm => itm !== void 0);
    }
  }

  /**
   * Waits for the callbacks specified to be invoked before continuing execution of the current callback.
   * This method should only be used by a callback in response to a dispatched payload.
   * @method waitFor
   * @param {Array<string>} ids List of stores to wait for end of handling, before processing the action
   * @param {Action} action The action to process when ready
   * @return {Promise<void>}
   */
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

  /**
   * Gets a list of Promise from internal list tp process
   * @method getPromiseFromProcessList
   * @param {string} index The key
   * @param {Action} the action to apply
   * @return {Promise<void>}
   */
  private getPromiseFromProcessList(index: string, action: Action): Promise<void> {
    if (typeof(this.disptachStoreProcessList[index]) === "number") {
      let bindedHandler = this.storesHandlerPool[this.storesPoolMap[index]];
      this.disptachStoreProcessList[index] = new Promise<void>((rc, xc) => {
        bindedHandler(action, rc, xc);
      });
    }

    return this.disptachStoreProcessList[index] as Promise<void>;
  }

  /**
   * Creates a new list of promise to process
   * @method createProcessList
   * @param {Action} action
   * @return {Promise<void>}
   */
  private createProcessList(action: Action): Promise<void> {
   return new Promise<void>((r, x) => {
      this.disptachStoreProcessList = {};
      Object.keys(this.storesPoolMap).forEach((index) => {
        this.disptachStoreProcessList[index] = this.storesPoolMap[index];
      });
      r();
    });
  }

  /**
   * Dispatch the action to all stores
   * @method dispatchAction
   * @param {Action} action
   * @return {void}
   */
  private dispatchAction(action: Action): void {
    if (this.withTrace) {
      // Controls if there is no cycle references between stores
      Object.keys(this.storesMap).forEach(key => {
        let source = this.storesMap[key];
        let sourceTokens = source.tokenListToWaitFor;

        sourceTokens.forEach(token => {
          if (this.storesMap[token].tokenListToWaitFor.indexOf(source.tokenId) !== -1) {
            throw Error(`Cycling references detected between store <${source.tokenId}> and <${token}>`);
          }
        });
      });
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
          this.dispatchAction(this.bufferedActions.shift());
        }
      }).catch(ex => {
        console.error(ex);
      });
    });
  }

  /**
   * Dispatch the action or bufferize it if an action is already processing
   * @method dispatch
   * @generic {T}
   * @param {Action & T} action The action to dispatch
   * @return {void}
   */
  dispatch<T>(action: Action & T): void {
    this.bufferedActions.push(action);
    if (!this._isDispatching) {
      this._isDispatching = true;
      this.dispatchAction(this.bufferedActions.shift());
    }
  }

  /**
   * Gets a value indicating wether or not an action is dispatching
   * @method isDispatching
   * @return {boolean}
   */
  isDispatching(): boolean {
    return this._isDispatching;
  }
}
/**@endClass */
/**@endModule */
