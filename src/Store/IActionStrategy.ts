import { TAction } from "../Index";

export interface IActionStrategy<T> {
  resolve(instance: T, payload: TAction, success: () => void, error: (error: Error) => void, For: (...ids: string[]) => Promise<void>): Promise<void | Error>;
}