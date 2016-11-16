var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
System.register("Utils/Action", [], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters:[],
        execute: function() {
        }
    }
});
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
System.register("Utils/Store", ["shadow-lib/Event/Emitter"], function(exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var Emitter_1;
    var BaseStore, Store;
    return {
        setters:[
            function (Emitter_1_1) {
                Emitter_1 = Emitter_1_1;
            }],
        execute: function() {
            BaseStore = (function () {
                function BaseStore() {
                    this._tokenId = "";
                    this._tokenListToWaitFor = [];
                    this._dispatcher = void 0;
                    this._withTrace = false;
                    this._emitter = new Emitter_1.Emitter();
                }
                Object.defineProperty(BaseStore.prototype, "tokenId", {
                    get: function () {
                        return this._tokenId;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BaseStore.prototype, "dispatcher", {
                    get: function () {
                        return this._dispatcher;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BaseStore.prototype, "on", {
                    get: function () {
                        return this._emitter.on.bind(this._emitter);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BaseStore.prototype, "once", {
                    get: function () {
                        return this._emitter.once.bind(this._emitter);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BaseStore.prototype, "tokenListToWaitFor", {
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
            exports_2("BaseStore", BaseStore);
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
            exports_2("Store", Store);
        }
    }
});
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
System.register("Utils/Dispatcher", ["es6-promise", "shadow-lib/Text/Guid"], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var es6_promise_1, Guid_1;
    var Dispatcher;
    return {
        setters:[
            function (es6_promise_1_1) {
                es6_promise_1 = es6_promise_1_1;
            },
            function (Guid_1_1) {
                Guid_1 = Guid_1_1;
            }],
        execute: function() {
            /**@module Flux */
            /**
             * This class aims to handle action dispatch to stores, and ensure that stores are updated in an ordered or unordered way
             * @class Dispatcher
             * @md
             */
            Dispatcher = (function () {
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
                    var guid = id || new Guid_1.Guid().toString();
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
                Dispatcher.prototype.getStoreFromTokenId = function (id) {
                    return this.storesMap[id];
                };
                Dispatcher.prototype.getTraces = function () {
                    var res = [];
                    var i = 0;
                    var _loop_1 = function(action) {
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
                // Removes a callback based on its token.
                Dispatcher.prototype.unregister = function (id) {
                    if (id in this.storesPoolMap) {
                        delete this.storesHandlerPool[this.storesPoolMap[id]];
                        delete this.storesPoolMap[id];
                        delete this.storesMap[id];
                        this.storesHandlerPool = this.storesHandlerPool.filter(function (itm) { return itm !== void 0; });
                    }
                };
                // Waits for the callbacks specified to be invoked before continuing execution of the current callback.
                // This method should only be used by a callback in response to a dispatched payload.
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
                Dispatcher.prototype.getPromiseFromProcessList = function (index, action) {
                    if (typeof (this.disptachStoreProcessList[index]) === "number") {
                        var bindedHandler_1 = this.storesHandlerPool[this.storesPoolMap[index]];
                        this.disptachStoreProcessList[index] = new es6_promise_1.Promise(function (rc, xc) {
                            bindedHandler_1(action, rc, xc);
                        });
                    }
                    return this.disptachStoreProcessList[index];
                };
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
                Dispatcher.prototype.disptachAction = function (action) {
                    var _this = this;
                    if (this.withTrace) {
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
                                _this.disptachAction(_this.bufferedActions.shift());
                            }
                        }).catch(function (ex) {
                            console.error(ex);
                        });
                    });
                };
                //  a payload to all registered callbacks.
                Dispatcher.prototype.dispatch = function (action) {
                    this.bufferedActions.push(action);
                    if (!this._isDispatching) {
                        this._isDispatching = true;
                        this.disptachAction(this.bufferedActions.shift());
                    }
                };
                // Is this Dispatcher currently dispatching.
                Dispatcher.prototype.isDispatching = function () {
                    return this._isDispatching;
                };
                return Dispatcher;
            }());
            exports_3("Dispatcher", Dispatcher);
        }
    }
});
/**@endClass */
/**@endModule */
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
System.register("Flux", ["Utils/Dispatcher", "Utils/Store"], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var Dispatcher_1, Store_1;
    return {
        setters:[
            function (Dispatcher_1_1) {
                Dispatcher_1 = Dispatcher_1_1;
            },
            function (Store_1_1) {
                Store_1 = Store_1_1;
            }],
        execute: function() {
            exports_4("Dispatcher", Dispatcher_1.Dispatcher);
            exports_4("Store", Store_1.Store);
        }
    }
});
System.register("__tests__/test", ["Flux"], function(exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var flux;
    var TestStore, TestStoreWaiter;
    return {
        setters:[
            function (flux_1) {
                flux = flux_1;
            }],
        execute: function() {
            TestStore = (function (_super) {
                __extends(TestStore, _super);
                function TestStore() {
                    _super.apply(this, arguments);
                }
                TestStore.prototype.dispatchHandler = function (payload, success, error) {
                    if (payload.type === "TestAction") {
                        this.nextState(payload.value);
                        this._emitter.emit("TestAction_Update", this);
                    }
                    success();
                };
                TestStore.prototype.getState = function () {
                    return this._state;
                };
                return TestStore;
            }(flux.Store));
            TestStoreWaiter = (function (_super) {
                __extends(TestStoreWaiter, _super);
                function TestStoreWaiter() {
                    _super.apply(this, arguments);
                }
                TestStoreWaiter.prototype.dispatchHandler = function (payload, success, error) {
                    var _this = this;
                    if (payload.type === "TestAction") {
                        this._dispatcher.waitFor(this._tokenListToWaitFor, payload).then(function () {
                            _this.nextState(payload.value + _this._dispatcher.getStoreFromTokenId(_this._tokenListToWaitFor[0]).getState());
                            _this._emitter.emit("TestAction2_Update", _this);
                            success();
                        });
                    }
                };
                TestStoreWaiter.prototype.getState = function () {
                    return this._state;
                };
                return TestStoreWaiter;
            }(flux.Store));
            describe("Flux tests", function () {
                var dispatcher = null;
                var store;
                var waitStore;
                it("Initialize a new dispatcher", function () {
                    dispatcher = new flux.Dispatcher();
                    expect(dispatcher).toBeDefined();
                });
                it("Initialize a store", function () {
                    store = new TestStore();
                    expect(store).toBeDefined();
                });
                it("Register the store in the dispatcher", function () {
                    dispatcher.register(store);
                    // Gets the tokenId
                    var key = store.tokenId;
                    expect(key.length).toBeGreaterThan(0);
                    expect(dispatcher["storesPoolMap"][key]).toEqual(0);
                });
                it("Should be notified from a TestAction", function () {
                    return new Promise(function (r, x) {
                        store.once("TestAction_Update", function (sender) {
                            expect(sender.getState()).toBe(42);
                            r();
                        });
                        dispatcher.dispatch({
                            "type": "TestAction",
                            "value": 42
                        });
                    });
                });
                it("Should wait for the proper stores to process action in the correct order", function () {
                    return new Promise(function (r, x) {
                        waitStore = new TestStoreWaiter();
                        waitStore.tokenListToWaitFor = [store.tokenId];
                        dispatcher.register(waitStore);
                        var first = true;
                        waitStore.once("TestAction2_Update", function () {
                            expect(first).toBeFalsy();
                            expect(waitStore.getState()).toBe(100);
                            r();
                        });
                        store.once("TestAction_Update", function () {
                            first = false;
                        });
                        dispatcher.dispatch({
                            "type": "TestAction",
                            "value": 50
                        });
                    });
                });
            });
        }
    }
});
