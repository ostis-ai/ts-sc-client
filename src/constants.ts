// sc-element types
export const sc_type_unknown = 0
export const sc_type_node = 0x1
export const sc_type_connector = 0x4000
export const sc_type_common_edge = (sc_type_connector | 0x4)
export const sc_type_arc = (sc_type_connector | 0x8000)
export const sc_type_common_arc = (sc_type_arc | 0x8)
export const sc_type_membership_arc = (sc_type_arc | 0x10)

// sc-element constant
export const sc_type_const = 0x20
export const sc_type_var = 0x40

// sc-arc actuality
export const sc_type_actual_arc = (sc_type_membership_arc | 0x1000)
export const sc_type_inactual_arc = (sc_type_membership_arc | 0x2000)

// sc-arc permanence
export const sc_type_temp_arc = (sc_type_membership_arc | 0x400)
export const sc_type_perm_arc = (sc_type_membership_arc | 0x800)

// sc-arc positivity
export const sc_type_pos_arc = (sc_type_membership_arc | 0x80)
export const sc_type_neg_arc = (sc_type_membership_arc | 0x100)

// sc-arc fuzziness
export const sc_type_fuz_arc = (sc_type_membership_arc | 0x200)

// semantic sc-node types
export const sc_type_node_link = (sc_type_node | 0x2)
export const sc_type_node_tuple = (sc_type_node | 0x80)
export const sc_type_node_structure = (sc_type_node | 0x100)
export const sc_type_node_role = (sc_type_node | 0x200)
export const sc_type_node_no_role = (sc_type_node | 0x400)
export const sc_type_node_class = (sc_type_node | 0x800)
export const sc_type_node_superclass = (sc_type_node | 0x1000)
export const sc_type_node_material = (sc_type_node | 0x2000)

// type mask
export const sc_type_element_mask = (sc_type_node | sc_type_connector)
export const sc_type_connector_mask = (sc_type_common_edge | sc_type_common_arc | sc_type_membership_arc)
export const sc_type_arc_mask = (sc_type_common_arc | sc_type_membership_arc)

export const sc_type_constancy_mask = (sc_type_const | sc_type_var)
export const sc_type_actuality_mask = (sc_type_actual_arc | sc_type_inactual_arc)
export const sc_type_permanency_mask = (sc_type_perm_arc | sc_type_temp_arc)
export const sc_type_positivity_mask = (sc_type_pos_arc | sc_type_neg_arc)

export const sc_type_membership_arc_mask = (sc_type_actuality_mask | sc_type_permanency_mask | sc_type_positivity_mask | sc_type_fuz_arc)
export const sc_type_common_arc_mask = (sc_type_common_arc)
export const sc_type_common_edge_mask = (sc_type_common_edge)

export const sc_type_node_mask = (
    sc_type_node_link | sc_type_node_tuple | sc_type_node_structure | sc_type_node_role | sc_type_node_no_role
    | sc_type_node_class | sc_type_node_superclass | sc_type_node_material)
export const sc_type_node_link_mask = (sc_type_node | sc_type_node_link | sc_type_node_class)

export const DEFAULT_KEYNODES_CACHE_SIZE = 5000;
