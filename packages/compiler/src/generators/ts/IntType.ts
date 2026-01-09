import { NumberType } from "./NumberType.js";
import { Type } from "./Type.js";

export class IntType extends NumberType {
  override readonly graphqlType = new Type.GraphqlType("graphql.GraphQLInt");
}
