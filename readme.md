## Shadow Flux
Shadow Flux is an implementation of the Flux pattern in Typescript. It can be used on Typescript and Javascript projects

### Installation

```bash
  npm i -S shadow-flux
```

### Overview
Flux follows a simple unidirectional data flow pattern that can be sumurized as below :

<pre>
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
</pre>

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

### To be continued