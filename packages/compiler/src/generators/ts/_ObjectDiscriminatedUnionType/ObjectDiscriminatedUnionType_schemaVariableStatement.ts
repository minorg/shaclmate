import { PropertyPath } from "@rdfx/resource";
import type { ObjectDiscriminatedUnionType } from "../ObjectDiscriminatedUnionType.js";
import type { ObjectType } from "../ObjectType.js";
import { singleEntryRecord } from "../singleEntryRecord.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectDiscriminatedUnionType_schemaVariableStatement(
  this: ObjectDiscriminatedUnionType,
): Record<string, Code> {
  if (!this.configuration.features.has("Object.schema")) {
    return {};
  }

  const commonPropertiesByName: Record<
    string,
    {
      memberTypesWithProperty: boolean[];
      property: ObjectType.ShaclProperty<Type>;
    }
  > = {};

  this.members.forEach((member, memberI) => {
    for (const memberTypeProperty of member.type.properties) {
      if (memberTypeProperty.kind !== "Shacl") {
        continue;
      }
      let commonProperty = commonPropertiesByName[memberTypeProperty.name];
      if (commonProperty) {
        if (
          PropertyPath.equals(
            commonProperty.property.path,
            memberTypeProperty.path,
          )
        ) {
          commonProperty.memberTypesWithProperty[memberI] = true;
        }
      } else {
        commonPropertiesByName[memberTypeProperty.name] = commonProperty = {
          memberTypesWithProperty: new Array<boolean>(this.members.length).fill(
            false,
          ),
          property: memberTypeProperty,
        };
        commonProperty.memberTypesWithProperty[memberI] = true;
      }
    }
  });

  const propertiesObject: Code[] = [];
  for (const name of Object.keys(commonPropertiesByName).toSorted()) {
    const { memberTypesWithProperty, property } = commonPropertiesByName[name];
    if (!memberTypesWithProperty.every((value) => value)) {
      continue;
    }
    property.schema.ifJust((propertySchema) => {
      propertiesObject.push(code`${property.name}: ${propertySchema}`);
    });
  }

  return singleEntryRecord(
    `schema`,
    code`\
export const schema = { ${joinCode(this.schemaInitializers.concat(code`properties: { ${joinCode(propertiesObject, { on: ", " })} }`), { on: ", " })} } as const;`,
  );
}
