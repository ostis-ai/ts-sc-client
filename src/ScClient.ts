import { InvalidValue } from "./errors";
import { ScAddr } from "./ScAddr";
import { ScConstruction } from "./ScConstruction";
import { ScConstructionCommand } from "./ScConstructionCommand";
import { ScEvent } from "./ScEvent";
import { ScEventParams } from "./ScEventParams";
import { ScLinkContent, ScLinkContentType } from "./ScLinkContent";
import { ScTemplate } from "./ScTemplate";
import { ScTemplateSearchResult, ScTemplateResult } from "./ScTemplateResult";
import { ScType } from "./scType";

export type ResolveIdtfMap = { [id: string]: ScAddr };

type CallbackFunc = () => void;
type ScEventCallbackFunc = (
  elAddr: ScAddr,
  edge: ScAddr,
  other: ScAddr
) => void;

export type ScTemplateGenParams = { [id: string]: ScAddr };
export interface ScIdtfResolveParams {
  idtf: string;
  type: ScType;
}

type ScTemplateParamValue = string | ScAddr | ScType;

interface Response {
  id: number;
  status: boolean;
  event: boolean;
  payload: any;
}

interface ScTemplateValue {
  value: ScTemplateParamValue;
  alias: string;
}

interface ScTemplateTriple {
  source: ScTemplateValue;
  edge: ScTemplateValue;
  target: ScTemplateValue;
}

type WSCallback = (data: Response) => void;

export class ScClient {
  private _eventID: number;
  private _url: string;
  private _socket: WebSocket;
  private _callbacks: Map<number, WSCallback>;
  private _events: Map<number, ScEvent>;

  constructor(
    wsURL,
    onConnect: CallbackFunc,
    onDisconnect: CallbackFunc,
    onError: CallbackFunc
  ) {
    this._url = wsURL;
    this._socket = new WebSocket(this._url);
    this._socket.onopen = onConnect;
    this._socket.onclose = onDisconnect;
    this._socket.onerror = onError;
    this._socket.onmessage = this.onMessage.bind(this);

    this._callbacks = new Map<number, WSCallback>();
    this._events = new Map<number, ScEvent>();
    this._eventID = 1;
  }

  private onMessage(evt: MessageEvent): void {
    const data: Response = JSON.parse(evt.data);
    const cmdID: number = data.id;
    const callback: WSCallback = this._callbacks[cmdID];

    if (data.event) {
      const evt: ScEvent = this._events[cmdID];

      if (evt) {
        evt.callback(
          new ScAddr(data.payload[0]),
          new ScAddr(data.payload[1]),
          new ScAddr(data.payload[2])
        );
      } else {
        throw `Can't find callback for an event ${cmdID}`;
      }
    } else {
      if (!callback) {
        throw `Can't find callback for a command ${cmdID}`;
      }

      delete this._callbacks[cmdID];

      callback(data as Response);
    }
  }

  private sendMessage(
    type: string,
    payload: object,
    callback: WSCallback
  ): void {
    this._eventID++;
    if (this._callbacks[this._eventID]) {
      throw "Invalid state of messages queue";
    }

    this._callbacks[this._eventID] = callback;
    this._socket.send(
      JSON.stringify({
        id: this._eventID,
        type: type,
        payload: payload,
      })
    );
  }

  public async CheckElements(addrs: ScAddr[]): Promise<ScType[]> {
    const self = this;
    return new Promise<ScType[]>(function (resolve) {
      if (addrs.length == 0) {
        resolve([]);
      } else {
        const payload: number[] = addrs.map((a: ScAddr) => {
          return a.value;
        });
        self.sendMessage("check_elements", payload, (data: Response) => {
          const result: ScType[] = data.payload.map((t: number): ScType => {
            return new ScType(t);
          });
          resolve(result);
        });
      }
    });
  }

  public async CreateElements(constr: ScConstruction): Promise<ScAddr[]> {
    const self = this;
    return new Promise<ScAddr[]>(function (resolve) {
      let payload: any[] = constr.commands.map((cmd: ScConstructionCommand) => {
        if (cmd.type.isNode()) {
          return {
            el: "node",
            type: cmd.type.value,
          };
        } else if (cmd.type.isEdge()) {
          function solveAdj(obj: any) {
            if (obj instanceof ScAddr) {
              return {
                type: "addr",
                value: obj.value,
              };
            }

            const idx: number = constr.GetIndex(obj);
            if (idx === undefined) {
              InvalidValue(`Invalid alias: ${obj}`);
            }
            return {
              type: "ref",
              value: idx,
            };
          }

          return {
            el: "edge",
            type: cmd.type.value,
            src: solveAdj(cmd.data.src),
            trg: solveAdj(cmd.data.trg),
          };
        } else if (cmd.type.isLink()) {
          return {
            el: "link",
            type: cmd.type.value,
            content: cmd.data.content,
            content_type: cmd.data.type,
          };
        }

        InvalidValue("Unknown type");
      });

      self.sendMessage("create_elements", payload, (data: Response) => {
        resolve(
          data.payload.map((a: number): ScAddr => {
            return new ScAddr(a);
          })
        );
      });
    });
  }

  public async DeleteElements(addrs: ScAddr[]): Promise<boolean> {
    const self = this;
    return new Promise<boolean>(function (resolve) {
      const payload = addrs.map((a: ScAddr) => {
        return a.value;
      });
      self.sendMessage("delete_elements", payload, (data: Response) => {
        resolve(data.status);
      });
    });
  }

  public async SetLinkContents(contents: ScLinkContent[]): Promise<boolean[]> {
    const self = this;
    return new Promise<boolean[]>(function (resolve) {
      const payload = contents.map((c: ScLinkContent) => {
        return {
          command: "set",
          type: c.TypeToStr(),
          data: c.data,
          addr: c.addr.value,
        };
      });

      self.sendMessage("content", payload, (data: Response) => {
        resolve(data.payload);
      });
    });
  }

  public async GetLinkContents(addrs: ScAddr[]): Promise<ScLinkContent[]> {
    const self = this;
    return new Promise<ScLinkContent[]>((resolve) => {
      const payload = addrs.map((a: ScAddr) => {
        return {
          command: "get",
          addr: a.value,
        };
      });

      self.sendMessage("content", payload, (data: Response) => {
        const result: ScLinkContent[] = data.payload.map((o: object) => {
          const t: string = o["type"];
          let ctype = ScLinkContentType.Binary;
          if (t == "string") {
            ctype = ScLinkContentType.String;
          } else if (t == "int") {
            ctype = ScLinkContentType.Int;
          } else if (t == "float") {
            ctype = ScLinkContentType.Float;
          }

          return new ScLinkContent(o["value"], ctype);
        });

        resolve(result);
      });
    });
  }

  public async ResolveKeynodes(
    params: ScIdtfResolveParams[]
  ): Promise<ResolveIdtfMap> {
    const self = this;
    return new Promise<ResolveIdtfMap>(function (resolve) {
      const payload = params.map((p: ScIdtfResolveParams) => {
        if (p.type.isValid()) {
          return {
            command: "resolve",
            idtf: p.idtf,
            elType: p.type.value,
          };
        }

        return {
          command: "find",
          idtf: p.idtf,
        };
      });

      self.sendMessage("keynodes", payload, (data: Response) => {
        const addrs: ScAddr[] = data.payload.map((n: number) => {
          return new ScAddr(n);
        });

        const result: ResolveIdtfMap = {};
        for (let i = 0; i < addrs.length; ++i) {
          result[params[i].idtf] = addrs[i];
        }
        resolve(result);
      });
    });
  }

  private ProcessTripleItem(it: ScTemplateValue) {
    let result: any = {};
    if (it.value instanceof ScAddr) {
      result = { type: "addr", value: it.value.value };
    } else if (it.value instanceof ScType) {
      result = { type: "type", value: it.value.value };
    } else {
      return { type: "alias", value: it.value };
    }

    if (it.alias) {
      result.alias = it.alias;
    }

    return result;
  }

  /* Search constructions by specified template
   */
  public async TemplateSearch(
    templ: ScTemplate | string
  ): Promise<ScTemplateSearchResult> {
    const self = this;
    return new Promise<ScTemplateSearchResult>(async function (resolve) {
      let payload: any = [];

      if (typeof templ === "string") {
        payload = templ;
      } else {
        templ.ForEachSearchTriple((triple: ScTemplateTriple) => {
          let items: object[] = [];
          payload.push([
            self.ProcessTripleItem(triple.source),
            self.ProcessTripleItem(triple.edge),
            self.ProcessTripleItem(triple.target),
          ]);
        });
      }

      self.sendMessage("search_template", payload, (data: Response) => {
        let result: ScTemplateSearchResult = [];
        if (data.status) {
          const aliases: any = data.payload["aliases"];
          const addrs: number[][] = data.payload["addrs"];

          addrs.forEach((addrsItem: number[]) => {
            let resultAddrsItem: ScAddr[] = [];
            addrsItem.forEach((a: number) => {
              resultAddrsItem.push(new ScAddr(a));
            });
            result.push(new ScTemplateResult(aliases, resultAddrsItem));
          });
        }

        resolve(result);
      });
    });
  }

  /* Search constructions by specified template
   */
  public async TemplateGenerate(
    templ: ScTemplate | string,
    params: ScTemplateGenParams
  ): Promise<ScTemplateResult> {
    const self = this;
    return new Promise<ScTemplateResult>(async function (resolve) {
      let templData: any = [];

      if (typeof templ === "string") {
        templData = templ;
      } else {
        templ.ForEachSearchTriple((triple: ScTemplateTriple) => {
          let items: object[] = [];

          templData.push([
            self.ProcessTripleItem(triple.source),
            self.ProcessTripleItem(triple.edge),
            self.ProcessTripleItem(triple.target),
          ]);
        });
      }
      const jsonParams = {};
      for (let key in params) {
        if (params.hasOwnProperty(key)) {
          jsonParams[key] = params[key].value;
        }
      }
      const payload = { templ: templData, params: jsonParams };

      self.sendMessage("generate_template", payload, (data: Response) => {
        if (data.status) {
          const aliases: any = data.payload["aliases"];
          const addrs: number[] = data.payload["addrs"];

          let resultAddrs: ScAddr[] = [];
          addrs.forEach((a: number) => {
            resultAddrs.push(new ScAddr(a));
          });

          resolve(new ScTemplateResult(aliases, resultAddrs));
        }

        resolve(null);
      });
    });
  }

  /// -----------------------
  /**
   * Create specified ScEvent
   */
  public async EventsCreate(events: ScEventParams[]): Promise<ScEvent[]> {
    const self = this;
    return new Promise<ScEvent[]>(function (resolve) {
      const payload = {
        create: events.map((evt: ScEventParams) => {
          return {
            type: evt.type,
            addr: evt.addr.value,
          };
        }),
      };

      self.sendMessage("events", payload, (data: Response) => {
        const result: ScEvent[] = [];
        for (let i = 0; i < events.length; ++i) {
          const id: number = data.payload[i];
          const callback: ScEventCallbackFunc = events[i].callback;

          const evt: ScEvent = new ScEvent(id, events[i].type, callback);
          self._events[id] = evt;

          result.push(evt);
        }

        resolve(result);
      });
    });
  }

  /**
   * Destroy specified event
   */
  public async EventsDestroy(events: ScEvent[]): Promise<void> {
    const self = this;
    return new Promise<void>(function (resolve) {
      const payload = {
        delete: events.map((evt: ScEvent) => {
          return evt.id;
        }),
      };

      self.sendMessage("events", payload, (data: Response) => {
        for (let i = 0; i < events.length; ++i) {
          delete self._events[events[i].id];
        }
        resolve();
      });
    });
  }
}
