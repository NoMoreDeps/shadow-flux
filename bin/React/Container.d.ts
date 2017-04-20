/// <reference types="react" />
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
import { Action, Dispatcher } from "../Flux";
import * as ShadowLib from "shadow-lib";
import EmitterAutoOff = ShadowLib.Event.EmitterAutoOff;
export declare type mapToState = (storeState: any) => {
    [key: string]: any;
};
export declare type mapToProps = (state: any) => {
    [key: string]: any;
};
export declare type actionCreator = (...params: any[]) => Action & any | void;
export declare type mapToStateType = {
    [key: string]: mapToStateType | mapToState;
};
export declare type mapToPropsType = {
    [key: string]: mapToPropsType | mapToProps;
};
export declare type mapToActionsType = {
    [key: string]: mapToActionsType | actionCreator;
};
export declare type requiredProps = {
    dispatcher: Dispatcher;
};
export declare abstract class Container<P extends requiredProps, S> extends React.Component<P, S> {
    private _hashComponent;
    private _hashEvent;
    protected _dispatcher: Dispatcher;
    protected actions: mapToActionsType;
    protected mapState: mapToStateType;
    protected mapProps: mapToPropsType;
    state: any;
    constructor(props: P);
    getStore<K>(storeTokenId: string): K;
    getState(): S;
    subscribe<T>(storeTokenId: string, eventName: string, mapToStateHandler: mapToState, handler: (stateData: T) => void): EmitterAutoOff;
    unsubscribe(storeTokenId: string, eventName: string): void;
    abstract nextState(newState: S): boolean;
    abstract initState(): void;
    abstract render(): JSX.Element;
}
