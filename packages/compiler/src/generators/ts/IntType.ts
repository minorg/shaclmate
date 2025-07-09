import { NumberType } from "./NumberType.js";

export class IntType extends NumberType {
  override get graphqlName(): string {
    return "graphql.GraphQLInt";
  }
}
