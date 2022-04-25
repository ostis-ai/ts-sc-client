import {
  sc_type_const,
  sc_type_constancy_mask,
  sc_type_dedge_common,
  sc_type_edge_access,
  sc_type_edge_fuz,
  sc_type_edge_mask,
  sc_type_edge_neg,
  sc_type_edge_perm,
  sc_type_edge_pos,
  sc_type_edge_temp,
  sc_type_element_mask,
  sc_type_link,
  sc_type_node,
  sc_type_node_abstract,
  sc_type_node_class,
  sc_type_node_material,
  sc_type_node_norole,
  sc_type_node_role,
  sc_type_node_struct,
  sc_type_node_tuple,
  sc_type_uedge_common,
  sc_type_var,
} from "./constants";

export class ScType {
  private _value: number;

  constructor(value?: number) {
    this._value = value || 0;
  }

  public get value(): number {
    return this._value;
  }

  public hasConstancy(): boolean {
    return (this._value & sc_type_constancy_mask) != 0;
  }

  public hasDirection(): boolean {
    return (this._value & sc_type_uedge_common) == 0;
  }

  public isNode(): boolean {
    return (this._value & sc_type_node) != 0;
  }

  public isEdge(): boolean {
    return (this._value & sc_type_edge_mask) != 0;
  }

  public isLink(): boolean {
    return (this._value & sc_type_link) != 0;
  }

  public isConst(): boolean {
    return (this._value & sc_type_const) != 0;
  }

  public isVar(): boolean {
    return (this._value & sc_type_var) != 0;
  }

  public isPos(): boolean {
    return (this._value & sc_type_edge_pos) != 0;
  }

  public isNeg(): boolean {
    return (this._value & sc_type_edge_neg) != 0;
  }

  public isFuz(): boolean {
    return (this._value & sc_type_edge_fuz) != 0;
  }

  public isPerm(): boolean {
    return (this._value & sc_type_edge_perm) != 0;
  }

  public isTemp(): boolean {
    return (this._value & sc_type_edge_temp) != 0;
  }

  public isAccess(): boolean {
    return (this._value & sc_type_edge_access) != 0;
  }

  public isTuple(): boolean {
    return (this._value & sc_type_node_tuple) != 0;
  }
  public isStruct(): boolean {
    return (this._value & sc_type_node_struct) != 0;
  }

  public isRole(): boolean {
    return (this._value & sc_type_node_role) != 0;
  }

  public isNoRole(): boolean {
    return (this._value & sc_type_node_norole) != 0;
  }

  public isClass(): boolean {
    return (this._value & sc_type_node_class) != 0;
  }

  public isAbstract(): boolean {
    return (this._value & sc_type_node_abstract) != 0;
  }

  public isMaterial(): boolean {
    return (this._value & sc_type_node_material) != 0;
  }

  public isValid(): boolean {
    return this._value !== 0;
  }

  public equal(other: ScType): boolean {
    return this._value === other._value;
  }

  public merge(other: ScType): ScType {
    const t1 = this._value & sc_type_element_mask;
    const t2 = other._value & sc_type_element_mask;

    if (t1 != 0 || t2 != 0) {
      if (t1 != t2) throw "You can't merge two different syntax type";
    }

    return new ScType(this._value | other._value);
  }

  public changeConst(isConst: boolean): ScType {
    const v: number = this._value & ~sc_type_constancy_mask;
    return new ScType(v | (isConst ? sc_type_const : sc_type_var));
  }

  static readonly EdgeUCommon = new ScType(sc_type_uedge_common);
  static readonly EdgeDCommon = new ScType(sc_type_dedge_common);

  static readonly EdgeUCommonConst = new ScType(
    sc_type_uedge_common | sc_type_const
  );
  static readonly EdgeDCommonConst = new ScType(
    sc_type_dedge_common | sc_type_const
  );
  static readonly EdgeUCommonVar = new ScType(
    sc_type_uedge_common | sc_type_var
  );
  static readonly EdgeDCommonVar = new ScType(
    sc_type_dedge_common | sc_type_var
  );

  static readonly EdgeAccess = new ScType(sc_type_edge_access);
  static readonly EdgeAccessConstPosPerm = new ScType(
    sc_type_const | sc_type_edge_access | sc_type_edge_perm | sc_type_edge_pos
  );
  static readonly EdgeAccessConstNegPerm = new ScType(
    sc_type_const | sc_type_edge_access | sc_type_edge_perm | sc_type_edge_neg
  );
  static readonly EdgeAccessConstFuzPerm = new ScType(
    sc_type_const | sc_type_edge_access | sc_type_edge_perm | sc_type_edge_fuz
  );
  static readonly EdgeAccessConstPosTemp = new ScType(
    sc_type_const | sc_type_edge_access | sc_type_edge_temp | sc_type_edge_pos
  );
  static readonly EdgeAccessConstNegTemp = new ScType(
    sc_type_const | sc_type_edge_access | sc_type_edge_temp | sc_type_edge_neg
  );
  static readonly EdgeAccessConstFuzTemp = new ScType(
    sc_type_const | sc_type_edge_access | sc_type_edge_temp | sc_type_edge_fuz
  );

  static readonly EdgeAccessVarPosPerm = new ScType(
    sc_type_var | sc_type_edge_access | sc_type_edge_perm | sc_type_edge_pos
  );
  static readonly EdgeAccessVarNegPerm = new ScType(
    sc_type_var | sc_type_edge_access | sc_type_edge_perm | sc_type_edge_neg
  );
  static readonly EdgeAccessVarFuzPerm = new ScType(
    sc_type_var | sc_type_edge_access | sc_type_edge_perm | sc_type_edge_fuz
  );
  static readonly EdgeAccessVarPosTemp = new ScType(
    sc_type_var | sc_type_edge_access | sc_type_edge_temp | sc_type_edge_pos
  );
  static readonly EdgeAccessVarNegTemp = new ScType(
    sc_type_var | sc_type_edge_access | sc_type_edge_temp | sc_type_edge_neg
  );
  static readonly EdgeAccessVarFuzTemp = new ScType(
    sc_type_var | sc_type_edge_access | sc_type_edge_temp | sc_type_edge_fuz
  );

  static readonly Const = new ScType(sc_type_const);
  static readonly Var = new ScType(sc_type_var);

  static readonly Node = new ScType(sc_type_node);
  static readonly Link = new ScType(sc_type_link);
  static readonly Unknown = new ScType();

  static readonly NodeConst = new ScType(sc_type_node | sc_type_const);
  static readonly NodeVar = new ScType(sc_type_node | sc_type_var);

  static readonly LinkConst = new ScType(sc_type_link | sc_type_const);
  static readonly LinkVar = new ScType(sc_type_link | sc_type_var);

  static readonly NodeStruct = new ScType(sc_type_node | sc_type_node_struct);
  static readonly NodeTuple = new ScType(sc_type_node | sc_type_node_tuple);
  static readonly NodeRole = new ScType(sc_type_node | sc_type_node_role);
  static readonly NodeNoRole = new ScType(sc_type_node | sc_type_node_norole);
  static readonly NodeClass = new ScType(sc_type_node | sc_type_node_class);
  static readonly NodeAbstract = new ScType(
    sc_type_node | sc_type_node_abstract
  );
  static readonly NodeMaterial = new ScType(
    sc_type_node | sc_type_node_material
  );

  static readonly NodeConstStruct = new ScType(
    sc_type_node | sc_type_const | sc_type_node_struct
  );
  static readonly NodeConstTuple = new ScType(
    sc_type_node | sc_type_const | sc_type_node_tuple
  );
  static readonly NodeConstRole = new ScType(
    sc_type_node | sc_type_const | sc_type_node_role
  );
  static readonly NodeConstNoRole = new ScType(
    sc_type_node | sc_type_const | sc_type_node_norole
  );
  static readonly NodeConstClass = new ScType(
    sc_type_node | sc_type_const | sc_type_node_class
  );
  static readonly NodeConstAbstract = new ScType(
    sc_type_node | sc_type_const | sc_type_node_abstract
  );
  static readonly NodeConstMaterial = new ScType(
    sc_type_node | sc_type_const | sc_type_node_material
  );

  static readonly NodeVarStruct = new ScType(
    sc_type_node | sc_type_var | sc_type_node_struct
  );
  static readonly NodeVarTuple = new ScType(
    sc_type_node | sc_type_var | sc_type_node_tuple
  );
  static readonly NodeVarRole = new ScType(
    sc_type_node | sc_type_var | sc_type_node_role
  );
  static readonly NodeVarNoRole = new ScType(
    sc_type_node | sc_type_var | sc_type_node_norole
  );
  static readonly NodeVarClass = new ScType(
    sc_type_node | sc_type_var | sc_type_node_class
  );
  static readonly NodeVarAbstract = new ScType(
    sc_type_node | sc_type_var | sc_type_node_abstract
  );
  static readonly NodeVarMaterial = new ScType(
    sc_type_node | sc_type_var | sc_type_node_material
  );
}
