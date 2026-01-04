import { Maybe } from "purify-ts";
import {
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { objectInitializer } from "../objectInitializer.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function graphqlTypeVariableStatement(
  this: ObjectUnionType,
): Maybe<VariableStatementStructure> {
  if (!this.features.has("graphql")) {
    return Maybe.empty();
  }

  return Maybe.of({
    declarationKind: VariableDeclarationKind.Const,
    kind: StructureKind.VariableStatement,
    declarations: [
      {
        name: `${syntheticNamePrefix}GraphQL`,
        initializer: `new graphql.GraphQLUnionType(${objectInitializer({
          description: this.comment.map(JSON.stringify).extract(),
          name: `"${this.name}"`,
          resolveType: `(value: ${this.name}) => value.${syntheticNamePrefix}type`,
          types: `[${this.memberTypes.map((memberType) => memberType.graphqlType.nullableName).join(", ")}]`,
        })})`,
      },
    ],
    isExported: true,
  } satisfies VariableStatementStructure);
}
