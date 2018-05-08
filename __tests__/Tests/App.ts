import { Dispatcher } from "../../src/Dispatcher";
import { SimpleStore } from "../Helpers/SimpleStore";

describe("Dispatcher tests", function () {
    it("Should instanciate", function () {
        expect(() => new Dispatcher()).not.toThrowError();
    });

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

    it("should unregister properly", () => {
        const dispatcher = new Dispatcher();

        const simpleStore = new SimpleStore();

        dispatcher.register(simpleStore, "store");

        dispatcher.unregister(simpleStore);

        expect(() => {
            dispatcher.register(simpleStore, "store");
        }).not.toThrowError();
    })

    it("shoud dispatch action", () => {
        const dispatcher = new Dispatcher();

        const simpleStore = new SimpleStore();

        dispatcher.register(simpleStore, "store");

        dispatcher.dispatch({ type: "nothingToDo"})
    })
});
