import { NumberType } from "./NumberType.js";
import { Type } from "./Type.js";

export class FloatType extends NumberType {
  override readonly graphqlType = new Type.GraphqlType("graphql.GraphQLFloat");
}
