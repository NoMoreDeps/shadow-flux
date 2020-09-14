import { TAction }                               from "../Store/Action"             ;
import { BaseStore, TBaseStore, TExtentedStore } from "../Store/BaseStore"          ;
import { constantTree }                          from "../Utils/Event/ConstantTree" ;
import { EventBus }                              from "../Utils/Event/EventBus"     ;
import { Guid }                                  from "../Utils/Text/Guid"          ;

const $ = constantTree({
  DISPATCHER: {
    CYCLE: {
      START                 : "" ,
      END                   : "" ,
      RETREIVE_STORE_LIST   : "" ,
      ABORT_ALREADY_RUNNING : "" ,
      START_PROCESSING      : "" ,
      ANOTHER_CYCLE_PENDING : "" ,
    },
    DISPATCH: {
      RECEIVE_PAYLOAD  : "" ,
      SET_DEBUG_STATUS : "" ,
    },
    STORE: {
      START_WAITING     : "" ,
      CHECK_ACTION_NAME : "" ,
      WILL_PROCESS      : "" ,
      WILL_NOT_PROCESS  : "" ,
      EMIT              : "" ,
      NEXT_STATE        : "" ,
      REGISTERING_NEW   : "" ,
      SEND_ACTION:"",
    }
  }
}, "DEBUG");

export class Dispatcher { 
  private _StoreHash      : { [key: string] : TExtentedStore<any> } = {}                   ;
  private _payloads       : Array<TAction<any>>                     = []                   ;
  private _currentPayload : TAction<any> | null                     = null                 ;
  private _cycle          : {[key: string]: Promise<any> }          = {}                   ;
  private _IsCycleRunning : boolean                                 = false                ;
  private _EvtBus         : EventBus                                = new EventBus(".", 4) ;
  private _DebugMode      : boolean                                 = false                ;
  private _DebugOrder     : number                                  = 0                    ;
  private _DebugCycleIdx  : number                                  = 0                    ;

  constructor() {

  }

  private emitDbg(event: string, data?: any) {
    this._DebugMode && this._EvtBus.emitAsync(event, {cycle: this._DebugCycleIdx, order: this._DebugOrder++,  event, timestamp: new Date().getTime(), data });
  }

  dispatch(payload: TAction<any>) {
    this.emitDbg($.DISPATCHER.DISPATCH.RECEIVE_PAYLOAD, payload);

    if (payload.type === "SET_DEBUG_MODE_ON") {
      this._DebugMode = true;
      this.emitDbg($.DISPATCHER.DISPATCH.SET_DEBUG_STATUS, true);
      return;
    }

    if (payload.type === "SET_DEBUG_MODE_OFF") {
      this.emitDbg($.DISPATCHER.DISPATCH.SET_DEBUG_STATUS, false);
      this._DebugMode = false;
      return;
    }

    this._payloads.push(payload);
    this.processNextCycle();
  }

  private wait(time: number) {
    return new Promise(r => setTimeout(() => r(), time))
  }

  registerStore<T>(store: BaseStore<T>, storeId?: string){
    console.log("registering")
    const $this = this;
    store.id = storeId ?? Guid.getGuid();
    this.emitDbg($.DISPATCHER.STORE.REGISTERING_NEW, store.id);
    store["nextState"] = function(this: BaseStore<T>, newState: Partial<T>, mergeToPreviousState?: boolean) {
      this["state"] = mergeToPreviousState ? 
      {
        ...this["state"],
        ...newState as T
      } 
      : 
      newState as T;
      $this.emitDbg($.DISPATCHER.STORE.NEXT_STATE, {storeId: store.id, state: newState, mergeToPreviousState});
    };

    store["sendAction"] = <U>(type: string, payload: U) => {
      $this.emitDbg($.DISPATCHER.STORE.SEND_ACTION, {storeId: store.id, type, payload});
      if (typeof type === "string") {
        this.dispatch({
          type,
          ...payload
        });
      } else {
        this.dispatch(type);
      }
    }

    store["getState"] = function() {
      return this["state"];
    }

    store["initState"]?.();

    if (store.id in this._StoreHash) throw Error(`A store named ${store.id} already exists, maybe you are trying to add the same store several times...`);
    this._StoreHash[store.id] = store as unknown as TExtentedStore<any>;
  }

  getStoreStateByToken<T>(storeId: string): T {
    return this._StoreHash[storeId]?.getState() as T;
  }

  private async processNextCycle() {
    const $this = this;    
    if (this._IsCycleRunning || this._payloads.length === 0) {
      this.emitDbg($.DISPATCHER.CYCLE.ABORT_ALREADY_RUNNING);
      return;
    }
    
    this._IsCycleRunning = true                    ;
    this._currentPayload = this._payloads.shift()! ;
    this.emitDbg($.DISPATCHER.CYCLE.START, this._currentPayload);
    
    // Select  all
    this._cycle        = {}                                ;
    const allPromises  = [] as Promise<any>[]              ;
    const waitingQueue = {} as { [key: string]: string[] } ;

    // Prevent cycling dependencies
    function checkBeforeWaiting(sourceId: string, targetIds: string[]) {
      $this.emitDbg($.DISPATCHER.STORE.START_WAITING, {sourceId, targetIds});
      if (targetIds.includes(sourceId)) throw Error(`${sourceId} cannot wait for itself to finish berofe it can finish... Cycling dependency detected.`);
      if (sourceId in waitingQueue) throw Error(`${sourceId} already waiting in this current cycle, and it cannot wait a second time`);
      
      targetIds.forEach(_ => {
        if (_ in waitingQueue && waitingQueue[_].includes(sourceId)) throw Error(`Cycling dependency detected, store ${sourceId} is trying to wait for store ${_} to finish, but ${_} is already waiting for ${sourceId} to finish first`);
      });
      waitingQueue[sourceId]= targetIds;
    }

    this.emitDbg($.DISPATCHER.CYCLE.RETREIVE_STORE_LIST);
    for (const store in this._StoreHash) {
      // Find a function that can process this payload
      const str = this._StoreHash[store];

      // Check for mapped actions first
      const actionToLookFor = str.mappedActions?.[this._currentPayload.type] ?? this._currentPayload.type;
      this.emitDbg($.DISPATCHER.STORE.CHECK_ACTION_NAME, {storeId: str.id, payloadAction: this._currentPayload.type, selectedAction: actionToLookFor})
      // Action found
      if (actionToLookFor in str) {
        this.emitDbg($.DISPATCHER.STORE.WILL_PROCESS, {storeId: str.id, willProcess: actionToLookFor})
        this._cycle[store] = (async () => {
          const result = await ((str as any)[actionToLookFor])(this._currentPayload, async (...ids: string[]) => {
            checkBeforeWaiting(store, ids);
            for (const st of ids) {
              while(!this._cycle[st]) {
                await this.wait(0);
              }
            }
            return Promise.all(ids.map(_ => this._cycle[_]));
          });
          return { id: str.id, result };
        })();
      } else if ("dispatchHandler" in str) {
        const str2 = this._StoreHash[store];
        // fallback to default
        this._cycle[store] = (async () => {
          const result = await ((str2 as any)["dispatchHandler"])(this._currentPayload, async (...ids: string[]) => {
            checkBeforeWaiting(store, ids);
            for (const st of ids) {
              while(!this._cycle[st]) {
                await this.wait(0);
              }
            }
            return Promise.all(ids.map(_ => this._cycle[_]));
          });
          return { id: str2.id, result };
        })();
      } else {
        // nothing to do
        this.emitDbg($.DISPATCHER.STORE.WILL_NOT_PROCESS, {storeId: str.id, willNotProcess: actionToLookFor})
        this._cycle[store] = new Promise(_ => _({id: str.id, result: null}));
      }
      // Add the store to the cycle
      allPromises.push(this._cycle[store]);
    }

    try {
      // Wait the cycle to finish
      this.emitDbg($.DISPATCHER.CYCLE.START_PROCESSING);
      const cycleResult = await Promise.all<{id: string, result: undefined | null | string | string[]}>(allPromises) ;
      cycleResult.forEach(_ => {
        if (_.result === null) {
          this.emitDbg($.DISPATCHER.STORE.EMIT, 
            {
              storeId: _.id, 
              event: `STORE.${_.id}.EMIT.--`, 
              state: (this._StoreHash[_.id] as any)["state"] ,
              subscribers: 0});
          return;
        }

        this._EvtBus.emitAsync(`STORE.${_.id}.EMIT.ALL`, (this._StoreHash[_.id] as any)["state"]);
        this.emitDbg($.DISPATCHER.STORE.EMIT, {storeId: _.id, event: `STORE.${_.id}.EMIT.ALL`, state: (this._StoreHash[_.id] as any)["state"] , subscribers: this._EvtBus["_Emitter_"].onPool[`STORE.${_.id}.EMIT.ALL`]?.length ?? 0});

        
        if (typeof _.result === "string" && _.result !== "ALL") {
          this._EvtBus.emitAsync(`STORE.${_.id}.EMIT.${_.result}`, (this._StoreHash[_.id] as any)["state"]);
          this.emitDbg($.DISPATCHER.STORE.EMIT, {storeId: _.id, event: `STORE.${_.id}.EMIT.${_.result}`, state: (this._StoreHash[_.id] as any)["state"], subscribers: this._EvtBus["_Emitter_"].onPool[`STORE.${_.id}.EMIT.${_.result}`]?.length ?? 0 });
        }

        if (Array.isArray(_.result)) 
          _.result.filter(__ => __ !== "ALL")
          .forEach(__ => {
            this._EvtBus.emitAsync(`STORE.${_.id}.EMIT.${__}`, (this._StoreHash[_.id] as any)["state"]);
            this.emitDbg($.DISPATCHER.STORE.EMIT, {storeId: _.id, event: `STORE.${_.id}.EMIT.${__}`, state: (this._StoreHash[_.id] as any)["state"], subscribers: this._EvtBus["_Emitter_"].onPool[`STORE.${_.id}.EMIT.${__}`]?.length ?? 0 });
          });
      })
    } catch(ex) {
      this._EvtBus.emitAsync(`DISPATCHER.SYSTEM.ERROR.TRIGGER`, {owner: "Dispatcher", error: ex});
    } finally {
      this._IsCycleRunning = false;
      this.emitDbg($.DISPATCHER.CYCLE.END);
      this._DebugCycleIdx++;
      if (this._payloads.length > 0) {
        await this.wait(0);
        this.emitDbg($.DISPATCHER.CYCLE.ANOTHER_CYCLE_PENDING);
        this.processNextCycle();
      }
    }
  }

  subscribe<T>(storeId: string, handler: (newState: T) => void, eventName: string = "ALL") {
    return this._EvtBus.on(`STORE.${storeId}.EMIT.${eventName}`, handler);
  }

  /**
   * Register to receive all errors from any stores
   * @param handler Handler to pass errors to
   */
  onError(handler: (data: { owner: string, error: any}) => void) {
    return this._EvtBus.on("DISPATCHER.SYSTEM.ERROR.TRIGGER", handler);
  }
}