import { AbstractNumberType } from "./AbstractNumberType.js";

export class FloatType extends AbstractNumberType {
  override readonly kind = "FloatType";
  override readonly graphqlType = new AbstractNumberType.GraphqlType(
    "graphql.GraphQLFloat",
  );
}
