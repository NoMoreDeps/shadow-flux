import { sFDebugger } from "./Index";
import { BaseStore, registerStore, TActionExtention, TAwaitFor, TBaseStore, withEvents } from "./Store/BaseStore";

sFDebugger.setOn();

type S = {
  counter: number;
}

const events = withEvents({
  add: ""
});

const actions = {
  async add(this: TBaseStore<S>, payload: { howMany: number }, For: TAwaitFor) {
    await For(store2.id);
    console.log("End wait")
    this.nextState({
      counter: this.getState().counter + payload.howMany
    });
    console.log("End nextState")

    return events.add;
  },
  async SET_DEBUG_MODE_ON() {
    return null;
  }
}

const store = registerStore({
  id: "Store-1",
  actions,
  events,
  init() {
    return {counter: 0}
  }
});

const actions2 = {
  async addA(this: TBaseStore<S>, payload: { howMany: number }) {
    this.nextState({
      counter: this.getState().counter + payload.howMany
    }, true);
    return events.add;
  }
}

const store2 = registerStore({
  id: "Store-2",
  actions: actions2,
  events,
  init(): S {
   return { counter: 0 }
  },
  async dispatchHandler(payload, For) {
    this.nextState(payload, true);
  }
});



store2.actions.addA({howMany: 99})
store2.actions.addA({howMany: 99})
store.actions.add({howMany: 3});
/*
for(let i =0; i<5; i++) {
  setTimeout(() => {
store2.actions.addA({howMany: 500 * i})
store.actions.add({howMany: 3});
    
  }, 500 * i);
}*/
