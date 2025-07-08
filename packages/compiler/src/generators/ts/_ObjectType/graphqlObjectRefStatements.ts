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

  const statements: (StatementStructures | string)[] = [
    {
      declarationKind: VariableDeclarationKind.Const,
      kind: StructureKind.VariableStatement,
      declarations: [
        {
          name: "graphqlObjectRef",
          initializer: `graphqlSchemaBuilder.objectRef<object>("${this.graphqlName}")`,
        },
      ],
      isExported: true,
    } satisfies VariableStatementStructure,
  ];

  // From https://pothos-graphql.dev/docs/guide/objects#using-refs
  // When using objectRefs with circular dependencies, ensure that the implement method is called as a separate statement, or typescript may complain about circular references:
  statements.push(
    `graphqlObjectRef.implement(${objectInitializer({
      description: this.comment.map(JSON.stringify).extract(),
      fields: "fieldBuilder => ({})",
    })})`,
  );

  return statements;
}
