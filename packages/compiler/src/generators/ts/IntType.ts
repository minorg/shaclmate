import { AbstractNumberType } from "./AbstractNumberType.js";

export class IntType extends AbstractNumberType {
  override readonly graphqlType = new AbstractNumberType.GraphqlType(
    "graphql.GraphQLInt",
  );
  override readonly kind = "IntType";
}
