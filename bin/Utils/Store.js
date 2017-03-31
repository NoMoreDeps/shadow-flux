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
System.register(["shadow-lib/Event/Emitter"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var Emitter_1;
    var BaseStore, Store, MapStore;
    return {
        setters:[
            function (Emitter_1_1) {
                Emitter_1 = Emitter_1_1;
            }],
        execute: function() {
            /**
             * @class BaseStore
             * @generic {T}
             */
            BaseStore = (function () {
                /**
                 * Creates a new store
                 * @constructor
                 */
                function BaseStore() {
                    this._tokenId = "";
                    this._tokenListToWaitFor = [];
                    this._dispatcher = void 0;
                    this._withTrace = false;
                    this._emitter = new Emitter_1.Emitter();
                }
                Object.defineProperty(BaseStore.prototype, "tokenId", {
                    /**
                     * Retreives the unique store identifier
                     * @property {string} tokenId
                     */
                    get: function () {
                        return this._tokenId;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BaseStore.prototype, "dispatcher", {
                    /**
                     * Retreives the dispatcher witch the store is registered to.
                     * @property {Dispatcher} dispatcher;
                     */
                    get: function () {
                        return this._dispatcher;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BaseStore.prototype, "on", {
                    /**
                     * Gets access to the internal emitter to register for a specific event
                     * @property {RegisterEventDelegate} on
                     */
                    get: function () {
                        return this._emitter.on.bind(this._emitter);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BaseStore.prototype, "once", {
                    /**
                     * Gets access to the internal emitter to register once for a specific event
                     * @property {RegisterEventDelegate} once
                     */
                    get: function () {
                        return this._emitter.once.bind(this._emitter);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BaseStore.prototype, "tokenListToWaitFor", {
                    /**
                     * Gets or sets the token list to wait for
                     */
                    get: function () {
                        return this._tokenListToWaitFor;
                    },
                    set: function (tokens) {
                        this._tokenListToWaitFor = tokens;
                    },
                    enumerable: true,
                    configurable: true
                });
                return BaseStore;
            }());
            exports_1("BaseStore", BaseStore);
            Store = (function (_super) {
                __extends(Store, _super);
                function Store() {
                    _super.call(this);
                    this.initializeState();
                }
                Store.prototype.initializeState = function () {
                    this._state = void 0;
                    this._states = [];
                };
                Store.prototype.nextState = function (state) {
                    if (state === void 0) { state = void 0; }
                    if (this._withTrace) {
                        this._states.push(this._state);
                    }
                    if (state !== void 0) {
                        this._state = state;
                    }
                };
                return Store;
            }(BaseStore));
            exports_1("Store", Store);
            MapStore = (function (_super) {
                __extends(MapStore, _super);
                function MapStore() {
                    _super.call(this);
                    this.initializeState();
                }
                MapStore.prototype.initializeState = function () {
                    this._state = void 0;
                    this._states = [];
                };
                MapStore.prototype.getState = function () {
                    return this._state;
                };
                MapStore.prototype.nextState = function (state) {
                    if (state === void 0) { state = void 0; }
                    if (this._withTrace) {
                        this._states.push(this._state.toJS());
                    }
                    if (state !== void 0) {
                        this._state = this._state.merge(state);
                    }
                };
                return MapStore;
            }(BaseStore));
            exports_1("MapStore", MapStore);
        }
    }
});
