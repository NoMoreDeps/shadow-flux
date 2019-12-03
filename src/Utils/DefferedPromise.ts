export type Executor<T> = (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void;

/**
 * Create a Wrapper that will deffer Promise execution
 */
export class DefferedPromise<T> {
  // The final promise instance
  private instance: Promise<T> | null = null;
  // Executor handler
  private executor: Executor<T>;

  /**@contructor */
  constructor(executor: Executor<T>) {
    this.executor = executor;
  }

  /**
   * Returns the unique promise stored
   * @method
   */
  getPromise(): Promise<T> {
    if (!this.instance) {
      this.instance = new Promise<T>(this.executor);
    }

    return this.instance;
  }
};
