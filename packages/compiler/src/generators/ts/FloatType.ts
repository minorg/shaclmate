import { AbstractNumberType } from "./AbstractNumberType.js";
import { imports } from "./imports.js";
import { code } from "./ts-poet-wrapper.js";

export class FloatType extends AbstractNumberType {
  override readonly kind = "FloatType";
  override readonly graphqlType = new AbstractNumberType.GraphqlType(
    code`${imports.GraphQLFloat}`,
  );
}
