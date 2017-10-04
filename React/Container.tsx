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

import * as React from "react";

import {
  Store  ,
  Action ,
  Dispatcher
} from "../Flux";

import * as ShadowLib from "shadow-lib"                ;
import Emitter        = ShadowLib.Event.Emitter        ;
import EmitterAutoOff = ShadowLib.Event.EmitterAutoOff ;

export type mapToState       = (storeState : any) => {[key: string]: any} ;
export type mapToProps       = (state      : any) => {[key: string]: any} ;
export type actionCreator    = (...params: any[]) => Action & any | void  ;

export type mapToStateType   = {[key: string]: mapToStateType   | mapToState}    ;
export type mapToPropsType   = {[key: string]: mapToPropsType   | mapToProps}    ;
export type mapToActionsType = {[key: string]: mapToActionsType | actionCreator} ;

export type requiredProps    = {dispatcher?: Dispatcher};

export abstract class Container<P extends requiredProps, S> extends React.Component<P, S>  {
  private _hashComponent : {[key: string]: JSX.Element}    ;
  private _hashEvent     : {[key: string]: EmitterAutoOff} ;

  protected _dispatcher  : Dispatcher       ;
  protected actions      : mapToActionsType ;
  protected mapState     : mapToStateType   ;
  protected mapProps     : mapToPropsType   ;
  public    state        : any              ;

  constructor(props: P) {
    super(props);

    this._hashComponent = {};
    this._hashEvent     = {};
    this._dispatcher    = this.props.dispatcher;
    this.initState();
  }

  getStore<K>(storeTokenId: string): K {
    return this._dispatcher.getStoreFromTokenId<K>(storeTokenId);
  }

  getState(): S {
    return this.state;
  }

  sendAction<T>(payload: Action & T): void {
    this._dispatcher &&
      this._dispatcher.dispatch<T>(payload);
  }

  subscribe<T>(storeTokenId: string, handler: (stateData: T) => void): EmitterAutoOff;
  subscribe<T>(storeTokenId: string, eventName: string, handler: (stateData: T) => void): EmitterAutoOff;
  subscribe<T>(storeTokenId: string, mapToStateHandler: mapToState, handler: (stateData: T) => void): EmitterAutoOff;
  subscribe<T>(storeTokenId: string, eventName: string, mapToStateHandler: mapToState,
    handler: (stateData: T) => void): EmitterAutoOff;
  subscribe<T>(storeTokenId: string, ...params:Array<any>) {
    if (!this._dispatcher) return;

    let eventName         : string                 ;
    let mapToStateHandler : mapToState             ;
    let handler           : (stateData: T) => void ;

    if (params.length === 1) { // only handler
      eventName         = "updated" ;
      mapToStateHandler = null      ;
      handler           = params[0] ;
    } else if (params.length === 2) {
      if (typeof params[0] === "string") { // eventName
        [eventName, handler] = params ;
        mapToStateHandler    = null   ;
      } else { // MapHandler
        eventName                    = "updated" ;
        [mapToStateHandler, handler] = params    ;
      }
    } else if (params.length === 3) {
      [eventName, mapToStateHandler, handler] = params;
    }

    const registeredEvent = this.getStore<Store<any>>(storeTokenId).on(eventName, () => {
      const storeState  = this.getStore<Store<any>>(storeTokenId).getState();
      mapToStateHandler = mapToStateHandler || function(storeState: any) {return storeState};
      const stateData   = mapToStateHandler(storeState);

      handler(stateData as T);
    });

    const hashKey = `${storeTokenId}.${eventName}`;
    if (this._hashEvent[hashKey]) {
      throw Error(`The event <${eventName}> for store <${storeTokenId}> has already been registered`);
    }

    this._hashEvent[hashKey] = registeredEvent;
    return registeredEvent;
  }

  /**
   * Unsubscribe for a specific event for a specific store
   * @param {string} storeTokenId The token identifying the store
   * @param {string} eventName The event to unscribe for, "updated" by default
   */
  unsubscribe(storeTokenId: string, eventName: string = "updated"): boolean {
    if (!this._dispatcher) return;
    
    const hashKey = `${storeTokenId}.${eventName}`;

    if (this._hashEvent[hashKey]) {
      this._hashEvent[hashKey].off();
      delete this._hashEvent[hashKey];
      return true;
    }

    return false;
  }

  abstract nextState(newState: S): boolean;
  abstract initState(): void;
  abstract render(): JSX.Element;
}
