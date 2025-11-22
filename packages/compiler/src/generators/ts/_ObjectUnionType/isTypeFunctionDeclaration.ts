import { Maybe } from "purify-ts";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import { logger } from "../../../logger.js";
import type { ObjectType } from "../ObjectType.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";

export function isTypeFunctionDeclaration(
  this: ObjectUnionType,
): Maybe<FunctionDeclarationStructure> {
  let parameterObjectType: ObjectType | undefined;
  for (const memberType of this.memberTypes) {
    let candidateParameterObjectType: ObjectType | undefined;
    if (memberType.ancestorObjectTypes.length === 0) {
      candidateParameterObjectType = memberType.toObjectType();
    } else {
      candidateParameterObjectType =
        memberType.rootAncestorObjectType.extract();
    }
    if (!candidateParameterObjectType) {
      logger.debug(
        "%s.is%s: member %s has no candidate parameter object type",
        this.name,
        this.name,
        memberType.name,
      );
      return Maybe.empty();
    }
    if (!parameterObjectType) {
      parameterObjectType = candidateParameterObjectType;
    } else if (candidateParameterObjectType.name !== parameterObjectType.name) {
      logger.debug(
        "%s.is%s: candidate parameter object types differ: %s vs. %s",
        this.name,
        this.name,
        candidateParameterObjectType.name,
        parameterObjectType.name,
      );
      return Maybe.empty();
    }
  }
  if (!parameterObjectType) {
    logger.debug("%s.is%s: no parameter object type", this.name, this.name);
    return Maybe.empty();
  }

  return Maybe.of({
    isExported: true,
    kind: StructureKind.Function,
    name: `is${this.name}`,
    parameters: [
      {
        name: "object",
        type: parameterObjectType.name,
      },
    ],
    returnType: `object is ${this.name}`,
    statements: [
      `switch (object.${this._discriminatorProperty.name}) { ${this._discriminatorProperty.descendantValues
        .concat(this._discriminatorProperty.ownValues)
        .map((value) => `case "${value}":`)
        .join("\n")} return true; default: return false; }`,
    ],
  });
}
