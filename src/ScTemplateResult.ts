import { ScAddr } from "./ScAddr";

type ScTripleCallback = (src: ScAddr, edge: ScAddr, trg: ScAddr) => void;

export class ScTemplateResult {
  private _addrs: ScAddr[] = [];
  private _indecies: Record<string, number> = {};

  constructor(indecies: Record<string, number>, addrs: ScAddr[]) {
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
