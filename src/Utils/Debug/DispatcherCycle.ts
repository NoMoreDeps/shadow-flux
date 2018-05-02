import { IStore } from "../../Store/IStore";

type NextState = {
  type       : "NextState" ;
  storeId    : string      ;
  storeState : any         ;
  time       : number      ;
};

type UpdatedState = {
  type       : "UpdatedState" ;
  storeId    : string         ;
  fullEvent  : string         ;
  storeState : any            ;
  time       : number         ;
};

type NewCycle = {
  type : "NewCycle" ;
  time : number     ;
};

type EndCycle = {
  type : "EndCycle" ;
  time : number     ;
};

type NotProcessed = {
  type      : "NotProcessed" ;
  eventName : string         ;
  data      : any            ;
  time      : number         ;
};

type Dispatch = {
  time      : number     ;
  type      : "Dispatch" ;
  payload   : any        ;
}

type CycleEvent = NextState | UpdatedState | NewCycle | EndCycle | NotProcessed | Dispatch;

export class DispatcherCycle {
  private _events: Array<CycleEvent>;

  constructor() {
    this._events = [];
  }

  newEvent(eventName: string, data: any) {
    const event = eventName.split(".");

    // New nextState trigger from a store
    if (event[1] === "nextState") {
      this._events.push({
        time       : Date.now()  ,
        type       : "NextState" ,
        storeId    : event[0]    ,
        storeState : (data as IStore<any>).getState()
      } as NextState);
      return;
    }

    // emit data to views
    if (event[1] === "updated") {
      this._events.push({
        time       : Date.now()     ,
        type       : "UpdatedState" ,
        storeId    : event[0]       ,
        fullEvent  : eventName      ,
        storeState : (data as IStore<any>).getState()
      } as UpdatedState);
      return;
    }

    if (eventName === "dispatcher.newCycle") {
      this._events.push({
        time : Date.now(),
        type : "NewCycle"
      } as NewCycle);
      return;
    }

    if (eventName === "dispatcher.endCycle") {
      this._events.push({
        time : Date.now(),
        type : "EndCycle"
      } as EndCycle);
      return;
    }

    if (eventName === "dispatcher.dispatch") {
      this._events.push({
        time    : Date.now(),
        type    : "Dispatch",
        payload : data
      } as Dispatch);
      return;
    }

    this._events.push({
      time      : Date.now()      ,
      type      : "NotProcessed"  ,
      eventName : eventName       ,
      data      : data
    } as NotProcessed)
  }
}