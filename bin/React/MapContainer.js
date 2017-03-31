System.register(["./Container"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var Container_1;
    var MapContainer;
    return {
        setters:[
            function (Container_1_1) {
                Container_1 = Container_1_1;
            }],
        execute: function() {
            MapContainer = (function (_super) {
                __extends(MapContainer, _super);
                function MapContainer(props) {
                    _super.call(this, props);
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
            exports_1("MapContainer", MapContainer);
        }
    }
});
