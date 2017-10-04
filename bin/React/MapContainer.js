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
var Container_1 = require("./Container");
var Immutable = require("immutable");
var MapContainer = /** @class */ (function (_super) {
    __extends(MapContainer, _super);
    function MapContainer(props) {
        return _super.call(this, props) || this;
    }
    MapContainer.prototype.nextState = function (newStateData, mergeDescriptor) {
        var newData = Immutable.fromJS(newStateData);
        var currentData = this.state;
        var newState = currentData.mergeDeep(newData);
        if (mergeDescriptor) {
            mergeDescriptor.forEach(function (elt) {
                var path = elt.path.split(".");
                switch (elt.action) {
                    case "keep":
                        newState = newState.setIn(path, currentData.getIn(path));
                        break;
                    case "replace":
                        newState = newState.setIn(path, newData.getIn(path));
                        break;
                }
            });
        }
        var res = newState.equals(this.state);
        if (!res) {
            this.state = newState;
            this.forceUpdate();
        }
        return !res;
    };
    MapContainer.prototype.getState = function () {
        return this.state.toJS();
    };
    return MapContainer;
}(Container_1.Container));
exports.MapContainer = MapContainer;
