import type {} from "@rdfjs/types";
import { Maybe } from "purify-ts";
import {
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";
import { ObjectType } from "../ObjectType.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import type { Type } from "../Type.js";
import { objectInitializer } from "../objectInitializer.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function propertiesVariableStatement(
  this: ObjectUnionType,
): Maybe<VariableStatementStructure> {
  const commonPropertiesByName: Record<
    string,
    {
      memberTypesWithProperty: boolean[];
      path: ObjectType.ShaclProperty<Type>["path"];
    }
  > = {};

  this.memberTypes.forEach((memberType, memberTypeI) => {
    for (const memberTypeProperty of memberType.ownProperties.concat(
      memberType.ancestorObjectTypes.flatMap(
        (ancestorObjectType) => ancestorObjectType.ownProperties,
      ),
    )) {
      if (!(memberTypeProperty instanceof ObjectType.ShaclProperty)) {
        continue;
      }
      let commonProperty = commonPropertiesByName[memberTypeProperty.name];
      if (commonProperty) {
        if (commonProperty.path.equals(memberTypeProperty.path)) {
          commonProperty.memberTypesWithProperty[memberTypeI] = true;
        }
      } else {
        commonPropertiesByName[memberTypeProperty.name] = commonProperty = {
          memberTypesWithProperty: new Array<boolean>(
            this.memberTypes.length,
          ).fill(false),
          path: memberTypeProperty.path,
        };
        commonProperty.memberTypesWithProperty[memberTypeI] = true;
      }
    }
  });

  const propertiesObject: string[] = [];
  for (const name of Object.keys(commonPropertiesByName).toSorted()) {
    const { memberTypesWithProperty, path } = commonPropertiesByName[name];
    if (!memberTypesWithProperty.every((value) => value)) {
      continue;
    }
    const propertyObject: Record<string, string> = {};
    if (this.features.has("rdf")) {
      propertyObject["identifier"] = rdfjsTermExpression(path);
    }
    propertiesObject.push(`${name}: ${objectInitializer(propertyObject)}`);
  }
  if (propertiesObject.length === 0) {
    return Maybe.empty();
  }

  return Maybe.of({
    declarationKind: VariableDeclarationKind.Const,
    kind: StructureKind.VariableStatement,
    declarations: [
      {
        name: `${syntheticNamePrefix}properties`,
        initializer: `{${propertiesObject.join(", ")}}`,
      },
    ],
    isExported: true,
  } satisfies VariableStatementStructure);
}
