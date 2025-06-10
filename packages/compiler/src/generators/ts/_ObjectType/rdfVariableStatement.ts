import { Maybe } from "purify-ts";
import { StructureKind, type VariableStatementStructure } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { objectInitializer } from "../objectInitializer.js";

export function rdfVariableStatement(
  this: ObjectType,
): Maybe<VariableStatementStructure> {
  if (!this.features.has("rdf")) {
    return Maybe.empty();
  }

  if (this.extern) {
    return Maybe.empty();
  }

  const initializer: Record<string, string> = {
    deserialize: "rdfDeserialize",
    deserializeProperties: "rdfDeserializeProperties",
  };
  if (this.declarationType === "interface") {
    initializer["serialize"] = "rdfSerialize";
  }

  return Maybe.of({
    kind: StructureKind.VariableStatement,
    declarations: [
      {
        name: "Rdf",
        initializer: objectInitializer(initializer),
      },
    ],
    isExported: true,
  });
}
