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
var Container_1 = require("./Container");
var MapContainer = (function (_super) {
    __extends(MapContainer, _super);
    function MapContainer(props) {
        return _super.call(this, props) || this;
    }
    MapContainer.prototype.nextState = function (newStateData) {
        var newState = this.state.merge(newStateData);
        var res = newState.equals(this.state);
        if (!res) {
            this.state = newState;
        }
        return !res;
    };
    return MapContainer;
}(Container_1.Container));
exports.MapContainer = MapContainer;
