// sc-element types
export const sc_type_node = 0x1;
export const sc_type_edge_common = 0x2;
export const sc_type_arc_common = 0x4;
export const sc_type_arc_access = 0x8;

// sc-element constant
export const sc_type_const = 0x10;
export const sc_type_var = 0x20;
export const sc_type_metavar = 0x40;

// sc-element permanently
export const sc_type_temp = 0x80;
export const sc_type_perm = 0x100;

// sc-element positivity
export const sc_type_arc_pos = 0x200;
export const sc_type_arc_neg = 0x400;
export const sc_type_arc_fuz = 0x800;

// struct node types
export const sc_type_link = 0x200;
export const sc_type_link_class = 0x400;
export const sc_type_node_tuple = 0x800;
export const sc_type_node_struct = 0x1000;
export const sc_type_node_role = 0x2000;
export const sc_type_node_norole = 0x4000;
export const sc_type_node_class = 0x8000;
export const sc_type_node_superclass = 0x10000;
export const sc_type_node_abstract = 0x20000;
export const sc_type_node_material = 0x40000;

export const sc_type_connector =
    sc_type_edge_common | sc_type_arc_common | sc_type_arc_access;

export const sc_type_arc =
    sc_type_arc_common | sc_type_arc_access;

export const sc_type_arc_pos_const_perm =
  sc_type_arc_access | sc_type_const | sc_type_arc_pos | sc_type_perm;
export const sc_type_arc_pos_var_perm =
  sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_perm;

// masks
export const sc_type_element_mask =
  sc_type_node |
  sc_type_link |
  sc_type_edge_common |
  sc_type_arc_common |
  sc_type_arc_access;

export const sc_type_constancy_mask = sc_type_const | sc_type_var | sc_type_metavar;

export const sc_type_positivity_mask =
  sc_type_arc_pos | sc_type_arc_neg | sc_type_arc_fuz;

export const sc_type_permanency_mask = sc_type_perm | sc_type_temp;

export const sc_type_node_struct_mask =
  sc_type_link |
  sc_type_link_class |
  sc_type_node_tuple |
  sc_type_node_struct |
  sc_type_node_role |
  sc_type_node_norole |
  sc_type_node_class |
  sc_type_node_abstract |
  sc_type_node_material;

export const sc_type_edge_mask =
  sc_type_arc_access | sc_type_edge_common | sc_type_arc_common;
