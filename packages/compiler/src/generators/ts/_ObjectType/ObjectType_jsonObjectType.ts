import type { AbstractUserDefinedType } from "../AbstractUserDefinedType.js";
import type { Callable } from "../Callable.js";
import { InlineCallable } from "../InlineCallable.js";
import type { ObjectType } from "../ObjectType.js";
import { code, literalOf } from "../ts-poet-wrapper.js";

export function ObjectType_jsonObjectType(
  this: ObjectType,
): AbstractUserDefinedType["jsonObjectType"] {
  // If the JSON object type is { "@id": string }, allow a shorthand of string => that type.
  let shorthand:
    | { transformer: Callable; type: AbstractUserDefinedType.JsonType }
    | undefined;
  this.identifierProperty.ifJust((identifierProperty) => {
    const fromJsonObjectInitializerParameters = {
      variables: { context: code``, jsonObject: code``, options: code`` },
    };
    if (
      this.properties.some(
        (property) =>
          !Object.is(property, identifierProperty) &&
          property
            .fromJsonObjectInitializer(fromJsonObjectInitializerParameters)
            .isJust(),
      )
    ) {
      return;
    }

    shorthand = {
      transformer: new InlineCallable(
        code`(id) => ({ ${literalOf(identifierProperty.jsonObjectMember.unsafeCoerce().name)}: id })`,
      ),
      type: identifierProperty.type.jsonValueType,
    };
  });

  return this.jsonTypeFactory.createJsonObjectType(
    this.properties.flatMap((property) => property.jsonObjectMember.toList()),
    {
      name: this.name.map((name) => [name, "Json"]).extract(),
      shorthand,
    },
  );
}
