import { sFWindow }   from "../Debug/sFWindow"       ;
import { sfCycle }    from "../Debug/Views/sFCycle"  ;
import { Dispatcher } from "../Index"                ;
import { EventBus }   from "../Utils/Event/EventBus" ;
import { jsonTree }   from "../Debug/JsonTree"       ;
import { sfTrace }    from "../Debug/Views/sfTrace"  ;
import { TCycle } from "./TCycle";

class Debugger {
  private _dispatcher! : Dispatcher ;
  private evtBus!      : EventBus   ;
  private events!      : any[]      ;
  private cycles!      : TCycle[]   ;

  private getEvent(event: string, events: any[]) {
    return events.filter(_ => _.event.endsWith(event))[0];
  }

  private getEvents(event: string, events: any[]) {
    return events.filter(_ => _.event.endsWith(event));
  }

  private chkCycle(cycle: any, store: string) {
    if (!cycle.stores[store]) {
      cycle.stores[store] = { emit: []};
    }

    return cycle.stores[store];
  }


  setOn() {
    sfCycle.evtBus = this.evtBus;
    sfTrace.evtBus = this.evtBus;
    this.events = [];
    this.cycles = [];
    var styleElement = document.createElement("style");
    styleElement.appendChild(document.createTextNode(`
      .sFScrollable::-webkit-scrollbar {-webkit-appearance: none;width: 7px;}
      .sFScrollable::-webkit-scrollbar-thumb {background-color: #007acc; -webkit-box-shadow: 0 0 1px rgba(255,255,255,.5);}
      .jsonTree ul>li>ul {display:none;}
      .jsonTree ul>li.selected>ul{display:block;}
      .jsonTree li {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .jsonTree ul {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-left: 15px
      }

      .jsonTree > ul {
        overflow: initial;
      }
    
     /* .jsonTree > ul li:before {
        content:"";
        padding-left: 15px;
        border-left: 1px dashed #ffffff22;
        height: 100%;
        width: 1px;
    }*/

    .jsonTree > ul ul {
      content: "";
      padding-left: 15px;
      border-left: 1px dashed #ffffff22;
      height: 100%;
  }

    .strColor {
      color: #00CCB8;
    }

    .boolColor {
      color: #7ACC00;
    }

    .otherColor {
      color: #CC007A;
    }
      `));

    document.getElementsByTagName("head")[0].appendChild(styleElement);	

    document.body.appendChild(sfCycle.dom);
    document.body.appendChild(sfTrace.dom);

    const sfExplorer = new sFWindow({
      title  : "Explorer" ,
      x      : window.innerWidth - 400 - 10,
      y      : 10         ,
      width  : 400        ,
      height : 600        ,
    });

    sfTrace.height = 330                              ;
    sfTrace.width  = 710                              ;
    sfTrace.x      = innerWidth - 10 - 400 - 10 - 300 ;
    sfTrace.y      = 10 + 600 + 10                    ;

    sfCycle.height = 600                              ;
    sfCycle.width  = 300                              ;
    sfCycle.x      = innerWidth - 10 - 400 - 10 - 300 ;
    sfCycle.y      = 10                               ;

    sfExplorer.css({
      display       : "flex"   ,
      flexDirection : "column" ,
      overflowY     : "auto"   ,
    }, sfExplorer.contentDom);

    document.body.appendChild(sfExplorer.dom);


    this.evtBus.on("DEBUG", (_: any) => {
      console.log(_)
      this.events.push(_);
     if (_.event === "DEBUG.DISPATCHER.CYCLE.END") {
       const evts = this.events.filter(__ => __.cycle === _.cycle);
       
       const cycle = {
        id      : _.cycle                                        ,
        type    : this.getEvent("CYCLE.START", evts)?.data?.type ,
        payload : this.getEvent("CYCLE.START", evts)?.data       ,
        stores  : {} as any                                      ,
       };

       const stActions   = this.getEvents("STORE.CHECK_ACTION_NAME" , evts);
       const stWait      = this.getEvents("STORE.START_WAITING"     , evts);
       const stWill      = this.getEvents("STORE.WILL_PROCESS"      , evts);
       const stWIllNot   = this.getEvents("STORE.WILL_NOT_PROCESS"  , evts);
       const stNextState = this.getEvents("STORE.NEXT_STATE"        , evts);
       const stEmit      = this.getEvents("STORE.EMIT"              , evts);

       stActions.forEach(   s => this.chkCycle(cycle, s.data.storeId).action      = s.data.selectedAction                    );
       stWait.forEach(      s => this.chkCycle(cycle, s.data.sourceId).wait       = s.data.targetIds ?? "--"                 );
       stWill.forEach(      s => this.chkCycle(cycle, s.data.storeId).will        = true                                     );
       stWIllNot.forEach(   s => this.chkCycle(cycle, s.data.storeId).will        = false                                    );
       stNextState.forEach( s => this.chkCycle(cycle, s.data.storeId).nextState   = JSON.parse(JSON.stringify(s.data.state)) );
       stEmit.forEach(      s => this.chkCycle(cycle, s.data.storeId).emit.push(s.data.event.split(".").pop())               );
       stEmit.forEach(      s => this.chkCycle(cycle, s.data.storeId).subscribers = s.data.subscribers                       );

       console.log(cycle)
       this.cycles.push(cycle);
       sfCycle.addCycle(cycle);
      }

      if (_.event === "DEBUG.DEBUGGER.CYCLE.SELECT") {
        new jsonTree(sfExplorer.contentDom, this.cycles.filter(__ => __.id === _.id)[0].payload, 5);
        const cycle = this.cycles.filter(__ => __.id === _.id)[0];
        sfTrace.showTrace(cycle);
      }

      if (_.event === "DEBUG.DEBUGGER.CYCLE.EXPLORE") {
        new jsonTree(sfExplorer.contentDom, _.data, 5);
      }

      //debugWindow?.dom?.appendChild(document.createTextNode(_.data.type));
    });

    this._dispatcher.dispatch({ type: "SET_DEBUG_MODE_ON" });
  }

  setOff() {
    this._dispatcher.dispatch({type: "SET_DEBUG_MODE_OFF"});
  }
}

const sFDebugger = new Debugger();
export {sFDebugger}
