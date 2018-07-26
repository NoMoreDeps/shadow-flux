import { IStore } from "../../Store/IStore";
import { Dispatcher } from "../../Dispatcher";

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

export type CycleEvent = NextState | UpdatedState | NewCycle 
                       | EndCycle  | NotProcessed | Dispatch;

export class DispatcherCycle {
  private _events     : Array<CycleEvent> ;
  private _cycleIndex : Array<number>     ;
  private _frameIndex : number            ;
  private _dispatcher  : Dispatcher       ;

  constructor(dispatcher: Dispatcher) {
    this._events     = []         ;
    this._cycleIndex = []         ;
    this._frameIndex = 0          ;
    this._dispatcher = dispatcher ;
  }

  get length(): number {
    return this._cycleIndex.length;
  }

  protected getFrameStartEnd(frameIndex: number): [number, number] {
    return [
      this._cycleIndex[frameIndex],
      (() => {
        if (this._cycleIndex[frameIndex + 1]) {
          return this._cycleIndex[frameIndex + 1] - 1;
        }
        return this._events.length - 1
      })()
    ];
  }

  protected getFrameContent(frameIndex: number): Array<CycleEvent> {
    return this._events.slice(...this.getFrameStartEnd(frameIndex));
  }

  get frameIndex(): number {
    return this._frameIndex;
  }

  set frameIndex(value: number) {
    this._frameIndex = value < this.length ? value : this.length - 1;
    this._frameIndex < 0 && (this._frameIndex = 0); 
  }

  playCurrentFrame(): void {
    const frame = this.getFrameContent(this._frameIndex);
    (frame.filter(_ => _.type === "UpdatedState") as Array<UpdatedState>).forEach( _ => {
      this._dispatcher["_eventBus"].emit(`${_.storeId}.setState`, _.storeState);
    });
  }

  newEvent(eventName: string, data: any): void {
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
      this._cycleIndex.push(
        this._events.push({
          time : Date.now(),
          type : "NewCycle"
        } as NewCycle) - 1
      );
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