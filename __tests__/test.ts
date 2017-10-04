import * as flux from "../Flux";
import * as Immutable from "immutable";

/*
type TestAction = {
  value: number
} & flux.Action;

class TestStore extends flux.Store<number> {
  dispatchHandler(payload: TestAction, success: () => void, error: (error: Error) => void): void {
    if (payload.type === "TestAction") {
      this.nextState(payload.value);
      this._emitter.emit("TestAction_Update", this);
    }
    success();
  }

  getState(): number {
    return this._state;
  }
}

class TestStoreWaiter extends flux.Store<number> {
  dispatchHandler(payload: TestAction, success: () => void, error: (error: Error) => void): void {
    if (payload.type === "TestAction") {
      this._dispatcher.waitFor(this._tokenListToWaitFor, payload).then(() => {
        this.nextState(payload.value + this._dispatcher.getStoreFromTokenId<TestStore>(this._tokenListToWaitFor[0]).getState());
        this._emitter.emit("TestAction2_Update", this);
        success();
      });
    }
  }

  getState(): number {
    return this._state;
  }
}

describe( "Flux tests", () => {
  let dispatcher: flux.Dispatcher = null;
  let store: TestStore;
  let waitStore: TestStoreWaiter;

  it("Initialize a new dispatcher", () => {
    dispatcher = new flux.Dispatcher();
    expect(dispatcher).toBeDefined();
  });

  it("Initialize a store", () => {
    store = new TestStore();
    expect(store).toBeDefined();
  });

  it("Register the store in the dispatcher", () => {
    dispatcher.register(store);

    // Gets the tokenId
    let key = store.tokenId;
    expect(key.length).toBeGreaterThan(0);
    expect(dispatcher["storesPoolMap"][key]).toEqual(0);
  });

  it("Should be notified from a TestAction", () => {

    return new Promise((r, x) => {
      store.once("TestAction_Update", (sender: TestStore) => {
        expect(sender.getState()).toBe(42);
        r();
      });

      dispatcher.dispatch<TestAction>({
        "type": "TestAction",
        "value": 42
      });
    });

  });

  it("Should wait for the proper stores to process action in the correct order", () => {
    return new Promise<void>((r, x) => {

    waitStore = new TestStoreWaiter();
    waitStore.tokenListToWaitFor = [store.tokenId];
    dispatcher.register(waitStore);
    let first = true;

    waitStore.once("TestAction2_Update", () => {
      expect(first).toBeFalsy();
      expect(waitStore.getState()).toBe(100);
      r();
    });

    store.once("TestAction_Update", () => {
      first = false;
    });

    dispatcher.dispatch<TestAction>({
        "type": "TestAction",
        "value": 50
      });
    });
  });

  it("Should raise an error if a cycling reference is detected", () => {
    return new Promise<void>((r,x) => {
      let d = new flux.Dispatcher(true);
      let d1 = new TestStore();
      let d2 = new TestStore();

      d.register(d1, "d1");
      d.register(d2, "d2");

      d1.tokenListToWaitFor = ["d2"];
      d2.tokenListToWaitFor = ["d1"];

      expect(() => {
        d.dispatch({ type: ""});
      }).toThrowError(`Cycling references detected between store <${d1.tokenId}> and <${d2.tokenId}>`);
      r();
    });
  });
}); 

*/

class Test extends flux.MapContainer<{dispatcher: flux.Dispatcher}, {}> {
  constructor(props: {dispatcher: flux.Dispatcher}) {
    super(props);
  }

  initState() {
    this.state = Immutable.Map({}).mergeDeep({
      level1: {
        level11: "coucou",
        level12: [1,2,3]
      }
    });

    console.log(this.getState());

    this.nextState({
      level1: {
        level11: "eeee"
      }
    });

    console.log(this.getState());

    this.nextState({
      level1: {
        level11: "eeee",
        level12:[]
      }
    });

    console.log(this.getState());

    
    this.nextState({
      level1: {
        level11: "eeee",
        level12:[]
      }}, [{ path:"level1.level12", action:"replace"}]
    );

    console.log(this.getState());

    this.nextState({
      level1: {
        level11: "eeee",
        level12:[2,3,4]
      }}, [{ path:"level1.level12", action:"keep"}]
    );

    console.log(this.getState());
  }

  render(): JSX.Element {
    return null;
  }
}

it("1", () => {
  const x = new Test({dispatcher:null});
  expect(true).toBe(true);
})