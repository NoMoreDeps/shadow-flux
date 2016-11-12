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

import {Action}                 from "./Action";
import {Dispatcher}             from "./Dispatcher";
import {Emitter   ,
  EmitterDelegate ,
  EmitterAutoOff}               from "shadow-lib/Event/Emitter";

/**
 * @class BaseStore
 * @generic {T}
 */
export abstract class BaseStore<T> {
  protected _tokenId            : string;
  protected _dispatcher         : Dispatcher;
  protected _tokenListToWaitFor : Array<string>;
  protected _withTrace          : boolean;
  protected _emitter            : Emitter;

  get tokenId(): string {
    return this._tokenId;
  }

  get dispatcher(): Dispatcher {
    return this._dispatcher;
  }

  constructor() {
    this._tokenId            = ""     ;
    this._tokenListToWaitFor = []     ;
    this._dispatcher         = void 0 ;
    this._withTrace          = false  ;
    this._emitter            = new Emitter();
  }

  get on() : (eventName: string, callback: EmitterDelegate) => EmitterAutoOff {
    return this._emitter.on.bind(this._emitter);
  }

  get once(): (eventName: string, callback: EmitterDelegate) => EmitterAutoOff {
    return this._emitter.once.bind(this._emitter);
  }

  get tokenListToWaitFor(): Array<string> {
    return this._tokenListToWaitFor;
  }

  set tokenListToWaitFor(tokens: Array<string>) {
    this._tokenListToWaitFor = tokens;
  }

  abstract dispatchHandler(payload: Action, success: () => void, error: (error: Error) => void): void;
  protected abstract initializeState(): void ;
  protected abstract nextState(state: T): void;
  abstract getState(): T;
}



export abstract class Store<T> extends BaseStore<T> {
  protected _state  : T        ;
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