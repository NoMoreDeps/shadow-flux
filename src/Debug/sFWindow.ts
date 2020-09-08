import { DragNDrogManager }       from "./DragNDrop" ;
import { createIcon, IconResize } from "./Icons"     ;

type TWindowInfo  = {
  title  ?: string ;
  x      ?: number ;
  y      ?: number ;
  width  ?: number ;
  height ?: number ;
}

export class sFWindow {
  protected id!          : string                ;
  protected _            : Required<TWindowInfo> ;
  titleDom!   : HTMLSpanElement       ;
  contentDom! : HTMLDivElement        ;
  dom!                   : HTMLDivElement        ;

  css(style: Partial<CSSStyleDeclaration>, target: HTMLElement) {
    for(let i in style) {
      target.style[i] = style[i]!;
    }
  }

  cElt<T extends HTMLElement>(type: string) {
    return document.createElement(type) as T;
  }

  set x(value: number) {
    this._.x = value;
    this.update();
  }

  set y(value: number) {
    this._.y = value;
    this.update();
  }

  set width(value: number) {
    this._.width = value;
    this.update();
  }

  set height(value: number) {
    this._.height = value;
    this.update();
  }

  constructor(info?: TWindowInfo) {
    this._ = {
      title  : ""  ,
      x      : 0   ,
      y      : 0   ,
      width  : 400 ,
      height : 400 ,
      ...info
    };

    this.createDom();
  }

  update() {
    this.dom.style.width  = `${this._.width}px`  ;
    this.dom.style.height = `${this._.height}px` ;
    this.dom.style.left   = `${this._.x}px`      ;
    this.dom.style.top    = `${this._.y}px`      ;
  }

  createDom() {
    this.dom = document.createElement("div") ;
    this.id  = performance.now().toString()  ;

    this.dom.setAttribute("id", this.id);

    this.dom.style.width           = `${this._.width}px`                ;
    this.dom.style.height          = `${this._.height}px`               ;
    this.dom.style.left            = `${this._.x}px`                    ;
    this.dom.style.top             = `${this._.y}px`                    ;
    this.dom.style.backgroundColor = "#252526"                          ;
    this.dom.style.position        = "fixed"                            ;
    this.dom.style.zIndex          = "10000"                            ;
    this.dom.style.boxShadow       = "4px 3px 5px 1px rgba(0,0,0,0.20)" ;

    const botBar = document.createElement("div");
    this.css({
      height          : "20px"     ,
      backgroundColor : "#007acc"  ,
      position        : "absolute" ,
      right           : "0px"      ,
      left            : "0px"      ,
      bottom          : "0px"      ,
    }, botBar);
    this.dom.appendChild(botBar);

    const rZone = document.createElement("div");
    this.css({
      width           : "20px"      ,
      height          : "20px"      ,
      backgroundColor : "#007acc"   ,
      position        : "absolute"  ,
      right           : "0px"       ,
      bottom          : "0px"       ,
      cursor          : "se-resize" ,
    }, rZone);

    this.dom.appendChild(rZone);
    rZone.appendChild(createIcon(IconResize, {
      transform: "scaleX(-.8) scaleY(.8)"
    }));

    const topBar = document.createElement("div");
    this.css({
      height          : "30px"                          ,
      backgroundColor : "#323233"                       ,
      position        : "absolute"                      ,
      right           : "0px"                           ,
      left            : "0px"                           ,
      top             : "0px"                           ,
      display         : "flex"                          ,
      alignItems      : "center"                        ,
      justifyContent  : "center"                        ,
      fontFamily      : "Segoe WPC,Segoe UI,sans-serif" ,
      color           : "rgb(255 255 255 / 0.5)"        ,
      userSelect      : "none"                          ,
    }, topBar);

    this.dom.appendChild(topBar);

    const title     = document.createElement("span") ;
    title.innerText = this._.title                   ;
    this.css({
      whiteSpace   : "nowrap"   ,
      overflow     : "hidden"   ,
      textOverflow : "ellipsis" ,
    }, title)
    topBar.appendChild(title);

    this.titleDom = title;

    const contentZone = document.createElement("div");
    this.css({
      backgroundColor : "#252526"                       ,
      position        : "absolute"                      ,
      right           : "0px"                           ,
      left            : "0px"                           ,
      top             : "30px"                          ,
      bottom          : "20px"                          ,
      display         : "flex"                          ,
      justifyContent  : "stretch"                       ,
      fontFamily      : "Segoe WPC,Segoe UI,sans-serif" ,
      borderLeft      : "1px dashed #323233"            ,
      borderRight     : "1px dashed #323233"            ,
      color           : "rgb(255 255 255 / 0.5)"        ,
    }, contentZone);
    contentZone.classList.add("sFScrollable")

    this.dom.appendChild(contentZone);
    this.contentDom = contentZone;

    const dnd = new DragNDrogManager(this.dom, topBar, this, rZone );
  }
}
