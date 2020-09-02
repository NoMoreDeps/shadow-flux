import { TAction }                    from "./Store/Action"         ;
import { TBaseStore, TExtentedStore } from "./Store/BaseStore"      ;
import { EventBus }                   from "./Utils/Event/EventBus" ;
import { Guid }                       from "./Utils/Text/Guid"      ;

export class Dispatcher { 
  private _StoreHash      : { [key: string] : TExtentedStore<any> } = {}                   ;
  private _payloads       : Array<TAction<any>>                     = []                   ;
  private _currentPayload : TAction<any> | null                     = null                 ;
  private _cycle          : {[key: string]: Promise<any> }          = {}                   ;
  private _IsCycleRunning : boolean                                 = false                ;
  private _EvtBus         : EventBus                                = new EventBus(".", 4) ;

  dispatch(payload: TAction<any>) {
    this._payloads.push(payload);
    this.processNextCycle();
  }

  private wait(time: number) {
    return new Promise(r => setTimeout(() => r(), time))
  }

  registerStore<T>(store: TBaseStore<T>, storeId?: string){
    store.id = store.id ?? storeId ?? Guid.getGuid();

    if (store.id in this._StoreHash) throw Error(`A store named ${store.id} already exists, maybe you are trying to add the same store several times...`);
    this._StoreHash[store.id] = store;
  }

  private async processNextCycle() {
    if (this._IsCycleRunning || this._payloads.length === 0) return;

    this._IsCycleRunning = true                    ;
    this._currentPayload = this._payloads.shift()! ;
    
    // Select  all
    this._cycle        = {}                                ;
    const allPromises  = [] as Promise<any>[]              ;
    const waitingQueue = {} as { [key: string]: string[] } ;

    // Prevent cycling dependencies
    function checkBeforeWaiting(sourceId: string, targetIds: string[]) {
      if (targetIds.includes(sourceId)) throw Error(`${sourceId} cannot wait for itself to finish berofe it can finish... Cycling dependency detected.`);
      if (sourceId in waitingQueue) throw Error(`${sourceId} already waiting in this current cycle, and it cannot wait a second time`);
      
      targetIds.forEach(_ => {
        if (_ in waitingQueue && waitingQueue[_].includes(sourceId)) throw Error(`Cycling dependency detected, store ${sourceId} is trying to wait for store ${_} to finish, but ${_} is already waiting for ${sourceId} to finish first`);
      });
      waitingQueue[sourceId]= targetIds;
    }

    for (const store in this._StoreHash) {
      // Find a function that can process this payload
      const str = this._StoreHash[store];

      // Check for mapped actions first
      const actionToLookFor = str.mappedActions?.[this._currentPayload.type] ?? this._currentPayload.type;

      // Action found
      if (actionToLookFor in str) {
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
      } else {
        // nothing to do
        this._cycle[store] = new Promise(_ => _({id: str.id, result: void 0}));
      }
      // Add the store to the cycle
      allPromises.push(this._cycle[store]);
    }

    try {
      // Wait the cycle to finish
      const cycleResult = await Promise.all(allPromises) ;
    } catch(ex) {
      console.error(ex);
    } finally {
      this._IsCycleRunning = false;
      if (this._payloads.length > 0) {
        await this.wait(0);
        this.processNextCycle();
      }
    }
  }
}