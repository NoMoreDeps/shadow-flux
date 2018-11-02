import { DispatchHandler } from "../Dispatcher"     ;
import { EventBus }        from "../shared/event/EventBus" ;

export interface IPrivateStore<T> extends IStore<T> {
    state: T;
    dispatchHandler: DispatchHandler;
    registerEventBus: (eventBus: EventBus) => void;
}

export interface IStore<T> {
    id: string;
    getState: () => T;
}