import { BaseStore } from "../Utils/Store";
import { Action } from "../Utils/Action";
/**
 * Defines the trace type
 * @type TraceType
 * @field {Action} action The current action
 */
export declare type TraceType = {
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
        [index: string]: BaseStore<any>;
    };
    protected actions: Array<Action>;
    protected withTrace: boolean;
    protected storeTraces: Array<BaseStore<Object>>;
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
    register(store: BaseStore<any>, id?: string): string;
    /**
     * Retreive a store based on the storeTokenId
     * @method getStoreFromTokenId
     * @generic {T} Generic store type
     * @param {string} id The store id
     * @return {T} The corresponding store if available
     */
    getStoreFromTokenId<T>(id: string): T;
    /**
     * Gets all traces for debug purpose
     * @method getTraces
     * @return {Array<TraceType>}
     */
    getTraces(): Array<TraceType>;
    /**
     * Removes a callback based on its token.
     * @method unregister
     * @param {string} id The store id
     * @return {void}
     */
    unregister(id: string): void;
    /**
     * Waits for the callbacks specified to be invoked before continuing execution of the current callback.
     * This method should only be used by a callback in response to a dispatched payload.
     * @method waitFor
     * @param {Array<string>} ids List of stores to wait for end of handling, before processing the action
     * @param {Action} action The action to process when ready
     * @return {Promise<void>}
     */
    waitFor(ids: Array<string>, action: Action): Promise<void>;
    /**
     * Gets a list of Promise from internal list tp process
     * @method getPromiseFromProcessList
     * @param {string} index The key
     * @param {Action} the action to apply
     * @return {Promise<void>}
     */
    private getPromiseFromProcessList(index, action);
    /**
     * Creates a new list of promise to process
     * @method createProcessList
     * @param {Action} action
     * @return {Promise<void>}
     */
    private createProcessList(action);
    /**
     * Dispatch the action to all stores
     * @method dispatchAction
     * @param {Action} action
     * @return {void}
     */
    private dispatchAction(action);
    /**
     * Dispatch the action or bufferize it if an action is already processing
     * @method dispatch
     * @generic {T}
     * @param {Action & T} action The action to dispatch
     * @return {void}
     */
    dispatch<T>(action: Action & T): void;
    /**
     * Gets a value indicating wether or not an action is dispatching
     * @method isDispatching
     * @return {boolean}
     */
    isDispatching(): boolean;
}
