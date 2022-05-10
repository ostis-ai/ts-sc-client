import { ScAddr } from "./ScAddr";
import { ScEventCallbackFunc, ScEventType } from "./ScEvent";

export class ScEventParams {
  private _addr: ScAddr;
  private _type: ScEventType;
  private _callback: ScEventCallbackFunc;

  constructor(addr: ScAddr, type: ScEventType, callback: ScEventCallbackFunc) {
    this._addr = addr;
    this._type = type;
    this._callback = callback;
  }

  public get addr() {
    return this._addr;
  }
  public get type() {
    return this._type;
  }
  public get callback() {
    return this._callback;
  }
}
