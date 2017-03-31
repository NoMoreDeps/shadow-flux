System.register(["react"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React;
    var Container;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            }],
        execute: function() {
            Container = (function (_super) {
                __extends(Container, _super);
                function Container(props) {
                    _super.call(this, props);
                    this._hashComponent = {};
                    this._hashEvent = {};
                    this._dispatcher = this.props.dispatcher;
                    this.initState();
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
            exports_1("Container", Container);
        }
    }
});
