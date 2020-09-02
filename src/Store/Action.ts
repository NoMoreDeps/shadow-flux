export type TAction<T> = {
  type: string;
} & T;