import { Dispatcher }                       from "../../src/Dispatcher"          ;
import { Subscriber }                       from "../../src/Extension/Container" ;
import { SimpleStore, State as StoreState } from "../Helpers/SimpleStore"        ;
import { TAction }                          from "../../src/Action/TAction"      ;

/**
 * These tests cover the Dispatcher Class
 */
describe("Dispatcher tests", function () {
  /**
   * Tests if the class can be instanciated
   * without any error
   */
  it("Should instanciate", function () {
    expect(() => new Dispatcher()).not.toThrowError();
  });

  /**
   * Tests how the dispactcher register a new store, with different options
   */
  it("should register a new store", () => {
    const dispatcher = new Dispatcher();

    const simpleStore = new SimpleStore();

    dispatcher.register(simpleStore);

    expect(simpleStore.id.length).toBeGreaterThan(0);

    const simpleStore2 = new SimpleStore();

    dispatcher.register(simpleStore2, "simpleStore2");

    expect(simpleStore2.id).toBe("simpleStore2");

    const simpleStore3 = new SimpleStore();

    simpleStore3.id = "simpleStore3";

    dispatcher.register(simpleStore3);

    expect(simpleStore3.id).toBe("simpleStore3")

    expect(() => {
      dispatcher.register(simpleStore3);
    }).toThrowError("A store with id simpleStore3 already exists.")
  });

  /**
   * Tests how the dispacther handle a store that is unregistering
   */
  it("should unregister properly", () => {
    const dispatcher = new Dispatcher();

    const simpleStore = new SimpleStore();

    dispatcher.register(simpleStore, "store");

    dispatcher.unregister(simpleStore);

    expect(() => {
      dispatcher.register(simpleStore, "store");
    }).not.toThrowError();
  })

  /**
   * Tests an action that is dispatched to one store
   * The simpliest case
   */
  it("shoud dispatch action", (done) => {
    const dispatcher = new Dispatcher()           ;
    const wrapper    = new Subscriber(dispatcher) ;

    const simpleStore = new SimpleStore();

    dispatcher.register(simpleStore, "store");

    wrapper.subscribe("store", (state: StoreState) => {
      expect(state.state).toBe("nothing");

      done();
    })

    wrapper.sendAction({ type: "nothingToDo" });
  })

  it("Should get the correct frameindex", () => {
    const dispatcher  = new Dispatcher()  ;
    const simpleStore = new SimpleStore() ;

    dispatcher.register(simpleStore, "store");

    dispatcher.debug.setDebugOn();
    dispatcher.dispatch({type: "1"});
    dispatcher.dispatch({type: "2"});
    dispatcher.dispatch({type: "3"});
    dispatcher.dispatch({type: "4"});

    setTimeout(() => {
      
      dispatcher.debug.lockState(true);
      expect(dispatcher["_debugCycle"]).not.toBe(null);
      
      for(let i=0; i<4; i++) {
        dispatcher.debug.goToFrame(i);
        if (dispatcher["_debugCycle"]) {
          expect(dispatcher["_debugCycle"].frameIndex).toBe(i);
        }
      }

      if (dispatcher["_debugCycle"]) {
        dispatcher.debug.goToFrame(10);
        expect(dispatcher["_debugCycle"].frameIndex).toBe(3);
        dispatcher.debug.goToFrame(-5);
        expect(dispatcher["_debugCycle"].frameIndex).toBe(0);
      }
      

    }, 200);

  })

  /**
   * Tests the dispatche life cycle when a store have to wait for another one
   * to process first before fininssing its own process
   */
  it("shoud dispatch action and handle wait for process", (done) => {
    const dispatcher  = new Dispatcher()           ;
    const wrapper     = new Subscriber(dispatcher) ;
    const simpleStore = new SimpleStore()          ;
    dispatcher.register(simpleStore, "store");


    const otherStore = new SimpleStore();
    dispatcher.register(otherStore, "otherStore");

    let tabRes: Array<string> = [];

    wrapper.subscribe("otherStore", (state: StoreState) => {
      tabRes.push(state.state);
    })

    wrapper.subscribe("store", (state: StoreState) => {
      tabRes.push(state.state);

      if (tabRes.length === 2) {
        expect(tabRes.join("-") === "otherStore-wait");
      }

      if (tabRes.length === 4) {
        expect(tabRes.join("-") === "otherStore-wait-otherStore-wait");
        done();
      }

    })

    // Dispatch
    wrapper.sendAction({ type: "wait" });
    // Dispatch multiple times
    wrapper.sendAction({ type: "wait" });
  });

  it("sould handle subcription", () => {
    const dispatcher = new Dispatcher();

    expect(() => (dispatcher as any).subscribe()).toThrowError();
    expect(() => (dispatcher as any).subscribe(true)).toThrowError();
    expect(() => dispatcher.subscribe("GhostStore", () => void 0)).toThrowError("Cannot subscribe to the store GhostStore. This store does not exists or is not registered into the dispatcher.")

  });

  it("Sould not dispatch if payload is null", (done) => {
    const dispatcher = new Dispatcher();

    const simpleStore = new SimpleStore();
    dispatcher.register(simpleStore, "store");

    dispatcher.subscribe(simpleStore.id, state => {
      expect((state as any)["state"]).toBe("nothing");
      done();
    });

    dispatcher.dispatch(null as any as TAction);
    expect(dispatcher["_isDispatching"]).toBe(false);
    expect(dispatcher["_payloads"].length).toBe(0);

    dispatcher.dispatch({
      type: "nothing"
    });
  });

  it("Should allow to process an error and continue", (done) => {
    const dispatcher  = new Dispatcher()  ;
    const simpleStore = new SimpleStore() ;

    dispatcher.register(simpleStore, "store");
    dispatcher.dispatch({
      type: "error"
    });

    dispatcher.subscribe(simpleStore.id, state => {
      expect((state as any)["state"]).toBe("nothing");
      done();
    });

    dispatcher.dispatch({
      type: "nothing"
    });
  });


  it("Should activate and deactivate debugger", (done) => {
    const dispatcher  = new Dispatcher()  ;
    const simpleStore = new SimpleStore() ;

    dispatcher.register(simpleStore, "store");
    dispatcher.debug.setDebugOff();
    dispatcher.debug.setDebugOn();
    dispatcher.debug.setDebugOff();
    dispatcher.debug.setDebugOn();

    let tab = ["debugFirst", "debugSecond", "nothing", "debugSecond", "debugFirst", "nothing"];

    dispatcher.subscribe(simpleStore.id, (state: { state: string }) => {
      expect(simpleStore.getState().state).toBe(tab.shift());

      if (tab.length === 3) {
        dispatcher.debug.lockState(true);

        dispatcher.debug.goToFrame(1);
        dispatcher.debug.playCurrentFrame();

        expect(simpleStore.getState().state).toBe(tab.shift());

        dispatcher.debug.goToFrame(0);
        dispatcher.debug.playCurrentFrame();

        expect(simpleStore.getState().state).toBe(tab.shift());

        dispatcher.debug.goToFrame(2);
        dispatcher.debug.playCurrentFrame();

        expect(simpleStore.getState().state).toBe(tab.shift());

        expect(dispatcher.debug.getFrameLength()).toBe(3);

        dispatcher.debug.lockState(false);
        dispatcher.debug.setDebugOff();

        expect(dispatcher.debug.getFrameLength()).toBe(0);

        done();

      }
    });

    dispatcher.dispatch({ type : "debugFirst" })  ;
    dispatcher.dispatch({ type : "debugSecond" }) ;
    dispatcher.dispatch({ type : "addNothing" })  ;
  });

  it("Should not set debug setState if not in debug mode even if lockState is false", (done) => {
    const dispatcher  = new Dispatcher()  ;
    const simpleStore = new SimpleStore() ;

    dispatcher.debug.setDebugOn();

    dispatcher.register(simpleStore, "store");

    dispatcher.dispatch({ type : "debugFirst" });
    dispatcher.dispatch({ type : "debugSecond" });

    dispatcher.debug.lockState(false);
    dispatcher.debug.goToFrame(0);
    dispatcher.debug.playCurrentFrame();

    setTimeout(() => {
      expect(simpleStore.getState().state).toBe("debugSecond");
      done();
    }, 200);
  });

  it ("should not emit if lockState is true", (done) => {
    const dispatcher  = new Dispatcher()  ;
    const simpleStore = new SimpleStore() ;

    dispatcher.register(simpleStore, "store");
    dispatcher.debug.setDebugOn();

    dispatcher.subscribe(simpleStore.id, (state) => {
      throw Error();
    });

    dispatcher.debug.lockState(true);
    dispatcher.dispatch({ type : "debugFirst" });

    setTimeout(() => {
      done();
    }, 200);

  });

  it("Should emit a sub event", (done) => {
    const dispatcher  = new Dispatcher()  ;
    const simpleStore = new SimpleStore() ;

    dispatcher.register(simpleStore, "store");

    dispatcher.subscribe(simpleStore.id, "child" ,(state) => {
      done();
    });

    dispatcher.dispatch({ type: "emitChild" });
  });

  it("Should update state base on a function in nextState", (done) => {
    const dispatcher  = new Dispatcher()  ;
    const simpleStore = new SimpleStore() ;

    dispatcher.register(simpleStore, "store");

    dispatcher.subscribe(simpleStore.id ,(state) => {
      expect(state).toBe("FctState");
      done();
    });

    dispatcher.dispatch({ type: "FctState" });
  });


  it("Should not trigger an event if no eventBus is defined", () => {
    const simpleStore = new SimpleStore() ;

    simpleStore["emit"]("test");
  })

  it("Should log the endCycle in debug mode", (done) => {
    const dispatcher  = new Dispatcher()  ;
    const simpleStore = new SimpleStore() ;

    dispatcher.register(simpleStore, "store");
    dispatcher.debug.setDebugOn();
    dispatcher.subscribe(simpleStore.id, (state: { state: string }) => {
      done();
    });

    dispatcher.dispatch({ type: "nothing" });
  });

  it("Should throw all possible errors", () => {
    const dispatcher  = new Dispatcher()  ;
    const simpleStore = new SimpleStore() ;

    dispatcher.register(simpleStore, "store");

    expect(() => {
      dispatcher.subscribe.apply(dispatcher, [simpleStore.id, 1]);

    }).toThrowError(`subscribe function has no signature corresponding to the one you provided :
      subscribe(number) => void; not found !`)

    expect(() => {
      dispatcher.subscribe.apply(dispatcher, [simpleStore.id, 1, 2]);

    }).toThrowError(`subscribe function has no signature corresponding to the one you provided :
      subscribe(number, number) => void; not found !`)

    expect(() => {
      dispatcher.subscribe.apply(dispatcher, [simpleStore.id, 1, 2, 3]);

    }).toThrowError(`subscribe function has no signature corresponding to the one you provided :
      subscribe(number, number, number) => void; not found !`);

    expect(() => {
      dispatcher.subscribe.apply(dispatcher, [simpleStore.id, 1, 2, 3, 4]);
    }).toThrowError(`subscribe function has no signature corresponding to the one you provided :
      subscribe(number, number, number, number) => void; not found !`);
  });

  it("Should handle subscribe<T>(storeId, eventName, updatedStateHandler): void;", (done) => {
    const dispatcher  = new Dispatcher()           ;
    const wrapper     = new Subscriber(dispatcher) ;
    const simpleStore = new SimpleStore()          ;

    dispatcher.register(simpleStore, "store");
    wrapper.subscribe<any, any>(simpleStore.id, (state) => {
      return state;
    }, (state) => {
      done();
    });

    wrapper.sendAction("nothind", {});
  });

  it("Should handle subscribe<T>(storeId, eventName, updatedStateHandler): void;", (done) => {
    const dispatcher  = new Dispatcher()           ;
    const wrapper     = new Subscriber(dispatcher) ;
    const simpleStore = new SimpleStore()          ;

    dispatcher.register(simpleStore, "store");
    wrapper.subscribe<any>(simpleStore.id, "double", (state) => {
      done();
    });

    wrapper.sendAction({ type: "double" });
  });

  it("Should handle subscribe<T,U>(storeId, eventName, mapToStateHandler, updatedStateHandler): void;", (done) => {
    const dispatcher  = new Dispatcher()           ;
    const wrapper     = new Subscriber(dispatcher) ;
    const simpleStore = new SimpleStore()          ;

    dispatcher.register(simpleStore, "store");
    wrapper.subscribe<any, any>(simpleStore.id, "double", (state) => {
      return state;
    }, (state) => {
      done();
    });

    wrapper.sendAction({ type: "double" });
  });
});
