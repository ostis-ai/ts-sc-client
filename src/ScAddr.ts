export class ScAddr {
  private _value: number;

  constructor(v = 0) {
    this._value = v;
  }

  public get value() {
    return this._value;
  }

  public isValid() {
    return this._value != 0;
  }

  public equal(other: ScAddr) {
    return this._value === other._value;
  }
}
