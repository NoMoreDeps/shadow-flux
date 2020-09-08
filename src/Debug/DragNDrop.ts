import { sFWindow } from "./sFWindow";

export class DragNDrogManager{
  private _resize = false;

  XX() {
    return this._resize ? "width" : "x";
  }

  YY() {
    return this._resize ? "height" : "y";
  }

  constructor(private source: HTMLElement, private sourceDragZone: HTMLElement, private parent: sFWindow, resizeDragZone: HTMLElement) {
    let deltaX    = 0              ;
    let deltaY    = 0              ;
    let posX      = parent["_"].x! ;
    let posY      = parent["_"].y! ;
    let mouseDown = false          ;
    
    parent["_"][this.XX()] = posX;
    parent["_"][this.YY()] = posY;
    
    parent.update();

    window.addEventListener("dblclick", _ => {
      this._resize = !this._resize;
    })

    window.addEventListener("mousedown", _ => {
      if (mouseDown) return;
      if (_.target === resizeDragZone || (_.target as HTMLElement).parentElement === resizeDragZone || (_.target as HTMLElement).parentElement?.parentElement === resizeDragZone) {
        this._resize = true;
      } else if (_.target !== sourceDragZone && (_.target as HTMLElement).parentElement !== sourceDragZone) return; else { this._resize = false; };
    
      mouseDown = true             ;
      deltaX    = _.clientX - parent["_"][this.XX()] ;
      deltaY    = _.clientY - parent["_"][this.YY()] ;
    
      parent["_"][this.XX()] = _.clientX - deltaX;
      parent["_"][this.YY()] = _.clientY - deltaY;
      parent.update();
    });

    source.addEventListener("dragstart", _ => _.preventDefault());
    sourceDragZone.addEventListener("dragstart", _ => _.preventDefault());
    resizeDragZone.addEventListener("dragstart", _ => _.preventDefault());
    
    window.addEventListener("mouseup", _ => {
      if (!mouseDown) return;
      mouseDown = false;
    
      let newPosX = (_.clientX - deltaX);
      let newPosY = (_.clientY - deltaY);
    
      if (!this._resize) {
        newPosX = Math.max(10, newPosX);
        newPosX = Math.min(window.innerWidth -10 - this.parent["_"].width, newPosX);
      
        newPosY = Math.max(10, newPosY);
        newPosY = Math.min(window.innerHeight -10 - this.parent["_"].height, newPosY);
      }

      newPosX -= (newPosX % 10);
      newPosY -= (newPosY % 10);
    
      posX = newPosX ;
      posY = newPosY ;

      parent["_"][this.XX()] = posX;
      parent["_"][this.YY()] = posY;

      
      parent.update();
    });

    window.addEventListener("resize", _ => {
      let newPosX = parent["_"].x;
      let newPosY = parent["_"].y;
    
      if (true) {
        newPosX = Math.max(10, newPosX);
        newPosX = Math.min(window.innerWidth -10 - this.parent["_"].width, newPosX);
      
        newPosY = Math.max(10, newPosY);
        newPosY = Math.min(window.innerHeight -10 - this.parent["_"].height, newPosY);
      }

      newPosX -= (newPosX % 10);
      newPosY -= (newPosY % 10);

    
      posX = newPosX ;
      posY = newPosY ;

      parent["_"]["x"] = posX;
      parent["_"]["y"] = posY;
      
      parent.update();
    })
    
    window.addEventListener("mousemove", _ => {
      if (mouseDown) {
        let newPosX = (_.clientX - deltaX);
        let newPosY = (_.clientY - deltaY);
    
        if (!this._resize) {
          newPosX = Math.max(10, newPosX);
          newPosX = Math.min(window.innerWidth -10 - this.parent["_"].width, newPosX);
        
          newPosY = Math.max(10, newPosY);
          newPosY = Math.min(window.innerHeight -10 - this.parent["_"].height, newPosY);
        }

        newPosX -= (newPosX % 10);
        newPosY -= (newPosY % 10);
        
        parent["_"][this.XX()] = newPosX;
        parent["_"][this.YY()] = newPosY;

        parent.update();
      }
    });
  }
}