import { ScAddr } from "./ScAddr";

export type ScEventCallbackFunc = (
  elAddr: ScAddr,
  edge: ScAddr,
  other: ScAddr,
  eventId: number
) => void;

export enum ScEventType {
  Unknown = "unknown",
  AfterGenerateOutgoingArc = "add_outgoing_edge",
  AfterGenerateIncomingArc = "add_ingoing_edge",
  BeforeEraseOutgoingArc = "remove_outgoing_edge",
  BeforeEraseIncomingArc = "remove_ingoing_edge",
  BeforeEraseElement = "delete_element",
  BeforeChangeLinkContent = "content_change",
}

export class ScEventSubscription {
  private _id: number = 0;
  private _type: ScEventType | null = null;
  private _callback: ScEventCallbackFunc | null = null;

  constructor(id: number, type: ScEventType, callback: ScEventCallbackFunc) {
    this._id = id;
    this._type = type;
    this._callback = callback;
  }

  public get id() {
    return this._id;
  }

  public get type() {
    return this._type;
  }

  public get callback() {
    return this._callback;
  }

  public IsValid() {
    return this._id > 0;
  }
}
