System.register(["./Utils/Store", "./Utils/Dispatcher", "./React/MapContainer", "./React/Container"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Store_1, Dispatcher_1, MapContainer_1, Container_1;
    return {
        setters:[
            function (Store_1_1) {
                Store_1 = Store_1_1;
            },
            function (Dispatcher_1_1) {
                Dispatcher_1 = Dispatcher_1_1;
            },
            function (MapContainer_1_1) {
                MapContainer_1 = MapContainer_1_1;
            },
            function (Container_1_1) {
                Container_1 = Container_1_1;
            }],
        execute: function() {
            exports_1("Dispatcher", Dispatcher_1.Dispatcher);
            exports_1("Store", Store_1.Store);
            exports_1("MapStore", Store_1.MapStore);
            exports_1("Container", Container_1.Container);
            exports_1("MapContainer", MapContainer_1.MapContainer);
        }
    }
});
