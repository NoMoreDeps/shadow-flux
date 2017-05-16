## Shadow Flux
Shadow Flux is an implementation of the Flux pattern in Typescript. It can be used on Typescript and Javascript projects

### Installation

```bash
  npm i -S shadow-flux
```

### Overview
Flux follows a simple unidirectional data flow pattern that can be sumurized as below :

```
                            +-----------+
+--------------------------->  SERVER   |
|                           +-----+-----+
|                                 |
|                                 |
|     +------------+        +-----v-----+       +------------+
|     |    VIEW    +------->+   ACTION  +-------> DISPATCHER |
|     +-----^------+        +-----------+       +-----+------+
|           |                                         |
|           |                                         |
|           |               +------------+            |
|           +---------------+   STORE    <------------+
|                           +-----+------+
|                                 |
+---------------------------------+

```

* An action is triggered from a view or from a server
* The action is stacked in the dispatcher
* The dispatcher dispatches one action at a time
* Any store can handle the action
* Any store can wait for another store to finish before processing the action

## How to use it
### First you have to import all the Classes

```javascript
import * as Flux from "shadow-flux";
```

### Create a new Store
To create a new store, you can extend one of the base classes.
The simplest way is to extend the Store<T> class. the `<T>`  generic parameter represents the `State Type` of the store.

```javascript
/**
 * You have to expose a Type for your state.
 * You can reuse this type to extend the payload
 * action if needed
 */
export type State = {
  value: number
};

/**
 * You have to specify the payload type.
 * Any payload should be compatible with the Flux.Action type.
 * Flux.Action is type of { type: string }
 * So you can extend it with the Intersect Operator `&`
 */
export Action = Flux.Action & State;


/**
 * You have to define the Store class, by extending a base one
 * If you prefer keeping an internal state as an Immutable Map
 * and expose a JSON object as the public state, you can extends
 * the MapStore<T> instead.
 */
export default class extends Flux.Store<number> {
  constructor() {
    super();
  }

  /* 
   * This function is automaticaly called at the end
   * of the super constructor
   */
  initializeState(): void {
    this._state = 0;
  }

  /**
   * You need to implement the dispatchHandler function to handle an action
   */
  dispatchHandler( 
    payload : Action        , 
    success : () => void    ,   
    error   : (error: Error
  ) => void): void {
    // Here you need to check the action type in order to know
    // If you want to process the action or not
    if (payload.type === "something I want") {
      
      // Now you can update your state
      this.nextState(payload.value);

      // When you have finished to update your state, you have to emit an event to tell all views
        // that they can retreive the data
        this._emitter.emit("My_Event_That_Tells_I_Have_Finished");
        
        //The disptach handler should be terminated with the success method or the error method
        success();

      /***********************************************/
      /********************** OR *********************/
      /***********************************************/

      // If you need to wait for another store to process first
      // You can use the dispatcher waitFor function
      this.dispatcher.waitFor(this.tokenListToWaitFor, payload).then(() => {
        // Gets the store I want to check the state
        let valueOfStore = this.dispatcher.getStoreFromTokenId("AnotherStore").getState();

        // Now you can update your state        
        this.nextState(payload.value + valueOfStore);
        
        // When you have finished to update your state, you have to emit an event to tell all views
        // that they can retreive the data
        this._emitter.emit("My_Event_That_Tells_I_Have_Finished");
        
        //The disptach handler should be terminated with the success method or the error method
        success();
      });
    }
  }
}
```
### Using an Immutable based Store
In order to use a store which state is Immutable, you can use the MapStore<T> class. This Store helps you manipulate Immutable based states

By default, the nextState function will apply a mergeDeep of the new state to the current one. You can provide a mergeDescriptor if you want the nextState to apply specific rules when merging, like keeping an old value or replacing it without merging it
```javascript
export type State = {
  id : string;
  nested: {
    name       : string        ;
    collection : Array<number> ;
  }
};

export class myMapStore extends MapStore<State> {
  constructor() {
    super();
  }

  dispatchHandler(payload: Action, success: () => void, error: (error: Error) => void): void {
    /** ... **/
    switch(payload.type) {
      case "SomeAction":
        this.nextState({
          id: "newId"
        });
      break;
      case "OtherMerge":
      /** 
        We assume that we got an object nammed newState like that : {
          nested: {
            name: "NewName",
            collection: ["new","array"]
          }
        }

      **/
      // Here we dont want to merge the collection, but we dont want to alter the object too.
      // So we will tell the nextsate that we want to Keep the current collection data
      this.nextState(newState, [{ path: "nested.collection", action:"keep"}]);

      // If we want instead to replace the collection, ignoring the merge, we can do like that
      this.nextState(newState, [{ path: "nested.collection", action:"replace"}]);
        
      break;
    }
  }
}
```
### Using the Container
If you use Stores, you need to use some view-controller from React code.
You can use Container, or their immutable counterpart MapContainer, to interact with stores

Keep in mind that in MapContainer class, the nextstate function has the same behaviour that in the MapStore.

To create a new Container, you can do like that :
```javascript
export type Props = {
  dispatcher: Flux.Dispatcher;
}

export type State ={
  ... // you state description
}

export class MyContainer extends Flux.Container<Props, State> {
  constructor(props: Props) {
    super(props)
  } 
}
```

### To be continued

### What's new in version 1.0.15
* MapStore nextState uses mergeDeep instead of merge
* MapStore now uses a descriptor with nextState to allow better configuration of the mergeDeep

### What's new in version 1.0.10
* Subscribe function now has the mapToStateHandler optional, it will just return the storeSate as is by default.
* MapStore getState returns the Map.toJS()
* MapStore has a new getMapState() to return the Map State instead of the JS representation
* MapContainer nextState use mergeDeep instead of merge
* MapContainer now use a descriptor with nextState to allow better configuration of the mergeDeep