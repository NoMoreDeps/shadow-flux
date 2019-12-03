import { IActionStrategy } from "./IActionStrategy";
import { TAction } from "../Index";

type TActionStrategy<T> = {
  [k: string] : (payload: TAction, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>) => Promise<void | Error>;
}

export class BaseActionStrategy<T> implements IActionStrategy<T> {
  async resolve(instance: T, payload: TAction, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>): Promise<void | Error> {
    if (`action${payload.type}` in instance) {
      try {
        return await (instance as unknown as TActionStrategy<T>)[`action${payload.type}`](payload, success, error, For);
      } catch(ex) {
        return ex;
      }
    } else {
      success();
    }
  }
}