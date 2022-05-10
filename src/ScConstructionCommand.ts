import { ScType } from "./ScType";

export class ScConstructionCommand {
  private _elType: ScType;
  private _data: any;

  constructor(elType: ScType, data?: any) {
    this._elType = elType;
    this._data = data;
  }

  get type() {
    return this._elType;
  }
  get data() {
    return this._data;
  }
}
