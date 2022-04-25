import { ScAddr } from "./ScAddr";

export enum ScLinkContentType {
  Int = 0,
  Float = 1,
  String = 2,
  Binary = 3,
}

export class ScLinkContent {
  private _data: string | number;
  private _type: ScLinkContentType;
  private _addr: ScAddr | undefined;

  constructor(data: string | number, type: ScLinkContentType, addr?: ScAddr) {
    this._data = data;
    this._type = type;
    this._addr = addr;
  }

  public get data() {
    return this._data;
  }
  public get type() {
    return this._type;
  }
  public get addr() {
    return this._addr;
  }

  public TypeToStr() {
    if (this._type == ScLinkContentType.Binary) {
      return "binary";
    } else if (this._type == ScLinkContentType.Float) {
      return "float";
    } else if (this._type == ScLinkContentType.Int) {
      return "int";
    }

    return "string";
  }
}
