import { invariant } from "ts-invariant";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_fromJsonFunctionExpression(this: ObjectType): Code {
  const variables = {
    jsonObject: code`${this.configuration.syntheticNamePrefix}json`,
  };

  const propertyInitializers = this.properties.flatMap((property) =>
    property.fromJsonInitializer({ variables }).toList(),
  );
  invariant(propertyInitializers.length > 0);

  return code`\
((${variables.jsonObject}) => ${this.reusables.snippets.sequenceRecord}({ ${joinCode(propertyInitializers, { on: "," })} }).chain(create))`;
}
