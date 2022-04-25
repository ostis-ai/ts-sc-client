// sc-element types
export const sc_type_node = 0x1;
export const sc_type_link = 0x2;
export const sc_type_uedge_common = 0x4;
export const sc_type_dedge_common = 0x8;
export const sc_type_edge_access = 0x10;

// sc-element constant
export const sc_type_const = 0x20;
export const sc_type_var = 0x40;

// sc-element positivity
export const sc_type_edge_pos = 0x80;
export const sc_type_edge_neg = 0x100;
export const sc_type_edge_fuz = 0x200;

// sc-element premanently
export const sc_type_edge_temp = 0x400;
export const sc_type_edge_perm = 0x800;

// struct node types
export const sc_type_node_tuple = 0x80;
export const sc_type_node_struct = 0x100;
export const sc_type_node_role = 0x200;
export const sc_type_node_norole = 0x400;
export const sc_type_node_class = 0x800;
export const sc_type_node_abstract = 0x1000;
export const sc_type_node_material = 0x2000;

export const sc_type_arc_pos_const_perm =
  sc_type_edge_access | sc_type_const | sc_type_edge_pos | sc_type_edge_perm;
export const sc_type_arc_pos_var_perm =
  sc_type_edge_access | sc_type_var | sc_type_edge_pos | sc_type_edge_perm;

// masks
export const sc_type_element_mask =
  sc_type_node |
  sc_type_link |
  sc_type_uedge_common |
  sc_type_dedge_common |
  sc_type_edge_access;

export const sc_type_constancy_mask = sc_type_const | sc_type_var;

export const sc_type_positivity_mask =
  sc_type_edge_pos | sc_type_edge_neg | sc_type_edge_fuz;

export const sc_type_permanency_mask = sc_type_edge_perm | sc_type_edge_temp;

export const sc_type_node_struct_mask =
  sc_type_node_tuple |
  sc_type_node_struct |
  sc_type_node_role |
  sc_type_node_norole |
  sc_type_node_class |
  sc_type_node_abstract |
  sc_type_node_material;

export const sc_type_edge_mask =
  sc_type_edge_access | sc_type_dedge_common | sc_type_uedge_common;
