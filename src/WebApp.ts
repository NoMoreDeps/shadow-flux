import { sFDebugger } from "./Index";
import { BaseStore, registerStore, TAwaitFor, withEvents } from "./Store/BaseStore";

//sFDebugger.setOn();

type S = {
  counter: number;
}

const events = withEvents({
  add: ""
});

const actions = {
  async add(this: BaseStore<S>, payload: { howMany: number }, For: TAwaitFor) {
    await For(store2.id)
    this.nextState({
      counter: this.getState().counter + payload.howMany
    });
    return events.add;
  },
  async SET_DEBUG_MODE_ON() {
    return null;
  }
}

const store = registerStore<S, typeof actions, typeof events>({
  id: "Store-1",
  actions,
  events,
  init(this: BaseStore<S>) {
    this.nextState({counter: 0}, true);
  }
});

const actions2 = {
  async addA(this: BaseStore<S>, payload: { howMany: number }) {
    this.nextState({
      counter: this.getState().counter + payload.howMany
    }, true);
    return events.add;
  }
}

const store2 = registerStore<S, typeof actions2, typeof events>({
  id: "Store-2",
  localActions: true,
  actions: actions2,
  events,
  init(this: BaseStore<S>) {
    this.nextState({counter: 0});
  },
  async dispatchHandler(this: BaseStore<S>, payload, For) {
    this.nextState(payload, true);
  }
});



store.actions.add({howMany: 3});
store2.actions.addA({howMany: 99})

for(let i =0; i<5; i++) {
  setTimeout(() => {
store2.actions.addA({howMany: 500 * i})
    
  }, 500 * i);
}
