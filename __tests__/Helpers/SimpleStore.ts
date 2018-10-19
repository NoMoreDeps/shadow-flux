import { BaseStore } from "../../src/Store/BaseStore" ;
import { TAction }   from "../../src/Action/TAction"  ;

export type State = {
  state: string;
};

export class SimpleStore extends BaseStore<State> {
  initState(): void {
    
  }

  async dispatchHandler(payload: TAction, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>): Promise<void> {
    switch (payload.type) {
      case "error":
        error(new Error("There was an error"));
        break;
      case "FctState":
        this.nextState((oldState) => {
          return "FctState";
        });
        this.emit();
        break;
      case "emitChild":
        this.emit("updated.child");
        this.nextState({
          state: "emitChild"
        });
        success();
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
          let st = this.getStoreStateByToken("otherStore");
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