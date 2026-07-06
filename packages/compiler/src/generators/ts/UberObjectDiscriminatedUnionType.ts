import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { Logger } from "ts-log";
import { Memoize } from "typescript-memoize";

import type { ObjectType } from "./ObjectType.js";
import type { Reusables } from "./Reusables.js";
import type { TsGenerator } from "./TsGenerator.js";
import { type Code, code, def, joinCode } from "./ts-poet-wrapper.js";

/**
 * The $Object discriminated union used in type guard functions (isSomeObjectType(object: $Object)) and some convenience methods.
 */
export class UberObjectDiscriminatedUnionType {
  private readonly configuration: TsGenerator.Configuration;
  private readonly members: readonly ObjectType[];
  private readonly reusables: Reusables;

  constructor({
    configuration,
    members,
    reusables,
  }: {
    configuration: TsGenerator.Configuration;
    logger: Logger;
    members: readonly ObjectType[];
    reusables: Reusables;
  }) {
    this.configuration = configuration;
    this.members = members;
    invariant(members.every((member) => member.name.isJust()));
    this.reusables = reusables;
  }

  get declaration(): Maybe<Code> {
    if (this.members.length === 0) {
      return Maybe.empty();
    }

    const declarations: Code[] = [];

    if (this.configuration.features.has("Object.type")) {
      declarations.push(
        code`export type ${def(this.name)} = ${this.members.map((member) => member.name.unsafeCoerce()).join(" | ")};`,
      );
    }

    const staticModuleDeclarations: Code[] = [
      ...this.equalsFunctionDeclaration.toList(),
      ...this.hashFunctionDeclaration.toList(),
      ...this.toJsonFunctionDeclaration.toList(),
      ...this.toRdfResourceFunctionDeclaration.toList(),
      ...this.toStringFunctionDeclaration.toList(),
    ];

    if (staticModuleDeclarations.length > 0) {
      declarations.push(code`\
export namespace ${def(this.name)} {
${joinCode(staticModuleDeclarations, { on: "\n\n" })}
}`);
    }

    if (declarations.length === 0) {
      return Maybe.empty();
    }

    return Maybe.of(joinCode(declarations, { on: "\n\n" }));
  }

  private get equalsFunctionDeclaration(): Maybe<Code> {
    if (!this.configuration.features.has("Object.equals")) {
      return Maybe.empty();
    }

    if (this.members.length === 1) {
      return Maybe.of(
        code`export const equals = ${this.members[0].name.unsafeCoerce()}.equals`,
      );
    }

    return Maybe.of(code`\
export function equals(left: ${this.name}, right: ${this.name}): ${this.reusables.snippets.EqualsResult} {
  if (left.${this.configuration.objectDiscriminantProperty.name} !== right.${this.configuration.objectDiscriminantProperty.name}) {
    return ${this.reusables.imports.Left}({ left, right, propertyName: "type", propertyValuesUnequal: { left: typeof left, right: typeof right, type: "boolean" as const }, type: "property" as const });
  }

${this.memberTypeSwitch({
  caseBlock: (member) =>
    code`return ${member.equalsFunction}(left, right as ${member.name.unsafeCoerce()});`,
  variables: { value: code`left` },
})}
}`);
  }

  @Memoize()
  private get name(): string {
    return `${this.configuration.syntheticNamePrefix}Object`;
  }

  private get toJsonFunctionDeclaration(): Maybe<Code> {
    if (!this.configuration.features.has("Object.toJson")) {
      return Maybe.empty();
    }

    if (this.members.length === 1) {
      return Maybe.of(
        code`export const toJson = ${this.members[0].name.unsafeCoerce()}.toJson;`,
      );
    }

    return Maybe.of(code`\
export function toJson(object: ${this.name}) {
${this.memberTypeSwitch({
  caseBlock: (member) =>
    code`return ${member.toJsonExpression({ variables: { value: code`object` } })};`,
  variables: { value: code`object` },
})}
}`);
  }

  private get toRdfResourceFunctionDeclaration(): Maybe<Code> {
    if (!this.configuration.features.has("Object.toRdf")) {
      return Maybe.empty();
    }

    if (this.members.length === 1) {
      return Maybe.of(
        code`export const toRdfResource = ${this.members[0].name.unsafeCoerce()}.toRdfResource;`,
      );
    }

    return Maybe.of(code`\
export const toRdfResource: ${this.reusables.snippets.ToRdfResourceFunction}<${this.name}> = (object, options) => {
${this.memberTypeSwitch({
  caseBlock: (member) =>
    code`return ${member.name.unsafeCoerce()}.toRdfResource(object, options);`,
  variables: { value: code`object` },
})}
};`);
  }

  private get hashFunctionDeclaration(): Maybe<Code> {
    if (!this.configuration.features.has("Object.hash")) {
      return Maybe.empty();
    }

    if (this.members.length === 1) {
      return Maybe.of(
        code`export const hash = ${this.members[0].name.unsafeCoerce()}.hash;`,
      );
    }

    return Maybe.of(code`\
export function hash<HasherT extends ${this.reusables.snippets.Hasher}>(hasher: HasherT, object: ${this.name}): HasherT {
${this.memberTypeSwitch({
  caseBlock: (member) => code`return ${member.hashFunction}(hasher, object);`,
  variables: { value: code`object` },
})}
}`);
  }

  private get toStringFunctionDeclaration(): Maybe<Code> {
    if (!this.configuration.features.has("Object.toString")) {
      return Maybe.empty();
    }

    const syntheticNamePrefix = this.configuration.syntheticNamePrefix;

    if (this.members.length === 1) {
      return Maybe.of(
        code`export const ${syntheticNamePrefix}toString = ${this.members[0].name.unsafeCoerce()}.${syntheticNamePrefix}toString;`,
      );
    }

    return Maybe.of(code`\
export function ${syntheticNamePrefix}toString(object: ${this.name}) {
${this.memberTypeSwitch({
  caseBlock: (member) =>
    code`return ${member.toStringExpression({ variables: { value: code`object` } })};`,
  variables: { value: code`object` },
})}
}`);
  }

  private memberTypeSwitch({
    caseBlock,
    variables,
  }: {
    caseBlock: (member: ObjectType) => Code;
    variables: { value: Code };
  }) {
    return code`\
switch (${variables.value}.${this.configuration.objectDiscriminantProperty.name}) {
${joinCode(
  this.members.map(
    (member) =>
      code`case "${member.discriminantProperty.unsafeCoerce().value}": ${caseBlock(member)}`,
  ),
  { on: "\n" },
)}
default: ${variables.value} satisfies never; throw new Error("should never reach this point");
}`;
  }
}
