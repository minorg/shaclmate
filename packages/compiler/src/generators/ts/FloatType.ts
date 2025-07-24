import { NumberType } from "./NumberType.js";

export class FloatType extends NumberType {
  override get graphqlName(): string {
    return "graphql.GraphQLFloat";
  }
}
