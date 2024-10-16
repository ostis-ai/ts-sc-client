import {
  sc_type_const,
  sc_type_var,
  sc_type_constancy_mask,
  sc_type_element_mask,
  sc_type_connector,
  sc_type_common_edge,
  sc_type_arc,
  sc_type_common_arc,
  sc_type_membership_arc,
  sc_type_pos_arc,
  sc_type_neg_arc,
  sc_type_fuz_arc,
  sc_type_perm_arc,
  sc_type_temp_arc,
  sc_type_actual_arc,
  sc_type_inactual_arc,
  sc_type_node_link,
  sc_type_node,
  sc_type_node_class,
  sc_type_node_superclass,
  sc_type_node_material,
  sc_type_node_norole,
  sc_type_node_role,
  sc_type_node_structure,
  sc_type_node_tuple,
  sc_type_unknown,
  sc_type_node_link_mask,
  sc_type_node_mask,
  sc_type_connector_mask,
  sc_type_actuality_mask,
  sc_type_permanency_mask,
  sc_type_positivity_mask,
} from "./constants";

export class ScType {
  private _value: number;

  constructor(value?: number | ScType) {
    if (typeof value === 'number') {
      this._value = value || 0;
    } else if (value instanceof ScType) {
      this._value = value._value || 0;
    } else {
      this._value = 0;
    }
  }

  public get value(): number {
    return this._value;
  }

  public hasConstancy(): boolean {
    return (this._value & sc_type_constancy_mask) != 0;
  }

  public isConst(): boolean {
    return (this._value & sc_type_const) != 0;
  }

  public isVar(): boolean {
    return (this._value & sc_type_var) != 0;
  }

  public hasDirection(): boolean {
    return (this._value & sc_type_common_edge) == 0;
  }

  public isNode(): boolean {
    return (this._value & sc_type_node) != 0;
  }

  public isLink(): boolean {
    return (this._value & sc_type_node_link) == sc_type_node_link;
  }

  public isConnector(): boolean {
    return (this._value & sc_type_connector) != 0;
  }

  /*!
   * @deprecated ScType `isEdge` method is deprecated. Use `isConnector` instead.
   */
  public isEdge(): boolean {
    console.warn("Warning: ScType `isEdge` method is deprecated. Use `isConnector` instead.");
    return this.isConnector();
  }

  public isCommonEdge(): boolean {
    return (this._value & sc_type_common_edge) != 0;
  }

  public isArc(): boolean {
    return (this._value & sc_type_arc) != 0;
  }

  public isCommonArc(): boolean {
    return (this._value & sc_type_common_arc) != 0;
  }

  public isMembershipArc(): boolean {
    return (this._value & sc_type_membership_arc) != 0;
  }

  public isPos(): boolean {
    return (this._value & sc_type_pos_arc) == sc_type_pos_arc;
  }

  public isNeg(): boolean {
    return (this._value & sc_type_neg_arc) == sc_type_neg_arc;
  }

  public isFuz(): boolean {
    return (this._value & sc_type_fuz_arc) == sc_type_fuz_arc;
  }

  public isPerm(): boolean {
    return (this._value & sc_type_perm_arc) == sc_type_perm_arc;
  }

  public isTemp(): boolean {
    return (this._value & sc_type_temp_arc) == sc_type_temp_arc;
  }

  public isActual(): boolean {
    return (this._value & sc_type_actual_arc) == sc_type_actual_arc;
  }

  public isInactual(): boolean {
    return (this._value & sc_type_inactual_arc) == sc_type_inactual_arc;
  }

  public isTuple(): boolean {
    return (this._value & sc_type_node_tuple) == sc_type_node_tuple;
  }
  
  public isStructure(): boolean {
    return (this._value & sc_type_node_structure) == sc_type_node_structure;
  }

  /*!
   * @deprecated ScType `isStruct` method is deprecated. Use `isStructure` instead.
   */
  public isStruct(): boolean {
    console.warn("Warning: ScType `isStruct` method is deprecated. Use `isStructure` instead.");
    return this.isStructure();
  }

  public isRole(): boolean {
    return (this._value & sc_type_node_role) == sc_type_node_role;
  }

  public isNoRole(): boolean {
    return (this._value & sc_type_node_norole) == sc_type_node_norole;
  }

  public isClass(): boolean {
    return (this._value & sc_type_node_class) == sc_type_node_class;
  }

  public isSuperclass(): boolean {
    return (this._value & sc_type_node_superclass) == sc_type_node_superclass;
  }

  public isMaterial(): boolean {
    return (this._value & sc_type_node_material) == sc_type_node_material;
  }

  public isValid(): boolean {
    return this._value !== 0;
  }

  public equal(other: ScType): boolean {
    return this._value === other._value;
  }

  protected isNotCompatibleByMask(newType: ScType, mask: number): boolean {
    const subtype = this.value & mask;
    const newSubtype = newType.value & mask;
    return subtype != sc_type_unknown && subtype != newSubtype;
  }

  protected isExpendableTo(newType: ScType): boolean { // it is equal to `sc_storage_is_type_expendable_to` in the sc-machine
    let thisValue = this.value;
    let newValue = newType.value;

    if (this.isNotCompatibleByMask(newType, sc_type_element_mask)) {
      return false;
    }
    if (this.isNotCompatibleByMask(newType, sc_type_constancy_mask)) {
      return false;
    }

    if (this.isLink()) {
      if (!newType.isLink()) {
        return false;
      }

      const thisType = new ScType(thisValue & ~sc_type_node_link);
      newType = new ScType(newValue & ~sc_type_node_link);

      if (thisType.isNotCompatibleByMask(newType, sc_type_node_link_mask)) {
        return false;
      }
    } else if (this.isNode()) {
      if (!newType.isNode()) {
        return false;
      }

      const thisType = new ScType(thisValue & ~sc_type_node);
      newType = new ScType(newValue & ~sc_type_node);

      if (thisType.isNotCompatibleByMask(newType, sc_type_node_mask)) {
        return false;
      } 
    } else if (this.isConnector()) {
      if (newType.isConnector()) {
        return false;
      }

      if (this.isNotCompatibleByMask(newType, sc_type_connector_mask)) {
        if (this.isCommonEdge()) {
          if (!newType.isCommonEdge()) {
            return false;
          }
        } else if (this.isArc()) {
          if (!newType.isArc()) {
            return false;
          }

          if (this.isCommonArc()) {
            if (!newType.isCommonArc()) {
              return false;
            }
          } else if (!this.isMembershipArc()) {
            if (!newType.isMembershipArc()) {
              return false;
            }
          }
        }
      }

      const thisType = new ScType(thisValue & ~sc_type_connector_mask);
      newType = new ScType(newValue & ~sc_type_connector_mask);

      if (thisType.isNotCompatibleByMask(newType, sc_type_actuality_mask)) {
        return false;
      }

      if (thisType.isNotCompatibleByMask(newType, sc_type_permanency_mask)) {
        return false;
      }

      if (thisType.isNotCompatibleByMask(newType, sc_type_positivity_mask)) {
        return false;
      }
    }

    return true;
  }

  public merge(other: ScType): ScType {
    if (!this.isExpendableTo(other)) {
      throw "Type `" + this + "` can not be expended to `" + other + "`";
    }

    return new ScType(this._value | other._value);
  }

  public changeConst(isConst: boolean): ScType {
    const v: number = this._value & ~sc_type_constancy_mask;
    return new ScType(v | (isConst ? sc_type_const : sc_type_var));
  }

  static readonly Unknown = new ScType(sc_type_unknown);

  // sc-elements
  static readonly Node = new ScType(sc_type_node);
  static readonly Connector = new ScType(sc_type_connector);
  static readonly CommonEdge = new ScType(sc_type_common_edge);
  static readonly Arc = new ScType(sc_type_arc);
  static readonly CommonArc = new ScType(sc_type_common_arc);
  static readonly MembershipArc = new ScType(sc_type_membership_arc);

  // constancy
  static readonly Const = new ScType(sc_type_const);
  static readonly Var = new ScType(sc_type_var);

  static readonly ConstNode = new ScType(sc_type_const | sc_type_node);
  static readonly VarNode = new ScType(sc_type_var | sc_type_node);
  static readonly ConstConnector = new ScType(sc_type_const | sc_type_connector);
  static readonly VarConnector = new ScType(sc_type_var | sc_type_connector);
  static readonly ConstCommonEdge = new ScType(sc_type_const | sc_type_common_edge);
  static readonly VarCommonEdge = new ScType(sc_type_var | sc_type_common_edge);
  static readonly ConstArc = new ScType(sc_type_const | sc_type_arc);
  static readonly VarArc = new ScType(sc_type_var | sc_type_arc);
  static readonly ConstCommonArc = new ScType(sc_type_const | sc_type_common_arc);
  static readonly VarCommonArc = new ScType(sc_type_var | sc_type_common_arc);
  static readonly ConstMembershipArc = new ScType(sc_type_const | sc_type_membership_arc);
  static readonly VarMembershipArc = new ScType(sc_type_var | sc_type_membership_arc);

  // permanency
  static readonly PermArc = new ScType(sc_type_perm_arc);
  static readonly TempArc = new ScType(sc_type_temp_arc);

  static readonly ConstPermArc = new ScType(sc_type_const | sc_type_perm_arc);
  static readonly VarPermArc = new ScType(sc_type_var | sc_type_perm_arc);
  static readonly ConstTempArc = new ScType(sc_type_const | sc_type_temp_arc);
  static readonly VarTempArc = new ScType(sc_type_var | sc_type_temp_arc);

  // actuality
  static readonly ActualTempArc = new ScType(sc_type_actual_arc | sc_type_temp_arc);
  static readonly InactualTempArc = new ScType(sc_type_inactual_arc | sc_type_temp_arc);

  static readonly ConstActualTempArc = new ScType(sc_type_const | sc_type_actual_arc | sc_type_temp_arc);
  static readonly VarActualTempArc = new ScType(sc_type_var | sc_type_actual_arc | sc_type_temp_arc);
  static readonly ConstInactualTempArc = new ScType(sc_type_const | sc_type_inactual_arc | sc_type_temp_arc);
  static readonly VarInactualTempArc = new ScType(sc_type_var | sc_type_inactual_arc | sc_type_temp_arc);

  // positivity
  static readonly PosArc = new ScType(sc_type_pos_arc);
  static readonly NegArc = new ScType(sc_type_neg_arc);

  // fuzzy sc-arc
  static readonly FuzArc = new ScType(sc_type_fuz_arc);

  // positive sc-arcs
  static readonly ConstPosArc = new ScType(sc_type_const | sc_type_pos_arc);
  static readonly VarPosArc = new ScType(sc_type_var | sc_type_pos_arc);

  static readonly PermPosArc = new ScType(sc_type_perm_arc | sc_type_pos_arc);
  static readonly TempPosArc = new ScType(sc_type_temp_arc | sc_type_pos_arc);
  static readonly ActualTempPosArc = new ScType(sc_type_actual_arc | sc_type_temp_arc | sc_type_pos_arc);
  static readonly InactualTempPosArc = new ScType(sc_type_inactual_arc | sc_type_temp_arc | sc_type_pos_arc);

  static readonly ConstPermPosArc = new ScType(sc_type_const | sc_type_perm_arc | sc_type_pos_arc);
  static readonly ConstTempPosArc = new ScType(sc_type_const | sc_type_temp_arc | sc_type_pos_arc);
  static readonly ConstActualTempPosArc = new ScType(sc_type_const | sc_type_actual_arc | sc_type_temp_arc | sc_type_pos_arc);
  static readonly ConstInactualTempPosArc = new ScType(sc_type_const | sc_type_inactual_arc | sc_type_temp_arc | sc_type_pos_arc);

  static readonly VarPermPosArc = new ScType(sc_type_var | sc_type_perm_arc | sc_type_pos_arc);
  static readonly VarTempPosArc = new ScType(sc_type_var | sc_type_temp_arc | sc_type_pos_arc);
  static readonly VarActualTempPosArc = new ScType(sc_type_var | sc_type_actual_arc | sc_type_temp_arc | sc_type_pos_arc);
  static readonly VarInactualTempPosArc = new ScType(sc_type_var | sc_type_inactual_arc | sc_type_temp_arc | sc_type_pos_arc);

  // negative sc-arcs
  static readonly ConstNegArc = new ScType(sc_type_const | sc_type_neg_arc);
  static readonly VarNegArc = new ScType(sc_type_var | sc_type_neg_arc);

  static readonly PermNegArc = new ScType(sc_type_perm_arc | sc_type_neg_arc);
  static readonly TempNegArc = new ScType(sc_type_temp_arc | sc_type_neg_arc);
  static readonly ActualTempNegArc = new ScType(sc_type_actual_arc | sc_type_temp_arc | sc_type_neg_arc);
  static readonly InactualTempNegArc = new ScType(sc_type_inactual_arc | sc_type_temp_arc | sc_type_neg_arc);

  static readonly ConstPermNegArc = new ScType(sc_type_const | sc_type_perm_arc | sc_type_neg_arc);
  static readonly ConstTempNegArc = new ScType(sc_type_const | sc_type_temp_arc | sc_type_neg_arc);
  static readonly ConstActualTempNegArc = new ScType(sc_type_const | sc_type_actual_arc | sc_type_temp_arc | sc_type_neg_arc);
  static readonly ConstInactualTempNegArc = new ScType(sc_type_const | sc_type_inactual_arc | sc_type_temp_arc | sc_type_neg_arc);

  static readonly VarPermNegArc = new ScType(sc_type_var | sc_type_perm_arc | sc_type_neg_arc);
  static readonly VarTempNegArc = new ScType(sc_type_var | sc_type_temp_arc | sc_type_neg_arc);
  static readonly VarActualTempNegArc = new ScType(sc_type_var | sc_type_actual_arc | sc_type_temp_arc | sc_type_neg_arc);
  static readonly VarInactualTempNegArc = new ScType(sc_type_var | sc_type_inactual_arc | sc_type_temp_arc | sc_type_neg_arc);

  // fuzzy sc-arcs
  static readonly ConstFuzArc = new ScType(sc_type_const | sc_type_fuz_arc);
  static readonly VarFuzArc = new ScType(sc_type_var | sc_type_fuz_arc);

  // semantic sc-node types
  static readonly NodeLink = new ScType(sc_type_node_link);
  static readonly NodeLinkClass = new ScType(sc_type_node_link | sc_type_node_class);
  static readonly NodeTuple = new ScType(sc_type_node_tuple);
  static readonly NodeStructure = new ScType(sc_type_node_structure);
  static readonly NodeRole = new ScType(sc_type_node_role);
  static readonly NodeNoRole = new ScType(sc_type_node_norole);
  static readonly NodeClass = new ScType(sc_type_node_class);
  static readonly NodeSuperclass = new ScType(sc_type_node_superclass);
  static readonly NodeMaterial = new ScType(sc_type_node_material);

  static readonly ConstNodeLink = new ScType(sc_type_const | sc_type_node_link);
  static readonly ConstNodeLinkClass = new ScType(sc_type_const | sc_type_node_link | sc_type_node_class);
  static readonly ConstNodeTuple = new ScType(sc_type_const | sc_type_node_tuple);
  static readonly ConstNodeStructure = new ScType(sc_type_const | sc_type_node_structure);
  static readonly ConstNodeRole = new ScType(sc_type_const | sc_type_node_role);
  static readonly ConstNodeNoRole = new ScType(sc_type_const | sc_type_node_norole);
  static readonly ConstNodeClass = new ScType(sc_type_const | sc_type_node_class);
  static readonly ConstNodeSuperclass = new ScType(sc_type_const | sc_type_node_superclass);
  static readonly ConstNodeMaterial = new ScType(sc_type_const | sc_type_node_material);

  static readonly VarNodeLink = new ScType(sc_type_var | sc_type_node_link);
  static readonly VarNodeLinkClass = new ScType(sc_type_var | sc_type_node_link | sc_type_node_class);
  static readonly VarNodeTuple = new ScType(sc_type_var | sc_type_node_tuple);
  static readonly VarNodeStructure = new ScType(sc_type_var | sc_type_node_structure);
  static readonly VarNodeRole = new ScType(sc_type_var | sc_type_node_role);
  static readonly VarNodeNoRole = new ScType(sc_type_var | sc_type_node_norole);
  static readonly VarNodeClass = new ScType(sc_type_var | sc_type_node_class);
  static readonly VarNodeSuperclass = new ScType(sc_type_var | sc_type_node_superclass);
  static readonly VarNodeMaterial = new ScType(sc_type_var | sc_type_node_material);

  // deprecated
  /*!
   * @deprecated EdgeUCommon is deprecated. Use CommonEdge instead.
   */
  static readonly EdgeUCommon = new ScType(ScType.CommonEdge);

  /*!
   * @deprecated EdgeDCommon is deprecated. Use CommonArc instead.
   */
  static readonly EdgeDCommon = new ScType(ScType.CommonArc);

  /*!
   * @deprecated EdgeUCommonConst is deprecated. Use ConstCommonEdge instead.
   */
  static readonly EdgeUCommonConst = new ScType(ScType.ConstCommonEdge);

  /*!
   * @deprecated EdgeDCommonConst is deprecated. Use ConstCommonArc instead.
   */
  static readonly EdgeDCommonConst = new ScType(ScType.ConstCommonArc);

  /*!
  * @deprecated EdgeAccess is deprecated. Use MembershipArc instead.
  */
  static readonly EdgeAccess = new ScType(ScType.MembershipArc);

  /*!
  * @deprecated EdgeAccessConstPosPerm is deprecated. Use ConstPermPosArc instead.
  */
  static readonly EdgeAccessConstPosPerm = new ScType(ScType.ConstPermPosArc);

  /*!
  * @deprecated EdgeAccessConstNegPerm is deprecated. Use ConstPermNegArc instead.
  */
  static readonly EdgeAccessConstNegPerm = new ScType(ScType.ConstPermNegArc);

  /*!
  * @deprecated EdgeAccessConstFuzPerm is deprecated. Use ConstFuzArc instead.
  */
  static readonly EdgeAccessConstFuzPerm = new ScType(ScType.ConstFuzArc);

  /*!
  * @deprecated EdgeAccessConstPosTemp is deprecated. Use ConstTempPosArc instead.
  */
  static readonly EdgeAccessConstPosTemp = new ScType(ScType.ConstTempPosArc);

  /*!
  * @deprecated EdgeAccessConstNegTemp is deprecated. Use ConstTempNegArc instead.
  */
  static readonly EdgeAccessConstNegTemp = new ScType(ScType.ConstTempNegArc);

  /*!
  * @deprecated EdgeAccessConstFuzTemp is deprecated. Use ConstFuzArc instead.
  */
  static readonly EdgeAccessConstFuzTemp = new ScType(ScType.ConstFuzArc);

  /*!
  * @deprecated EdgeUCommonVar is deprecated. Use VarCommonEdge instead.
  */
  static readonly EdgeUCommonVar = new ScType(ScType.VarCommonEdge);

  /*!
  * @deprecated EdgeDCommonVar is deprecated. Use VarCommonArc instead.
  */
  static readonly EdgeDCommonVar = new ScType(ScType.VarCommonArc);

  /*!
  * @deprecated EdgeAccessVarPosPerm is deprecated. Use VarPermPosArc instead.
  */
  static readonly EdgeAccessVarPosPerm = new ScType(ScType.VarPermPosArc);

  /*!
  * @deprecated EdgeAccessVarNegPerm is deprecated. Use VarPermNegArc instead.
  */
  static readonly EdgeAccessVarNegPerm = new ScType(ScType.VarPermNegArc);

  /*!
  * @deprecated EdgeAccessVarFuzPerm is deprecated. Use VarFuzArc instead.
  */
  static readonly EdgeAccessVarFuzPerm = new ScType(ScType.VarFuzArc);

  /*!
  * @deprecated EdgeAccessVarPosTemp is deprecated. Use VarTempPosArc instead.
  */
  static readonly EdgeAccessVarPosTemp = new ScType(ScType.VarTempPosArc);

  /*!
  * @deprecated EdgeAccessVarNegTemp is deprecated. Use VarTempNegArc instead.
  */
  static readonly EdgeAccessVarNegTemp = new ScType(ScType.VarTempNegArc);

  /*!
  * @deprecated EdgeAccessVarFuzTemp is deprecated. Use VarFuzArc instead.
  */
  static readonly EdgeAccessVarFuzTemp = new ScType(ScType.VarFuzArc);

  /*!
  * @deprecated NodeConst is deprecated. Use ConstNode instead.
  */
  static readonly NodeConst = new ScType(ScType.ConstNode);

  /*!
  * @deprecated NodeVar is deprecated. Use VarNode instead.
  */
  static readonly NodeVar = new ScType(ScType.VarNode);

  /*!
  * @deprecated Link is deprecated. Use NodeLink instead.
  */
  static readonly Link = new ScType(ScType.NodeLink);

  /*!
  * @deprecated LinkClass is deprecated. Use NodeLinkClass instead.
  */
  static readonly LinkClass = new ScType(ScType.NodeLinkClass);

  /*!
  * @deprecated NodeStruct is deprecated. Use NodeStructure instead.
  */
  static readonly NodeStruct = new ScType(ScType.NodeStructure);

  /*!
  * @deprecated LinkConst is deprecated. Use ConstNodeLink instead.
  */
  static readonly LinkConst = new ScType(ScType.ConstNodeLink);

  /*!
  * @deprecated LinkConstClass is deprecated. Use ConstNodeLinkClass instead.
  */
  static readonly LinkConstClass = new ScType(ScType.ConstNodeLinkClass);

  /*!
  * @deprecated NodeConstTuple is deprecated. Use ConstNodeTuple instead.
  */
  static readonly NodeConstTuple = new ScType(ScType.ConstNodeTuple);

  /*!
  * @deprecated NodeConstStruct is deprecated. Use ConstNodeStructure instead.
  */
  static readonly NodeConstStruct = new ScType(ScType.ConstNodeStructure);

  /*!
  * @deprecated NodeConstRole is deprecated. Use ConstNodeRole instead.
  */
  static readonly NodeConstRole = new ScType(ScType.ConstNodeRole);

  /*!
  * @deprecated NodeConstNoRole is deprecated. Use ConstNodeNoRole instead.
  */
  static readonly NodeConstNoRole = new ScType(ScType.ConstNodeNoRole);

  /*!
  * @deprecated NodeConstClass is deprecated. Use ConstNodeClass instead.
  */
  static readonly NodeConstClass = new ScType(ScType.ConstNodeClass);

  /*!
  * @deprecated NodeConstMaterial is deprecated. Use ConstNodeMaterial instead.
  */
  static readonly NodeConstMaterial = new ScType(ScType.ConstNodeMaterial);

  /*!
  * @deprecated LinkVar is deprecated. Use VarNodeLink instead.
  */
  static readonly LinkVar = new ScType(ScType.VarNodeLink);

  /*!
  * @deprecated LinkVarClass is deprecated. Use VarNodeLinkClass instead.
  */
  static readonly LinkVarClass = new ScType(ScType.VarNodeLinkClass);

  /*!
  * @deprecated NodeVarStruct is deprecated. Use VarNodeStructure instead.
  */
  static readonly NodeVarStruct = new ScType(ScType.VarNodeStructure);

  /*!
  * @deprecated NodeVarTuple is deprecated. Use VarNodeTuple instead.
  */
  static readonly NodeVarTuple = new ScType(ScType.VarNodeTuple);

  /*!
  * @deprecated NodeVarRole is deprecated. Use VarNodeRole instead.
  */
  static readonly NodeVarRole = new ScType(ScType.VarNodeRole);

  /*!
  * @deprecated NodeVarNoRole is deprecated. Use VarNodeNoRole instead.
  */
  static readonly NodeVarNoRole = new ScType(ScType.VarNodeNoRole);

  /*!
  * @deprecated NodeVarClass is deprecated. Use VarNodeClass instead.
  */
  static readonly NodeVarClass = new ScType(ScType.VarNodeClass);

  /*!
  * @deprecated NodeVarMaterial is deprecated. Use VarNodeMaterial instead.
  */
  static readonly NodeVarMaterial = new ScType(ScType.VarNodeMaterial);
}
