import type { NamedObjectType } from "../NamedObjectType.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const hasherVariable = code`_hasher`;

export function NamedObjectType_hashFunctionDeclarations(
  this: NamedObjectType,
): readonly Code[] {
  if (!this.features.has("hash")) {
    return [];
  }

  const hashOwnShaclPropertiesStatements = this.properties.flatMap(
    (property) =>
      property.kind === "ShaclProperty"
        ? property.hashStatements({
            depth: 0,
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
      code`${parentObjectType.staticModuleName}.${syntheticNamePrefix}hashShaclProperties(${this.thisVariable}, ${hasherVariable});`,
    );
  }
  hashStatements.push(
    code`${this.staticModuleName}.${syntheticNamePrefix}hashShaclProperties(${this.thisVariable}, ${hasherVariable});`,
  );

  hashShaclPropertiesStatements.push(...hashOwnShaclPropertiesStatements);
  hashShaclPropertiesStatements.push(code`return ${hasherVariable};`);

  hashStatements.push(
    ...this.properties
      .filter((property) => property.kind !== "ShaclProperty")
      .flatMap((property) =>
        property.hashStatements({
          depth: 0,
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
export function ${syntheticNamePrefix}hash<HasherT extends ${snippets.Hasher}>(${this.thisVariable}: ${this.name}, ${hasherVariable}: HasherT): HasherT {
  ${joinCode(hashStatements)}
}`,
    code`\
export function ${syntheticNamePrefix}hashShaclProperties<HasherT extends ${snippets.Hasher}>(${this.thisVariable}: ${this.name}, ${hasherVariable}: HasherT): HasherT {
  ${joinCode(hashShaclPropertiesStatements)}
}`,
  ];
}
