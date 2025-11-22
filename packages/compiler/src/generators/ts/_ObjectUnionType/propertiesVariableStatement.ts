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
      count: number;
      path: ObjectType.ShaclProperty<Type>["path"];
    }
  > = {};

  for (const memberType of this.memberTypes) {
    for (const memberTypeProperty of memberType.properties) {
      if (!(memberTypeProperty instanceof ObjectType.ShaclProperty)) {
        continue;
      }
      let commonProperty = commonPropertiesByName[memberTypeProperty.name];
      if (commonProperty) {
        if (commonProperty.path.equals(memberTypeProperty.path)) {
          commonProperty.count++;
        }
      } else {
        commonPropertiesByName[memberTypeProperty.name] = commonProperty = {
          count: 1,
          path: memberTypeProperty.path,
        };
      }
    }
  }

  const propertiesObject: string[] = [];
  for (const [name, { count, path }] of Object.entries(
    commonPropertiesByName,
  )) {
    if (count !== this.memberTypes.length) {
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
