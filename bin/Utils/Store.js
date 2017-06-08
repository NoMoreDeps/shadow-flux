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
var ShadowLib = require("shadow-lib");
var Immutable = require("immutable");
var Emitter = ShadowLib.Event.Emitter;
/**
 * @class BaseStore
 * @generic {T}
 */
var BaseStore = (function () {
    /**
     * Creates a new store
     * @constructor
     */
    function BaseStore() {
        this._tokenId = "";
        this._tokenListToWaitFor = [];
        this._dispatcher = void 0;
        this._withTrace = false;
        this._emitter = new Emitter();
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
    /**
     * Emit a new event after a state change
     * @param eventName The event name, "updated" by default
     */
    BaseStore.prototype.emit = function (eventName) {
        if (eventName === void 0) { eventName = "updated"; }
        this._emitter.emit(eventName);
    };
    return BaseStore;
}());
exports.BaseStore = BaseStore;
var Store = (function (_super) {
    __extends(Store, _super);
    function Store() {
        var _this = _super.call(this) || this;
        _this.initializeState();
        return _this;
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
exports.Store = Store;
var MapStore = (function (_super) {
    __extends(MapStore, _super);
    function MapStore() {
        var _this = _super.call(this) || this;
        _this.initializeState();
        _this.initState();
        return _this;
    }
    MapStore.prototype.initializeState = function () {
        this._state = void 0;
        this._states = [];
    };
    MapStore.prototype.getState = function () {
        return this._state.toJS();
    };
    MapStore.prototype.getMapState = function () {
        return this._state;
    };
    MapStore.prototype.nextState = function (state, mergeDescriptor) {
        if (state === void 0) { state = void 0; }
        if (mergeDescriptor === void 0) { mergeDescriptor = void 0; }
        if (this._withTrace) {
            this._states.push(this._state.toJS());
        }
        if (state !== void 0) {
            var newData_1 = Immutable.fromJS(state);
            var currentData_1 = this._state;
            var newState_1 = currentData_1.mergeDeep(newData_1);
            if (mergeDescriptor) {
                mergeDescriptor.forEach(function (elt) {
                    var path = elt.path.split(".");
                    switch (elt.action) {
                        case "keep":
                            newState_1 = newState_1.setIn(path, currentData_1.getIn(path));
                            break;
                        case "replace":
                            newState_1 = newState_1.setIn(path, newData_1.getIn(path));
                            break;
                    }
                });
            }
            var res = newState_1.equals(this._state);
            if (!res) {
                this._state = newState_1;
            }
        }
    };
    return MapStore;
}(BaseStore));
exports.MapStore = MapStore;
