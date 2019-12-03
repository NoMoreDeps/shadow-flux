import { BaseStore } from "../../src/Store/BaseStore" ;
import { TAction }   from "../../src/Action/TAction"  ;

export type StrategyActionOne = {
  type : "StrategyActionOne"
}

export type StrategyActionTwo = {
  type : "StrategyActionOne"
}

export type Actions = StrategyActionOne | StrategyActionTwo;

export type State = {
  state: string;
};

export class StrategyStore extends BaseStore<State> {
  protected initState(): void {
    this.nextState({ state : "" });
  }

  async actionStrategyActionOne(payload: TAction, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>) : Promise<void | Error> {
    this.nextState({state: "StrategyActionOne"});
    this.emit();
    success();
  }

  async actionStrategyActionTwo(payload: TAction, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>) : Promise<void | Error> {
    this.nextState({state: "StrategyActionTwo"});
    this.emit();
    success();
  }

}