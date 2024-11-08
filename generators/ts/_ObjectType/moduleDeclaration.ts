import {
  type ModuleDeclarationStructure,
  type StatementStructures,
  StructureKind,
} from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { classDeclaration } from "./classDeclaration.js";
import { equalsFunctionDeclaration } from "./equalsFunctionDeclaration.js";
import { fromRdfFunctionDeclaration } from "./fromRdfFunctionDeclaration.js";
import { hashFunctionDeclaration } from "./hashFunctionDeclaration.js";
import { sparqlGraphPatternsClassDeclaration } from "./sparqlGraphPatternsClassDeclaration.js";
import { toRdfFunctionDeclaration } from "./toRdfFunctionDeclaration.js";

export function moduleDeclaration(
  this: ObjectType,
): ModuleDeclarationStructure {
  const statements: StatementStructures[] = [];

  if (this.configuration.features.has("class")) {
    const classDeclaration_ = classDeclaration.bind(this)();
    statements.push(classDeclaration_);
  }

  if (this.configuration.features.has("equals")) {
    statements.push(equalsFunctionDeclaration.bind(this)());
  }

  if (this.configuration.features.has("fromRdf")) {
    statements.push(fromRdfFunctionDeclaration.bind(this)());
  }

  if (this.configuration.features.has("hash")) {
    statements.push(hashFunctionDeclaration.bind(this)());
  }

  if (this.configuration.features.has("sparql-graph-patterns")) {
    if (this.parentObjectTypes.length > 1) {
      throw new RangeError(
        `object type '${this.astName}' has multiple super object types, can't use with SPARQL graph patterns`,
      );
    }

    statements.push(sparqlGraphPatternsClassDeclaration.bind(this)());
  }

  if (this.configuration.features.has("toRdf")) {
    statements.push(toRdfFunctionDeclaration.bind(this)());
  }

  return {
    isExported: true,
    kind: StructureKind.Module,
    name: this.astName,
    statements: statements,
  };
}
