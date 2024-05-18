import { invalidValue } from "./errors";
import { ScAddr } from "./ScAddr";
import { ScConstruction } from "./ScConstruction";
import { ScEvent } from "./ScEvent";
import { ScEventParams } from "./ScEventParams";
import { ScLinkContent, TContentString } from "./ScLinkContent";
import { ScTemplate, ScTemplateValue } from "./ScTemplate";
import { ScTemplateResult } from "./ScTemplateResult";
import { ScType } from "./ScType";
import {
  ScError,
  IEdge,
  ILink,
  INode,
  TCheckElementsArgs,
  TGetContentArgs,
  TSetContentArgs,
  TGetLinksArgs,
  TGetStringsArgs,
  TCreateElementsArgs,
  TCreateElementsBySCsArgs,
  TDeleteElementsArgs,
  TWSCallback,
  TAction,
  TKeynodesElementsArgs,
  TTemplateSearchArgs,
  TTripleItem,
  TTemplateGenerateArgs,
  TCreateEventArgs,
  TDeleteEventArgs,
  ISCs,
  TConnectionInfoArgs,
} from "./types";
import { shiftMap, snakeToCamelCase, transformEdgeInfo } from "./utils";
import { KeynodesToObject } from "./types";
import { DEFAULT_KEYNODES_CASHE_SIZE } from "./constants";

export interface Response<T = any> {
  id: number;
  status: boolean;
  event: boolean;
  payload: T;
  errors: ScError;
}

export interface Request<T = any> {
  id: number;
  type: TAction;
  payload: T;
}

interface KeynodeParam<ParamId extends string = string> {
  id: ParamId;
  type: ScType;
}

type SocketEvent = "close" | "error" | "open";

interface IParams {
  keynodesCasheSize?: number;
}

const defaultParams: IParams = {
  keynodesCasheSize: DEFAULT_KEYNODES_CASHE_SIZE,
};

export class ScClient {
  private _eventID: number;
  private _messageQueue: Array<() => void>;
  private _socket: WebSocket;
  private _callbacks: Record<number, TWSCallback>;
  private _events: Record<number, ScEvent>;
  private _keynodesCache: Map<string, ScAddr>;
  private _keynodesCacheSize: number;

  constructor(arg: string | WebSocket, params = defaultParams) {
    this._socket = typeof arg === "string" ? new WebSocket(arg) : arg;
    this._socket.onmessage = this.onMessage;
    this._socket.onopen = this.sendMessagesFromQueue;

    this._messageQueue = [];
    this._callbacks = {};
    this._events = {};
    this._eventID = 1;
    this._keynodesCacheSize =
      params.keynodesCasheSize ?? DEFAULT_KEYNODES_CASHE_SIZE;
    this._keynodesCache = new Map<string, ScAddr>();
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

  private onMessage = (messageEvent: MessageEvent) => {
    const data = JSON.parse(messageEvent.data.toString()) as Response;
    const cmdID = data.id;
    const callback = this._callbacks[cmdID];

    if (data.event) {
      const evt = this._events[cmdID];

      if (evt) {
        evt.callback?.(
          new ScAddr(data.payload[0]),
          new ScAddr(data.payload[1]),
          new ScAddr(data.payload[2]),
          evt.id
        );
      } else {
        throw `Can't find callback for an event ${cmdID}`;
      }
    } else {
      if (!callback) {
        throw `Can't find callback for a command ${cmdID}`;
      }

      delete this._callbacks[cmdID];

      callback(data);
    }
  };

  private sendMessage(...args: TConnectionInfoArgs): void;
  private sendMessage(...args: TDeleteElementsArgs): void;
  private sendMessage(...args: TCreateElementsArgs): void;
  private sendMessage(...args: TCreateElementsBySCsArgs): void;
  private sendMessage(...args: TCheckElementsArgs): void;
  private sendMessage(...args: TGetContentArgs): void;
  private sendMessage(...args: TSetContentArgs): void;
  private sendMessage(...args: TGetLinksArgs): void;
  private sendMessage(...args: TGetStringsArgs): void;
  private sendMessage(...args: TKeynodesElementsArgs): void;
  private sendMessage(...args: TTemplateSearchArgs): void;
  private sendMessage(...args: TTemplateGenerateArgs): void;
  private sendMessage(...args: TCreateEventArgs): void;
  private sendMessage(...args: TDeleteEventArgs): void;

  private sendMessage(
    actionType: string,
    payload: unknown,
    callback: TWSCallback<any>
  ): void {
    this._eventID++;

    if (this._callbacks[this._eventID]) {
      throw "Invalid state of messages queue";
    }

    this._callbacks[this._eventID] = callback;
    const data = JSON.stringify({
      id: this._eventID,
      type: actionType,
      payload,
    });

    const sendData = () => this._socket.send(data);

    if (this._socket.readyState !== this._socket.OPEN) {
      this._messageQueue.push(sendData);
      return;
    }
    sendData();
  }

  private resolveOrReject(
    resolve: (arg: any) => void,
    reject: (arg: string | string[]) => void,
    success: any,
    errors: ScError
  ) {
    if (errors.length === 0) {
      return resolve(success);
    }

    const transformedErrors =
      typeof errors === "string"
        ? errors
        : errors.map(({ message }) => message);
    return reject(transformedErrors);
  }

  public async getUser() {
    return new Promise<ScAddr>((resolve, reject) => {
      this.sendMessage("connection_info", null, ({ payload, errors }) => {
        const result = new ScAddr(payload.user_addr);
        this.resolveOrReject(resolve, reject, result, errors);
      });
    });
  }

  public async checkElements(addrs: ScAddr[]) {
    return new Promise<ScType[]>((resolve, reject) => {
      if (!addrs.length) return resolve([]);

      const payload = addrs.map(({ value }) => value);

      this.sendMessage("check_elements", payload, ({ payload, errors }) => {
        const result = payload.map((type: number) => new ScType(type));
        this.resolveOrReject(resolve, reject, result, errors);
      });
    });
  }

  public async createElements(construction: ScConstruction) {
    return new Promise<ScAddr[]>((resolve, reject) => {
      const payload = construction.commands
        .map((cmd) => {
          if (cmd.type.isNode()) {
            return {
              el: "node",
              type: cmd.type.value,
            };
          }
          if (cmd.type.isEdge()) {
            return {
              el: "edge",
              type: cmd.type.value,
              src: transformEdgeInfo(construction, cmd.data.src),
              trg: transformEdgeInfo(construction, cmd.data.trg),
            };
          }
          if (cmd.type.isLink()) {
            return {
              el: "link",
              type: cmd.type.value,
              content: cmd.data.content,
              content_type: cmd.data.type,
            };
          }

          invalidValue("Unknown type");
        })
        .filter((value): value is INode | IEdge | ILink => Boolean(value));

      this.sendMessage("create_elements", payload, ({ payload, errors }) => {
        const result = payload.map((a) => new ScAddr(a));
        this.resolveOrReject(resolve, reject, result, errors);
      });
    });
  }

  public async createElementsBySCs(scsText: string[] | ISCs[]) {
    return new Promise<boolean[]>((resolve, reject) => {
      const payload = scsText.map((scsString) => {
        if (typeof scsString === "string") {
          return { scs: scsString, output_structure: 0 };
        }
        return {
          scs: scsString.scs,
          output_structure: scsString.output_structure?.value,
        };
      });
      this.sendMessage(
        "create_elements_by_scs",
        payload,
        ({ payload, errors }) => {
          this.resolveOrReject(resolve, reject, payload, errors);
        }
      );
    });
  }

  public async deleteElements(addrs: ScAddr[]) {
    return new Promise<boolean>((resolve, reject) => {
      const payload = addrs.map(({ value }) => value);
      this.sendMessage("delete_elements", payload, ({ status, errors }) => {
        this.resolveOrReject(resolve, reject, status, errors);
      });
    });
  }

  public async setLinkContents(contents: ScLinkContent[]) {
    return new Promise<boolean[]>((resolve, reject) => {
      const payload = contents.map((content) => ({
        command: "set" as const,
        type: content.typeToStr(),
        data: content.data,
        addr: content.addr?.value as number,
      }));

      this.sendMessage("content", payload, ({ payload, errors }) => {
        this.resolveOrReject(resolve, reject, payload, errors);
      });
    });
  }

  public async getLinkContents(addrs: ScAddr[]) {
    return new Promise<ScLinkContent[]>((resolve, reject) => {
      const payload = addrs.map(({ value }) => ({
        command: "get" as const,
        addr: value,
      }));

      this.sendMessage("content", payload, ({ payload, errors }) => {
        const result = payload.map(
          (res) =>
            new ScLinkContent(res.value, ScLinkContent.stringToType(res.type))
        );
        this.resolveOrReject(resolve, reject, result, errors);
      });
    });
  }

  public async getLinksByContents(contents: string[]) {
    return new Promise<ScAddr[][]>((resolve, reject) => {
      const payload = contents.map((content) => ({
        command: "find" as const,
        data: content,
      }));

      this.sendMessage("content", payload, ({ payload, errors }) => {
        const result = payload.map((slice) =>
          slice.map((addr) => new ScAddr(addr))
        );
        this.resolveOrReject(resolve, reject, result, errors);
      });
    });
  }

  public async getLinksByContentSubstrings(contents: string[]) {
    return new Promise<ScAddr[][]>((resolve, reject) => {
      const payload = contents.map((content) => ({
        command: "find_links_by_substr" as const,
        data: content,
      }));

      this.sendMessage("content", payload, ({ payload, errors }) => {
        const result = payload.map((slice) =>
          slice.map((addr) => new ScAddr(addr))
        );
        this.resolveOrReject(resolve, reject, result, errors);
      });
    });
  }

  public async getLinksContentsByContentSubstrings(contents: string[]) {
    return new Promise<string[][]>((resolve, reject) => {
      const payload = contents.map((content) => ({
        command: "find_strings_by_substr" as const,
        data: content,
      }));

      this.sendMessage("content", payload, ({ payload, errors }) => {
        this.resolveOrReject(resolve, reject, payload, errors);
      });
    });
  }

  public async resolveKeynodes<ParamId extends string>(
    params: ReadonlyArray<KeynodeParam<ParamId>>
  ) {
    return new Promise<Record<ParamId, ScAddr>>((resolve, reject) => {
      const payload = params.map(({ id, type }) => {
        if (type.isValid()) {
          return {
            command: "resolve" as const,
            idtf: id,
            elType: type.value,
          };
        }

        return {
          command: "find" as const,
          idtf: id,
        };
      });

      this.sendMessage("keynodes", payload, ({ payload, errors }) => {
        const addrs = payload.map((addr: number) => new ScAddr(addr));

        const result = addrs.reduce(
          (acc, curr, ind) => ({
            ...acc,
            [params[ind].id]: curr,
          }),
          {} as Record<ParamId, ScAddr>
        );

        this.resolveOrReject(resolve, reject, result, errors);
      });
    });
  }

  private processTripleItem({ value, alias }: ScTemplateValue): TTripleItem {
    const aliasObj = alias ? { alias } : {};
    if (value instanceof ScAddr) {
      return { type: "addr", value: value.value, ...aliasObj };
    }
    if (value instanceof ScType) {
      return { type: "type", value: value.value, ...aliasObj };
    }
    return { type: "alias", value, ...aliasObj };
  }

  private processTemplate(template: ScTemplate | ScAddr | string) {
    if (template instanceof ScAddr)
      return { type: "addr", value: template.value };
    else if (typeof template === "string" && /^[a-z0-9_]+$/.test(template))
      return { type: "idtf", value: template };
    else if (typeof template === "string") return template;
    else
      return template.triples.map(({ source, edge, target }) => [
        this.processTripleItem(source),
        this.processTripleItem(edge),
        this.processTripleItem(target),
      ]);
  }

  private processTemplateParams(params: Record<string, ScAddr | string>) {
    return Object.keys(params).reduce((acc, key) => {
      const param = params[key];
      acc[key] = typeof param === "string" ? param : param.value;
      return acc;
    }, {} as Record<string, number | string>);
  }

  public async templateSearch(
    template: ScTemplate | ScAddr | string,
    params: Record<string, ScAddr | string> = {}
  ) {
    return new Promise<ScTemplateResult[]>(async (resolve, reject) => {
      const templ = this.processTemplate(template);
      const processedParams = this.processTemplateParams(params);
      const payload = { templ, params: processedParams };
      this.sendMessage(
        "search_template",
        payload,
        ({ payload, status, errors }) => {
          if (!status) return resolve([]);

          const result = payload.addrs.map((addrs) => {
            const templateAddrs = addrs.map((addr) => new ScAddr(addr));
            return new ScTemplateResult(payload.aliases, templateAddrs);
          });
          this.resolveOrReject(resolve, reject, result, errors);
        }
      );
    });
  }

  public async templateGenerate(
    template: ScTemplate | ScAddr | string,
    params: Record<string, ScAddr | string> = {}
  ) {
    return new Promise<ScTemplateResult | null>(async (resolve, reject) => {
      const templ = this.processTemplate(template);
      const processedParams = this.processTemplateParams(params);

      const payload = { templ, params: processedParams };

      this.sendMessage(
        "generate_template",
        payload,
        ({ status, payload, errors }) => {
          if (!status) resolve(null);
          const addrs = payload.addrs.map((addr) => new ScAddr(addr));
          const result = new ScTemplateResult(payload.aliases, addrs);
          this.resolveOrReject(resolve, reject, result, errors);
        }
      );
    });
  }

  public async eventsCreate(eventOrEvents: ScEventParams[] | ScEventParams) {
    const events = Array.isArray(eventOrEvents)
      ? eventOrEvents
      : [eventOrEvents];

    return new Promise<ScEvent[]>((resolve, reject) => {
      const payload = {
        create: events.map(({ type, addr }) => ({
          type,
          addr: addr.value,
        })),
      };

      this.sendMessage("events", payload, ({ payload, errors }) => {
        const result = events.map(({ callback, type }, ind) => {
          const eventId = payload[ind];
          const newEvt = new ScEvent(eventId, type, callback);
          this._events[eventId] = newEvt;
          return newEvt;
        });

        this.resolveOrReject(resolve, reject, result, errors);
      });
    });
  }

  public async eventsDestroy(eventIdOrIds: number[] | number) {
    const eventIds = Array.isArray(eventIdOrIds)
      ? eventIdOrIds
      : [eventIdOrIds];

    return new Promise<void>((resolve, reject) => {
      const payload = {
        delete: eventIds,
      };

      this.sendMessage("events", payload, ({ status, errors }) => {
        eventIds.forEach((eventId) => {
          delete this._events[eventId];
        });
        this.resolveOrReject(resolve, reject, status, errors);
      });
    });
  }

  public async findKeynodes<K extends [string, ...string[]]>(
    ...keynodes: K
  ): Promise<KeynodesToObject<K>> {
    const newKeynodes = keynodes
      .filter((keynode) => !this._keynodesCache.get(keynode))
      .map((keynode) => ({ id: keynode, type: ScType.NodeConst }));
    const cacheKeynodes = keynodes.filter((keynode) =>
      this._keynodesCache.get(keynode)
    );

    const overflow =
      this._keynodesCache.size + newKeynodes.length - this._keynodesCacheSize;

    if (overflow > 0) shiftMap(this._keynodesCache, overflow);

    const foundKeynodes = newKeynodes.length
      ? await this.resolveKeynodes(newKeynodes)
      : [];

    const foundKeynodesEntries = Object.entries(foundKeynodes);
    const cacheKeynodesEntries = cacheKeynodes.map((keynode) => [
      keynode,
      this._keynodesCache.get(keynode),
    ]);

    foundKeynodesEntries.forEach(([key, value]) =>
      this._keynodesCache.set(key, value)
    );

    const keynodesEntries = [...foundKeynodesEntries, ...cacheKeynodesEntries];
    const transformedEntries = keynodesEntries.map(([key, value]) => [
      snakeToCamelCase(key as string),
      value,
    ]);
    return Object.fromEntries(transformedEntries);
  }
}
