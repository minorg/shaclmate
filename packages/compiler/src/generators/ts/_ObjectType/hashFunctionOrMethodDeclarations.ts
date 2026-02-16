import type { ObjectType } from "../ObjectType.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const hasherVariable = code`_hasher`;

export function hashFunctionOrMethodDeclarations(
  this: ObjectType,
): readonly Code[] {
  if (!this.features.has("hash")) {
    return [];
  }

  const hashOwnShaclPropertiesStatements = this.ownShaclProperties.flatMap(
    (property) =>
      property.hashStatements({
        depth: 0,
        variables: {
          hasher: hasherVariable,
          value: code`${this.thisVariable}.${property.name}`,
        },
      }),
  );

  if (
    this.declarationType === "class" &&
    this.parentObjectTypes.length > 0 &&
    hashOwnShaclPropertiesStatements.length === 0
  ) {
    // If there's a parent class and no hash statements in this class, can skip overriding hash
    return [];
  }

  const hashShaclPropertiesStatements: Code[] = [];
  const hashStatements: Code[] = [];
  const parameters: Code[] = []; // Same between the two functions
  let hashPreamble: string = "";
  let hashShaclPropertiesPreamble: string = "";
  switch (this.declarationType) {
    case "class": {
      if (this.parentObjectTypes.length > 0) {
        hashShaclPropertiesStatements.push(
          code`super.${syntheticNamePrefix}hashShaclProperties(${hasherVariable});`,
        );
        hashShaclPropertiesPreamble = "override ";
        hashPreamble = "override ";
      }
      hashShaclPropertiesPreamble = `protected ${hashShaclPropertiesPreamble}`;
      hashStatements.push(
        code`this.${syntheticNamePrefix}hashShaclProperties(${hasherVariable});`,
      );

      break;
    }
    case "interface": {
      for (const parentObjectType of this.parentObjectTypes) {
        hashShaclPropertiesStatements.push(
          code`${parentObjectType.staticModuleName}.${syntheticNamePrefix}hashShaclProperties(${this.thisVariable}, ${hasherVariable});`,
        );
      }
      parameters.push(code`${this.thisVariable}: ${this.name}`);
      hashPreamble = hashShaclPropertiesPreamble = "export function ";
      hashStatements.push(
        code`${this.staticModuleName}.${syntheticNamePrefix}hashShaclProperties(${this.thisVariable}, ${hasherVariable});`,
      );
      break;
    }
  }

  parameters.push(code`${hasherVariable}: HasherT`);
  const parametersCode = joinCode(parameters, { on: "," });

  hashShaclPropertiesStatements.push(...hashOwnShaclPropertiesStatements);
  hashShaclPropertiesStatements.push(code`return ${hasherVariable};`);

  hashStatements.push(
    ...this.ownProperties
      .filter((property) => property.kind !== "ShaclProperty")
      .flatMap((property) =>
        property.hashStatements({
          depth: 0,
          variables: {
            hasher: hasherVariable,
            value: code`${this.thisVariable}.${property.name}`,
          },
        }),
      ),
  );
  hashStatements.push(code`return ${hasherVariable};`);

  return [
    code`\
${hashPreamble}${syntheticNamePrefix}hash<HasherT extends ${snippets.Hasher}>(${parametersCode}): HasherT {
  ${joinCode(hashStatements)}
}`,
    code`\
${hashShaclPropertiesPreamble}${syntheticNamePrefix}hashShaclProperties<HasherT extends ${snippets.Hasher}>(${parametersCode}): HasherT {
  ${joinCode(hashShaclPropertiesStatements)}
}`,
  ];
}
