import { AbstractNumberType } from "./AbstractNumberType.js";
import { imports } from "./imports.js";
import { code } from "./ts-poet-wrapper.js";

export class IntType extends AbstractNumberType {
  override readonly graphqlType = new AbstractNumberType.GraphqlType(
    code`${imports.GraphQLInt}`,
  );
  override readonly kind = "IntType";
}
