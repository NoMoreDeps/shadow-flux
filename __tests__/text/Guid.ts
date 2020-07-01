import { Guid } from "../../../text/Guid";


describe("Test Guid", () => {
  it("Should be instanciated", () => {
    let guid = new Guid();
    expect(guid).not.toBeUndefined();
  });

  it("Should generate a valid guid with 5 parts", () => {
    let guid    = new Guid()      ;
    let strGuid = guid.toString() ;

    expect(strGuid.split("-").length).toEqual(5);
  });

  it("Should let us access all part with getters", () => {
    let guid    = new Guid()      ;
    let strGuid = guid.toString() ;

    const tabPart = strGuid.split("-");

    expect(guid.part1).toEqual(parseInt(tabPart[0], 16));
    expect(guid.part2).toEqual(parseInt(tabPart[1], 16));
    expect(guid.part3).toEqual(parseInt(tabPart[2], 16));
    expect(guid.part4).toEqual(parseInt(tabPart[3], 16));
    expect(guid.part5).toEqual(parseInt(tabPart[4], 16));
  })

  it("Should be generated from the static method and be correct", () => {
    let guid      = Guid.getGuid()  ;
    const tabPart = guid.split("-") ;

    expect(tabPart[0].length).toEqual(8);
    expect(tabPart[1].length).toEqual(4);
    expect(tabPart[2].length).toEqual(4);
    expect(tabPart[3].length).toEqual(4);
    expect(tabPart[4].length).toEqual(12);
  });

  it("Shoud get the String Guid version on each call", () => {
    const guid = new Guid()      ;
    const str1 = guid.toString() ;
    const str2 = guid.toString() ;

    expect(str1).toEqual(str2);
  })

  it("Should be unique in 1000 instances", () => {
    let hash: {[key: string]: boolean} = {};

    for (let i = 0; i < 1000; i++) {
      hash[new Guid().toString()] = true;
    }

    let count = 0;

    for (let i in hash) {
      count++;
    }

    expect(count).toEqual(1000);
  });
});