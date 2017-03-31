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
