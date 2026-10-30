import { Maybe } from "purify-ts";
import type { Callable } from "../Callable.js";
import type { ObjectDiscriminatedUnionType } from "../ObjectDiscriminatedUnionType.js";
import { code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectDiscriminatedUnionType_typeGuardFunction(
  this: ObjectDiscriminatedUnionType,
): Maybe<Callable> {
  const name = this.name.extract();
  if (!name) {
    return Maybe.empty();
  }

  return Maybe.of(
    this._function({
      type: code`(object: ${this.configuration.syntheticNamePrefix}Object): object is ${this.expression}`,
      unannotatedExpression: code`(object) => ${joinCode(
        this.members.map(
          (member) =>
            code`${member.type.name.unsafeCoerce()}.is${member.type.name.unsafeCoerce()}(object)`,
        ),
        { on: " || " },
      )};`,
      unqualifiedName: `is${name}`,
    }),
  );
}
