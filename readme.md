Shadow-Flux
===

Shadow Flux is an implementation of the Flux pattern in Typescript. It can be used on Typescript and Javascript projects

Version 3 available.

Please find all documentation available on [Shadow-Flux Website](https://nomoredeps.github.io/shadowjs/)

Enjoy !
<hr />

## Quick start



To get started quickly with **S-Flux**, you can import the following items :

```typescript
import { registerStore, withEvents, TAwaitFor, TBaseStore } from "shadow-flux";
```

Once this is done, you can register your first store with the `registerStore` function.

**Here is a short summary on the use of imported objects**

Name           | Type         | Description
--|--|--
`**registerStore**`| **Function** | *Register a new store with all helpers methods around it.*
`**withEvents**`   | **Function** | *Creates a key-value hashmap to desribe all store's events available*
`**TAwaitFor**`    | **Type**     | *Describes the method prototype used to synchronize one or more stores with each other*
`**TBaseStore**`   | **Type**     | *Desribes the methods availables inside a real store class*


Let's declare two stores, with an dependency between the two. The first store contains a value, the second must always contain the same squared value. Let's start by declaring 
the state of both stores, which will be of same type.

```typescript
type TState = {
  value: number;
}
```

Too easy, now let's prepare the actions available in the 2 stores. Let's start with the first one, the A. This one can perform 1 action, the one to update the value by any number.

```typescript
// We need to declare all store's actions in a Key-value hashmap
const storeA_Actions = {
  // Action
  async setValue(this: TBaseStore<TState>, payload: { value: number }) {
    // Here we can update the state
    this.nextState(payload);
  }
}
```

Now the second store
```typescript
const storeB_Actions = {
  // Action
  async setValue(this: TBaseStore<TState>, payload: void, For: TAwaitFor) {
    // We will wait for store 1 to finish first
    await For(store1.id);

    // Here we can update the state based on Store1
    this.nextState({
      value: store1.getState().value *  store1.getState().value
    });
  }
}
```

And then we have to register the store 
```typescript
const store1 = registerStore({
  // Actions
  actions: storeA_Actions

  // Initialize the state
  init(): TState {
    return { value: 0 }
  }
})

const store2 = registerStore({
  // Actions
  actions: storeB_Actions
  
  // Initialize the state
  init(): TState {
    return { value: 0 }
  }
})
```

To retreive data, we need to register for state change. Since we already now that store 1 will always finish after store 2, we an register for store 2 events.

```typescript
// You can subscribe with full intellisense
store2.subscribeTo.All(_ => {
  _state2 = _;
  _state1 = store1.getState();
})
```

**What's next**
- [ ] Improve Debug visualizer to allow time travel
- [ ] Improve documentation to include use cases

**What's new in version 3.0.1**
===
- [x] Built-In Timeline 
- [x] New documentation website

**What's new in version 3.0.0-beta.6**
* This is the last release before rc1
* Documentation is nto yet ready
* This version comes with some breaking changes so don't upgrade from v2 now

**What's new in version 3.0.0-beta.5**
* Fixed some typing

**What's new in version 3.0.0-beta.4**
* Debug viewer 

**What's new in version 3.0.0-beta.3**
* Fixed missing storeId

**What's new in version 3.0.0-beta.2**
* Add subsribeTo.All to handle all updates
* Add dispatchHandler to globally catch all payloads when no action is defined

**What's new in version 3.0.0-beta.0**
* Full rewrite of the library. (Code size reduced by 60%), using promise.all instead of custom workaround
* Simple way to declare a new store / less code to write
* Store helper now generated with full intellisense
* Auto generated Subscribe method
* Auto generated Action helper method

**What's new in version 2.0.12**
* Fixed Event typing issue with latest typescript compiler
* Updated links to git repository and documentation

**What's new in version 2.0.11**
* Updated type TDispatch handler to use a payload type from TAction to &lt;T extends TActions&gt; 
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