Shadow-Flux
===

Shadow Flux is an implementation of the Flux pattern in Typescript. It can be used on Typescript and Javascript projects

Version 2 available

Please find all documentation available on [Shadow-Flux Website](https://fskorzec.github.io/shadowjs/)

Enjoy !

**What's next**
===
* Updating Unit tests suite
* Updating Online documentation to see how to use the TimeLine debugger

**What's new in version 2.0.11**
===
* Updated type TDispatch handler to use a payload type from TAction to <T extends TActions>
This was causing a typing issue in strict mode

**What's new in version 2.0.10**
* Updated The dispatcher so it can delay to the next execution Frame the next payload processing,
so the UI can refresh between each action if mulples are stacked.

**What's new in version 2.0.9**
* Fixed await For that was not waiting anymore

**What's new in version 2.0.8**
* Fixed the getStoreState type issue.
<br />Compatible with the WIP timeline debugger interface.

* Documentation update and TimeLine UI will be online very soon

* Added new global error handler, use it with : subscriber.onError

**What's new in version 2.0.7**
* Added A default Strategy Pattern implementation to handle the default behavior of teh DispatchHandler function
<br />See the advance programming section of the store in the documentation

**What's new in version 2.0.6**
* Fixed the npm package to include the missing Index.d.ts file and sourcemap
<br/>(Sorry for that !)

* Fixed the npm package to include the types attribute

**What's new in version 2.0.2**
* Complete rewrite of the library

**What's new in version 1.0.16**
* Moved to github

**What's new in version 1.0.15**
* Added few new prototypes on the subscribe method of a container.
* Added an emit function on the Store class, no need to call this._emitter.emit anymore, just this.emit
* Now the eventName of a subscribe | unsubscribe and an emit is optional. By default, the event updated will be used

**What's new in version 1.0.14**
* MapContainer nexState parameter has now the same type as the MapContainer * JS State Same behaviour was already implemented in the MapStore.

**What's new in version 1.0.13**
* MapStore nextState uses mergeDeep instead of merge
* MapStore now uses a descriptor with nextState to allow better configuration of the mergeDeep

**What's new in version 1.0.10**
* Subscribe function now has the mapToStateHandler optional, it will just return the storeSate as is by default.
* MapStore getState returns the Map.toJS()
* MapStore has a new getMapState() to return the Map State instead of the JS representation
* MapContainer nextState use mergeDeep instead of merge
* MapContainer now use a descriptor with nextState to allow better configuration of the mergeDeep