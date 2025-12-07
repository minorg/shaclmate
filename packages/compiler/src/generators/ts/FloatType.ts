import { Memoize } from "typescript-memoize";
import { NumberType } from "./NumberType.js";
import { Type } from "./Type.js";

export class FloatType extends NumberType {
  @Memoize()
  override get graphqlName(): Type.GraphqlName {
    return new Type.GraphqlName("graphql.GraphQLFloat");
  }
}
