import { Dispatcher } from "./Dispatcher";

const d = new Dispatcher();

function wait(time: number) {
  return new Promise(r => setTimeout(() => r(), time))
}

d.registerStore({
  async test1(payload: any, For: any) {
    await For("ID2")
    await wait(500);
    console.log("End 1");
    return "Ok - 1";
  },
  mappedActions: { test2: "test1"}
} as any, "ID1");

d.registerStore({
  async test2(payload: any, For: any) {
    await wait(2000);
    console.log("End 2");
    return "Ok - 2";
  }
} as any, "ID2");

d.dispatch({ type: "test2"});
d.dispatch({ type: "test1"});
d.dispatch({ type: "test"});

