import { TDispatchHandler } from "../Dispatcher"     ;
import { EventBus }        from "../shared/event/EventBus" ;

export interface IPrivateStore<T> extends IStore<T> {
    state: Partial<T>;
    dispatchHandler: TDispatchHandler;
    registerEventBus: (eventBus: EventBus) => void;
}

export interface IStore<T> {
    id: string;
    getState: () => Partial<T>;
}