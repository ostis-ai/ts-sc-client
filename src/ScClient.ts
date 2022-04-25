import { InvalidValue } from "./errors";
import { ScAddr } from "./ScAddr";
import { ScConstruction } from "./ScConstruction";
import { ScConstructionCommand } from "./ScConstructionCommand";
import { ScEvent, ScEventCallbackFunc } from "./scEvent";
import { ScEventParams } from "./ScEventParams";
import { ScLinkContent, ScLinkContentType } from "./ScLinkContent";
import { ScTemplate, ScTemplateTriple, ScTemplateValue } from "./ScTemplate";
import { ScTemplateSearchResult, ScTemplateResult } from "./ScTemplateResult";
import { ScType } from "./scType";

type WSCallback = (data: Response) => void;

interface Response {
  id: number;
  status: boolean;
  event: boolean;
  payload: any;
}

interface KeynodeParam<ParamId extends string = string> {
  id: ParamId;
  type: ScType;
}

type ResolveIdtfMap = { [id: string]: ScAddr };

type SocketEvent = "close" | "error" | "open";

export type ScTemplateGenParams = { [id: string]: ScAddr };

export type TAction =
  | "create_elements"
  | "check_elements"
  | "delete_elements"
  | "search_template"
  | "generate_template"
  | "events"
  | "keynodes"
  | "content";

export class ScClient {
  private _eventID: number;
  private _url: string;
  private _messageQueue: Array<() => void>;
  private _socket: WebSocket;
  private _callbacks: Record<number, WSCallback>;
  private _events: Record<number, ScEvent>;

  constructor(url: string) {
    this._url = url;
    this._socket = new WebSocket(this._url);
    this._socket.onmessage = this.onMessage;
    this._socket.onopen = this.sendMessagesFromQueue;

    this._messageQueue = [];
    this._callbacks = {};
    this._events = {};
    this._eventID = 1;
  }

  public addEventListener(evt: SocketEvent, cb: () => void) {
    this._socket.addEventListener(evt, cb);
  }

  public removeEventListener(evt: SocketEvent, cb: () => void) {
    this._socket.removeEventListener(evt, cb);
  }

  private sendMessagesFromQueue = () => {
    this._messageQueue.forEach((func) => func());
    this._messageQueue = [];
  };

  private onMessage = (evt: MessageEvent) => {
    const data = JSON.parse(evt.data);
    const cmdID = data.id;
    const callback = this._callbacks[cmdID];

    if (data.event) {
      const evt = this._events[cmdID];

      if (evt) {
        evt.callback?.(
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
  };

  private sendMessage(
    type: TAction,
    payload: Record<string, any>,
    callback: WSCallback
  ) {
    this._eventID++;

    if (this._callbacks[this._eventID]) {
      throw "Invalid state of messages queue";
    }

    this._callbacks[this._eventID] = callback;
    const data = JSON.stringify({
      id: this._eventID,
      type,
      payload,
    });

    const sendData = () => this._socket.send(data);

    if (this._socket.readyState !== this._socket.OPEN) {
      return this._messageQueue.push(sendData);
    }
    sendData();
  }

  public async checkElements(addrs: ScAddr[]): Promise<ScType[]> {
    return new Promise<ScType[]>((resolve) => {
      if (!addrs.length) return resolve([]);

      const payload = addrs.map(({ value }: ScAddr) => value);

      this.sendMessage("check_elements", payload, (data: Response) => {
        const result = data.payload.map((scType: number) => new ScType(scType));
        resolve(result);
      });
    });
  }

  public async createElements(constr: ScConstruction) {
    return new Promise<ScAddr[]>((resolve) => {
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

      this.sendMessage("create_elements", payload, (data: Response) => {
        resolve(
          data.payload.map((a: number): ScAddr => {
            return new ScAddr(a);
          })
        );
      });
    });
  }

  public async deleteElements(addrs: ScAddr[]) {
    return new Promise<boolean>((resolve) => {
      const payload = addrs.map((a: ScAddr) => {
        return a.value;
      });
      this.sendMessage("delete_elements", payload, (data: Response) => {
        resolve(data.status);
      });
    });
  }

  public async setLinkContents(contents: ScLinkContent[]) {
    return new Promise<boolean[]>((resolve) => {
      const payload = contents.map((c: ScLinkContent) => {
        return {
          command: "set",
          type: c.TypeToStr(),
          data: c.data,
          addr: c.addr?.value,
        };
      });

      this.sendMessage("content", payload, (data: Response) => {
        resolve(data.payload);
      });
    });
  }

  public async getLinkContents(addrs: ScAddr[]) {
    return new Promise<ScLinkContent[]>((resolve) => {
      const payload = addrs.map((a: ScAddr) => {
        return {
          command: "get",
          addr: a.value,
        };
      });

      this.sendMessage("content", payload, (data: Response) => {
        const result: ScLinkContent[] = data.payload.map((o: any) => {
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

  public async resolveKeynodes<ParamId extends string>(
    params: ReadonlyArray<KeynodeParam<ParamId>>
  ) {
    return new Promise<Record<ParamId, ScAddr>>((resolve) => {
      const payload = params.map(({ id, type }) => {
        if (type.isValid()) {
          return {
            command: "resolve",
            idtf: id,
            elType: type.value,
          };
        }

        return {
          command: "find",
          idtf: id,
        };
      });

      this.sendMessage("keynodes", payload, (data: Response) => {
        const addrs = data.payload.map((addr: number) => new ScAddr(addr));

        const result = {} as Record<ParamId, ScAddr>;
        for (let i = 0; i < addrs.length; ++i) {
          result[params[i].id] = addrs[i];
        }
        resolve(result);
      });
    });
  }

  private processTripleItem(it: ScTemplateValue) {
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

  public async templateSearch(templ: ScTemplate | string) {
    return new Promise<ScTemplateSearchResult>(async (resolve) => {
      let payload: any = [];

      if (typeof templ === "string") {
        payload = templ;
      } else {
        templ.ForEachSearchTriple((triple: ScTemplateTriple) => {
          let items: object[] = [];
          payload.push([
            this.processTripleItem(triple.source),
            this.processTripleItem(triple.edge),
            this.processTripleItem(triple.target),
          ]);
        });
      }

      this.sendMessage("search_template", payload, (data: Response) => {
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

  public async templateGenerate(
    templ: ScTemplate | string,
    params: ScTemplateGenParams
  ) {
    return new Promise<ScTemplateResult | null>(async (resolve) => {
      let templData: any = [];

      if (typeof templ === "string") {
        templData = templ;
      } else {
        templ.ForEachSearchTriple((triple: ScTemplateTriple) => {
          templData.push([
            this.processTripleItem(triple.source),
            this.processTripleItem(triple.edge),
            this.processTripleItem(triple.target),
          ]);
        });
      }
      const jsonParams = {} as Record<string, any>;
      for (let key in params) {
        if (params.hasOwnProperty(key)) {
          jsonParams[key] = params[key].value;
        }
      }
      const payload = { templ: templData, params: jsonParams };

      this.sendMessage("generate_template", payload, (data: Response) => {
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

  public async eventsCreate(events: ScEventParams[]) {
    return new Promise<ScEvent[]>((resolve) => {
      const payload = {
        create: events.map((evt: ScEventParams) => {
          return {
            type: evt.type,
            addr: evt.addr.value,
          };
        }),
      };

      this.sendMessage("events", payload, (data: Response) => {
        const result: ScEvent[] = [];
        for (let i = 0; i < events.length; ++i) {
          const id: number = data.payload[i];
          const callback: ScEventCallbackFunc = events[i].callback;

          const evt: ScEvent = new ScEvent(id, events[i].type, callback);
          this._events[id] = evt;

          result.push(evt);
        }

        resolve(result);
      });
    });
  }

  public async eventsDestroy(events: ScEvent[]): Promise<void> {
    return new Promise<void>((resolve) => {
      const payload = {
        delete: events.map((evt: ScEvent) => {
          return evt.id;
        }),
      };

      this.sendMessage("events", payload, (data: Response) => {
        for (let i = 0; i < events.length; ++i) {
          delete this._events[events[i].id];
        }
        resolve();
      });
    });
  }
}
