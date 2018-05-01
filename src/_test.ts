import { Dispatcher } from "./Dispatcher";
import { BaseStore } from "./Store/BaseStore";
import { IAction } from "./Action/IAction";

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

  initState() {}

  async dispatchHandler(payload: IAction, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>) {
    console.log("Before await store b", Date.now());
    await For("storeB")
    console.log("After await store b", Date.now());
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

  async dispatchHandler(payload: IAction, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>) {
    setTimeout(() => {
      console.log("has wait for a long...", Date.now());
      success();
    }, 3000);
  }
}

const storeA = new StoreA();
const storeB = new StoreB();

dispatcher.register(storeA, "storeA");
dispatcher.register(storeB, "storeB");

dispatcher.dispatch({
  type: ""
});

