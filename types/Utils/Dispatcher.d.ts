/// <reference types="es6-promise" />
import { Store } from "../Utils/Store";
import { Action } from "../Utils/Action";
export declare type traceType = {
    action: Action;
    stores: Array<{
        token: string;
        trace: Object;
        state: Object;
    }>;
};
/**@module Flux */
/**
 * This class aims to handle action dispatch to stores, and ensure that stores are updated in an ordered or unordered way
 * @class Dispatcher
 * @md
 */
export declare class Dispatcher {
    protected storesHandlerPool: Array<(payload: Action, success: () => void, error: (error: Error) => void) => void>;
    protected storesPoolMap: {
        [index: string]: number;
    };
    protected storesMap: {
        [index: string]: Store<any>;
    };
    protected actions: Array<Action>;
    protected withTrace: boolean;
    protected storeTraces: Array<Store<Object>>;
    protected _isDispatching: boolean;
    protected bufferedActions: Array<Action>;
    protected disptachStoreProcessList: {
        [index: string]: Promise<void> | number;
    };
    /**
     * @constructor
     * @md
     */
    constructor(withTrace?: boolean);
    /**
     * Registers a callback to be invoked with every dispatched payload.
     * Returns a token that can be used with waitFor().
     * @method register<T>
     * @param {T} store The store instance
     * @param {string} id The id to use. By default, a new Guid will be generated
     * @return {string} The Id
     * @md
     */
    register<T>(store: Store<T>, id?: string): string;
    getStoreFromTokenId<T>(id: string): T;
    getTraces(): Array<traceType>;
    unregister(id: string): void;
    waitFor(ids: Array<string>, action: Action): Promise<void>;
    private getPromiseFromProcessList(index, action);
    private createProcessList(action);
    private disptachAction(action);
    dispatch<T>(action: Action & T): void;
    isDispatching(): boolean;
}
