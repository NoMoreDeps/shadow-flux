import * as React from "react";

import {
  Store,
  Action,
  Dispatcher
} from "../Flux";

import {
  Emitter,
  EmitterAutoOff
} from "shadow-lib/Event/Emitter";

export type mapToState       = (storeState : any) => {[key: string]: any};
export type mapToProps       = (state      : any) => {[key: string]: any};
export type actionCreator    = (...params: any[]) => Action & any;

export type mapToStateType   = {[key: string]: mapToStateType   | mapToState}    ;
export type mapToPropsType   = {[key: string]: mapToPropsType   | mapToProps}    ;
export type mapToActionsType = {[key: string]: mapToActionsType | actionCreator} ;

export abstract class Container<T> extends React.Component<{dispatcher: Dispatcher}, T>  {
  private _hashComponent : {[key: string]: JSX.Element}    ;
  private _hashEvent     : {[key: string]: EmitterAutoOff} ;

  protected _dispatcher  : Dispatcher       ;
  protected actions      : mapToActionsType ;
  protected mapState     : mapToStateType   ;
  protected mapProps     : mapToPropsType   ;
  public    state        : any              ;

  constructor(props: {dispatcher: Dispatcher}) {
    super(props);

    this._hashComponent = {}         ;
    this._hashEvent     = {}         ;
    this._dispatcher    = this.props.dispatcher;
    this.initState();
  }

  getStore<K>(storeTokenId: string): K {
    return this._dispatcher.getStoreFromTokenId<K>(storeTokenId);
  }

  getState(): T {
    return this.state;
  }

  subscribe<T>(storeTokenId: string, eventName: string, mapToStateHandler: mapToState,
    handler: (stateData: T) => void): EmitterAutoOff {
      const registeredEvent = this.getStore<Store<any>>(storeTokenId).on(eventName, () => {
      const storeState = this.getStore<Store<any>>(storeTokenId).getState();
      const stateData = mapToStateHandler(storeState);
      handler(stateData as T);
    });
    return registeredEvent;
  }

  unsubscribe(storeTokenId: string, eventName: string): void {
    const hashKey = `${storeTokenId}.${eventName}`;

    if (this._hashEvent[hashKey]) {
      this._hashEvent[hashKey].off();
      delete this._hashEvent[hashKey];
    }
  }

  abstract nextState(newState: T): boolean;
  abstract initState(): void;
  abstract render(): JSX.Element;
}
