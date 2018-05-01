/**
 * The MIT License (MIT)
 * Copyright (c) <2017> <Beewix>
 * Author <François Skorzec>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT
 * OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Delegate prototype for emitter event handler
 */
export interface EventBusDelegate {
  (data: any): void;
}

export interface EventBusAutoOff {
  off: () => void;
  id: number;
}

export type OnPoolType = { id: number, callback: EventBusDelegate };
export type OncePoolType = OnPoolType & { originalCallback: EventBusDelegate };

/**
 * This class is used as a base class for all Emitters
 * @class EventBus
 * @md
 */
export class EventBus {

  // Internal fields
  protected _Emitter_: {
    onPool: { [eventName: string]: Array<OnPoolType> }; // on collection
    oncePool: { [eventName: string]: Array<OncePoolType> }; // once collection

    Ids: number; // Ids auto increment
    parent: EventBus | undefined; // Parent emitter, optional
  } = {
    oncePool: {},
    onPool: {},
    parent: void 0,
    Ids: 0
  };

  /**
   * @field {string} _separator
   */
  protected _separator: string;

  /**
   * @field {number} _depthLevel
   */
  protected _depthLevel: number;

  protected get _errors() {
    const $this = this;

    return {
      get eventNameBadFormat(): string {
        return `The event name is not in the correct format :
Should be in '${$this._depthLevel}' part${$this._depthLevel > 1 ? "s" : ""}
${$this._depthLevel > 1 ? "separated by '" + $this._separator + "'" : ""}`;
      }
    }
  }

  // Protected functions
  protected checkEventNameFormat(eventName: string | undefined = void 0): boolean {
    return (eventName &&
      eventName.trim().length > 0 &&
      eventName.split(this._separator).length <= this._depthLevel) || false;
  }

  /**
   * @constructor
   * @param {string} separator
   * @param {number} depthLevel
   */
  constructor(separator: string = ".", depthLevel: number = 3) {
    if (separator.trim() === "") {
      separator = ".";
    }

    if (depthLevel < 1) {
      depthLevel = 1;
    }

    this._separator = separator;
    this._depthLevel = depthLevel;
  }

  /**
   * Gets all pools in one array
   */
  protected get pools(): Array<{ [eventName: string]: Array<OnPoolType | OncePoolType> }> {
    return [this._Emitter_.onPool, this._Emitter_.oncePool];
  }

  /**
   * Gets or sets a value indicating the separator character to use in the event name
   * @prop {string} separator
   */
  get separator(): string {
    return this._separator;
  }

  set separator(value: string) {
    if (value.trim() === "") {
      value = ".";
    }

    this._separator = value;
  }

  get parent(): EventBus | undefined {
    return this._Emitter_.parent;
  }

  set parent(parent: EventBus | undefined) {
    this._Emitter_.parent = parent;
  }

  /**
   * Gets or sets a value indicating the depth of the event name
   */
  get depthLevel(): number {
    return this._depthLevel;
  }

  set depthLevel(value: number) {
    if (value < 1) {
      value = 1;
    }

    this._depthLevel = value;
  }

  /**
  * Register a new event
  * @method on
  * @param {string} eventName The event name
  * @param {EmitterDelegate} callback The callback
  @md
  */
  on(eventName: string, callback: EventBusDelegate): EventBusAutoOff {

    if (!this.checkEventNameFormat(eventName)) {
      throw Error(this._errors.eventNameBadFormat);
    }

    if (!this._Emitter_.onPool[eventName]) {
      this._Emitter_.onPool[eventName] = [];
    }

    let elt = {
      id: this._Emitter_.Ids++
      , callback: callback
    };

    this._Emitter_.onPool[eventName].push(elt);
    this.emit("registerEvent", { eventName: eventName, callback: callback });

    return {
      off: () => this.off(elt.id),
      id: elt.id
    };
  }

  /**
   * Register a new event that could be fired only one time
   * @method once
   * @param {string} eventName The event name
   * @param {EmitterDelegate} callback The callback
   */
  once(eventName: string, callback: EventBusDelegate): EventBusAutoOff {

    if (!this.checkEventNameFormat(eventName)) {
      throw Error(this._errors.eventNameBadFormat);
    }

    if (!this._Emitter_.oncePool[eventName]) {
      this._Emitter_.oncePool[eventName] = [];
    }

    let elt = {
      id: this._Emitter_.Ids++
      , callback: (data: any = void 0) => {
        this.off(elt.id);
        callback(data);
      }
      , originalCallback: callback
    };

    this._Emitter_.oncePool[eventName].push(elt);
    this.emit("registerEvent", { eventName: eventName, callback: elt.callback });

    return {
      off: () => this.off(elt.id),
      id: elt.id
    };
  }

  /**
   * Unregister an event
   * @method off
   * @noPrototype
   * @md
   */
  off(): void;
  off(eventName: string): void;
  off(callback: EventBusDelegate): void;
  off(callbackId: number): void;
  off(eventName: string, callback: EventBusDelegate): void;
  off(...params: any[]): void {
    let eventName  : string | undefined = void 0;
    let callback   : EventBusDelegate | undefined = void 0;
    let callbackId : number | undefined = void 0;

    if (params.length === 0 || !params) {
      this._Emitter_.oncePool = {};
      this._Emitter_.onPool = {};
      return;
    }

    if (params.length === 1) {
      switch (typeof params[0]) {
        case "string":
          eventName = params[0];
          break;
        case "number":
          callbackId = params[0];
          break;
        default:
          callback = params[0];
          break;
      }
    } else {
      eventName = params[0];
      callback = params[1];
      callbackId = params[2] || void 0;
    }

    if (eventName && typeof(eventName) === "string") {
      const evtName: string = eventName;
      this.pools.forEach(poolRef => {
        let pool: Array<OncePoolType> = (poolRef as any)[evtName] || [];

        if (callback) {
          pool = pool.filter(fct => fct.originalCallback
            ?
            fct.originalCallback === callback
            :
            fct.callback === callback
          );
        }

        pool.forEach(fct => {
          poolRef[evtName] =
            poolRef[evtName].filter(pFct => pFct.id !== fct.id);
        });
      });
    } else {

      [this._Emitter_.onPool, this._Emitter_.oncePool].forEach(poolRef => {
        for (let eventName in poolRef) {
          let pool = poolRef[eventName];
          if (callbackId) {
            pool = pool.filter(fct => fct.id === callbackId);
          }

          if (callback) {
            pool = pool.filter(fct => (fct as OncePoolType).originalCallback
              ?
              (fct as OncePoolType).originalCallback === callback
              :
              fct.callback === callback);
          }

          pool.forEach(fct => {
            poolRef[eventName] = poolRef[eventName].filter(pFct => pFct.id !== fct.id);
          });
        }
      });
    }
  }

  /**
   * Fires the specified event
   * @method emit
   * @param {string} eventName The event name
   * @param {any} data The data associated to the event
   * @return boolean
   * @md
   */
  emit(eventName: string, data: any = void 0): boolean {

    this.pools.forEach(poolRef => {
      for (const evt in poolRef) {
        if (typeof evt === "string" && eventName.startsWith(evt)) {
          poolRef[evt].forEach(fct => fct.callback(data));
        }
      }
    });

    this._Emitter_.parent && this._Emitter_.parent.emit(eventName, data);
    eventName !== "allEvents" && this.emit("allEvents", { eventName: eventName, data: data });
    return true;
  }

  /**
   * Fires the specified event but in an async way
   * @method emit
   * @param {string} eventName The event name
   * @param {any} data The data associated to the event
   * @return boolean
   * @md
   */
  emitAsync(eventName: string, data: any = void 0): boolean {
    /**
     * Couldn't call this.emit(...), the closure will cause an infinite loop if an inherited class overloads the Emit function.
     * */
    setTimeout(() => {
      this.pools.forEach(poolRef => {
        for (const evt in poolRef) {
          if (typeof evt === "string" && eventName.startsWith(evt)) {
            poolRef[evt].forEach(fct => fct.callback(data));
          }
        }
      });

      this._Emitter_.parent && this._Emitter_.parent.emitAsync(eventName, data);
      eventName !== "allEvents" && this.emitAsync("allEvents", { eventName: eventName, data: data });
    }, 0);

    return true;
  }
}