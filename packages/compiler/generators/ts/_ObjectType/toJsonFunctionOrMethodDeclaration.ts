import { Maybe } from "purify-ts";
import type { OptionalKind, ParameterDeclarationStructure } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";

export function toJsonFunctionOrMethodDeclaration(this: ObjectType): Maybe<{
  name: string;
  parameters: OptionalKind<ParameterDeclarationStructure>[];
  returnType: string;
  statements: string[];
}> {
  if (!this.features.has("toJson")) {
    return Maybe.empty();
  }

  if (
    this.declarationType === "class" &&
    this.ownProperties.length === 0 &&
    this.parentObjectTypes.length > 0
  ) {
    return Maybe.empty();
  }

  const jsonObjectMembers: string[] = [];
  const parameters: OptionalKind<ParameterDeclarationStructure>[] = [];
  const returnType: string[] = [];

  switch (this.declarationType) {
    case "class":
      if (this.parentObjectTypes.length > 0) {
        jsonObjectMembers.push("...super.toJson()");
      }
      break;
    case "interface":
      for (const parentObjectType of this.parentObjectTypes) {
        jsonObjectMembers.push(
          `...${parentObjectType.name}.toJson(${this.thisVariable});`,
        );
      }
      parameters.push({
        name: this.thisVariable,
        type: this.name,
      });
      break;
  }

  for (const parentObjectType of this.parentObjectTypes) {
    returnType.push(parentObjectType.jsonName);
  }

  if (this.ownProperties.length > 0) {
    for (const property of this.ownProperties) {
      jsonObjectMembers.push(
        property.toJsonObjectMember({
          variables: { value: `${this.thisVariable}.${property.name}` },
        }),
      );
    }

    returnType.splice(
      0,
      0,
      `{ ${this.ownProperties
        .map((property) => {
          const propertySignature = property.jsonPropertySignature;
          return `readonly "${propertySignature.name}": ${propertySignature.type}`;
        })
        .join("; ")} }`,
    );
  }

  // 20241220: don't add @type until we're doing JSON-LD
  // switch (this.toRdfTypes.length) {
  //   case 0:
  //     break;
  //   case 1:
  //     jsonObjectMembers.push(`"@type": "${this.toRdfTypes[0].value}"`);
  //     break;
  //   default:
  //     jsonObjectMembers.push(
  //       `"@type": ${JSON.stringify(this.toRdfTypes.map((rdfType) => rdfType.value))}`,
  //     );
  //     break;
  // }

  return Maybe.of({
    name: "toJson",
    parameters,
    returnType: returnType.length > 0 ? returnType.join(" & ") : "object",
    statements: [
      `return JSON.parse(JSON.stringify({ ${jsonObjectMembers.join(",")} } satisfies ${this.jsonName}));`,
    ],
  });
}
