import { ScEventType } from "./ScEvent";
import { ScLinkContentType, TContentString } from "./ScLinkContent";

export interface IContentResult {
  value: number | string | null;
  type: TContentString;
}

interface ISetContentPayload {
  command: "set";
  type: TContentString;
  data: string | number;
  addr: number;
}

interface IGetContentPayload {
  command: "get";
  addr: number;
}

interface IFindKeynode {
  command: "find";
  idtf: string;
}

interface IResolveKeynode {
  command: "resolve";
  idtf: string;
  elType: number;
}

type TKeynodesPayload = Array<IFindKeynode | IResolveKeynode>;

export interface INode {
  el: "node";
  type: number;
}

interface IEdgeInfo {
  type: "addr" | "ref";
  value: number;
}

export interface IEdge {
  el: "edge";
  type: number;
  src: IEdgeInfo;
  trg: IEdgeInfo;
}

export interface ILink {
  el: "link";
  type: number;
  content: string | number;
  content_type: ScLinkContentType;
}

interface ITripleAddr {
  type: "addr";
  value: number;
  alias?: string;
}

interface ITripleType {
  type: "type";
  value: number;
  alias?: string;
}

interface ITripleAlias {
  type: "alias";
  value: string;
  alias?: string;
}

export type TTripleItem = ITripleAddr | ITripleType | ITripleAlias;

type TSearchTemplatePayload = TTripleItem[][] | string;

interface IGenerateTemplatePayload {
  templ: TTripleItem[][] | string;
  params: Record<string, number>;
}

interface ICreateEventPayload {
  create: Array<{ type: ScEventType; addr: number }>;
}

interface IDeleteEventPayload {
  delete: number[];
}

interface ISearchResult {
  aliases: Record<string, number>;
  addrs: number[][];
}

interface IGenerateResult {
  aliases: Record<string, number>;
  addrs: number[];
}

export interface Response<
  Payload extends unknown = unknown,
  Event extends boolean = boolean
> {
  id: number;
  status: boolean;
  event: Event;
  payload: Payload;
}

export type TAction =
  | "create_elements"
  | "check_elements"
  | "delete_elements"
  | "search_template"
  | "generate_template"
  | "events"
  | "keynodes"
  | "content";

export type TWSCallback<
  Payload extends unknown = unknown,
  Event extends boolean = boolean
> = (data: Response<Payload, Event>) => void;

type Args<
  Action extends TAction,
  Payload extends unknown,
  ResponsePayload extends unknown,
  Event extends boolean = boolean
> = [Action, Payload, TWSCallback<ResponsePayload, Event>];

export type TCheckElementsArgs = Args<"check_elements", number[], number[]>;
export type TDeleteElementsArgs = Args<"delete_elements", number[], unknown>;
export type TKeynodesElementsArgs = Args<
  "keynodes",
  TKeynodesPayload,
  number[]
>;
export type TTemplateSearchArgs = Args<
  "search_template",
  TSearchTemplatePayload,
  ISearchResult
>;
export type TTemplateGenerateArgs = Args<
  "generate_template",
  IGenerateTemplatePayload,
  IGenerateResult
>;
export type TCreateEventArgs = Args<"events", ICreateEventPayload, number[]>;
export type TDeleteEventArgs = Args<"events", IDeleteEventPayload, number[]>;
export type TCreateElementsArgs = Args<
  "create_elements",
  Array<ILink | IEdge | INode>,
  number[]
>;
export type TSetContentArgs = Args<
  "content",
  Array<ISetContentPayload>,
  [boolean]
>;
export type TGetContentArgs = Args<
  "content",
  Array<IGetContentPayload>,
  IContentResult[]
>;
