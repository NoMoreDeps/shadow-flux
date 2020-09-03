import { Dispatcher } from "../Index";
import { EventBus, EventBusAutoOff } from "../Utils/Event/EventBus";
import { registerStore } from "./BaseStore";

class Debugger {
  private _dispatcher: Dispatcher = registerStore.prototype.__Dispatcher
  private evtBus!: EventBus;

  constructor() {
    this.evtBus = this._dispatcher["_EvtBus"];
    this.evtBus.on("DEBUG", _ => {
      console.log("DEBUGGER");
      console.dir(_, {depth: 20});
    });
  }

  setOn() {
    this._dispatcher.dispatch({type: "SET_DEBUG_MODE_ON"});
  }

  setOff() {
    this._dispatcher.dispatch({type: "SET_DEBUG_MODE_OFF"});
  }
}