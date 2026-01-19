import { NumberType } from "./NumberType.js";

export class FloatType extends NumberType {
  override readonly graphqlType = new NumberType.GraphqlType(
    "graphql.GraphQLFloat",
  );
}
