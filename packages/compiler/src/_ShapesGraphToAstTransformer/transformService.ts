import type * as ast from "../ast/index.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";

function transformOperation(
  this: ShapesGraphToAstTransformer,
  operation: input.Operation,
): ast.Operation {}

export function transformService(
  this: ShapesGraphToAstTransformer,
  service: input.Service,
): ast.Service {}
