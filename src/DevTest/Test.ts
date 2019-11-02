import { Dispatcher, Subscriber, BaseStore } from "../Index";

const disp = new Dispatcher();
const subs = new Subscriber(disp);
disp.debug.setDebugOn();

class TestStore extends BaseStore<unknown> {
  constructor() {
    super();
  }

  initState() {
    this.nextState({});
  }

  async actionTest(payload: {}, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>): Promise<void | Error> {
    console.log("Action Test has been called");
    this.nextState({});
    this.emit();
    success();
  }


  async actionTest2(payload: {}, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>): Promise<void | Error> {
    console.log("Action Test2 has been called");
    this.nextState({ age: 22 });
    this.emit("cool");
    success();
  }
}

const testStore = new TestStore();
disp.register(testStore);

const once = subs.subscribe(testStore.id, (state) => {
  once.off();
  console.log("View has been updated");
  subs.sendAction({
    type: "Test2"
  });
});

let handler = () => {
  handler = () => void 0;
  console.log(JSON.stringify(disp.debug.getFrames(), null, 2))
}

subs.subscribe(testStore.id, "cool", (state) => {
  console.log("View has been updated 2", state);
  setTimeout(handler, 100);
})

subs.sendAction({
  type: "Test"
});




