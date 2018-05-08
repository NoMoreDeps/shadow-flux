  /**
 * The MIT License (MIT)
 * Copyright (c) <2016> <Beewix>
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
 * Guid implementation based on Random generation (RFC V4)
 * @class Guid
 */
export class Guid {

  /**
   * Internal field that contains all Guid parts
   * @scope {protected}
   * @field {any} _Guid_
   */
  protected _Guid_: {
    toString : string        ;
    part1    : number        ;
    part2    : number        ;
    part3    : number        ;
    part4    : number        ;
    part5    : number        ;
    part6    : Array<number> ;
  };

  /**
   * Generates a new random number
   */
  protected static generate() {
    return ((1 + Math.random()) * 0x10000) >> 0;
  }

  /**
   * @constructor
   */
  constructor() {
    this._Guid_ = {
      part1: Guid.generate(),
      part2: Guid.generate(),
      part3: Guid.generate(),
      part4: Guid.generate(),
      part5: Guid.generate(),
      part6: [
        Guid.generate(),
        Guid.generate(),
        Guid.generate()
      ],
      toString: ""
    };
  }

  /**
   * Gets the part1
   */
  get part1(): number {
    return this._Guid_.part1;
  }

  /**
   * Gets the part2
   */
  get part2(): number {
    return this._Guid_.part2;
  }

  /**
   * Gets the part3
   */
  get part3(): number {
    return this._Guid_.part3;
  }

  /**
   * Gets the part 4
   */
  get part4(): number {
    return this._Guid_.part4;
  }

  /**
   * Gets the part 5
   */
  get part5(): number {
    return this._Guid_.part5;
  }

  /**
   * Gets the part 6
   */
  get part6(): Array<number> {
    return this._Guid_.part6;
  }

  /**
   * Gets a string representation of the Guid
   * @method toString
   * @return {string}
   */
  toString() {
    if (this._Guid_.toString.length === 0) {
      this._Guid_.toString =
        this._Guid_.part1.toString(16).substring(1) + "-" +
        this._Guid_.part2.toString(16).substring(1) + "-" +
        this._Guid_.part3.toString(16).substring(1) + "-" +
        this._Guid_.part4.toString(16).substring(1) + "-" +
        this._Guid_.part5.toString(16).substring(1) + "-" +
        this._Guid_.part6[0].toString(16).substring(1) +
        this._Guid_.part6[1].toString(16).substring(1) +
        this._Guid_.part6[2].toString(16).substring(1);
    }
    return this._Guid_.toString;
  }

  /**
   * Gets a string Guid without a Guid Object
   * @static
   * @method getGuid
   * @return {string}
   */
  static getGuid(): string {
    return `${Guid.generate()}-${Guid.generate()}-${Guid.generate()}-${Guid.generate()}-${Guid.generate()}-${Guid.generate() + Guid.generate() + Guid.generate()}`;
  }
}