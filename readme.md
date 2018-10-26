Shadow-Flux
===

Shadow Flux is an implementation of the Flux pattern in Typescript. It can be used on Typescript and Javascript projects

Version 2 available

Please find all documentation available on [Shaodw-Flux Website](https://fskorzec.github.io/shadowjs/)

Enjoy !

**What's next**
===
* Working on a new feature : Timeline debugging

**What's new in version 2.0.2**
===
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