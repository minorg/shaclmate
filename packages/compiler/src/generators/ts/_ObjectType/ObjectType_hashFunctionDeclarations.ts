import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const hasherVariable = code`hasher`;

export function ObjectType_hashFunctionDeclarations(
  this: ObjectType,
): readonly Code[] {
  if (!this.configuration.features.has("Object.hash")) {
    return [];
  }

  return [
    code`\
export function hash<HasherT extends ${this.reusables.snippets.Hasher}>(${hasherVariable}: HasherT, ${this.thisVariable}: ${this.expression}): HasherT {
  ${joinCode([
    code`${this.name.unsafeCoerce()}.hashShaclProperties(${hasherVariable}, ${this.thisVariable});`,
    ...this.properties
      .filter((property) => property.kind !== "Shacl")
      .flatMap((property) =>
        property.hashStatements({
          variables: {
            hasher: hasherVariable,
            value: code`${property.accessExpression({ variables: { object: this.thisVariable } })}`,
          },
        }),
      ),
    code`return ${hasherVariable};`,
  ])}
}`,
    code`\
export function hashShaclProperties<HasherT extends ${this.reusables.snippets.Hasher}>(${hasherVariable}: HasherT, ${this.thisVariable}: ${this.expression}): HasherT {
  ${joinCode([
    ...this.properties.flatMap((property) =>
      property.kind === "Shacl"
        ? property.hashStatements({
            variables: {
              hasher: hasherVariable,
              value: property.accessExpression({
                variables: { object: this.thisVariable },
              }),
            },
          })
        : [],
    ),
    code`return ${hasherVariable};`,
  ])}
}`,
  ];
}
