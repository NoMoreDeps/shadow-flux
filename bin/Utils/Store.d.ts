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
import { Action } from "./Action";
import { Dispatcher } from "./Dispatcher";
import * as ShadowLib from "shadow-lib";
import * as Immutable from "immutable";
import { mergeDescriptor } from "../React/MapContainer";
import EmitterAutoOff = ShadowLib.Event.EmitterAutoOff;
import EmitterDelegate = ShadowLib.Event.EmitterDelegate;
/**
 * @param eventName The event
 */
export declare type RegisterEventDelegate = (eventName: string, callback: EmitterDelegate) => EmitterAutoOff;
/**
 * @class BaseStore
 * @generic {T}
 */
export declare abstract class BaseStore<T> {
    protected _tokenId: string;
    protected _dispatcher: Dispatcher;
    protected _tokenListToWaitFor: Array<string>;
    protected _withTrace: boolean;
    protected _emitter: ShadowLib.Event.Emitter;
    /**
     * Retreives the unique store identifier
     * @property {string} tokenId
     */
    readonly tokenId: string;
    /**
     * Retreives the dispatcher witch the store is registered to.
     * @property {Dispatcher} dispatcher;
     */
    readonly dispatcher: Dispatcher;
    /**
     * Creates a new store
     * @constructor
     */
    constructor();
    /**
     * Gets access to the internal emitter to register for a specific event
     * @property {RegisterEventDelegate} on
     */
    readonly on: RegisterEventDelegate;
    /**
     * Gets access to the internal emitter to register once for a specific event
     * @property {RegisterEventDelegate} once
     */
    readonly once: RegisterEventDelegate;
    /**
     * Gets or sets the token list to wait for
     */
    tokenListToWaitFor: Array<string>;
    /**
     * Emit a new event after a state change
     * @param eventName The event name, "updated" by default
     */
    protected emit(eventName?: string): void;
    abstract dispatchHandler(payload: Action, success: () => void, error: (error: Error) => void): void;
    protected abstract initializeState(): void;
    protected abstract nextState(state: T): void;
    abstract getState(): any;
}
export declare abstract class Store<T> extends BaseStore<T> {
    protected _state: any;
    protected _states: Array<T>;
    protected initializeState(): void;
    constructor();
    protected nextState(state?: T): void;
    abstract dispatchHandler(payload: Action, success: () => void, error: (error: Error) => void): void;
    abstract getState(): T;
}
export declare abstract class MapStore<T> extends BaseStore<T> {
    protected _state: Immutable.Map<string, any>;
    protected _states: Array<T>;
    protected initializeState(): void;
    constructor();
    getState(): T;
    getMapState(): Immutable.Map<string, any>;
    protected nextState(state?: T): void;
    protected nextState(state?: T, mergeDescriptor?: mergeDescriptor): void;
    abstract dispatchHandler(payload: Action, success: () => void, error: (error: Error) => void): void;
    abstract initState(): void;
}
