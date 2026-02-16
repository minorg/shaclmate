import type { ObjectType } from "../ObjectType.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function schemaVariableStatement(this: ObjectUnionType): Code {
  const commonPropertiesByName: Record<
    string,
    {
      memberTypesWithProperty: boolean[];
      property: ObjectType.ShaclProperty<Type>;
    }
  > = {};

  this.memberTypes.forEach((memberType, memberTypeI) => {
    for (const memberTypeProperty of memberType.ownProperties.concat(
      memberType.ancestorObjectTypes.flatMap(
        (ancestorObjectType) => ancestorObjectType.ownProperties,
      ),
    )) {
      if (memberTypeProperty.kind !== "ShaclProperty") {
        continue;
      }
      let commonProperty = commonPropertiesByName[memberTypeProperty.name];
      if (commonProperty) {
        if (commonProperty.property.path.equals(memberTypeProperty.path)) {
          commonProperty.memberTypesWithProperty[memberTypeI] = true;
        }
      } else {
        commonPropertiesByName[memberTypeProperty.name] = commonProperty = {
          memberTypesWithProperty: new Array<boolean>(
            this.memberTypes.length,
          ).fill(false),
          property: memberTypeProperty,
        };
        commonProperty.memberTypesWithProperty[memberTypeI] = true;
      }
    }
  });

  const propertiesObject: Code[] = [];
  for (const name of Object.keys(commonPropertiesByName).toSorted()) {
    const { memberTypesWithProperty, property } = commonPropertiesByName[name];
    if (!memberTypesWithProperty.every((value) => value)) {
      continue;
    }
    propertiesObject.push(code`${property.name}: ${property.schema}`);
  }

  return code`\
export const ${syntheticNamePrefix}schema = { properties: { ${joinCode(propertiesObject, { on: ", " })} } } as const;`;
}
