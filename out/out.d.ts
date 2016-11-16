/// <reference types="es6-promise" />
declare module "Utils/Action" {
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
    export type Action = {
        type: string;
    };
}
declare module "Utils/Store" {
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
    import { Action } from "Utils/Action";
    import { Dispatcher } from "Utils/Dispatcher";
    import { Emitter, EmitterDelegate, EmitterAutoOff } from "shadow-lib/Event/Emitter";
    export abstract class BaseStore<T> {
        protected _tokenId: string;
        protected _dispatcher: Dispatcher;
        protected _tokenListToWaitFor: Array<string>;
        protected _withTrace: boolean;
        protected _emitter: Emitter;
        readonly tokenId: string;
        readonly dispatcher: Dispatcher;
        constructor();
        readonly on: (eventName: string, callback: EmitterDelegate) => EmitterAutoOff;
        readonly once: (eventName: string, callback: EmitterDelegate) => EmitterAutoOff;
        tokenListToWaitFor: Array<string>;
        abstract dispatchHandler(payload: Action, success: () => void, error: (error: Error) => void): void;
        protected abstract initializeState(): void;
        protected abstract nextState(state: T): void;
        abstract getState(): T;
    }
    export abstract class Store<T> extends BaseStore<T> {
        protected _state: T;
        protected _states: Array<T>;
        protected initializeState(): void;
        constructor();
        protected nextState(state?: T): void;
        abstract dispatchHandler(payload: Action, success: () => void, error: (error: Error) => void): void;
        abstract getState(): T;
    }
}
declare module "Utils/Dispatcher" {
    import { Store } from "Utils/Store";
    import { Action } from "Utils/Action";
    export type traceType = {
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
    export class Dispatcher {
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
}
declare module "Flux" {
    /**
     * The MIT License (MIT)
     * Copyright (c) <2016> <Beewix Interactive>
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
    import { Dispatcher } from "Utils/Dispatcher";
    import { Store } from "Utils/Store";
    import { Action } from "Utils/Action";
    export { Dispatcher, Store, Action };
}
declare module "__tests__/test" {
}
