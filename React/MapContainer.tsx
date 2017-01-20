import { Container } from "./Container";
import { Action, Dispatcher, Store } from "../Flux";
import { Map } from "immutable";

type ImmutableDefault = Immutable.Map<any, any>;

export abstract class MapContainer<T> extends Container<T> {

  constructor(props: {dispatcher: Dispatcher}) {
    super(props);
  }

  nextState(newStateData: any): boolean {
    const newState = (this.state as ImmutableDefault).merge(newStateData);
    let res = newState.equals(this.state);
    if (!res) {
      this.state = newState as ImmutableDefault;
    }
    return !res;
  }
}