import {
  type StatementStructures,
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";

import type { ObjectType } from "../ObjectType.js";
import { objectInitializer } from "../objectInitializer.js";

export function graphqlObjectRefStatements(
  this: ObjectType,
): readonly (StatementStructures | string)[] {
  if (!this.features.has("graphql")) {
    return [];
  }

  if (this.extern) {
    return [];
  }

  return [
    {
      declarationKind: VariableDeclarationKind.Const,
      kind: StructureKind.VariableStatement,
      declarations: [
        {
          name: "graphqlObjectRef",
          initializer: `graphqlSchemaBuilder.objectRef<${this.graphqlName}>("${this.graphqlName}")`,
        },
      ],
      isExported: true,
    } satisfies VariableStatementStructure,
    // From https://pothos-graphql.dev/docs/guide/objects#using-refs
    // When using objectRefs with circular dependencies, ensure that the implement method is called as a separate statement, or typescript may complain about circular references:
    `graphqlObjectRef.implement(${objectInitializer({
      description: this.comment.map(JSON.stringify).extract(),
      fields: `fieldBuilder => ({${this.properties.flatMap((property) =>
        property.graphqlPropertySignature
          .map((graphqlPropertySignature) => {
            return `${graphqlPropertySignature.name}: ${property.graphqlFieldBuilderExpression({ variables: { fieldBuilder: "fieldBuilder" } }).unsafeCoerce()}`;
          })
          .toList(),
      )}})`,
    })})`,
  ];
}
