import { code } from "ts-poet";
import { AbstractNumberType } from "./AbstractNumberType.js";
import { sharedImports } from "./sharedImports.js";

export class FloatType extends AbstractNumberType {
  override readonly kind = "FloatType";
  override readonly graphqlType = new AbstractNumberType.GraphqlType(
    code`${sharedImports.GraphQLFloat}`,
  );
}
