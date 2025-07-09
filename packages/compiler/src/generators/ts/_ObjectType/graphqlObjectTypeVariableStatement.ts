import {
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";

import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";

export function graphqlObjectTypeVariableStatement(
  this: ObjectType,
): Maybe<VariableStatementStructure> {
  if (!this.features.has("graphql")) {
    return Maybe.empty();
  }

  if (this.extern) {
    return Maybe.empty();
  }

  return Maybe.of({
    declarationKind: VariableDeclarationKind.Const,
    kind: StructureKind.VariableStatement,
    declarations: [
      {
        name: "GraphQL",
        initializer: `new graphql.GraphQLObjectType<${this.name}>({ name: "${this.name}" })`,
      },
    ],
    isExported: true,
  } satisfies VariableStatementStructure);
}
