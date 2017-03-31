System.register(["../Flux"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
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
                it("Should raise an error if a cycling reference is detected", function () {
                    return new Promise(function (r, x) {
                        var d = new flux.Dispatcher(true);
                        var d1 = new TestStore();
                        var d2 = new TestStore();
                        d.register(d1, "d1");
                        d.register(d2, "d2");
                        d1.tokenListToWaitFor = ["d2"];
                        d2.tokenListToWaitFor = ["d1"];
                        expect(function () {
                            d.dispatch({ type: "" });
                        }).toThrowError("Cycling references detected between store <" + d1.tokenId + "> and <" + d2.tokenId + ">");
                        r();
                    });
                });
            });
        }
    }
});
