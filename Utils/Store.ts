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

import {Action}                 from "./Action"              ;
import {Dispatcher}             from "./Dispatcher"          ;
import * as ShadowLib           from "shadow-lib"            ;
import * as Immutable           from "immutable"             ;
import {mergeDescriptor}        from "../React/MapContainer" ;

import EmitterAutoOff  = ShadowLib.Event.EmitterAutoOff  ;
import EmitterDelegate = ShadowLib.Event.EmitterDelegate ;
import Emitter         = ShadowLib.Event.Emitter         ;

/**
 * @param eventName The event
 */
export type RegisterEventDelegate = (eventName: string, callback: EmitterDelegate) => EmitterAutoOff;

/**
 * @class BaseStore
 * @generic {T}
 */
export abstract class BaseStore<T> {
  protected _tokenId            : string                  ;
  protected _dispatcher         : Dispatcher              ;
  protected _tokenListToWaitFor : Array<string>           ;
  protected _withTrace          : boolean                 ;
  protected _emitter            : ShadowLib.Event.Emitter ;

  /**
   * Retreives the unique store identifier
   * @property {string} tokenId
   */
  get tokenId(): string {
    return this._tokenId;
  }

  /**
   * Retreives the dispatcher witch the store is registered to.
   * @property {Dispatcher} dispatcher;
   */
  get dispatcher(): Dispatcher {
    return this._dispatcher;
  }

  /**
   * Creates a new store
   * @constructor
   */
  constructor() {
    this._tokenId            = ""     ;
    this._tokenListToWaitFor = []     ;
    this._dispatcher         = void 0 ;
    this._withTrace          = false  ;

    this._emitter = new Emitter();
  }

  /**
   * Gets access to the internal emitter to register for a specific event
   * @property {RegisterEventDelegate} on
   */
  get on() : RegisterEventDelegate {
    return this._emitter.on.bind(this._emitter);
  }

  /**
   * Gets access to the internal emitter to register once for a specific event
   * @property {RegisterEventDelegate} once
   */
  get once(): RegisterEventDelegate {
    return this._emitter.once.bind(this._emitter);
  }

  /**
   * Gets or sets the token list to wait for
   */
  get tokenListToWaitFor(): Array<string> {
    return this._tokenListToWaitFor;
  }

  set tokenListToWaitFor(tokens: Array<string>) {
    this._tokenListToWaitFor = tokens;
  }

  /**
   * Emit a new event after a state change
   * @param eventName The event name, "updated" by default
   */
  protected emit(eventName: string = "updated"): void {
    this._emitter.emit(eventName);
  }

  abstract dispatchHandler(payload: Action, success: () => void, error: (error: Error) => void): void;
  protected abstract initializeState(): void ;
  protected abstract nextState(state: T): void;
  abstract getState(): any;
}

export abstract class Store<T> extends BaseStore<T> {
  protected _state  : any;
  protected _states : Array<T> ;

  protected initializeState(): void {
    this._state  = void 0 ;
    this._states = []     ;
  }

  constructor() {
    super();
    this.initializeState();
  }

   protected nextState(state: T = void 0): void {
    if (this._withTrace) {
      this._states.push(this._state);
    }

    if (state !== void 0) {
      this._state = state;
    }
  }

  abstract dispatchHandler(payload: Action, success: () => void, error: (error: Error) => void): void;
  abstract getState(): T;
}

export abstract class MapStore<T> extends BaseStore<T> {
  protected _state  : Immutable.Map<string, any>;
  protected _states : Array<T> ;

  protected initializeState(): void {
    this._state  = void 0 ;
    this._states = []     ;
  }

  constructor() {
    super();
    this.initializeState();
    this.initState();
  }

  getState(): T {
    return this._state.toJS();
  }

  getMapState(): Immutable.Map<string, any> {
    return this._state;
  }

  protected nextState(state?: T): void;
  protected nextState(state?: T, mergeDescriptor? : mergeDescriptor): void;
  protected nextState(state: T = void 0, mergeDescriptor: mergeDescriptor = void 0): void {
    if (this._withTrace) {
      this._states.push(this._state.toJS());
    }

    if (state !== void 0) {

      const newData     = Immutable.fromJS(state);
      const currentData = this._state as Immutable.Map<any,any>;
      let newState      = currentData.mergeDeep(newData);

      if (mergeDescriptor) {
        mergeDescriptor.forEach( elt => {
          const path = elt.path.split(".");
          switch(elt.action) {
            case "keep":
              newState = newState.setIn(path, currentData.getIn(path));
            break;
            case "replace":
              newState = newState.setIn(path, newData.getIn(path));
            break;
          }
        });
      }

      let res = newState.equals(this._state);
      if (!res) {
        this._state = newState;
      }
    }
  }

  abstract dispatchHandler(payload: Action, success: () => void, error: (error: Error) => void): void;
  abstract initState(): void;
}
