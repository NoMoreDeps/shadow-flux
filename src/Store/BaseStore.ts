import { EventBusAutoOff } from "../Utils/Event/EventBus";

export type TBaseStore<T> = {
  id?: string;
  nextState  : (newState: Partial<State>, mergeToPreviousState: boolean) => void;
  sendAction : <T>(type: string, payload: T) => void;
}

export type TExtentedStore<T> = TBaseStore<T> & {
  mappedActions ?: { [key: string] : string; }
}

export type TStoreDefinition<T, U> = {
  id             : string                      ;
  actions        : T                           ;
  events         : U                           ;
  mappedActions ?: { [key: string] : string; } ;
}

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
function registerStore<State, Actions extends {[key: string]: (...args: any) => Promise<void | null | string | string[]>}, Events extends { [key: string]: string}>(def: TStoreDefinition<Actions, Events>) {

  const _actions = {} as {
    [P in keyof Actions] : PropType<Parameters<Actions[P]> , "0"> extends object ? 
      (payload: PropType<Parameters<Actions[P]> , "0">) => void 
      : 
      () => void;
  };

  const _subscribeTo = {} as {
    [P in keyof Events]: (handler: (newState: State) => void) => EventBusAutoOff;
  };

  return {
    id: def.id,
    actions: _actions,
    subscribeTo: _subscribeTo,
    getState: function(): State { return null as unknown as State; }
  }
}

type State = {
  counter: number;
}

const actions = {
  async getCounter() { },
  async add(this: TBaseStore<State>, payload: { xxx: number}, waitFor: any) {
    return null;
  }
}

const events = {
  None: ""
}

const x = registerStore<State, typeof actions, typeof events>({
  id: "",
  actions,
  events
});


x.actions.add({ xxx: 22 });
x.subscribeTo.None(_ => void 0);