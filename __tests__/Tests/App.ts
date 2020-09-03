import "../../src";
import { BaseStore, registerStore, withEvents } from "../../src";

describe("Test", () => {
  it("Should Run Simple store", () => {
    type S = {
      counter: number;
    }

    const events = withEvents({
      add: ""
    });
 
    const actions = {
      async add(this: BaseStore<S>, payload: { howMany: number }) {
        this.nextState({
          counter: this.getState().counter + payload.howMany
        });
        return events.add;
      }
    }

    const store = registerStore<S, typeof actions, typeof events>({
      actions,
      events,
      init(this: BaseStore<S>) {
        this.nextState({counter: 0});
      }
    });

    store.subscribeTo.add(_ => expect(_.counter).toBe(3));

    store.actions.add({howMany: 3});
  })
})