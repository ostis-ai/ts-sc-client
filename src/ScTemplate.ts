import { ScAddr } from "./ScAddr";
import { ScType } from "./scType";

type ScTemplateParamValue = string | ScAddr | ScType;
type ScTemplateParam = ScTemplateParamValue[] | ScTemplateParamValue;

export interface ScTemplateValue {
  value: ScTemplateParamValue;
  alias: string | null;
}

export interface ScTemplateTriple {
  source: ScTemplateValue;
  edge: ScTemplateValue;
  target: ScTemplateValue;
}

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

  public Triple(
    param1: ScTemplateParam,
    param2: ScTemplateParam,
    param3: ScTemplateParam
  ): ScTemplate {
    const p1: ScTemplateValue = this.SplitTemplateParam(param1);
    const p2: ScTemplateValue = this.SplitTemplateParam(param2);
    const p3: ScTemplateValue = this.SplitTemplateParam(param3);

    const baseIdx: number = this._triples.length * 3;

    this._triples.push({
      source: p1,
      edge: p2,
      target: p3,
    });

    return this;
  }

  public TripleWithRelation(
    param1: ScTemplateParam,
    param2: ScTemplateParam,
    param3: ScTemplateParam,
    param4: ScTemplateParam,
    param5: ScTemplateParam
  ): ScTemplate {
    let { alias, value } = this.SplitTemplateParam(param2);
    if (!alias) alias = `edge_1_${this._triples.length}`;

    this.Triple(param1, [value, alias], param3);
    this.Triple(param5, param4, alias);

    return this;
  }

  private SplitTemplateParam(param: ScTemplateParam): ScTemplateValue {
    if (param instanceof Array) {
      if (param.length != 2) {
        throw "Invalid number of values for remplacement. Use [ScType | ScAddr, string]";
      }

      const value: any = param[0];
      const alias: any = param[1];

      const isValidValue: boolean =
        value instanceof ScAddr || value instanceof ScType;

      if (!isValidValue || !(typeof alias === "string")) {
        throw "First parameter should be ScAddr or ScType. The second one - string";
      }

      return {
        alias: alias as string,
        value: value as ScTemplateParamValue,
      };
    }

    return {
      alias: null,
      value: param as ScTemplateParamValue,
    };
  }
}
