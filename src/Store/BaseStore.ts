import { IStore }             from "./IStore"                 ;
import { TAction }            from "../Action/TAction"        ;
import { EventBus }           from "../Utils/Event_/EventBus" ;
import { IActionStrategy }    from "./IActionStrategy"        ;
import { BaseActionStrategy } from "./ActionStrategy"         ;



export abstract class BaseStore<T> implements IStore<T>{
  id: string;
  private _lockState       : boolean;
  private _eventBus        : EventBus | null;
  private state            : Partial<T>;
  protected actionStrategy : IActionStrategy<BaseStore<T>>;

  // This method is overriden by the dispatcher
  protected getStoreStateByToken: <U>(tokenId: string) =>  Partial<U> 
    = <U>() => {return void 0 as unknown as Partial<U>};

  // This method is overriden by the dispatcher
  protected sendAction: (action: TAction) =>  void 
    = (action: TAction) => void 0;

  constructor() {
    this.id         = ""               ;
    this.state      = {} as Partial<T> ;
    this._eventBus  = null             ;
    this._lockState = false            ;
    this.initState();
    this.actionStrategy = new BaseActionStrategy();
  }

  protected abstract initState(): void;

  protected registerEventBus(eventBus: EventBus) {
    this._eventBus = eventBus;
    this._eventBus.on(`${this.id}.lockState`, (data: boolean) => {
      this._lockState = data;
    });
    this._eventBus.on(`${this.id}.setState`, (data: Partial<T>) => {
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

  getState(): Partial<T> {
    return this.state;
  }

  protected nextState(handler: (oldState: Partial<T>) => Partial<T>): void;
  protected nextState(newState: Partial<T>): void;
  protected nextState(newState: unknown) {
    if (this._lockState) return;

    if (typeof(newState) === "function") {
      this.state = newState(this.state);
    } else {
      this.state = Object.assign({}, this.state, newState);
    }

    this._eventBus && this._eventBus.emit(`${this.id}.nextState`, this);
  }

  protected async dispatchHandler<T extends TAction>(payload: T, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>) : Promise<void | Error> {
    await this.actionStrategy.resolve(this, payload, success, error, For);
  }
}
