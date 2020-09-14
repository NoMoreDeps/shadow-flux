import { TAction }         from "../Index"                ;
import { EventBusAutoOff } from "../Utils/Event/EventBus" ;
import { Dispatcher }      from "./Dispatcher"            ;

export class Subscriber {
  /**
   * Dispatcher internal instance
   */
  private dispatcher: Dispatcher;

  /**
   * Creates a new instance of a wrapper around a dispatcher
   * @param dispatcher the dispatcher to wrap and expose
   */
  constructor(dispatcher: Dispatcher) {
    this.dispatcher = dispatcher;
  }

    /**
   * Register to receive all errors from any stores
   * @param handler Handler to pass errors to
   */
  onError(handler: (data: { owner: string, error: any}) => void): EventBusAutoOff {
    return this.dispatcher.onError(handler);
  }

  /**
   * 
   * @param storeId
   * @param updatedStateHandler
   */
  subscribe<T>(storeId: string, updatedStateHandler: (state: T) => void): EventBusAutoOff;
  /**
   * 
   * @param storeId
   * @param mapToStateHandler
   * @param updatedStateHandler
   */
  subscribe<T, U>(storeId: string, mapToStateHandler: (state: T) => U, updatedStateHandler: (state: U) => void): EventBusAutoOff;
  /**
   * 
   * @param storeId
   * @param eventName
   * @param updatedStateHandler
   */
  subscribe<T>(storeId: string, eventName: string, updatedStateHandler: (state: T) => void): EventBusAutoOff;
  /**
   * 
   * @param storeId
   * @param eventName
   * @param mapToStateHandler
   * @param updatedStateHandler
   */
  subscribe<T, U>(storeId: string, eventName: string, mapToStateHandler: (state: T) => U, updatedStateHandler: (state: U) => void): EventBusAutoOff;
  subscribe(...params: any[]) {
    // To keep compatibility with V2 we have to wrap here
    let _params              : any[] = [] ;
    let _storeId             : string     ;
    let _eventName           : string     ;
    let _mapToStateHandler   : any        ;
    let _updatedStateHandler : any        ;
    let _finalHandler        : any        ;

    _storeId             = params[0] ;

    if (params.length === 2) {
      console.log("SC- string, =>");
      _updatedStateHandler = params[1]                        ;
      _params              = [_storeId, _updatedStateHandler] ;
    }

    if (params.length === 3) {
      if (typeof params[1] === "string") {
        console.log("SC- string, string, =>");
        _eventName           = params[1]                                    ;
        _updatedStateHandler = params[2]                                    ;
       _params               = [_storeId, _updatedStateHandler, `STORE.${_storeId}.EMIT.${_eventName}`] ;
      } else {
        console.log("SC- string, => , =>");
        _mapToStateHandler   = params[1] ;
        _updatedStateHandler = params[2] ;
        _finalHandler = (state: any) => {
          _updatedStateHandler(_mapToStateHandler(state));
        };
       _params = [_storeId, _finalHandler] 
      }
    }

    if (params.length === 4) {
      console.log("SC- string, string, =>, =>");
      _eventName           = params[1];
      _mapToStateHandler   = params[2];
      _updatedStateHandler = params[3];
      _finalHandler = (state: any) => {
        _updatedStateHandler(_mapToStateHandler(state));
      };
     _params = [_storeId, _finalHandler, `${_eventName}`];
    }

    return this.dispatcher.subscribe.apply(this.dispatcher, _params as [string, () => void, string?]);
  }

/**
 * 
 * @param payload
 */
  sendAction<T>(payload: TAction<T>): void
  sendAction<T>(actionType: string, payload: T): void
  sendAction(...params: any[]): void {
    if (params.length === 2) {
      this.dispatcher.dispatch({
        type: params[0],
        ...params[1]
      });
    } else {
      this.dispatcher.dispatch(params[0]);
    }
  }
}