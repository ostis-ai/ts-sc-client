import { ScEventType } from "./ScEvent";
import { ScLinkContentType, TContentString } from "./ScLinkContent";

interface ScServerError {
  ref: number;
  message: string;
}

export type ScError = string | ScServerError[];

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

interface IGetLinksByContentsPayload {
  command: "find";
  data: string | number;
}

interface IGetLinksByContentSubstringsPayload {
  command: "find_links_by_substr";
  data: string | number;
}

interface IGetStringsBySubstringsPayload {
  command: "find_strings_by_substr";
  data: string | number;
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

interface ISearchTemplatePayload {
  templ: TTripleItem[][] | { type: string; value: string | number; } | string;
  params: Record<string, number | string>;
}

interface IGenerateTemplatePayload {
  templ: TTripleItem[][] | { type: string; value: string | number; } | string;
  params: Record<string, number | string>;
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
  Event extends boolean = boolean,
  Errors extends ScError = ScError
> {
  id: number;
  status: boolean;
  event: Event;
  payload: Payload;
  errors: Errors;
}

export type TAction =
  | "create_elements"
  | "create_elements_by_scs"
  | "check_elements"
  | "delete_elements"
  | "search_template"
  | "generate_template"
  | "events"
  | "keynodes"
  | "content";

export type TWSCallback<
  Payload extends unknown = unknown,
  Event extends boolean = boolean,
  Errors extends ScError = ScError
> = (data: Response<Payload, Event, Errors>) => void;

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
  ISearchTemplatePayload,
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
export type TCreateElementsBySCsArgs = Args<
  "create_elements_by_scs",
  Array<string>,
  boolean[]
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

export type TGetLinksArgs = Args<
  "content",
  Array<IGetLinksByContentsPayload | IGetLinksByContentSubstringsPayload>,
  number[][]
>;

export type TGetStringsArgs = Args<
  "content",
  Array<IGetStringsBySubstringsPayload>,
  string[][]
>;
