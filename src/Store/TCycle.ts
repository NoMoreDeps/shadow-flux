
export type TCycle = {
  id      : number ;
  payload : any    ;
  type    : string ;
  stores: {
    [key: string]: {
      action      : string   ;
      nextState   : any      ;
      subscribers : number   ;
      wait        : string[] ;
      will        : boolean  ;
      emit        : string[] ;
    };
  };
};
