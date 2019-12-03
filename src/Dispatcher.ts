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
import { TAction }                   from "./Action/TAction"        ;
import { Guid }                      from "./shared/text/Guid"            ;
import { DefferedPromise }           from "./Utils/DefferedPromise" ;
import { EventBus, EventBusAutoOff } from "./shared/event/EventBus"        ;

import {
  IStore,
  IPrivateStore
} from "./Store/IStore";
import { DispatcherCycle, CycleEvent } from "./Utils/Debug/DispatcherCycle";

export type TWaitFor = (...ids: string[]) => Promise<void>;

export type TDispatchHandler = (
  payload : TAction                ,
  success : () => void             ,
  error   : (error: Error) => void ,
  For: TWaitFor
) => Promise<void>;

export type TDebuggerCommands = {
  lockState        : (active: boolean) => void       ;
  goToFrame        : (index: number) => void         ;
  getFrameLength   : () => number                    ;
  setDebugOn       : (option: TDebugOptions) => void ;
  setDebugOff      : () => void                      ;
  playCurrentFrame : () => void                      ;
  getFrames        : () => Array<CycleEvent[]>       ;
}

export type TDebugOptions = {
  mode : "local" | "postMessage" | "websocket";
  url? : string;
};

/**
 * Dispatcher class
 */
export class Dispatcher {
  private _payloads        : Array<TAction>                                ;
  private _stores          : Array<IPrivateStore<any>>                     ;
  private _storeHash       : { [storeId: string]: IPrivateStore<any> }     ;
  private _isDispatching   : boolean                                       ;
  private _currentStoreTab : { [storeId: string] : DefferedPromise<void> } ;
  private _eventBus        : EventBus                                      ;
  private _debugCycle      : DispatcherCycle | null                        ;
  private _debugMode       : boolean                                       ;
  private _currentFrame    : CycleEvent | null                             ;
  private _isPlayingDebug  : boolean                                       ;
  private _debugOptions    : TDebugOptions                                 ;
  private _debugWindow     : Window | null                                 ;

  /**
  * @constructor
  */
  constructor() {
    this._payloads        = []               ;
    this._stores          = []               ;
    this._storeHash       = {}               ;
    this._isDispatching   = false            ;
    this._currentStoreTab = {}               ;
    this._eventBus        = new EventBus()   ;
    this._debugCycle      = null             ;
    this._debugMode       = false            ;
    this._currentFrame    = null             ;
    this._isPlayingDebug  = false            ;
    this._debugOptions    = { mode: "local"} ;
    this._debugWindow     = null             ;

    this._eventBus.on("allEvents", (data) => {
      this.addTrace(data.eventName, data.data);
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

  private addTrace(eventName: string, data?: any) {
    if (this._debugMode && this._isDispatching && this._debugCycle) {
      this._debugCycle.newEvent(eventName, data);
    }
  }

  private addDispatcherTrace(eventName: string, data?: any) {
    if (this._debugMode && this._debugCycle) {
      this._debugCycle.newEvent(eventName, data);
    }
  }


  /**
   * starts a new dispatch cycle
   * @method processNextPayload
   */
  private processNextPayload() {
    // gets the next payload from the stack
    const payload = this._payloads.shift();

    // checks if we need to dispatch
    if (!payload) {
      this._isDispatching = false;
      return;
    }

    this.addDispatcherTrace("dispatcher.newCycle", null);

    // sets the dispatching flag to true
    this._isDispatching = true;

    const storeTab = this._stores.map(store => {
      const _this = this;

      const promise = new DefferedPromise<void>( (r, x) => {
        const success = () => {
          r();
        }

        const error = () => {
          r();
        }

        this.addTrace("store.Process", {
          owner: store.id
        });
        store.dispatchHandler(payload, success, error, async (...ids: string[]) => {
          this.addTrace("store.WaitFor", {
            owner    : store.id,
            waitList : ids
          });
          await this.waitFor(...ids);
          this.addTrace("store.EndWaitFor", {
            owner    : store.id,
            waitList : ids
          });
        });
      });

      this._currentStoreTab[store.id] = promise;
      return promise;
    });

    this.addTrace("dispatcher.dispatch", payload)

    Promise.all( storeTab.map(p => p.getPromise()) ).then( () => {
      this.addTrace("dispatcher.endCycle", null);
      this.sendMsg({topic: "getFrames", value: this.debug.getFrames()});
      
      this._currentStoreTab = {};
      // check if there is another one to process
      if (this._payloads.length > 0) {
        this.processNextPayload();
      } else {
        this._isDispatching = false;
      }
    })
  }

  /**
   * @method register
   * @param store The store to register
   * @param id The store's id
   */
	register(store: IStore<unknown>, id: string = "") {
    const pStore = store as IPrivateStore<unknown>;

    !pStore.id && 
      (id 
        ? 
          (pStore.id = id) 
        : 
          (pStore.id = Guid.getGuid())
      ); 

    if (this._storeHash[pStore.id]) {
      throw `A store with id ${pStore.id} already exists.`
    }

    this._storeHash[pStore.id] = pStore;
    this._stores.push(pStore);

    pStore.registerEventBus(this._eventBus);
    (pStore as unknown as any)["getStoreStateByToken"] = (_: any) => {
      return this._storeHash[_].getState();
    };
    (pStore as unknown as any)["sendAction"] = (_: TAction) => {
      this.dispatch(_);
    };
  }

  /**
   *
   * @param storeId
   * @param updatedStateHandler
   */
  subscribe<T>(storeId: string, updatedStateHandler: (state: T) => void): EventBusAutoOff;
  subscribe<T,U>(storeId: string, mapToStateHandler:(state: T) => U, updatedStateHandler: (state: U) => void): EventBusAutoOff;
  subscribe<T>(storeId: string, eventName: string, updatedStateHandler: (state: T) => void): EventBusAutoOff;
  subscribe<T,U>(storeId: string, eventName: string, mapToStateHandler:(state: T) => U, updatedStateHandler: (state: U) => void): EventBusAutoOff;
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
        return this._eventBus.on(`${event}.updated`, (store: IStore<any>) => {
          const updatedStateHandler: Function = params[0];

          updatedStateHandler(store.getState());
        });
      } else {
        noSignatureError();
      }
    } else if (params.length === 2) {
      if (typeof(params[0]) === "function" && typeof(params[1]) === "function") {
          //subscribe<T,U>(storeId, mapToStateHandler, updatedStateHandler): void;
          return this._eventBus.on(`${event}.updated`, (store: IStore<any>) => {
            const mapToStateHandler   : Function = params[0];
            const updatedStateHandler : Function = params[1];

            updatedStateHandler(mapToStateHandler(store.getState()));
          });

      } else if (typeof(params[0]) === "string" && typeof(params[1]) === "function") {
        //subscribe<T>(storeId, eventName, updatedStateHandler): void;
        const eventName: string = params[0];

        return this._eventBus.on(`${event}.updated.${eventName}`, (store: IStore<any>) => {
          const updatedStateHandler: Function = params[1];

          updatedStateHandler(store.getState());
        });

      } else {
        noSignatureError();
      }
    } else if (params.length === 3) {
      if (typeof(params[0]) === "string" && typeof(params[1]) === "function" && typeof(params[2]) === "function") {
        //subscribe<T,U>(storeId, eventName, mapToStateHandler, updatedStateHandler): void;
        const eventName: string = params[0];

        return this._eventBus.on(`${event}.updated.${eventName}`, (store: IStore<any>) => {
          const mapToStateHandler: Function = params[1];
          const updatedStateHandler: Function = params[2];

          updatedStateHandler(mapToStateHandler(store.getState()));
        });

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
	dispatch(payload: TAction): void {
    if (this._isPlayingDebug) return;
    if (this._debugMode) {
      this._eventBus.emit("dispatcher.stack", payload);
    }
    this._payloads.push(payload);
    !this._isDispatching && this.processNextPayload();
  }

  private messagingHandler = (ev: MessageEvent): void => {
    console.log("Messaging", ev.data)
    switch(ev.data.topic) {
      case "count": 
        this.sendMsg({topic: "count", value: this.debug.getFrames().length})
      break;

      case "getFrames": 
        this.sendMsg({topic: "getFrames", value: this.debug.getFrames()})
      break;

      case "playFrame":
        this.debug.goToFrame(ev.data.value);
        this.debug.playCurrentFrame();
        this.sendMsg({topic: "playFrame"})
      break;

      case "clear":
        this._debugCycle?.clear();
        this.sendMsg({topic: "clear"});
      break;
    }
  }
  
  private sendMsg(data: {topic: string, value?: any}) { 
   this._debugWindow?.postMessage(JSON.parse(JSON.stringify(data)), this._debugOptions.url!);
   console.log("sendMsg", this._debugWindow !== undefined, data)
  }

  private activateCrossMessaging() : void {
    if (this._debugOptions.mode === "postMessage") {
      this._debugWindow = window.open(`${this._debugOptions.url}?source=${window.origin}`, "_shadow_flux_");
    }

    try {
      window && window.addEventListener &&
        window.addEventListener("message", this.messagingHandler);
    } catch {}
  }

  private deactivateCrossMessaging() : void {
    try {
      window && window.addEventListener &&
      window.removeEventListener("message", this.messagingHandler)
    } catch {}
  }

  debug = {
    setDebugOn: (options: TDebugOptions): void => {
      this._debugOptions = options;
      this.debugHelper.setDebugState(true);
      this.activateCrossMessaging();
    },
    setDebugOff: (): void  => {
      this.debugHelper.setDebugState(false);
      this.deactivateCrossMessaging();
    },
    lockState: (active: boolean): void  => {
      this._debugMode 
        && this._stores.forEach( store => this._eventBus.emit(`${store.id}.lockState`, active) );
    },
    getFrameLength: (): number => {
      return this.debugHelper.countUpdates();
    },
    goToFrame: (index: number): void => {
      this._debugCycle 
        && (this._debugCycle.frameIndex = index);
    },
    playCurrentFrame: (): void => {
      this._debugCycle
        && this._debugCycle.playCurrentFrame();
    },
    getFrames: () => this._debugCycle && this._debugCycle.getFrames()
  } as TDebuggerCommands;

  protected debugHelper = {
    setDebugState: (value: boolean) => {
      this._debugMode = value;

      if (value) {
        !this._debugCycle 
          && (this._debugCycle = new DispatcherCycle(this));
      } else {
        if (this._debugCycle) {
          this._debugCycle["_events"].length = 0;
          this._debugCycle = null;
        }
      }
    },
    countUpdates: () => {
      return this._debugCycle 
      ? 
        this._debugCycle.length
      : 
        0
      ;
    }
  }

}
