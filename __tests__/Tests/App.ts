import { Dispatcher } from "../../src/Dispatcher";
import { SimpleStore, State as StoreState } from "../Helpers/SimpleStore";

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
        const dispatcher = new Dispatcher();

        const simpleStore = new SimpleStore();

        dispatcher.register(simpleStore, "store");

        dispatcher.subscribe("store", (state: StoreState) => {
            expect(state.state).toBe("nothing");

            done();
        })

        dispatcher.dispatch({ type: "nothingToDo"});
    })

    /**
     * Tests the dispatche life cycle when a store have to wait for another one
     * to process first before fininssing its own process
     */
    it("shoud dispatch action and handle wait for process", (done) => {
        const dispatcher = new Dispatcher();

        const simpleStore = new SimpleStore();
        dispatcher.register(simpleStore, "store");


        const otherStore = new SimpleStore();
        dispatcher.register(otherStore, "otherStore");

        let tabRes: Array<string> = [];

        dispatcher.subscribe("otherStore", (state: StoreState) => {
            tabRes.push(state.state);
        })

        dispatcher.subscribe("store", (state: StoreState) => {
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
        dispatcher.dispatch({ type: "wait"});
        // Dispatch multiple times
        dispatcher.dispatch({ type: "wait"});
    });

    it("sould handle subcription", () => {
        const dispatcher = new Dispatcher();

        expect(() => (dispatcher as any).subscribe()).toThrowError();
        expect(() => (dispatcher as any).subscribe(true)).toThrowError();
        expect(() => dispatcher.subscribe("GhostStore", () => void 0)).toThrowError("Cannot subscribe to the store GhostStore. This store does not exists or is not registered into the dispatcher.")

    });
});
