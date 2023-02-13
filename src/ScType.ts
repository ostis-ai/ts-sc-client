import {
  sc_type_const,
  sc_type_constancy_mask,
  sc_type_edge_common,
  sc_type_arc_access,
  sc_type_arc_fuz,
  sc_type_edge_mask,
  sc_type_arc_neg,
  sc_type_perm,
  sc_type_arc_pos,
  sc_type_temp,
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
  sc_type_arc_common,
  sc_type_var,
  sc_type_node_superclass,
  sc_type_metavar,
  sc_type_link_class, sc_type_connector, sc_type_arc,
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
    return (this._value & sc_type_edge_common) == 0;
  }

  public isNode(): boolean {
    return (this._value & sc_type_node) != 0;
  }

  public isEdge(): boolean {
    return (this._value & sc_type_edge_common) != 0;
  }

  public isArc(): boolean {
    return (this._value & sc_type_arc) != 0;
  }

  public isConnector(): boolean {
    return (this._value & sc_type_connector) != 0;
  }

  public isLink(): boolean {
    return (this._value & (sc_type_node | sc_type_link)) == (sc_type_node | sc_type_link);
  }

  public isConst(): boolean {
    return (this._value & sc_type_const) != 0;
  }

  public isVar(): boolean {
    return (this._value & sc_type_var) != 0;
  }

  public isMetaVar(): boolean {
    return (this._value & sc_type_metavar) != 0;
  }

  public isPos(): boolean {
    return (this._value & sc_type_arc_pos) != 0;
  }

  public isNeg(): boolean {
    return (this._value & sc_type_arc_neg) != 0;
  }

  public isFuz(): boolean {
    return (this._value & sc_type_arc_fuz) != 0;
  }

  public isPerm(): boolean {
    return (this._value & sc_type_perm) != 0;
  }

  public isTemp(): boolean {
    return (this._value & sc_type_temp) != 0;
  }

  public isAccess(): boolean {
    return (this._value & sc_type_arc_access) != 0;
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

  public isSuperClass(): boolean {
    return (this._value & sc_type_node_superclass) != 0;
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

  public upConstType(): ScType {
    if (this.isVar()) {
      return new ScType((this._value & ~sc_type_var) | sc_type_const);
    }
    else if (this.isMetaVar()) {
      return new ScType((this._value & ~sc_type_metavar) | sc_type_var);
    }

    return new ScType(this._value | sc_type_const);
  }

  static readonly Unknown = new ScType(0);

  static readonly Const = new ScType(sc_type_const);
  static readonly Var = new ScType(sc_type_var);
  static readonly MetaVar = new ScType(sc_type_metavar);

  static readonly Perm = new ScType(sc_type_perm);
  static readonly Temp = new ScType(sc_type_temp);

  static readonly Node = new ScType(sc_type_node);

  static readonly NodeConst = new ScType(sc_type_node | sc_type_const);
  static readonly NodeVar = new ScType(sc_type_node | sc_type_var);
  static readonly NodeMetaVar = new ScType(sc_type_node | sc_type_metavar);

  static readonly NodePerm = new ScType(sc_type_node | sc_type_perm);
  static readonly NodeTemp = new ScType(sc_type_node | sc_type_temp);

  static readonly NodeStruct = new ScType(sc_type_node | sc_type_node_struct);
  static readonly NodeTuple = new ScType(sc_type_node | sc_type_node_tuple);
  static readonly NodeRole = new ScType(sc_type_node | sc_type_node_role);
  static readonly NodeNoRole = new ScType(sc_type_node | sc_type_node_norole);
  static readonly NodeClass = new ScType(sc_type_node | sc_type_node_class);
  static readonly NodeSuperClass = new ScType(sc_type_node | sc_type_node_superclass);
  static readonly NodeAbstract = new ScType(sc_type_node | sc_type_node_abstract);
  static readonly NodeMaterial = new ScType(sc_type_node | sc_type_node_material);
  static readonly Link = new ScType(sc_type_node | sc_type_link);
  static readonly LinkClass = new ScType(sc_type_node | sc_type_link | sc_type_link_class);

  static readonly NodeConstStruct = new ScType(sc_type_node | sc_type_const | sc_type_node_struct);
  static readonly NodeConstTuple = new ScType(sc_type_node | sc_type_const | sc_type_node_tuple);
  static readonly NodeConstRole = new ScType(sc_type_node | sc_type_const | sc_type_node_role);
  static readonly NodeConstNoRole = new ScType(sc_type_node | sc_type_const | sc_type_node_norole);
  static readonly NodeConstClass = new ScType(sc_type_node | sc_type_const | sc_type_node_class);
  static readonly NodeConstSuperClass = new ScType(sc_type_node | sc_type_const | sc_type_node_superclass);
  static readonly NodeConstAbstract = new ScType(sc_type_node | sc_type_const | sc_type_node_abstract);
  static readonly NodeConstMaterial = new ScType(sc_type_node | sc_type_const | sc_type_node_material);
  static readonly LinkConst = new ScType(sc_type_node | sc_type_const | sc_type_link);
  static readonly LinkConstClass = new ScType(sc_type_node | sc_type_const | sc_type_link | sc_type_link_class);

  static readonly NodeVarStruct = new ScType(sc_type_node | sc_type_var | sc_type_node_struct);
  static readonly NodeVarTuple = new ScType(sc_type_node | sc_type_var | sc_type_node_tuple);
  static readonly NodeVarRole = new ScType(sc_type_node | sc_type_var | sc_type_node_role);
  static readonly NodeVarNoRole = new ScType(sc_type_node | sc_type_var | sc_type_node_norole);
  static readonly NodeVarClass = new ScType(sc_type_node | sc_type_var | sc_type_node_class);
  static readonly NodeVarSuperClass = new ScType(sc_type_node | sc_type_var | sc_type_node_superclass);
  static readonly NodeVarAbstract = new ScType(sc_type_node | sc_type_var | sc_type_node_abstract);
  static readonly NodeVarMaterial = new ScType(sc_type_node | sc_type_var | sc_type_node_material);
  static readonly LinkVar = new ScType(sc_type_node | sc_type_var | sc_type_link);
  static readonly LinkVarClass = new ScType(sc_type_node | sc_type_var | sc_type_link | sc_type_link_class);

  static readonly NodeMetaVarStruct = new ScType(sc_type_node | sc_type_metavar | sc_type_node_struct);
  static readonly NodeMetaVarTuple = new ScType(sc_type_node | sc_type_metavar | sc_type_node_tuple);
  static readonly NodeMetaVarRole = new ScType(sc_type_node | sc_type_metavar | sc_type_node_role);
  static readonly NodeMetaVarNoRole = new ScType(sc_type_node | sc_type_metavar | sc_type_node_norole);
  static readonly NodeMetaVarClass = new ScType(sc_type_node | sc_type_metavar | sc_type_node_class);
  static readonly NodeMetaVarSuperClass = new ScType(sc_type_node | sc_type_metavar | sc_type_node_superclass);
  static readonly NodeMetaVarAbstract = new ScType(sc_type_node | sc_type_metavar | sc_type_node_abstract);
  static readonly NodeMetaVarMaterial = new ScType(sc_type_node | sc_type_metavar | sc_type_node_material);
  static readonly LinkMetaVar = new ScType(sc_type_node | sc_type_metavar | sc_type_link);
  static readonly LinkMetaVarClass = new ScType(sc_type_node | sc_type_metavar | sc_type_link | sc_type_link_class);

  static readonly NodePermStruct = new ScType(sc_type_node | sc_type_perm | sc_type_node_struct);
  static readonly NodePermTuple = new ScType(sc_type_node | sc_type_perm | sc_type_node_tuple);
  static readonly NodePermRole = new ScType(sc_type_node | sc_type_perm | sc_type_node_role);
  static readonly NodePermNoRole = new ScType(sc_type_node | sc_type_perm | sc_type_node_norole);
  static readonly NodePermClass = new ScType(sc_type_node | sc_type_perm | sc_type_node_class);
  static readonly NodePermSuperClass = new ScType(sc_type_node | sc_type_perm | sc_type_node_superclass);
  static readonly NodePermAbstract = new ScType(sc_type_node | sc_type_perm | sc_type_node_abstract);
  static readonly NodePermMaterial = new ScType(sc_type_node | sc_type_perm | sc_type_node_material);
  static readonly LinkPermConst = new ScType(sc_type_node | sc_type_perm | sc_type_link);
  static readonly LinkPermConstClass = new ScType(sc_type_node | sc_type_perm | sc_type_link | sc_type_link_class);

  static readonly NodeTempStruct = new ScType(sc_type_node | sc_type_temp | sc_type_node_struct);
  static readonly NodeTempTuple = new ScType(sc_type_node | sc_type_temp | sc_type_node_tuple);
  static readonly NodeTempRole = new ScType(sc_type_node | sc_type_temp | sc_type_node_role);
  static readonly NodeTempNoRole = new ScType(sc_type_node | sc_type_temp | sc_type_node_norole);
  static readonly NodeTempClass = new ScType(sc_type_node | sc_type_temp | sc_type_node_class);
  static readonly NodeTempSuperClass = new ScType(sc_type_node | sc_type_temp | sc_type_node_superclass);
  static readonly NodeTempAbstract = new ScType(sc_type_node | sc_type_temp | sc_type_node_abstract);
  static readonly NodeTempMaterial = new ScType(sc_type_node | sc_type_temp | sc_type_node_material);
  static readonly LinkTempConst = new ScType(sc_type_node | sc_type_temp | sc_type_link);
  static readonly LinkTempConstClass = new ScType(sc_type_node | sc_type_temp | sc_type_link | sc_type_link_class);

  static readonly NodeConstPermStruct = new ScType(sc_type_node | sc_type_const | sc_type_perm | sc_type_node_struct);
  static readonly NodeConstPermTuple = new ScType(sc_type_node | sc_type_const | sc_type_perm | sc_type_node_tuple);
  static readonly NodeConstPermRole = new ScType(sc_type_node | sc_type_const | sc_type_perm | sc_type_node_role);
  static readonly NodeConstPermNoRole = new ScType(sc_type_node | sc_type_const | sc_type_perm | sc_type_node_norole);
  static readonly NodeConstPermClass = new ScType(sc_type_node | sc_type_const | sc_type_perm | sc_type_node_class);
  static readonly NodeConstPermSuperClass = new ScType(sc_type_node | sc_type_const | sc_type_perm | sc_type_node_superclass);
  static readonly NodeConstPermAbstract = new ScType(sc_type_node | sc_type_const | sc_type_perm | sc_type_node_abstract);
  static readonly NodeConstPermMaterial = new ScType(sc_type_node | sc_type_const | sc_type_perm | sc_type_node_material);
  static readonly LinkConstPerm = new ScType(sc_type_node | sc_type_const | sc_type_perm | sc_type_link);
  static readonly LinkConstPermClass = new ScType(sc_type_node | sc_type_const | sc_type_perm | sc_type_link | sc_type_link_class);

  static readonly NodeVarPermStruct = new ScType(sc_type_node | sc_type_var | sc_type_perm | sc_type_node_struct);
  static readonly NodeVarPermTuple = new ScType(sc_type_node | sc_type_var | sc_type_perm | sc_type_node_tuple);
  static readonly NodeVarPermRole = new ScType(sc_type_node | sc_type_var | sc_type_perm | sc_type_node_role);
  static readonly NodeVarPermNoRole = new ScType(sc_type_node | sc_type_var | sc_type_perm | sc_type_node_norole);
  static readonly NodeVarPermClass = new ScType(sc_type_node | sc_type_var | sc_type_perm | sc_type_node_class);
  static readonly NodeVarPermSuperClass = new ScType(sc_type_node | sc_type_var | sc_type_perm | sc_type_node_superclass);
  static readonly NodeVarPermAbstract = new ScType(sc_type_node | sc_type_var | sc_type_perm | sc_type_node_abstract);
  static readonly NodeVarPermMaterial = new ScType(sc_type_node | sc_type_var | sc_type_perm | sc_type_node_material);
  static readonly LinkVarPerm = new ScType(sc_type_node | sc_type_var | sc_type_perm | sc_type_link);
  static readonly LinkVarPermClass = new ScType(sc_type_node | sc_type_var | sc_type_perm | sc_type_link | sc_type_link_class);

  static readonly NodeMetaVarPermStruct = new ScType(sc_type_node | sc_type_metavar | sc_type_perm | sc_type_node_struct);
  static readonly NodeMetaVarPermTuple = new ScType(sc_type_node | sc_type_metavar | sc_type_perm | sc_type_node_tuple);
  static readonly NodeMetaVarPermRole = new ScType(sc_type_node | sc_type_metavar | sc_type_perm | sc_type_node_role);
  static readonly NodeMetaVarPermNoRole = new ScType(sc_type_node | sc_type_metavar | sc_type_perm | sc_type_node_norole);
  static readonly NodeMetaVarPermClass = new ScType(sc_type_node | sc_type_metavar | sc_type_perm | sc_type_node_class);
  static readonly NodeMetaVarPermSuperClass = new ScType(sc_type_node | sc_type_metavar | sc_type_perm | sc_type_node_superclass);
  static readonly NodeMetaVarPermAbstract = new ScType(sc_type_node | sc_type_metavar | sc_type_perm | sc_type_node_abstract);
  static readonly NodeMetaVarPermMaterial = new ScType(sc_type_node | sc_type_metavar | sc_type_perm | sc_type_node_material);
  static readonly LinkMetaVarPerm = new ScType(sc_type_node | sc_type_metavar | sc_type_perm | sc_type_link);
  static readonly LinkMetaVarPermClass = new ScType(sc_type_node | sc_type_metavar | sc_type_perm | sc_type_link | sc_type_link_class);

  static readonly NodeConstTempStruct = new ScType(sc_type_node | sc_type_const | sc_type_temp | sc_type_node_struct);
  static readonly NodeConstTempTuple = new ScType(sc_type_node | sc_type_const | sc_type_temp | sc_type_node_tuple);
  static readonly NodeConstTempRole = new ScType(sc_type_node | sc_type_const | sc_type_temp | sc_type_node_role);
  static readonly NodeConstTempNoRole = new ScType(sc_type_node | sc_type_const | sc_type_temp | sc_type_node_norole);
  static readonly NodeConstTempClass = new ScType(sc_type_node | sc_type_const | sc_type_temp | sc_type_node_class);
  static readonly NodeConstTempSuperClass = new ScType(sc_type_node | sc_type_const | sc_type_temp | sc_type_node_superclass);
  static readonly NodeConstTempAbstract = new ScType(sc_type_node | sc_type_const | sc_type_temp | sc_type_node_abstract);
  static readonly NodeConstTempMaterial = new ScType(sc_type_node | sc_type_const | sc_type_temp | sc_type_node_material);
  static readonly LinkConstTemp = new ScType(sc_type_node | sc_type_const | sc_type_temp | sc_type_link);
  static readonly LinkConstTempClass = new ScType(sc_type_node | sc_type_const | sc_type_temp | sc_type_link | sc_type_link_class);

  static readonly NodeVarTempStruct = new ScType(sc_type_node | sc_type_var | sc_type_temp | sc_type_node_struct);
  static readonly NodeVarTempTuple = new ScType(sc_type_node | sc_type_var | sc_type_temp | sc_type_node_tuple);
  static readonly NodeVarTempRole = new ScType(sc_type_node | sc_type_var | sc_type_temp | sc_type_node_role);
  static readonly NodeVarTempNoRole = new ScType(sc_type_node | sc_type_var | sc_type_temp | sc_type_node_norole);
  static readonly NodeVarTempClass = new ScType(sc_type_node | sc_type_var | sc_type_temp | sc_type_node_class);
  static readonly NodeVarTempSuperClass = new ScType(sc_type_node | sc_type_var | sc_type_temp | sc_type_node_superclass);
  static readonly NodeVarTempAbstract = new ScType(sc_type_node | sc_type_var | sc_type_temp | sc_type_node_abstract);
  static readonly NodeVarTempMaterial = new ScType(sc_type_node | sc_type_var | sc_type_temp | sc_type_node_material);
  static readonly LinkVarTemp = new ScType(sc_type_node | sc_type_var | sc_type_temp | sc_type_link);
  static readonly LinkVarTempClass = new ScType(sc_type_node | sc_type_var | sc_type_temp | sc_type_link | sc_type_link_class);

  static readonly NodeMetaVarTempStruct = new ScType(sc_type_node | sc_type_metavar | sc_type_temp | sc_type_node_struct);
  static readonly NodeMetaVarTempTuple = new ScType(sc_type_node | sc_type_metavar | sc_type_temp | sc_type_node_tuple);
  static readonly NodeMetaVarTempRole = new ScType(sc_type_node | sc_type_metavar | sc_type_temp | sc_type_node_role);
  static readonly NodeMetaVarTempNoRole = new ScType(sc_type_node | sc_type_metavar | sc_type_temp | sc_type_node_norole);
  static readonly NodeMetaVarTempClass = new ScType(sc_type_node | sc_type_metavar | sc_type_temp | sc_type_node_class);
  static readonly NodeMetaVarTempSuperClass = new ScType(sc_type_node | sc_type_metavar | sc_type_temp | sc_type_node_superclass);
  static readonly NodeMetaVarTempAbstract = new ScType(sc_type_node | sc_type_metavar | sc_type_temp | sc_type_node_abstract);
  static readonly NodeMetaVarTempMaterial = new ScType(sc_type_node | sc_type_metavar | sc_type_temp | sc_type_node_material);
  static readonly LinkMetaVarTemp = new ScType(sc_type_node | sc_type_metavar | sc_type_temp | sc_type_link);
  static readonly LinkMetaVarTempClass = new ScType(sc_type_node | sc_type_metavar | sc_type_temp | sc_type_link | sc_type_link_class);

  static readonly Connector = new ScType(sc_type_connector);
  static readonly Arc = new ScType(sc_type_arc);

  static readonly EdgeCommon = new ScType(sc_type_edge_common);
  static readonly ArcCommon = new ScType(sc_type_arc_common);
  static readonly ArcAccess = new ScType(sc_type_arc_access);

// backward compatibility
  static readonly EdgeUCommon = new ScType(sc_type_edge_common);
  static readonly EdgeDCommon = new ScType(sc_type_arc_common);
  static readonly EdgeAccess = new ScType(sc_type_arc_access);

  static readonly EdgeCommonConst = new ScType(sc_type_edge_common | sc_type_const);
  static readonly ArcCommonConst = new ScType(sc_type_arc_common | sc_type_const);
  static readonly ArcAccessConst = new ScType(sc_type_arc_access | sc_type_const);

// backward compatibility
  static readonly EdgeUCommonConst = new ScType(sc_type_edge_common | sc_type_const);
  static readonly EdgeDCommonConst = new ScType(sc_type_arc_common | sc_type_const);

  static readonly EdgeCommonVar = new ScType(sc_type_edge_common | sc_type_var);
  static readonly ArcCommonVar = new ScType(sc_type_arc_common | sc_type_var);
  static readonly ArcAccessVar = new ScType(sc_type_arc_access | sc_type_var);

// backward compatibility
  static readonly EdgeUCommonVar = new ScType(sc_type_edge_common | sc_type_var);
  static readonly EdgeDCommonVar = new ScType(sc_type_arc_common | sc_type_var);

  static readonly EdgeCommonMetaVar = new ScType(sc_type_edge_common | sc_type_metavar);
  static readonly ArcCommonMetaVar = new ScType(sc_type_arc_common | sc_type_metavar);
  static readonly ArcAccessMetaVar = new ScType(sc_type_arc_access | sc_type_metavar);

  static readonly EdgeCommonPerm = new ScType(sc_type_edge_common | sc_type_perm);
  static readonly ArcCommonPerm = new ScType(sc_type_arc_common | sc_type_perm);
  static readonly ArcAccessPerm = new ScType(sc_type_arc_access | sc_type_perm);

  static readonly EdgeCommonTemp = new ScType(sc_type_edge_common | sc_type_temp);
  static readonly ArcCommonTemp = new ScType(sc_type_arc_common | sc_type_temp);
  static readonly ArcAccessTemp = new ScType(sc_type_arc_access | sc_type_temp);

  static readonly EdgeCommonConstPerm = new ScType(sc_type_edge_common | sc_type_const | sc_type_perm);
  static readonly ArcCommonConstPerm = new ScType(sc_type_arc_common | sc_type_const | sc_type_perm);

  static readonly EdgeCommonVarPerm = new ScType(sc_type_edge_common | sc_type_var | sc_type_perm);
  static readonly ArcCommonVarPerm = new ScType(sc_type_arc_common | sc_type_var | sc_type_perm);

  static readonly EdgeCommonMetaVarPerm = new ScType(sc_type_edge_common | sc_type_metavar | sc_type_perm);
  static readonly ArcCommonMetaVarPerm = new ScType(sc_type_arc_common | sc_type_metavar | sc_type_perm);

  static readonly EdgeCommonConstTemp = new ScType(sc_type_edge_common | sc_type_const | sc_type_temp);
  static readonly ArcCommonConstTemp = new ScType(sc_type_arc_common | sc_type_const | sc_type_temp);

  static readonly EdgeCommonVarTemp = new ScType(sc_type_edge_common | sc_type_var | sc_type_temp);
  static readonly ArcCommonVarTemp = new ScType(sc_type_arc_common | sc_type_var | sc_type_temp);

  static readonly EdgeCommonMetaVarTemp = new ScType(sc_type_edge_common | sc_type_metavar | sc_type_temp);
  static readonly ArcCommonMetaVarTemp = new ScType(sc_type_arc_common | sc_type_metavar | sc_type_temp);

  static readonly ArcAccessPos = new ScType(sc_type_arc_access | sc_type_arc_pos);
  static readonly ArcAccessNeg = new ScType(sc_type_arc_access | sc_type_arc_neg);
  static readonly ArcAccessFuz = new ScType(sc_type_arc_access | sc_type_arc_fuz);

  static readonly ArcAccessConstPos = new ScType(sc_type_arc_access | sc_type_const | sc_type_arc_pos);
  static readonly ArcAccessConstNeg = new ScType(sc_type_arc_access | sc_type_const | sc_type_arc_neg);
  static readonly ArcAccessConstFuz = new ScType(sc_type_arc_access | sc_type_const | sc_type_arc_fuz);

  static readonly ArcAccessVarPos = new ScType(sc_type_arc_access | sc_type_var | sc_type_arc_pos);
  static readonly ArcAccessVarNeg = new ScType(sc_type_arc_access | sc_type_var | sc_type_arc_neg);
  static readonly ArcAccessVarFuz = new ScType(sc_type_arc_access | sc_type_var | sc_type_arc_fuz);

  static readonly ArcAccessMetaVarPos = new ScType(sc_type_arc_access | sc_type_metavar | sc_type_arc_pos);
  static readonly ArcAccessMetaVarNeg = new ScType(sc_type_arc_access | sc_type_metavar | sc_type_arc_neg);
  static readonly ArcAccessMetaVarFuz = new ScType(sc_type_arc_access | sc_type_metavar | sc_type_arc_fuz);

  static readonly ArcAccessConstPerm = new ScType(sc_type_arc_access | sc_type_const | sc_type_perm);
  static readonly ArcAccessConstTemp = new ScType(sc_type_arc_access | sc_type_const | sc_type_temp);

  static readonly ArcAccessVarPerm = new ScType(sc_type_arc_access | sc_type_var | sc_type_perm);
  static readonly ArcAccessVarTemp = new ScType(sc_type_arc_access | sc_type_var | sc_type_temp);

  static readonly ArcAccessMetaVarPerm = new ScType(sc_type_arc_access | sc_type_metavar | sc_type_perm);
  static readonly ArcAccessMetaVarTemp = new ScType(sc_type_arc_access | sc_type_metavar | sc_type_temp);

  static readonly ArcAccessPosPerm = new ScType(sc_type_arc_access | sc_type_arc_pos | sc_type_perm);
  static readonly ArcAccessNegPerm = new ScType(sc_type_arc_access | sc_type_arc_neg | sc_type_perm);
  static readonly ArcAccessFuzPerm = new ScType(sc_type_arc_access | sc_type_arc_fuz | sc_type_perm);

  static readonly ArcAccessPosTemp = new ScType(sc_type_arc_access | sc_type_arc_pos | sc_type_temp);
  static readonly ArcAccessNegTemp = new ScType(sc_type_arc_access | sc_type_arc_neg | sc_type_temp);
  static readonly ArcAccessFuzTemp = new ScType(sc_type_arc_access | sc_type_arc_fuz | sc_type_temp);

  static readonly ArcAccessConstPosPerm = new ScType(sc_type_const | sc_type_arc_access | sc_type_perm | sc_type_arc_pos);
  static readonly ArcAccessConstNegPerm = new ScType(sc_type_const | sc_type_arc_access | sc_type_perm | sc_type_arc_neg);
  static readonly ArcAccessConstFuzPerm = new ScType(sc_type_const | sc_type_arc_access | sc_type_perm | sc_type_arc_fuz);

  static readonly ArcAccessConstPosTemp = new ScType(sc_type_const | sc_type_arc_access | sc_type_temp | sc_type_arc_pos);
  static readonly ArcAccessConstNegTemp = new ScType(sc_type_const | sc_type_arc_access | sc_type_temp | sc_type_arc_neg);
  static readonly ArcAccessConstFuzTemp = new ScType(sc_type_const | sc_type_arc_access | sc_type_temp | sc_type_arc_fuz);

  static readonly ArcAccessVarPosPerm = new ScType(sc_type_var | sc_type_arc_access | sc_type_perm | sc_type_arc_pos);
  static readonly ArcAccessVarNegPerm = new ScType(sc_type_var | sc_type_arc_access | sc_type_perm | sc_type_arc_neg);
  static readonly ArcAccessVarFuzPerm = new ScType(sc_type_var | sc_type_arc_access | sc_type_perm | sc_type_arc_fuz);

  static readonly ArcAccessVarPosTemp = new ScType(sc_type_var | sc_type_arc_access | sc_type_temp | sc_type_arc_pos);
  static readonly ArcAccessVarNegTemp = new ScType(sc_type_var | sc_type_arc_access | sc_type_temp | sc_type_arc_neg);
  static readonly ArcAccessVarFuzTemp = new ScType(sc_type_var | sc_type_arc_access | sc_type_temp | sc_type_arc_fuz);

  static readonly ArcAccessMetaVarPosPerm = new ScType(sc_type_metavar | sc_type_arc_access | sc_type_perm | sc_type_arc_pos);
  static readonly ArcAccessMetaVarNegPerm = new ScType(sc_type_metavar | sc_type_arc_access | sc_type_perm | sc_type_arc_neg);
  static readonly ArcAccessMetaVarFuzPerm = new ScType(sc_type_metavar | sc_type_arc_access | sc_type_perm | sc_type_arc_fuz);

  static readonly ArcAccessMetaVarPosTemp = new ScType(sc_type_metavar | sc_type_arc_access | sc_type_temp | sc_type_arc_pos);
  static readonly ArcAccessMetaVarNegTemp = new ScType(sc_type_metavar | sc_type_arc_access | sc_type_temp | sc_type_arc_neg);
  static readonly ArcAccessMetaVarFuzTemp = new ScType(sc_type_metavar | sc_type_arc_access | sc_type_temp | sc_type_arc_fuz);

  static readonly EdgeAccessConstPosPerm = new ScType(sc_type_const | sc_type_arc_access | sc_type_perm | sc_type_arc_pos);
  static readonly EdgeAccessConstNegPerm = new ScType(sc_type_const | sc_type_arc_access | sc_type_perm | sc_type_arc_neg);
  static readonly EdgeAccessConstFuzPerm = new ScType(sc_type_const | sc_type_arc_access | sc_type_perm | sc_type_arc_fuz);

  static readonly EdgeAccessConstPosTemp = new ScType(sc_type_const | sc_type_arc_access | sc_type_temp | sc_type_arc_pos);
  static readonly EdgeAccessConstNegTemp = new ScType(sc_type_const | sc_type_arc_access | sc_type_temp | sc_type_arc_neg);
  static readonly EdgeAccessConstFuzTemp = new ScType(sc_type_const | sc_type_arc_access | sc_type_temp | sc_type_arc_fuz);

  static readonly EdgeAccessVarPosPerm = new ScType(sc_type_var | sc_type_arc_access | sc_type_perm | sc_type_arc_pos);
  static readonly EdgeAccessVarNegPerm = new ScType(sc_type_var | sc_type_arc_access | sc_type_perm | sc_type_arc_neg);
  static readonly EdgeAccessVarFuzPerm = new ScType(sc_type_var | sc_type_arc_access | sc_type_perm | sc_type_arc_fuz);

  static readonly EdgeAccessVarPosTemp = new ScType(sc_type_var | sc_type_arc_access | sc_type_temp | sc_type_arc_pos);
  static readonly EdgeAccessVarNegTemp = new ScType(sc_type_var | sc_type_arc_access | sc_type_temp | sc_type_arc_neg);
  static readonly EdgeAccessVarFuzTemp = new ScType(sc_type_var | sc_type_arc_access | sc_type_temp | sc_type_arc_fuz);

  static readonly EdgeAccessMetaVarPosPerm = new ScType(sc_type_metavar | sc_type_arc_access | sc_type_perm | sc_type_arc_pos);
  static readonly EdgeAccessMetaVarNegPerm = new ScType(sc_type_metavar | sc_type_arc_access | sc_type_perm | sc_type_arc_neg);
  static readonly EdgeAccessMetaVarFuzPerm = new ScType(sc_type_metavar | sc_type_arc_access | sc_type_perm | sc_type_arc_fuz);

  static readonly EdgeAccessMetaVarPosTemp = new ScType(sc_type_metavar | sc_type_arc_access | sc_type_temp | sc_type_arc_pos);
  static readonly EdgeAccessMetaVarNegTemp = new ScType(sc_type_metavar | sc_type_arc_access | sc_type_temp | sc_type_arc_neg);
  static readonly EdgeAccessMetaVarFuzTemp = new ScType(sc_type_metavar | sc_type_arc_access | sc_type_temp | sc_type_arc_fuz);
}
