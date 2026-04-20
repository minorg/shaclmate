import { Maybe } from "purify-ts";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import type { ObjectType } from "./ObjectType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";
import { UnionType } from "./UnionType.js";

export class NewObjectUnionType extends UnionType<ObjectType> {
  private readonly identifierType: BlankNodeType | IdentifierType | IriType;
  readonly #alias: string;

  constructor({
    identifierType,
    name,
    ...superParameters
  }: {
    identifierType: BlankNodeType | IdentifierType | IriType;
    name: string;
  } & Omit<ConstructorParameters<typeof UnionType<ObjectType>>[0], "name">) {
    super({ ...superParameters, name: Maybe.of(name) });
    this.identifierType = identifierType;
    this.#alias = name;
  }

  protected override get staticModuleDeclarations(): readonly Code[] {
    let staticModuleDeclarations = super.staticModuleDeclarations.concat();

    staticModuleDeclarations = staticModuleDeclarations.concat(
      code`export type ${syntheticNamePrefix}Identifier = ${this.identifierType.name};`,
      code`export namespace ${syntheticNamePrefix}Identifier { ${joinCode([this.identifierType.fromStringFunction, this.identifierType.toStringFunction])} }`,
    );

    if (this.#alias !== `${syntheticNamePrefix}Object`) {
      staticModuleDeclarations.push(code`\
    export function is${this.#alias}(object: ${syntheticNamePrefix}Object): object is ${this.name} {
      return ${joinCode(
        this.memberTypes.map(
          (memberType) =>
            code`${memberType.staticModuleName}.is${memberType.name}(object)`,
        ),
        { on: " || " },
      )};
    }`);
    }

    return staticModuleDeclarations;
  }
}
