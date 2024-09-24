import { ScAddr } from "./ScAddr";
import { ScEventType } from "./ScEventSubscription";
import { ScLinkContentType, TContentString } from "./ScLinkContent";

interface ScServerError {
  ref: number;
  message: string;
}

export type ScError = string | ScServerError[];

export interface IConnectionInfo {
  connection_id: number;
  user_addr: number;
}

export interface IContentResult {
  value: number | string;
  type: TContentString;
}

interface ISetContentPayload {
  command: "set";
  type: TContentString;
  data: string | number;
  addr: number;
}

export interface ISCs {
  scs: string;
  output_structure: ScAddr;
}

interface IGenerateElementsBySCsArgs {
  scs: string;
  output_structure: number;
}

interface IGetContentPayload {
  command: "get";
  addr: number;
}

interface ISearchLinksByContentsPayload {
  command: "find";
  data: string | number;
}

interface ISearchLinksByContentSubstringsPayload {
  command: "find_links_by_substr";
  data: string | number;
}

interface ISearchLinkContentsByContentSubstringsPayload {
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

interface IConnectorInfo {
  type: "addr" | "ref";
  value: number;
}

export interface IConnector {
  el: "edge";
  type: number;
  src: IConnectorInfo;
  trg: IConnectorInfo;
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

interface ISearchByTemplatePayload {
  templ: TTripleItem[][] | { type: string; value: string | number } | string;
  params: Record<string, number | string>;
}

interface IGenerateByTemplatePayload {
  templ: TTripleItem[][] | { type: string; value: string | number } | string;
  params: Record<string, number | string>;
}

interface TCreateEventSubscriptionsPayload {
  create: Array<{ type: ScEventType; addr: number }>;
}

interface TDestroyEventSubscriptionsPayload {
  delete: number[];
}

interface ISearchByTemplateResult {
  aliases: Record<string, number>;
  addrs: number[][];
}

interface IGenerateByTemplateResult {
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
  | "connection_info"
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

export type TConnectionInfoArgs = Args<"connection_info", null, IConnectionInfo>
export type TGetElementsTypesArgs = Args<"check_elements", number[], number[]>;
export type TEraseElementsArgs = Args<"delete_elements", number[], unknown>;
export type TKeynodesElementsArgs = Args<
  "keynodes",
  TKeynodesPayload,
  number[]
>;
export type TSearchByTemplateArgs = Args<
  "search_template",
  ISearchByTemplatePayload,
  ISearchByTemplateResult
>;
export type TGenerateByTemplateArgs = Args<
  "generate_template",
  IGenerateByTemplatePayload,
  IGenerateByTemplateResult
>;
export type TCreateEventSubscriptionsArgs = Args<"events", TCreateEventSubscriptionsPayload, number[]>;
export type TDestroyEventSubscriptionArgs = Args<"events", TDestroyEventSubscriptionsPayload, number[]>;
export type TGenerateElementsArgs = Args<
  "create_elements",
  Array<ILink | IConnector | INode>,
  number[]
>;
export type TGenerateElementsBySCsArgs = Args<
  "create_elements_by_scs",
  Array<IGenerateElementsBySCsArgs>,
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

export type TSearchLinksArgs = Args<
  "content",
  Array<ISearchLinksByContentsPayload | ISearchLinksByContentSubstringsPayload>,
  number[][]
>;

export type TSearchLinkContentsArgs = Args<
  "content",
  Array<ISearchLinkContentsByContentSubstringsPayload>,
  string[][]
>;

export type SnakeToCamelCase<T extends string> = string extends T
  ? string
  : T extends `${infer Start}_${infer Letter}${infer Rest}`
  ? `${Start}${Uppercase<Letter>}${SnakeToCamelCase<Rest>}`
  : T extends `${infer Str}`
  ? `${Str}`
  : "";

export type KeynodesToObject<T extends string[]> = string[] extends T
  ? Record<string, ScAddr>
  : T extends [infer First, ...infer Rest]
  ? Rest extends [string, ...string[]]
    ? First extends string
      ? Record<SnakeToCamelCase<First>, ScAddr> & KeynodesToObject<Rest>
      : KeynodesToObject<Rest>
    : First extends string
    ? Record<SnakeToCamelCase<First>, ScAddr>
    : Record<string, never>
  : Record<string, never>;
