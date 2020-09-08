import { TCycle } from "../../Store/TCycle";
import { EventBus } from "../../Utils/Event/EventBus";
import { sFWindow } from "../sFWindow";


class Cycle extends sFWindow {
  evtBus!: EventBus;

  constructor() {
    super({ title: "Cycles", height: 450, width: 250 });
    this.css({
      display       : "flex"   ,
      flexDirection : "column" ,
      overflowY     : "auto"   ,
      
    }, this.contentDom);
  }
  
  addCycle(cycle: TCycle) {
    const div      = document.createElement("div")  ;
    const span     = document.createElement("span") ;
    span.innerText = cycle.type                     ;
    div.appendChild(span);

    div.onclick = () => {
      this.evtBus?.emitAsync("DEBUG.DEBUGGER.CYCLE.SELECT", {event: "DEBUG.DEBUGGER.CYCLE.SELECT", id: cycle.id})
    }

    this.css({
      whiteSpace      : "nowrap"               ,
      textOverflow    : "ellipsis"             ,
      overflow        : "hidden"               ,
      height          : "30px"                 ,
      backgroundColor : "#2d2d2d"              ,
      lineHeight      : "30px"                 ,
      textAlign       : "center"               ,
      color           : "#ffffffaa"            ,
      margin          : "5px"                  ,
      border          : "1px dotted #ffffffaa" ,
      flexShrink      : "0"                    ,
      userSelect      : "none"                 ,
    }, div)
    this.contentDom.prepend(div);
  }
}

const sfCycle = new Cycle();
export { sfCycle };