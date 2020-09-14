import { TCycle }   from "../../Store/TCycle"         ;
import { isNode } from "../../Utils/Env";
import { EventBus } from "../../Utils/Event/EventBus" ;
import { sFWindow } from "../sFWindow"                ;


class Trace extends sFWindow {
  evtBus!: EventBus;

  protected idx = 0;
  constructor() {
    super({ title: "Execution plan", height: 450, width: 250 });
    this.css({
      display       : "flex"   ,
      flexDirection : "column" ,
      overflowY     : "auto"   ,
    }, this.contentDom);
  }

  showTrace(events: TCycle) {
    const table = this.cElt<HTMLTableElement>("table");
    table.setAttribute("cellspacing", "0");
    table.appendChild(this.createHeader(["Name" , "Action" , "Wait For", "New State", "Emit"     , "Subscribers"]));
    
    for(const item in events.stores) {
      const itm = events.stores[item];
      table.appendChild(this.createRow([
        item, 
        itm.action, 
        itm.wait?.join(",") || "--", 
        itm.nextState ?? "--", 
        itm.emit?.join(",") || "--", 
        itm.subscribers ?? "--"]));
    }
    this.contentDom.innerHTML = "";
    this.contentDom.appendChild(table);
  }

  createRow(cells: (string | object)[]) {
    const row = this.cElt<HTMLTableRowElement>("tr");
    

    cells.forEach(_ => {
      const cell = this.cElt<HTMLTableCellElement>("td");
      this.css({ 
        textAlign    : "center"   ,
        whiteSpace   : "nowrap"   ,
        overflow     : "hidden"   ,
        textOverflow : "ellipsis" ,
      }, cell);

      if (this.idx % 2 === 1) {
        this.css({
          backgroundColor:"#ffffff1a"
        }, cell);
      }
      if (typeof _ === "object") {
        const div                = document.createElement("div") ;
        div.style.textAlign      = "center"                      ;
        div.style.textDecoration = "underline"                   ;
        div.style.cursor         = "pointer"                     ;

        div.appendChild(document.createTextNode("Explore..."));
        div.onclick = () => {
          this.evtBus.emitAsync("DEBUG.DEBUGGER.CYCLE.EXPLORE", 
          {event: "DEBUG.DEBUGGER.CYCLE.EXPLORE", data: _})
        }
        cell.appendChild(div);
      } else {
        cell.innerHTML = _;
      }
      row.appendChild(cell);
    });
    this.idx++;

    return row;
  }

  createHeader(cells: string[]) {
    const row = this.cElt<HTMLTableRowElement>("tr");
    
    cells.forEach(_ => {
      const cell = this.cElt<HTMLTableCellElement>("th");
      this.css({ 
        textAlign    : "center"              ,
        whiteSpace   : "nowrap"              ,
        overflow     : "hidden"              ,
        textOverflow : "ellipsis"            ,
        borderBottom : "1px solid #ffffff80" ,
      }, cell)
      cell.innerHTML = _;
      row.appendChild(cell);
    });

    return row;
  }
}

let sfTrace: Trace;
if (!isNode()) {
  sfTrace= new Trace();
}
export { sfTrace };