  /**
 * The MIT License (MIT)
 * Copyright (c) <2018> <shadowjs.com>
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
import { IAction }         from "./Action/IAction"        ;
import { Guid }            from "./Utils/Guid"            ;
import { DefferedPromise } from "./Utils/DefferedPromise" ;
import { EventBus }        from "./Utils/EventBus"        ;

import {
  IStore,
  IPrivateStore
} from "./Store/IStore";
import { DispatcherCycle } from "./Utils/Debug/DispatcherCycle";

export type WaitFor = (...ids: string[]) => Promise<void>;

export type DispatchHandler = (
  payload : IAction                ,
  success : () => void             ,
  error   : (error: Error) => void ,
  For     : WaitFor
) => Promise<void>;

/**
 * Dispatcher class
 */
export class Dispatcher {

	private _payloads        : Array<IAction>                                ;
	private _stores          : Array<IPrivateStore<any>>                     ;
  private _storeHash       : { [storeId: string]: IPrivateStore<any> }     ;
  private _isDispatching   : boolean                                       ;
  private _currentStoreTab : { [storeId: string] : DefferedPromise<void> } ;
  private _eventBus        : EventBus                                      ;
  private _debugFrames     : Array<DispatcherCycle>                        ;
  private _currentFrame    : DispatcherCycle | null                        ;
  private _debugMode       : boolean                                       ;

	/**
	 * @constructor
	 */
	constructor() {
		this._payloads        = []             ;
		this._stores          = []             ;
    this._storeHash       = {}             ;
    this._isDispatching   = false          ;
    this._currentStoreTab = {}             ;
    this._eventBus        = new EventBus() ;
    this._debugFrames     = []             ;
    this._currentFrame    = null           ;
    this._debugMode       = false;

    this._eventBus.on("allEvents", (data) => {
      this._currentFrame && this._currentFrame.newEvent(data.eventName, data.data);
    })
	}

  /**
   * Waits for some promises to finish
   * @method waitFor
   * @param ids {...string[]} list of store id to process first
   */
  private async waitFor(...ids: string[]): Promise<void> {
      const storeTab = ids.map(id => this._currentStoreTab[id].getPromise());
      await Promise.all(storeTab)
  }

  /**
   * starts a new dispatch cycle
   * @method processNextPayload
   */
  private processNextPayload() {
    if (this._currentFrame) {
      this._currentFrame.newEvent("dispatcher.endCycle", null);
      this._debugFrames.push(this._currentFrame);
      this._currentFrame = null;
    }

    // gets the next payload from the stack
    const payload = this._payloads.shift();

    // checks if we need to dispatch
    if (!payload) {
      this._isDispatching = false;
      return;
    }

    this._currentFrame = new DispatcherCycle();
    this._currentFrame.newEvent("dispatcher.newCycle", null);

    // sets the dispatching flag to true
    this._isDispatching = true;

    const storeTab = this._stores.map(store => {
      const _this = this;

      const promise = new DefferedPromise<void>( (r, x) => {
        const success = () => {
          r();
        }

        const error = () => {
          x();
        }

        store.dispatchHandler(payload, success, error, _this.waitFor.bind(_this));
      });

      this._currentStoreTab[store.id] = promise;
      return promise;
    });

    this._currentFrame.newEvent("dispatcher.dispatch", payload);

    Promise.all( storeTab.map(p => p.getPromise()) ).then( () => {
      this._currentStoreTab = {};
      // check if there is another one to process
      if (this._payloads.length > 0) {
        this.processNextPayload();
      } else {
        if (this._currentFrame) {
          this._currentFrame.newEvent("dispatcher.endCycle", null);
          this._debugFrames.push(this._currentFrame);
          this._currentFrame = null;
        }
        this._isDispatching = false;
      }
    })
  }

  /**
   * @method register
   * @param store The store to register
   * @param id The store's id
   */
	register(store: IStore<any>, id: string = "") {
    const pStore = store as IPrivateStore<any>;

    if (!pStore.id) {
      if (id) {
        pStore.id = id;
      } else {
        pStore.id = Guid.getGuid();
      }
    }

    if (this._storeHash[pStore.id]) {
      throw `A store with id ${pStore.id} already exists.`
    }

    this._storeHash[pStore.id] = pStore;
    this._stores.push(pStore);

    pStore.registerEventBus(this._eventBus);
  }

  /**
   *
   * @param storeId
   * @param updatedStateHandler
   */
  subscribe<T>(storeId: string, updatedStateHandler: (state: T) => void): void;
  subscribe<T,U>(storeId: string, mapToStateHandler:(state: T) => U, updatedStateHandler: (state: U) => void): void;
  subscribe<T>(storeId: string, eventName: string, updatedStateHandler: (state: T) => void): void;
  subscribe<T,U>(storeId: string, eventName: string, mapToStateHandler:(state: T) => U, updatedStateHandler: (state: U) => void): void;
  subscribe(...params: any[]) {
    const noSignatureError = () => {
      throw `subscribe function has no signature corresponding to the one you provided :
      subscribe(${params.map( p => typeof(p)).join(", ")}) => void; not found !`;
    };

    if (params.length === 0) {
      noSignatureError();
    }

    if(typeof(params[0]) !== "string") {
      noSignatureError();
    }

    // params[0] -> StoreId
    let event = params.shift() as string;

    if (this._stores.filter(s => s.id === event).length === 0) {
      throw `Cannot subscribe to the store ${event}. This store does not exists or is not registered into the dispatcher.`;
    }

    if (params.length === 1) {
      if (typeof(params[0]) === "function") {
        // subscribe<T>(storeId, updatedStateHandler): void;
        return this._eventBus.on(`${event}.updated`, params[0]);
      } else {
        noSignatureError();
      }
    } else if (params.length === 2) {
      if (typeof(params[0] === "function") && typeof(params[1] === "function")) {
          //subscribe<T,U>(storeId, mapToStateHandler, updatedStateHandler): void;

      } else if (typeof(params[0] === "string") && typeof(params[1] === "function")) {
        //subscribe<T>(storeId, eventName, updatedStateHandler): void;

      } else {
        noSignatureError();
      }
    } else if (params.length === 3) {
      if (typeof(params[0] === "string") && typeof(params[1] === "function") && typeof(params[2] === "function")) {
        //subscribe<T,U>(storeI, eventName, mapToStateHandler, updatedStateHandler): void;

      } else {
        noSignatureError();
      }
    } else {
      noSignatureError();
    }
  }


  /**
   * @method unregister
   * @param store The store to unregister
   */
	unregister(store: IStore<any>) {
    this._stores = this._stores.filter( s => s.id !== store.id );
    delete this._storeHash[store.id];
	}

  /**
   * @method dispatch
   * @param payload an action to dispatch
   */
	dispatch(payload: IAction): void {
    this._payloads.push(payload);
    !this._isDispatching && this.processNextPayload();
  }

  debug = {
    setDebugOn: () => {

    },
    setDebugOff: () => {

    },
    getFrameLength: () => {

    },
    goToFrame: (index: number) => {

    },
    playCurrentFrame: () => {

    }
  }

}