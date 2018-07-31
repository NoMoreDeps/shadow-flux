import { BaseStore } from "../../src/Store/BaseStore" ;
import { IAction }   from "../../src/Action/IAction"  ;

export type State = {
  state: string;
};

export class SimpleStore extends BaseStore<State> {
  initState(): void {
    
  }

  async dispatchHandler(payload: IAction, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>): Promise<void> {
    switch (payload.type) {
      case "error":
        error(new Error("There was an error"));
        break;
      case "debugFirst":
        this.nextState({
          state: "debugFirst"
        });
        this.emit();
        success();
        break;
      case "debugSecond":
        this.nextState({
          state: "debugSecond"
        });
        this.emit();
        success();
        break;
      case "classic":
        this.nextState({
          state: "classic"
        });
        this.emit();
        success();
        break;
      case "double":
        this.nextState({
          state: "double"
        });
        this.emit("double");
        success();
        break;
      case "wait":
        if (this.id !== "otherStore") {
          await For("otherStore");
          this.nextState({
            state: "wait"
          });
        } else {
          this.nextState({
            state: "otherStore"
          });
        }
        this.emit();
        success();
        break;
      default:
        this.nextState({
          state: "nothing"
        });
        this.emit();
        success();
        break;
    }
  }
}