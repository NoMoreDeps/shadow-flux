import { Dispatcher }      from "../Core/Dispatcher"      ;
import { EventBusAutoOff } from "../Utils/Event/EventBus" ;
import { Guid } from "../Utils/Text/Guid";
import { sFDebugger } from "./Debugger";

export type TBaseStore<T> = {
  id         ?: string                                                         ;
  nextState   : (newState: Partial<T>, mergeToPreviousState?: boolean) => void ;
  sendAction  : <U>(type: string, payload: U) => void                          ;
  getState    : () => T                                                        ;
}

export class BaseStore<T> {
  protected state     !: T                                                                                                                                 ;
  id                   : string = ""                                                                                                                       ;
  mappedActions       ?: { [key: string] : string; }                                                                                                       ;
  protected init       : () => void = () => void 0                                                                                                         ;
  protected nextState  : (newState: Partial<T>, mergeToPreviousState?: boolean) => void = (newState: Partial<T>, mergeToPreviousState?: boolean) => void 0 ;
  protected sendAction : <T>(type: string, payload: T) => void = <T>(type: string, payload: T) => void 0                                                   ;
  getState() {
    return this.state;
  }
}

export type TExtentedStore<T> = TBaseStore<T> & {
  mappedActions ?: { [key: string] : string; }
}

export type TStoreDefinition<S extends (...args: any[]) => any, T extends {[key: string]: (...args: any[]) => any}, U> = {
  id              ?: string                                                               ;
  localActions    ?: boolean                                                              ;
  actions          : T                                                                    ;
  events          ?: U                                                                    ;
  mappedActions   ?: { [key: string] : string; }                                          ;
  init             : S                                                                    ;
  dispatchHandler ?:(this: TBaseStore<ReturnType<S>>, payload: any, For? : TAwaitFor) => Promise<void | null | string | string[]> ;
  nextState       ?: (newState: Partial<ReturnType<S>>, mergeToPreviousState?: boolean) => void       ;
}

type TRegisterSystem = {
  __dispatcher: Dispatcher;
}

export type TActionHandler<T> = (payload: T, For?: TAwaitFor) => TActionReturn ;
export type TActionReturn     = Promise<undefined | null | string | string[]>  ;
export type TAwaitFor         = (...ids: string[]) => Promise<void>            ;

export function withEvents<T>(source: T) {
  for(const i in source) {
    (source as any)[i] = i;
  }
  return source as T;
}

export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

export type TActionExtention<T, U> = {
  [P in keyof T]: 
  ((this: TBaseStore<U>, payload: any) => Promise<void | null | string | string[]>) | 
  ((this: TBaseStore<U>, payload: any, For: TAwaitFor) => Promise<void | null | string | string[]>)
};


type St = {
  a: number;
}

type TFunction   = (...args: any[]) => any;
type TActionsDef = { [key: string]: (...args: any[]) => any; };
type TEventsDef  = { [key: string]: string };

function _registerStore<
  D       extends TStoreDefinition<State, Actions, Events> ,  
  State   extends TFunction                                , 
  Actions extends TActionsDef                              , 
  Events  extends TEventsDef
  >(this: any, def: D) {
  
  type TActions = PropType<typeof def, "actions">          ;
  type TEvents  = PropType<typeof def, "events">           ;
  type TState   = ReturnType<PropType<typeof def, "init">> ;

  const _this = this;
  
  if (!_this.__dispatcher) _this.__dispatcher = new Dispatcher();
  const store = new BaseStore<State>();
  store.mappedActions = def.mappedActions;
  if (!def.id) def.id = Guid.getGuid();
  _this.__dispatcher.registerStore(store, def.id);

  const _actions = {} as {
    [P in keyof TActions] :  PropType<Parameters<TActions[P]> , 0> extends undefined ?
    (() => void) 
    :
    ((payload: PropType<Parameters<TActions[P]> , 0>) => void) 
  };


  for (const key in def.actions) {
    (_actions as any)[key] = (_: any) => {
      _this.__dispatcher.dispatch({type: def.localActions ? `${def.id}-${key}` : key, ..._});
    };
    (store as any)[def.localActions ? `${def.id}-${key}` : key] = def.actions[key];
  }

  if (def.dispatchHandler) {
    (store as any)["dispatchHandler"] = def.dispatchHandler;
  }

  const _subscribeTo = {} as {
    [P in keyof TEvents]: (handler: (newState: TState) => void) => EventBusAutoOff;
  } & {
    All: (handler: (newState: TState) => void) => EventBusAutoOff;
  };

  for (const key in def.events) {
    (_subscribeTo as any)[key] = (_: any) => {
      return _this.__dispatcher.subscribe(store.id!, _, key);
    }
  }

  (_subscribeTo as any)["All"] = (_: any) => {
    return _this.__dispatcher.subscribe(store.id!, _, "ALL");
  }

  if (def.init) {
    store["init"] = function(this: BaseStore<TState>) { this.nextState(<any>def.init.call(this)) }
    store["init"]();
  }

  if (def.nextState) {
    store["nextState"] = <any>def.nextState;
  }

  return {
    id          : store.id              ,
    actions     : _actions              ,
    subscribeTo : _subscribeTo          ,
    events      : def.events as TEvents ,
    getState    : () => store["state"] as TState,
  }
}

const dp = new Dispatcher();
export const registerStore = _registerStore.bind({ __dispatcher: dp });

 sFDebugger["evtBus"]      = dp["_EvtBus"] ;
 sFDebugger["_dispatcher"] = dp            ;