import { ScAddr } from "./ScAddr";

export type ScEventCallbackFunc = (
  elAddr: ScAddr,
  edge: ScAddr,
  other: ScAddr,
  eventId: number
) => void;

export enum ScEventType {
  Unknown = "unknown",
  AddOutgoingEdge = "add_outgoing_edge",
  AddIngoingEdge = "add_ingoing_edge",
  RemoveOutgoingEdge = "remove_outgoing_edge",
  RemoveIngoingEdge = "remove_ingoing_edge",
  RemoveElement = "delete_element",
  ChangeContent = "content_change",
}

export class ScEvent {
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
