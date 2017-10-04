/**
 * The MIT License (MIT)
 * Copyright (c) <2016> <Beewix>
 * Author <François Skorzec>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT
 * OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Container } from "./Container";
import { requiredProps } from "./Container";
import * as Immutable from "immutable";

import {
  Action,
  Dispatcher,
  Store
} from "../Flux";

type ImmutableDefault = Immutable.Map<any, any>;

export type mergeDescriptor = Array<{
  path: string;
  action: "keep" | "replace"
}>;

export abstract class MapContainer<P extends requiredProps, S> extends Container<P, S> {

  constructor(props: P) {
    super(props);
  }

  nextState(newStateData: S): boolean;
  nextState(newStateData: S, mergeDescriptor : mergeDescriptor): boolean;
  nextState(newStateData: S, mergeDescriptor?: mergeDescriptor): boolean {
    
    const newData     = Immutable.fromJS(newStateData);
    const currentData = this.state as ImmutableDefault;
    let newState      = currentData.mergeDeep(newData);

    if (mergeDescriptor) {
      mergeDescriptor.forEach( elt => {
        const path = elt.path.split(".");
        switch(elt.action) {
          case "keep":
            newState = newState.setIn(path, currentData.getIn(path));
          break;
          case "replace":
            newState = newState.setIn(path, newData.getIn(path));
          break;
        }
      });
    }

    let res = newState.equals(this.state);

    if (!res) {
      this.state = newState as ImmutableDefault;
      this.forceUpdate();
    }

    return !res;
  }

  getState(): S {
    return (this.state as ImmutableDefault).toJS();
  }
}