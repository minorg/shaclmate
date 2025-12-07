import { Memoize } from "typescript-memoize";
import { AbstractType } from "./AbstractType.js";
import { NumberType } from "./NumberType.js";

export class IntType extends NumberType {
  @Memoize()
  override get graphqlName(): AbstractType.GraphqlName {
    return new AbstractType.GraphqlName("graphql.GraphQLInt");
  }
}
