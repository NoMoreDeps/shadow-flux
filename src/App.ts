import { BaseStore, registerStore, TAwaitFor, withEvents } from "./Store/BaseStore";

type S = {
  counter: number;
}

const events = withEvents({
  add: ""
});

const actions = {
  async add(this: BaseStore<S>, payload: { howMany: number }, For: TAwaitFor) {
    console.log("AA")
    await For(store2.id)
    console.log("BB")
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
  localActions: true,
  actions: actions2,
  events,
  init(this: BaseStore<S>) {
    this.nextState({counter: 0});
  },
  async dispatchHandler(this: BaseStore<S>, payload, For) {
    console.log("S2 -> ")
    this.nextState(payload, true);
  }
});

console.dir(store2, {depth: 20})
store2.subscribeTo.All(_ => console.log("GENERIC", _));
store2.subscribeTo.add(_ => console.log("Add", _));

store.actions.SET_DEBUG_MODE_ON();
store.subscribeTo.add(_ => console.log(_));

store.actions.add({howMany: 3});
store2.actions.addA({howMany: 99})
