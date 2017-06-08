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
var React = require("react");
var Container = (function (_super) {
    __extends(Container, _super);
    function Container(props) {
        var _this = _super.call(this, props) || this;
        _this._hashComponent = {};
        _this._hashEvent = {};
        _this._dispatcher = _this.props.dispatcher;
        _this.initState();
        return _this;
    }
    Container.prototype.getStore = function (storeTokenId) {
        return this._dispatcher.getStoreFromTokenId(storeTokenId);
    };
    Container.prototype.getState = function () {
        return this.state;
    };
    Container.prototype.subscribe = function (storeTokenId) {
        var _this = this;
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var eventName;
        var mapToStateHandler;
        var handler;
        if (params.length === 1) {
            eventName = "updated";
            mapToStateHandler = null;
            handler = params[0];
        }
        else if (params.length === 2) {
            if (typeof params[0] === "string") {
                eventName = params[0], handler = params[1];
                mapToStateHandler = null;
            }
            else {
                eventName = "updated";
                mapToStateHandler = params[0], handler = params[1];
            }
        }
        else if (params.length === 3) {
            eventName = params[0], mapToStateHandler = params[1], handler = params[2];
        }
        var registeredEvent = this.getStore(storeTokenId).on(eventName, function () {
            var storeState = _this.getStore(storeTokenId).getState();
            mapToStateHandler = mapToStateHandler || function (storeState) { return storeState; };
            var stateData = mapToStateHandler(storeState);
            handler(stateData);
        });
        var hashKey = storeTokenId + "." + eventName;
        if (this._hashEvent[hashKey]) {
            throw Error("The event <" + eventName + "> for store <" + storeTokenId + "> has already been registered");
        }
        this._hashEvent[hashKey] = registeredEvent;
        return registeredEvent;
    };
    /**
     * Unsubscribe for a specific event for a specific store
     * @param {string} storeTokenId The token identifying the store
     * @param {string} eventName The event to unscribe for, "updated" by default
     */
    Container.prototype.unsubscribe = function (storeTokenId, eventName) {
        if (eventName === void 0) { eventName = "updated"; }
        var hashKey = storeTokenId + "." + eventName;
        if (this._hashEvent[hashKey]) {
            this._hashEvent[hashKey].off();
            delete this._hashEvent[hashKey];
            return true;
        }
        return false;
    };
    return Container;
}(React.Component));
exports.Container = Container;
