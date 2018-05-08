import { BaseStore } from "../../src/Store/BaseStore";
import { IAction } from "../../src/Action/IAction";

type State = {
  state: string;
};

export class SimpleStore extends BaseStore<State> {
  initState(): void {

  }

  async dispatchHandler(payload: IAction, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>): Promise<void> {
    switch(payload.type) {
      case "classic":
        this.nextState({
          state:"classic"
        });
        this.emit();
        success();
      break;
      case "wait":
        await For("otherStore");
        this.nextState({
          state:"wait"
        });
        this.emit();
        success();
      break;
      default:
        this.nextState({
          state:"nothing"
        });
        this.emit();
        success();
      break;
    }
  }
}