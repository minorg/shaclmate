import { Maybe } from "purify-ts";
import {
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";

import type { ObjectType } from "../ObjectType.js";

export function fromRdfTypeVariableStatement(
  this: ObjectType,
): Maybe<VariableStatementStructure> {
  if (!this.features.has("rdf")) {
    return Maybe.empty();
  }

  if (this.extern) {
    return Maybe.empty();
  }

  if (this.fromRdfType.isNothing()) {
    return Maybe.empty();
  }

  return Maybe.of({
    declarationKind: VariableDeclarationKind.Const,
    kind: StructureKind.VariableStatement,
    declarations: [
      {
        name: "fromRdfType",
        initializer: this.rdfjsTermExpression(this.fromRdfType.unsafeCoerce()),
        type: "rdfjs.NamedNode<string>",
      },
    ],
    isExported: true,
  } satisfies VariableStatementStructure);
}
