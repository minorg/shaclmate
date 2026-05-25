import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const hasherVariable = code`hasher`;

export function NamedObjectType_hashFunctionDeclarations(
  this: NamedObjectType,
): readonly Code[] {
  if (!this.configuration.features.has("Object.hash")) {
    return [];
  }

  const hashOwnShaclPropertiesStatements = this.properties.flatMap(
    (property) =>
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
  );

  const hashShaclPropertiesStatements: Code[] = [];
  const hashStatements: Code[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    hashShaclPropertiesStatements.push(
      code`${parentObjectType.name}.hashShaclProperties(${hasherVariable}, ${this.thisVariable});`,
    );
  }
  hashStatements.push(
    code`${this.name}.hashShaclProperties(${hasherVariable}, ${this.thisVariable});`,
  );

  hashShaclPropertiesStatements.push(...hashOwnShaclPropertiesStatements);
  hashShaclPropertiesStatements.push(code`return ${hasherVariable};`);

  hashStatements.push(
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
  );
  hashStatements.push(code`return ${hasherVariable};`);

  return [
    code`\
export function hash<HasherT extends ${this.reusables.snippets.Hasher}>(${hasherVariable}: HasherT, ${this.thisVariable}: ${this.name}): HasherT {
  ${joinCode(hashStatements)}
}`,
    code`\
export function hashShaclProperties<HasherT extends ${this.reusables.snippets.Hasher}>(${hasherVariable}: HasherT, ${this.thisVariable}: ${this.name}): HasherT {
  ${joinCode(hashShaclPropertiesStatements)}
}`,
  ];
}
