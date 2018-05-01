import { IStore } from "./IStore";
import { IAction } from "../Action/IAction";
import { EventBus } from "../Utils/EventBus";

export abstract class BaseStore<T> implements IStore<T>{
  id: string;
  private _lockState: boolean;
  private _eventBus: EventBus | null;
  private state: T;

  constructor() {
    this.id = "";
    this.state = {} as T;
    this._eventBus = null;
    this._lockState = false;
    this.initState();
  }

  protected abstract initState(): void;

  protected registerEventBus(eventBus: EventBus) {
    this._eventBus = eventBus;
    this._eventBus.on(`${this.id}.lockState`, (data: boolean) => {
      this._lockState = data;
    });
    this._eventBus.on(`${this.id}.setState`, (data: T) => {
      this.state = data;
    });
  }

  protected emit(event: string = "") {
    if (event = "") {
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

    this._eventBus && this._eventBus.emit("nexState", this);
  }

  protected abstract async dispatchHandler(payload: IAction, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>) : Promise<void>;
}