import { Maybe } from "purify-ts";
import { AbstractNamedUnionType } from "./AbstractNamedUnionType.js";
import type { AbstractType } from "./AbstractType.js";
import type { Type } from "./Type.js";
import type { Code } from "./ts-poet-wrapper.js";

export class NamedUnionType extends AbstractNamedUnionType<Type> {
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  override readonly kind = "NamedUnionType";

  override graphqlResolveExpression(): Code {
    throw new Error("GraphQL doesn't support scalar unions");
  }

  override get graphqlType(): AbstractType.GraphqlType {
    throw new Error("GraphQL doesn't support scalar unions");
  }
}
