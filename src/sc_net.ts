import { ScType, ScAddr } from './sc_types';
import { InvalidValue } from './sc_errors';

export type ResolveIdtfMap = { [id: string] : ScAddr };

type CallbackFunc = ()=>void;
type ScEventCallbackFunc = (elAddr: ScAddr, edge: ScAddr, other: ScAddr)=>void;
type ScAddrList = ScAddr[];

export type ScTemplateGenParams = { [id: string] : ScAddr };
export interface ScIdtfResolveParams {
    idtf: string,
    type: ScType,
};

export enum ScEventType {
    Unknown = "unknown",
    AddOutgoingEdge = "add_outgoing_edge",
    AddIngoingEdge = "add_ingoing_edge",
    RemoveOutgoingEdge = "remove_outgoing_edge",
    RemoveIngoingEdge = "remove_ingoing_edge",
    RemoveElement = "delete_element",
    ChangeContent = "content_change",
}

export class ScEventParams {
    private _addr: ScAddr;
    private _type: ScEventType;
    private _callback: ScEventCallbackFunc;

    constructor(_addr: ScAddr, _type: ScEventType, _callback: ScEventCallbackFunc) {
        this._addr = _addr;
        this._type = _type;
        this._callback = _callback;
    }

    public get addr() { return this._addr; }
    public get type() { return this._type; }
    public get callback() { return this._callback; }
}

export class ScEvent {
    private _id: number = 0;
    private _type: ScEventType = null;
    private _callback: ScEventCallbackFunc = null;

    constructor(_id: number, _type: ScEventType, _callback: ScEventCallbackFunc) {
        this._id = _id;
        this._type = _type;
        this._callback = _callback;
    }

    public get id() : number {
        return this._id;
    }

    public get type() : string {
        return this._type;
    }

    public get callback() : ScEventCallbackFunc {
        return this._callback;
    }

    public IsValid() : boolean {
        return this._id > 0;
    }
}

type ScTemplateParamValue = string | ScAddr | ScType;
type ScTemplateParam = ScTemplateParamValue[] | ScTemplateParamValue;

interface Response {
    id: number,
    status: boolean,
    event: boolean,
    payload: any
}

interface ScTemplateValue {
    value: ScTemplateParamValue,
    alias: string
};

interface ScTemplateTriple {
    source: ScTemplateValue,
    edge: ScTemplateValue,
    target: ScTemplateValue,
};

/* Class that contains template information for search and generate.
 * Typical usage:
 * ScTemplate templ;
 * templ.triple(addr1,
 *              ScType.EdgeAccessConstPosPerm,
 *              [addr2, '_x']);
 * templ.triple('_x',
 *              ScType.EdgeAccessConstPosPerm
 *              ScType.NodeConst);
 */
export class ScTemplate {
    private _triples: ScTemplateTriple[] = [];

    // internal usage only
    public ForEachSearchTriple(callback: (triple: ScTemplateTriple) => void) {

        for (let i = 0; i < this._triples.length; ++i) {
            callback(this._triples[i]);
        }
    }

    public Triple(param1: ScTemplateParam, param2: ScTemplateParam, param3: ScTemplateParam) : ScTemplate {

        const p1: ScTemplateValue = this.SplitTemplateParam(param1);
        const p2: ScTemplateValue = this.SplitTemplateParam(param2);
        const p3: ScTemplateValue = this.SplitTemplateParam(param3);

        const baseIdx: number = this._triples.length * 3;

        this._triples.push({
            source: p1,
            edge: p2,
            target: p3
        });

        return this;
    }

    public TripleWithRelation(param1: ScTemplateParam, param2: ScTemplateParam, param3: ScTemplateParam,
                              param4: ScTemplateParam, param5: ScTemplateParam) : ScTemplate {

        let { alias, value } = this.SplitTemplateParam(param2);
        if (!alias)
            alias = `edge_1_${this._triples.length}`;

        this.Triple(param1, [value, alias], param3);
        this.Triple(param5, param4, alias);
        
        return this;
    }

    private SplitTemplateParam(param: ScTemplateParam) : ScTemplateValue {
        
        if (param instanceof Array) {

            if (param.length != 2) {
                throw 'Invalid number of values for remplacement. Use [ScType | ScAddr, string]';
            }

            const value: any = param[0];
            const alias: any = param[1];

            const isValidValue: boolean = (value instanceof ScAddr) || (value instanceof ScType);

            if (!isValidValue || !(typeof alias === 'string')) {
                throw 'First parameter should be ScAddr or ScType. The second one - string';
            }

            return {
                alias: alias as string,
                value: value as ScTemplateParamValue,
            };
        }

        return {
            alias: null,
            value: param as ScTemplateParamValue,
        }
    }
};

class ScConstructionCommand {
    private _elType: ScType;
    private _data: any;

    constructor(elType: ScType, data?: any) {
        this._elType = elType;
        this._data = data;
    }

    get type() { return this._elType; }
    get data() { return this._data; }
}

export enum ScLinkContentType {
    Int = 0,
    Float = 1,
    String = 2,
    Binary = 3
}

export class ScLinkContent {
    private _data: string | number;
    private _type: ScLinkContentType;
    private _addr: ScAddr;

    constructor(data: string | number, type: ScLinkContentType, addr?: ScAddr) {
        this._data = data;
        this._type = type;
        this._addr = addr;
    }

    public get data() { return this._data; }
    public get type() { return this._type; }
    public get addr() { return this._addr; }

    public TypeToStr() {
        if (this._type == ScLinkContentType.Binary) {
            return 'binary';
        } else if (this._type == ScLinkContentType.Float) {
            return 'float';
        } else if (this._type == ScLinkContentType.Int) {
            return 'int';
        }

        return 'string';
    }
}

export class ScConstruction {
    private _commands: ScConstructionCommand[];
    private _aliases: Map<string, number>;

    constructor() {
        this._commands = [];
        this._aliases = new Map<string, number>();
    }

    public CreateNode(type: ScType, alias?: string) {
        if (!type.isNode()) {
            InvalidValue("You should pass node type there");
        }

        const cmd: ScConstructionCommand = new ScConstructionCommand(type);
        if (alias) {
            this._aliases[alias] = this._commands.length;
        }
        this._commands.push(cmd);
    }

    public CreateEdge(type: ScType, src: string | ScAddr, trg: string | ScAddr, alias?: string) {
        if (!type.isEdge()) {
            InvalidValue("You should pass edge type there");
        }
        const cmd: ScConstructionCommand = new ScConstructionCommand(type, {
            src: src,
            trg: trg
        });

        if (alias) {
            this._aliases[alias] = this._commands.length;
        }
        this._commands.push(cmd);
    }

    public CreateLink(type: ScType, content: ScLinkContent, alias?: string) {
        if (!type.isLink()) {
            InvalidValue("You should pass link type there");
        }
        const cmd: ScConstructionCommand = new ScConstructionCommand(type, {
            content: content.data, type: content.type
        });

        if (alias) {
            this._aliases[alias] = this._commands.length;
        }
        this._commands.push(cmd);
    }

    public get commands() : ScConstructionCommand[] { return this._commands; }

    public GetIndex(alias: string) {
        return this._aliases[alias];
    }
}

// Result of template search
type ScValueIndex = { [id: string] : number };
type ScTripleCallback = (src: ScAddr, edge: ScAddr, trg: ScAddr) => void;

export class ScTemplateResult {
    private _addrs: ScAddr[] = [];
    private _indecies: ScValueIndex = null;

    constructor(indecies: ScValueIndex, addrs: ScAddr[]) {
        this._indecies = indecies;
        this._addrs = addrs;
    }
    public get size() {
        return this._addrs.length;
    }

    public Get(aliasOrIndex: string | number) : ScAddr {
        if (typeof aliasOrIndex === "string") {
            return this._addrs[this._indecies[aliasOrIndex]];
        }

        return this._addrs[aliasOrIndex];
    }

    public ForEachTriple(func: ScTripleCallback) {
        for (let i = 0; i < this.size; i += 3) {
            func(this._addrs[i], this._addrs[i + 1], this._addrs[i + 2]);
        }
    }
};

export type ScTemplateSearchResult = ScTemplateResult[];
export type ScTemplateGenerateResult = ScTemplateResult;

type WSCallback = (data: Response) => void;

export class ScNet {

    private _eventID: number;
    private _url: string;
    private _socket: WebSocket;
    private _callbacks: Map<number, WSCallback>;
    private _events: Map<number, ScEvent>;

    constructor(wsURL, onConnect: CallbackFunc, onDisconnect: CallbackFunc, onError: CallbackFunc) {
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

    private onMessage(evt: MessageEvent) : void {
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

    private sendMessage(type: string, payload: object, callback: WSCallback) : void {
        
        this._eventID++;
        if (this._callbacks[this._eventID]) {
            throw "Invalid state of messages queue";
        }

        this._callbacks[this._eventID] = callback;
        this._socket.send(JSON.stringify({
            id: this._eventID,
            type: type,
            payload: payload
        }));
    }

    public async CheckElements(addrs: ScAddr[]) : Promise<ScType[]> {
        const self = this;
        return new Promise<ScType[]>(function(resolve) {
            if (addrs.length == 0) {
                resolve([]);
            } else {
                const payload: number[] = addrs.map((a: ScAddr) => { return a.value; });
                self.sendMessage('check_elements', payload, (data: Response) => {
                    const result: ScType[] = data.payload.map((t: number) : ScType => { return new ScType(t); });
                    resolve(result);
                });
            }
        });
    }

    public async CreateElements(constr: ScConstruction) : Promise<ScAddr[]> {
        const self = this;
        return new Promise<ScAddr[]>(function(resolve) {
            let payload: any[] = constr.commands.map((cmd: ScConstructionCommand) => {
                if (cmd.type.isNode()) {
                    return {
                        el: 'node',
                        type: cmd.type.value
                    }
                } else if (cmd.type.isEdge()) {
                    function solveAdj(obj: any) {
                        if (obj instanceof ScAddr) {
                            return {
                                type: 'addr',
                                value: obj.value
                            }
                        }

                        const idx: number = constr.GetIndex(obj);
                        if (idx === undefined) {
                            InvalidValue(`Invalid alias: ${obj}`);
                        }
                        return {
                            type: 'ref',
                            value: idx
                        }
                    }

                    return {
                        el: 'edge',
                        type: cmd.type.value,
                        src: solveAdj(cmd.data.src),
                        trg: solveAdj(cmd.data.trg)
                    }
                } else if (cmd.type.isLink()) {
                    return {
                        el: 'link',
                        type: cmd.type.value,
                        content: cmd.data.content,
                        content_type: cmd.data.type
                    };
                }

                InvalidValue("Unknown type");
            });

            self.sendMessage('create_elements', payload, (data: Response) => {
                resolve(data.payload.map((a: number) : ScAddr => { return new ScAddr(a); }));
            });
        });
    }

    public async DeleteElements(addrs: ScAddr[]) : Promise<boolean> {
        const self = this;
        return new Promise<boolean>(function(resolve) {
            const payload = addrs.map((a: ScAddr) => { return a.value; });
            self.sendMessage('delete_elements', payload, (data: Response) => {
                resolve(data.status);
            });
        });
    }

    public async SetLinkContents(contents: ScLinkContent[]) : Promise<boolean[]> {
        const self = this;
        return new Promise<boolean[]>(function(resolve) {
            const payload = contents.map((c: ScLinkContent) => { 
                return {
                    command: 'set',
                    type: c.TypeToStr(),
                    data: c.data,
                    addr: c.addr.value
                };
            });

            self.sendMessage('content', payload, (data: Response) => {
                resolve(data.payload);
            });
        });
    }

    public async GetLinkContents(addrs: ScAddr[]) : Promise<ScLinkContent[]> {
        const self = this;
        return new Promise<ScLinkContent[]>((resolve) => {
            const payload = addrs.map((a: ScAddr) => {
                return {
                    command: 'get',
                    addr: a.value
                };
            });

            self.sendMessage('content', payload, (data: Response) => {
                const result: ScLinkContent[] = data.payload.map((o: object) => {
                    const t: string = o['type'];
                    let ctype = ScLinkContentType.Binary;
                    if (t == 'string') {
                        ctype = ScLinkContentType.String;
                    } else if (t == 'int') {
                        ctype = ScLinkContentType.Int;
                    } else if (t == 'float') {
                        ctype = ScLinkContentType.Float;
                    }

                    return new ScLinkContent(o['value'], ctype);
                });

                resolve(result);
            });
        });
    }

    public async ResolveKeynodes(params: ScIdtfResolveParams[]) : Promise<ResolveIdtfMap> {
        const self = this;
        return new Promise<ResolveIdtfMap>(function(resolve) {
            const payload = params.map((p: ScIdtfResolveParams) => {
                if (p.type.isValid()) {
                    return {
                        command: 'resolve',
                        idtf: p.idtf,
                        elType: p.type.value
                    }
                }
                
                return { 
                    command: 'find',
                    idtf: p.idtf
                };
            });

            self.sendMessage('keynodes', payload, (data: Response) => {
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
            result =  { type: 'addr', value: it.value.value };
        } else if (it.value instanceof ScType) {
            result = { type: 'type', value: it.value.value };
        } else {
            return { type: 'alias', value: it.value };
        }

        if (it.alias) {
            result.alias = it.alias;
        }

        return result;
    }

    /* Search constructions by specified template
     */
    public async TemplateSearch(templ: ScTemplate | string) : Promise<ScTemplateSearchResult> {
        const self = this;
        return new Promise<ScTemplateSearchResult>(async function(resolve) {
            let payload: any = [];

            if (typeof templ === "string") {
                payload = templ;
            } else {
                templ.ForEachSearchTriple((triple: ScTemplateTriple) => {
                    let items: object[] = [];
                    payload.push([
                        self.ProcessTripleItem(triple.source),
                        self.ProcessTripleItem(triple.edge),
                        self.ProcessTripleItem(triple.target)
                    ]);
                });
            }
            
            self.sendMessage('search_template', payload, (data: Response) => {
                let result: ScTemplateSearchResult = [];
                if (data.status) {
                    const aliases: any = data.payload['aliases'];
                    const addrs: number[][] = data.payload['addrs'];

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
    public async TemplateGenerate(templ: ScTemplate | string, params: ScTemplateGenParams) : Promise<ScTemplateResult> {
        const self = this;
        return new Promise<ScTemplateResult>(async function(resolve) {
            let templData: any = [];

            if (typeof templ === "string") {
                templData = templ;
            } else {
                templ.ForEachSearchTriple((triple: ScTemplateTriple) => {
                    let items: object[] = [];

                    templData.push([
                        self.ProcessTripleItem(triple.source),
                        self.ProcessTripleItem(triple.edge),
                        self.ProcessTripleItem(triple.target)
                    ]);
                });
            }
            const jsonParams = {}
            for (let key in params) {
                if (params.hasOwnProperty(key)) {
                    jsonParams[key] = params[key].value;
                }
            }
            const payload = { templ: templData, params: jsonParams };

            self.sendMessage('generate_template', payload, (data: Response) => {
                
                if (data.status) {
                    const aliases: any = data.payload['aliases'];
                    const addrs: number[] = data.payload['addrs'];

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
    public async EventsCreate(events: ScEventParams[]) : Promise<ScEvent[]> {
        const self = this;
        return new Promise<ScEvent[]>(function(resolve) {
            const payload = {
                create: events.map((evt: ScEventParams) => {
                    return {
                        type: evt.type,
                        addr: evt.addr.value
                    };
                })
            };

            self.sendMessage('events', payload, (data: Response) => {
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
    public async EventsDestroy(events: ScEvent[]) : Promise<void> {
        const self = this;
        return new Promise<void>(function(resolve) {
            const payload = {
                delete: events.map((evt: ScEvent) => {
                    return evt.id;
                })
            };

            self.sendMessage('events', payload, (data: Response) => {
                for (let i = 0; i < events.length; ++i) {
                    delete self._events[events[i].id];
                }
                resolve();
            });
        });
    }

}