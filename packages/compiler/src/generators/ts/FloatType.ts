import { Memoize } from "typescript-memoize";
import { AbstractType } from "./AbstractType.js";
import { NumberType } from "./NumberType.js";

export class FloatType extends NumberType {
  @Memoize()
  override get graphqlName(): AbstractType.GraphqlName {
    return new AbstractType.GraphqlName("graphql.GraphQLFloat");
  }
}
