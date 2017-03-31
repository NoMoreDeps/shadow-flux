/// <reference types="react" />
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
export declare type actionCreator = (...params: any[]) => Action & any;
export declare type mapToStateType = {
    [key: string]: mapToStateType | mapToState;
};
export declare type mapToPropsType = {
    [key: string]: mapToPropsType | mapToProps;
};
export declare type mapToActionsType = {
    [key: string]: mapToActionsType | actionCreator;
};
export declare abstract class Container<T> extends React.Component<{
    dispatcher: Dispatcher;
}, T> {
    private _hashComponent;
    private _hashEvent;
    protected _dispatcher: Dispatcher;
    protected actions: mapToActionsType;
    protected mapState: mapToStateType;
    protected mapProps: mapToPropsType;
    state: any;
    constructor(props: {
        dispatcher: Dispatcher;
    });
    getStore<K>(storeTokenId: string): K;
    getState(): T;
    subscribe<T>(storeTokenId: string, eventName: string, mapToStateHandler: mapToState, handler: (stateData: T) => void): EmitterAutoOff;
    unsubscribe(storeTokenId: string, eventName: string): void;
    abstract nextState(newState: T): boolean;
    abstract initState(): void;
    abstract render(): JSX.Element;
}
