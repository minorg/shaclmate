import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function toJsonFunctionOrMethodDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  if (
    this.declarationType === "class" &&
    this.ownProperties.length === 0 &&
    this.parentObjectTypes.length > 0
  ) {
    return Maybe.empty();
  }

  const jsonObjectMembers: Code[] = [];
  const parameters: Code[] = [];
  let preamble: string;
  switch (this.declarationType) {
    case "class":
      if (this.parentObjectTypes.length > 0) {
        jsonObjectMembers.push(code`...super.${syntheticNamePrefix}toJson()`);
        preamble = "override ";
      } else {
        preamble = "";
      }
      break;
    case "interface":
      for (const parentObjectType of this.parentObjectTypes) {
        jsonObjectMembers.push(
          code`...${parentObjectType.staticModuleName}.${syntheticNamePrefix}toJson(${this.thisVariable})`,
        );
      }
      parameters.push(code`${this.thisVariable}: ${this.name}`);
      preamble = "export function ";
      break;
  }

  if (this.ownProperties.length > 0) {
    jsonObjectMembers.push(
      ...this.ownProperties.flatMap((property) =>
        property
          .toJsonObjectMemberExpression({
            variables: { value: code`${this.thisVariable}.${property.name}` },
          })
          .toList(),
      ),
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

  return Maybe.of(code`\
${preamble}${syntheticNamePrefix}toJson(${joinCode(parameters, { on: ", " })}): ${this.jsonType().name} {
  return JSON.parse(JSON.stringify({ ${joinCode(jsonObjectMembers, { on: "," })} } satisfies ${this.jsonType().name}));
}`);
}
