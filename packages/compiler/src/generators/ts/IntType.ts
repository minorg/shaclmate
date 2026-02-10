import { code } from "ts-poet";
import { AbstractNumberType } from "./AbstractNumberType.js";
import { sharedImports } from "./sharedImports.js";

export class IntType extends AbstractNumberType {
  override readonly graphqlType = new AbstractNumberType.GraphqlType(
    code`${sharedImports.GraphQLInt}`,
  );
  override readonly kind = "IntType";
}
