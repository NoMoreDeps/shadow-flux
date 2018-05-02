import { Dispatcher } from "./Dispatcher";
import { BaseStore } from "./Store/BaseStore";
import { IAction } from "./Action/IAction";
import { EventBus } from "./Utils/EventBus";

const dispatcher = new Dispatcher();

const logs: any[] = [];
/*console["log"] = (...message: any[]) => {
  logs.push(message.join(" "))
};*/

type State = {

}

class StoreA extends BaseStore<State> {
  constructor() {
    super();
  }

  initState() {
    this.registerEventBus(new EventBus);
    console.log(this.registerEventBus)
  }

   registerEventBus(eventBus: EventBus) {
    super.registerEventBus(eventBus);
  }


  async dispatchHandler(payload: IAction, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>) {
    await For("storeB")
    this.emit();
    success();
  }
}


class StoreB extends BaseStore<State> {
  constructor() {
    super();
  }

  initState(){
    this.nextState((old) => {
      return Object.assign({}, old, {name:22});
    })
  }

 registerEventBus(eventBus: EventBus) {
    super.registerEventBus(eventBus);
  }

  async dispatchHandler(payload: IAction, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>) {
    setTimeout(() => {
      console.log("has wait for a long...", Date.now());
      this.emit("next")
      success();
    }, 300);
  }
}

let storeA = new StoreA();
let storeB = new StoreB();

console.log("storeA", storeA.registerEventBus)

dispatcher.register(storeA, "storeA");
dispatcher.register(storeB, "storeB");

dispatcher.dispatch({
  type: "NewEvent"
});

dispatcher.dispatch({
  type: "NewEvent2"
});

setTimeout(() => {

  console.log(JSON.stringify(dispatcher["_debugFrames"], null, 2));
}, 2000);