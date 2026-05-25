import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_toJsonFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.toJson")) {
    return Maybe.empty();
  }

  const jsonObjectMembers: Code[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    jsonObjectMembers.push(
      code`...${parentObjectType.name}.toJson(${this.thisVariable})`,
    );
  }

  if (this.properties.length > 0) {
    jsonObjectMembers.push(
      ...this.properties.flatMap((property) =>
        property
          .toJsonInitializer({
            variables: {
              value: property.accessExpression({
                variables: { object: this.thisVariable },
              }),
            },
          })
          .toList(),
      ),
    );
  }

  const returnType = this.jsonType().name;

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
export function toJson(${this.thisVariable}: ${this.name}): ${returnType} {
  return JSON.parse(JSON.stringify({ ${joinCode(jsonObjectMembers, { on: "," })} } satisfies ${this.jsonType().name}));
}`);
}
