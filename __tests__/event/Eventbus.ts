import { EventBus } from "../../../event/EventBus";


describe("EventBus", () => {
  it("Should instanciate", () => {
    const evb = new EventBus();
    expect(evb).toBeDefined();
  });

  it("Should set the separator to '.' if empty", () => {
    const evb = new EventBus("");
    expect(evb.separator).toBe(".");

    evb.separator = "";
    expect(evb.separator).toBe(".");

    evb.separator = "/";
    expect(evb.separator).toBe("/");
  });

  it("Should set the depth to 1 if < 1", () => {
    const evb = new EventBus("", 0);
    expect(evb.depthLevel).toBe(1);

    evb.depthLevel = 0;
    expect(evb.depthLevel).toBe(1);

    evb.depthLevel = 3;
    expect(evb.depthLevel).toBe(3);
  });

  it("Should allow to subscribe", () => {
    const evb = new EventBus();

    expect(() => {
      evb.on("A.B.C", () => void 0);
    }).not.toThrowError();

    expect(() => {
      evb.on("A.B", () => void 0);
    }).not.toThrowError();

    expect(() => {
      evb.on("A", () => void 0);
    }).not.toThrowError();

    expect(() => {
      evb.on("", () => void 0);
    }).toThrow(`The event name is not in the correct format :
Should be in '3' parts
separated by '.'`);

    evb.depthLevel = 1;

    expect(() => {
      evb.on("", () => void 0);
    }).toThrow(`The event name is not in the correct format :
Should be in '1' part`);
  });

  it("should allow to unsubscribe", () => {
    const evb = new EventBus(".", 2);

    const sub = evb.on("A.B", () => {
      throw Error("This handler should not be called");
    });

    sub.off();

    expect(() => {
      evb.emit("A.B");
    }).not.toThrowError();

    let fctIndex = 0;
    const fct = () => fctIndex++;

    evb.on("A.B", fct);
    evb.on("A.B", fct);

    evb.emit("A.B");

    evb.off("A.B");

    evb.emit("A.B");

    expect(fctIndex).toBe(2);
  });

  it("Should handle once subscription", () => {
    const evb = new EventBus(".", 2);
    let fctindex = 0;

    evb.once("A.B", () => {
      fctindex++;
      if (fctindex > 1) throw Error("This handler should not be called");
    });

    evb.emit("A.B");

    expect(() => evb.emit).not.toThrowError();
    expect(fctindex).toBe(1);


    expect(() => {
      evb.once("", () => void 0);
    }).toThrow(`The event name is not in the correct format :
Should be in '2' parts
separated by '.'`);

    evb.depthLevel = 1;

    expect(() => {
      evb.once("", () => void 0);
    }).toThrow(`The event name is not in the correct format :
Should be in '1' part`);

    evb.depthLevel = 2;



    fctindex = 0;
    evb.once("A.B", () => {
      fctindex++;
      if (fctindex > 2) throw Error("This handler should not be called");
    });
    evb.once("A.B", () => {
      fctindex++;
      if (fctindex > 2) throw Error("This handler should not be called");
    });

    evb.emit("A.B");

    expect(fctindex).toBe(2);
    
    expect(() => {
      evb.emit("A.B");
    }).not.toThrowError();
    
    expect(fctindex).toBe(2);


    fctindex = 0;
    evb.once("A.B", () => {
      throw Error("This handler should not be called");
    }).off();

    expect(() => {
      evb.emit("A.B");
    }).not.toThrowError();
  });

  it("Should handle all form of unsubscription", () => {
    const evb = new EventBus(".", 2);

    evb.on("A", () => {
      throw Error;
    });

    evb.on("B", () => {
      throw Error;
    });

    evb.off();

    expect(() => evb.emit("A")).not.toThrowError();
    expect(() => evb.emit("B")).not.toThrowError();
    /***************************** */

    const fct = () => { throw Error; };

    evb.on("A.B", fct);
    evb.once("C.D", fct);

    evb.off(fct);

    expect(() => evb.emit("A.B")).not.toThrowError();
    expect(() => evb.emit("C.D")).not.toThrowError();

    /************************************* */

    const fctA = () => {
      throw Error;
    };

    evb.on("A", fctA);
    evb.once("A", fctA);
    evb.off("A", fctA);

    expect(() => evb.emit("A")).not.toThrowError();


    /************************************* */

    const offId = evb.on("A", fctA).id;
    evb.off(offId);

    expect(() => evb.emit("A")).not.toThrowError();   
  });

  it("Should work with parent too", () => {
    const evbParent = new EventBus(".", 2);
    const evbChild = new EventBus(".", 2);
    
    evbChild.parent = evbParent;

    expect(evbChild.parent).toBe(evbParent);

    let fctIdx = 0;
    const fct = () => {
      fctIdx++;
    }

    evbParent.on("A.B", fct);
    evbChild.on("A.B", fct);

    evbChild.emit("A.B");

    expect(fctIdx).toBe(2);
  });

  it("Should work in async mode", (resolve) => {
    const evb = new EventBus(".", 2);

    evb.on("A.B", () => {
      resolve();
    });

    evb.emitAsync("A.B");
  });

  it("Should work in async mode with partial eventname", (resolve) => {
    const evb = new EventBus(".", 2);

    evb.on("A", () => {
      resolve();
    });

    evb.emitAsync("A.B");
  });

  it("Should work in async mode with partial eventname in once mode", (resolve) => {
    const evb = new EventBus(".", 2);

    evb.once("A", () => {
      resolve();
    });

    evb.emitAsync("D");
    evb.emitAsync("A.B");
  });

  it("Should work with parent too in async mode", (resolve) => {
    const evbParent = new EventBus(".", 2);
    const evbChild = new EventBus(".", 2);
    
    evbChild.parent = evbParent;

    expect(evbChild.parent).toBe(evbParent);

    let fctIdx = 0;
    const fct = () => {
      fctIdx++;
      if (fctIdx === 2) {
        resolve();
      }
    }

    evbParent.on("A.B", fct);
    evbChild.on("A.B", fct);

    evbChild.emitAsync("A.B");
  });

  it("Should throw an exception if eventName is not defined", () => {
    const bus = new EventBus(".", 3);
    expect(() => {
      bus.on((void 0 as any), () => {});
    }).toThrow(`The event name is not in the correct format :
Should be in '3' parts
separated by '.'`);
  });

});