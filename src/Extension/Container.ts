import { Dispatcher }      from "../Dispatcher"     ;
import { EventBusAutoOff } from "../shared/event/EventBus" ;
import { TAction }         from "../Action/TAction" ;

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
    return this.dispatcher.subscribe.apply(this.dispatcher, params as any);
  }

/**
 * 
 * @param payload
 */
  sendAction(payload: TAction): void
  sendAction(actionType: string, payload: object): void
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