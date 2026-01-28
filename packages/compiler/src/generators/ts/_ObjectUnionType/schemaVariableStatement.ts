import {
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";

import type { ObjectType } from "../ObjectType.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import type { Type } from "../Type.js";

export function schemaVariableStatement(
  this: ObjectUnionType,
): VariableStatementStructure {
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

  const propertiesObject: string[] = [];
  for (const name of Object.keys(commonPropertiesByName).toSorted()) {
    const { memberTypesWithProperty, property } = commonPropertiesByName[name];
    if (!memberTypesWithProperty.every((value) => value)) {
      continue;
    }
    propertiesObject.push(`${property.name}: ${property.schema}`);
  }

  return {
    declarationKind: VariableDeclarationKind.Const,
    kind: StructureKind.VariableStatement,
    declarations: [
      {
        name: `${syntheticNamePrefix}schema`,
        initializer: `{ properties: { ${propertiesObject.join(", ")} } } as const`,
      },
    ],
    isExported: true,
  };
}
