import type * as ast from "../ast/index.js";

export type NodeShapeAstType =
  | ast.ListType
  | ast.IntersectionType
  | ast.ObjectType
  | ast.UnionType;
