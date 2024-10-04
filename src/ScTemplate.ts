import { ScAddr } from "./ScAddr";
import { ScType } from "./ScType";

type ScTemplateParamValue = string | ScAddr | ScType;
type ScTemplateParam = [ScTemplateParamValue, string] | ScTemplateParamValue;

export interface ScTemplateValue {
  value: ScTemplateParamValue;
  alias: string | null;
}

export interface ScTemplateTriple {
  source: ScTemplateValue;
  connector: ScTemplateValue;
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

  get triples() {
    return this._triples;
  }

  public triple(
    param1: ScTemplateParam,
    param2: ScTemplateParam,
    param3: ScTemplateParam
  ): ScTemplate {
    const p1 = this.splitTemplateParam(param1);
    const p2 = this.splitTemplateParam(param2);
    const p3 = this.splitTemplateParam(param3);

    this._triples.push({
      source: p1,
      connector: p2,
      target: p3,
    });

    return this;
  }

  public quintuple(
    param1: ScTemplateParam,
    param2: ScTemplateParam,
    param3: ScTemplateParam,
    param4: ScTemplateParam,
    param5: ScTemplateParam
  ): ScTemplate {
    let { alias, value } = this.splitTemplateParam(param2);
    if (!alias) alias = `connector_1_${this._triples.length}`;

    this.triple(param1, [value, alias], param3);
    this.triple(param5, param4, alias);

    return this;
  }

  /*!
   * @deprecated ScTemplate `tripleWithRelation` method is deprecated. Use `quintuple` instead.
   */
  public tripleWithRelation(
    param1: ScTemplateParam,
    param2: ScTemplateParam,
    param3: ScTemplateParam,
    param4: ScTemplateParam,
    param5: ScTemplateParam
  ): ScTemplate {
    console.warn("Warning: ScTemplate `tripleWithRelation` method is deprecated. Use `quintuple` instead.");
    return this.quintuple(param1, param2, param3, param4, param5);
  }

  private splitTemplateParam(param: ScTemplateParam): ScTemplateValue {
    if (param instanceof Array) {
      if (param.length !== 2) {
        throw "Invalid number of values for replacement. Use [ScType | ScAddr, string]";
      }

      const value = param[0];
      const alias = param[1];

      const isValidValue = value instanceof ScAddr || value instanceof ScType;

      if (!isValidValue || typeof alias !== "string") {
        throw "First parameter should be ScAddr or ScType. The second one - string";
      }

      return {
        alias,
        value,
      };
    }

    return {
      alias: null,
      value: param,
    };
  }
}
