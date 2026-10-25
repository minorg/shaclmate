import { Memoize } from "typescript-memoize";

import { AbstractIntersectionType } from "./AbstractIntersectionType.js";
import type { Type } from "./Type.js";
import { type Code, joinCode } from "./ts-poet-wrapper.js";

export class IntersectionType extends AbstractIntersectionType<Type> {
  override readonly kind = "Intersection";

  @Memoize()
  protected override get inlineExpression(): Code {
    return joinCode(
      this.members.map((member) => member.type.expression),
      { on: " & " },
    );
  }

  override jsonType(): AbstractIntersectionType.JsonType {
    throw new Error("IntersectionType: not implemented: jsonType");
  }

  protected override fromJsonFunctionExpression(): Code {
    throw new Error(
      "IntersectionType: not implemented: fromJsonFunctionExpression",
    );
  }

  protected fromRdfResourceValuesFunctionExpression(): Code {
    throw new Error(
      "IntersectionType: not implemented: fromRdfResourceValuesFunctionExpression",
    );
  }

  protected override toJsonFunctionExpression(): Code {
    throw new Error(
      "IntersectionType: not implemented: toJsonFunctionExpression",
    );
  }

  protected toRdfResourceValuesFunctionExpression(): Code {
    throw new Error(
      "IntersectionType: not implemented: toRdfResourceValuesFunctionExpression",
    );
  }
}
