import * as flux from "../Flux";

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

describe("Flux tests", () => {
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
});
