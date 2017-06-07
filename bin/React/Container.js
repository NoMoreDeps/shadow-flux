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
    Container.prototype.subscribe = function (storeTokenId, eventName, mapToStateHandler, handler) {
        var _this = this;
        var registeredEvent = this.getStore(storeTokenId).on(eventName, function () {
            var storeState = _this.getStore(storeTokenId).getState();
            mapToStateHandler = mapToStateHandler || function (storeState) { return storeState; };
            handler = handler || function () { };
            var stateData = mapToStateHandler(storeState);
            handler(stateData);
        });
        return registeredEvent;
    };
    Container.prototype.unsubscribe = function (storeTokenId, eventName) {
        var hashKey = storeTokenId + "." + eventName;
        if (this._hashEvent[hashKey]) {
            this._hashEvent[hashKey].off();
            delete this._hashEvent[hashKey];
        }
    };
    return Container;
}(React.Component));
exports.Container = Container;
