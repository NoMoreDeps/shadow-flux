"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var flux = require("../Flux");
var TestStore = (function (_super) {
    __extends(TestStore, _super);
    function TestStore() {
        return _super !== null && _super.apply(this, arguments) || this;
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
var TestStoreWaiter = (function (_super) {
    __extends(TestStoreWaiter, _super);
    function TestStoreWaiter() {
        return _super !== null && _super.apply(this, arguments) || this;
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
