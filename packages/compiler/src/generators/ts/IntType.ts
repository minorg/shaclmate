import { Memoize } from "typescript-memoize";
import { NumberType } from "./NumberType.js";
import { Type } from "./Type.js";

export class IntType extends NumberType {
  @Memoize()
  override get graphqlType(): Type.GraphqlType {
    return new Type.GraphqlType("graphql.GraphQLInt");
  }
}
