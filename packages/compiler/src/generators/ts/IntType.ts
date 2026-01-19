import { NumberType } from "./NumberType.js";

export class IntType extends NumberType {
  override readonly graphqlType = new NumberType.GraphqlType(
    "graphql.GraphQLInt",
  );
}
