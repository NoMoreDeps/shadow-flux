import { IStore }   from "./IStore"          ;
import { TAction }  from "../Action/TAction" ;
import { EventBus } from "../shared/event/EventBus" ;

export abstract class BaseStore<T> implements IStore<T>{
  id: string;
  private _lockState : boolean;
  private _eventBus  : EventBus | null;
  private state      : T;

  // This method is overriden by the dispatcher
  protected getStoreStateByToken: <T>(tokenId: string) =>  T 
    = <T>() => {return void 0 as unknown as T};

  constructor() {
    this.id         = ""      ;
    this.state      = {} as T ;
    this._eventBus  = null    ;
    this._lockState = false   ;
    this.initState();
  }

  protected abstract initState(): void;

  protected registerEventBus(eventBus: EventBus) {
    this._eventBus = eventBus;
    this._eventBus.on(`${this.id}.lockState`, (data: boolean) => {
      this._lockState = data;
    });
    this._eventBus.on(`${this.id}.setState`, (data: T) => {
      if (this._lockState) {
        this.state = data;
      }
    });
  }

  protected emit(event: string = "") {
    if (this._lockState) return;

    if (event === "") {
      event = "updated";
    } else if(!event.startsWith("updated")) {
      event = `updated.${event}`;
    }

    if (this._eventBus) {
      this._eventBus.emit(`${this.id}.${event}`, this);
    }
  }

  getState(): T {
    return this.state;
  }

  protected nextState(handler: (oldState: T) => T): void;
  protected nextState(newState: any): void;
  protected nextState(newState: any) {
    if (this._lockState) return;

    if (typeof(newState) === "function") {
      this.state = newState(this.state);
    } else {
      this.state = Object.assign({}, this.state, newState);
    }

    this._eventBus && this._eventBus.emit(`${this.id}.nextState`, this);
  }

  protected abstract async dispatchHandler(payload: TAction, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>) : Promise<void>;
}
