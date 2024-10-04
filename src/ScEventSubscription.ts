import { ScAddr } from "./ScAddr";

export type ScEventCallbackFunc = (
  elAddr: ScAddr,
  edge: ScAddr,
  other: ScAddr,
  eventId: number
) => void;

export enum ScEventType {
  Unknown = "unknown",
  AfterGenerateConnector = "sc_event_after_generate_connector",
  AfterGenerateOutgoingArc = "sc_event_after_generate_outgoing_arc",
  AfterGenerateIncomingArc = "sc_event_after_generate_incoming_arc",
  AfterGenerateEdge = "sc_event_after_generate_edge",
  BeforeEraseConnector = "sc_event_before_erase_connector",
  BeforeEraseOutgoingArc = "sc_event_before_erase_outgoing_arc",
  BeforeEraseIncomingArc = "sc_event_before_erase_incoming_arc",
  BeforeEraseEdge = "sc_event_before_erase_edge",
  BeforeEraseElement = "sc_event_before_erase_element",
  BeforeChangeLinkContent = "sc_event_before_change_link_content",
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
