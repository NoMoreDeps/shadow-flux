import { Subscriber } from "./Core/Subscriber";
import {Dispatcher, BaseStore, TAction, TAwaitFor} from "./Index";

const dispatcher = new Dispatcher();

class StoreA extends BaseStore<{ value: number}> {
   initState() {
    this.nextState({ value: 42 });
  }

  async dispatchHandler(payload: TAction<any>, For: TAwaitFor) {
    await wait();
    console.log("dispatchHandler", payload, this.getState());
  }

  async hooked(payload: TAction<any>, For: TAwaitFor) {
    await wait();
    console.log("hooked", payload);
    return "hooked";
  }
}

function wait() {
  return new Promise(r => setTimeout(() => {
    r()
  }, 2500));
}

class StoreB extends BaseStore<{ value: number}> {
  initState() {
   this.nextState({ value: 42 });
 }

 async dispatchHandler(payload: TAction<any>, For: TAwaitFor) {
   await For(storeA.id);
   console.log("dispatchHandler-2", payload, this.getState());
 }

 async hooked(payload: TAction<any>, For: TAwaitFor) {
   await For(storeA.id);
   console.log("hooked-2", payload);
 }
}

dispatcher["_EvtBus"].on("allEvents", _ => console.log(_));

const storeB = new StoreB();
dispatcher.registerStore(storeB);

const storeA = new StoreA();
dispatcher.registerStore(storeA);

const subscriber = new Subscriber(dispatcher);

subscriber.subscribe(storeA.id, "hooked", (_: { value: number}) => { return { value: _.value * 2 } }, _ => console.log(_, "hokked---->>>"));

subscriber.sendAction({
  type      : "AnyTtpe" ,
  alloooooo : "sdasd"   ,
});

subscriber.sendAction({
  type      : "hooked" ,
  alloooooo : "sdasd"   ,
});


