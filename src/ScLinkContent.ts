import { ScAddr } from "./ScAddr";

export enum ScLinkContentType {
  Int = 0,
  Float = 1,
  String = 2,
  Binary = 3,
}

export type TContentString = "binary" | "float" | "int" | "string";

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

  public typeToStr(): TContentString {
    switch (this._type) {
      case ScLinkContentType.Binary:
        return "binary";
      case ScLinkContentType.Float:
        return "float";
      case ScLinkContentType.Int:
        return "int";
      default:
        return "string";
    }
  }

  public static stringToType(string: TContentString): ScLinkContentType {
    switch (string) {
      case "binary":
        return ScLinkContentType.Binary;
      case "float":
        return ScLinkContentType.Float;
      case "int":
        return ScLinkContentType.Int;
      default:
        return ScLinkContentType.String;
    }
  }
}
