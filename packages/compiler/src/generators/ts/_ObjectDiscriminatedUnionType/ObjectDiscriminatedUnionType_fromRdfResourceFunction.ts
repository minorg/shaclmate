import type { Callable } from "../Callable.js";
import type { ObjectDiscriminatedUnionType } from "../ObjectDiscriminatedUnionType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectDiscriminatedUnionType_fromRdfResourceFunction(
  this: ObjectDiscriminatedUnionType,
): Callable {
  return this._function({
    type: code`${this.reusables.snippets.FromRdfResourceFunction}<${this.expression}>`,
    unannotatedExpression: code`\
(resource, options) => 
  ${this.members.reduce(
    (expression, member) => {
      const memberTypeExpression = code`(${member.type.name.unsafeCoerce()}.fromRdfResource(resource, { ...options, ignoreRdfType: false }) as ${this.reusables.imports.Either}<Error, ${this.expression}>)`;
      return expression !== null
        ? code`${expression}.altLazy(() => ${memberTypeExpression})`
        : memberTypeExpression;
    },
    null as Code | null,
  )};`,
    unqualifiedName: "fromRdfResource",
  });
}
