import { ScAddr } from "./ScAddr";

// Result of template search
type ScValueIndex = { [id: string]: number };
type ScTripleCallback = (src: ScAddr, edge: ScAddr, trg: ScAddr) => void;

export type ScTemplateSearchResult = ScTemplateResult[];
export type ScTemplateGenerateResult = ScTemplateResult;

export class ScTemplateResult {
  private _addrs: ScAddr[] = [];
  private _indecies: ScValueIndex = {};

  constructor(indecies: ScValueIndex, addrs: ScAddr[]) {
    this._indecies = indecies;
    this._addrs = addrs;
  }
  public get size() {
    return this._addrs.length;
  }

  public get(aliasOrIndex: string | number) {
    if (typeof aliasOrIndex === "string") {
      return this._addrs[this._indecies[aliasOrIndex]];
    }

    return this._addrs[aliasOrIndex];
  }

  public forEachTriple(func: ScTripleCallback) {
    for (let i = 0; i < this.size; i += 3) {
      func(this._addrs[i], this._addrs[i + 1], this._addrs[i + 2]);
    }
  }
}
