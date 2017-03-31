import { Container } from "./Container";
import { Dispatcher } from "../Flux";
export declare abstract class MapContainer<T> extends Container<T> {
    constructor(props: {
        dispatcher: Dispatcher;
    });
    nextState(newStateData: any): boolean;
}
