import type { ObjectDiscriminatedUnionType } from "../ObjectDiscriminatedUnionType.js";
import { singleEntryRecord } from "../singleEntryRecord.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectDiscriminatedUnionType_fromRdfResourceFunctionDeclaration(
  this: ObjectDiscriminatedUnionType,
): Record<string, Code> {
  if (!this.configuration.features.has("Object.fromRdf")) {
    return {};
  }

  const name = this.name.unsafeCoerce();

  return singleEntryRecord(
    `fromRdfResource`,
    code`\
export const fromRdfResource: ${this.reusables.snippets.FromRdfResourceFunction}<${name}> = (resource, options) => 
  ${this.members.reduce(
    (expression, member) => {
      const memberTypeExpression = code`(${member.type.name.unsafeCoerce()}.fromRdfResource(resource, { ...options, ignoreRdfType: false }) as ${this.reusables.imports.Either}<Error, ${name}>)`;
      return expression !== null
        ? code`${expression}.altLazy(() => ${memberTypeExpression})`
        : memberTypeExpression;
    },
    null as Code | null,
  )};`,
  );
}
