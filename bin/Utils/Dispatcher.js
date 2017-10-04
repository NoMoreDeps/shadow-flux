"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Import declarations
 */
var es6_promise_1 = require("es6-promise");
var ShadowLib = require("shadow-lib"); // Shadow Guid Module
var Guid = ShadowLib.Text.Guid;
/**@module Flux */
/**
 * This class aims to handle action dispatch to stores, and ensure that stores are updated in an ordered or unordered way
 * @class Dispatcher
 * @md
 */
var Dispatcher = /** @class */ (function () {
    /**
     * @constructor
     * @md
     */
    function Dispatcher(withTrace) {
        if (withTrace === void 0) { withTrace = false; }
        this.storesHandlerPool = [];
        this.storesPoolMap = {};
        this._isDispatching = false;
        this.bufferedActions = [];
        this.actions = [];
        this.withTrace = withTrace;
        this.storeTraces = [];
        this.storesMap = {};
    }
    /**
     * Registers a callback to be invoked with every dispatched payload.
     * Returns a token that can be used with waitFor().
     * @method register<T>
     * @param {T} store The store instance
     * @param {string} id The id to use. By default, a new Guid will be generated
     * @return {string} The Id
     * @md
     */
    Dispatcher.prototype.register = function (store, id) {
        var storeIdx = this.storesHandlerPool.push(store.dispatchHandler.bind(store)) - 1;
        var guid = id || new Guid().toString();
        this.storesPoolMap[guid] = storeIdx;
        store["_tokenId"] = guid;
        store["_dispatcher"] = this;
        store["_withTrace"] = this.withTrace;
        this.storesMap[store.tokenId] = store;
        if (this.withTrace) {
            this.storeTraces.push(store);
        }
        return guid;
    };
    /**
     * Retreive a store based on the storeTokenId
     * @method getStoreFromTokenId
     * @generic {T} Generic store type
     * @param {string} id The store id
     * @return {T} The corresponding store if available
     */
    Dispatcher.prototype.getStoreFromTokenId = function (id) {
        return this.storesMap[id];
    };
    /**
     * Gets all traces for debug purpose
     * @method getTraces
     * @return {Array<TraceType>}
     */
    Dispatcher.prototype.getTraces = function () {
        var res = [];
        var i = 0;
        var _loop_1 = function (action) {
            var trace = {};
            trace["action"] = action;
            trace["stores"] = [];
            this_1.storeTraces.forEach(function (store) {
                trace["stores"].push({
                    token: store.tokenId,
                    trace: store["_states"][i],
                    state: store["_states"][i + 1] || store["_state"]
                });
            });
            res.push(trace);
        };
        var this_1 = this;
        for (var _i = 0, _a = this.actions; _i < _a.length; _i++) {
            var action = _a[_i];
            _loop_1(action);
        }
        return res;
    };
    /**
     * Removes a callback based on its token.
     * @method unregister
     * @param {string} id The store id
     * @return {void}
     */
    Dispatcher.prototype.unregister = function (id) {
        if (id in this.storesPoolMap) {
            delete this.storesHandlerPool[this.storesPoolMap[id]];
            delete this.storesPoolMap[id];
            delete this.storesMap[id];
            this.storesHandlerPool = this.storesHandlerPool.filter(function (itm) { return itm !== void 0; });
        }
    };
    /**
     * Waits for the callbacks specified to be invoked before continuing execution of the current callback.
     * This method should only be used by a callback in response to a dispatched payload.
     * @method waitFor
     * @param {Array<string>} ids List of stores to wait for end of handling, before processing the action
     * @param {Action} action The action to process when ready
     * @return {Promise<void>}
     */
    Dispatcher.prototype.waitFor = function (ids, action) {
        var _this = this;
        var pmsList = ids.map(function (tokenId) {
            var res = _this.getPromiseFromProcessList(tokenId, action);
            if (res === void 0) {
                res = new es6_promise_1.Promise(function (r, x) {
                    console.log("Error", "no token found named", tokenId);
                });
            }
            return res;
        });
        return new es6_promise_1.Promise(function (r, x) {
            es6_promise_1.Promise.all(pmsList)
                .then(function () {
                console.log("Promise All has been resolved for ids", ids);
                r();
            });
        });
    };
    /**
     * Gets a list of Promise from internal list tp process
     * @method getPromiseFromProcessList
     * @param {string} index The key
     * @param {Action} the action to apply
     * @return {Promise<void>}
     */
    Dispatcher.prototype.getPromiseFromProcessList = function (index, action) {
        if (typeof (this.disptachStoreProcessList[index]) === "number") {
            var bindedHandler_1 = this.storesHandlerPool[this.storesPoolMap[index]];
            this.disptachStoreProcessList[index] = new es6_promise_1.Promise(function (rc, xc) {
                bindedHandler_1(action, rc, xc);
            });
        }
        return this.disptachStoreProcessList[index];
    };
    /**
     * Creates a new list of promise to process
     * @method createProcessList
     * @param {Action} action
     * @return {Promise<void>}
     */
    Dispatcher.prototype.createProcessList = function (action) {
        var _this = this;
        return new es6_promise_1.Promise(function (r, x) {
            _this.disptachStoreProcessList = {};
            Object.keys(_this.storesPoolMap).forEach(function (index) {
                _this.disptachStoreProcessList[index] = _this.storesPoolMap[index];
            });
            r();
        });
    };
    /**
     * Dispatch the action to all stores
     * @method dispatchAction
     * @param {Action} action
     * @return {void}
     */
    Dispatcher.prototype.dispatchAction = function (action) {
        var _this = this;
        if (this.withTrace) {
            // Controls if there is no cycle references between stores
            Object.keys(this.storesMap).forEach(function (key) {
                var source = _this.storesMap[key];
                var sourceTokens = source.tokenListToWaitFor;
                sourceTokens.forEach(function (token) {
                    if (_this.storesMap[token].tokenListToWaitFor.indexOf(source.tokenId) !== -1) {
                        throw Error("Cycling references detected between store <" + source.tokenId + "> and <" + token + ">");
                    }
                });
            });
            this.actions.push(action);
        }
        this.createProcessList(action).then(function () {
            var pmsList = [];
            Object.keys(_this.storesPoolMap).forEach(function (index) {
                pmsList.push(_this.getPromiseFromProcessList(index, action));
            });
            es6_promise_1.Promise.all(pmsList).then(function () {
                if (_this.bufferedActions.length === 0) {
                    console.log("All actions has been solved");
                    _this._isDispatching = false;
                }
                else {
                    console.log("Current action is solved, but there is another one");
                    _this.dispatchAction(_this.bufferedActions.shift());
                }
            }).catch(function (ex) {
                console.error(ex);
            });
        });
    };
    /**
     * Dispatch the action or bufferize it if an action is already processing
     * @method dispatch
     * @generic {T}
     * @param {Action & T} action The action to dispatch
     * @return {void}
     */
    Dispatcher.prototype.dispatch = function (action) {
        this.bufferedActions.push(action);
        if (!this._isDispatching) {
            this._isDispatching = true;
            this.dispatchAction(this.bufferedActions.shift());
        }
    };
    /**
     * Gets a value indicating wether or not an action is dispatching
     * @method isDispatching
     * @return {boolean}
     */
    Dispatcher.prototype.isDispatching = function () {
        return this._isDispatching;
    };
    return Dispatcher;
}());
exports.Dispatcher = Dispatcher;
/**@endClass */
/**@endModule */
