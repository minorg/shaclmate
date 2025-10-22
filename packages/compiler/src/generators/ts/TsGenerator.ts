import { invariant } from "ts-invariant";
import {
  type ImportDeclarationStructure,
  Project,
  type SourceFile,
} from "ts-morph";
import * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";
import { Import } from "./Import.js";
import { ObjectType } from "./ObjectType.js";
import { ObjectUnionType } from "./ObjectUnionType.js";
import { TypeFactory } from "./TypeFactory.js";
import { graphqlSchemaVariableStatement } from "./graphqlSchemaVariableStatement.js";
import { objectSetDeclarations } from "./objectSetDeclarations.js";

export class TsGenerator implements Generator {
  private readonly typeFactory = new TypeFactory();

  generate(ast_: ast.Ast): string {
    const project = new Project({
      useInMemoryFileSystem: true,
    });
    const sourceFile = project.createSourceFile("generated.ts");

    this.addStatements({
      objectTypes: ast.ObjectType.toposort(ast_.objectTypes).flatMap(
        (astObjectType) => {
          const type = this.typeFactory.createTypeFromAstType(astObjectType);
          return type instanceof ObjectType ? [type] : [];
        },
      ),
      objectUnionTypes: ast_.objectUnionTypes.flatMap((astObjectUnionType) => {
        const type = this.typeFactory.createTypeFromAstType(astObjectUnionType);
        return type instanceof ObjectUnionType ? [type] : [];
      }),
      sourceFile,
    });

    sourceFile.saveSync();

    return project.getFileSystem().readFileSync(sourceFile.getFilePath());
  }

  private addStatements({
    objectTypes,
    objectUnionTypes,
    sourceFile,
  }: {
    objectTypes: readonly ObjectType[];
    objectUnionTypes: readonly ObjectUnionType[];
    sourceFile: SourceFile;
  }): void {
    const declaredTypes: (ObjectType | ObjectUnionType)[] = [
      ...objectTypes,
      ...objectUnionTypes,
    ];

    // Gather imports
    const imports: Import[] = [Import.DATA_FACTORY, Import.DATASET_FACTORY];
    for (const declaredType of declaredTypes) {
      imports.push(...declaredType.declarationImports);
    }
    // Deduplicate and add imports
    const stringImports = new Set<string>();
    const structureImports: ImportDeclarationStructure[] = [];
    for (const import_ of imports) {
      if (typeof import_ === "string") {
        stringImports.add(import_);
        continue;
      }

      const importWithSameModuleSpecifier = structureImports.find(
        (structureImport) =>
          structureImport.moduleSpecifier === import_.moduleSpecifier,
      );

      if (!importWithSameModuleSpecifier) {
        structureImports.push(import_);
        continue;
      }

      // Merge named imports
      invariant(!import_.namespaceImport);
      invariant(
        Array.isArray(import_.namedImports) &&
          import_.namedImports.every((value) => typeof value === "string"),
      );
      invariant(!importWithSameModuleSpecifier.namespaceImport);
      invariant(
        Array.isArray(importWithSameModuleSpecifier.namedImports) &&
          importWithSameModuleSpecifier.namedImports.every(
            (value) => typeof value === "string",
          ),
      );
      for (const newNamedImport of import_.namedImports) {
        if (
          !importWithSameModuleSpecifier.namedImports.includes(newNamedImport)
        ) {
          importWithSameModuleSpecifier.namedImports.push(newNamedImport);
        }
      }
    }
    sourceFile.addStatements([...stringImports]);
    sourceFile.addStatements(structureImports);

    // Deduplicate and add snippet declarations
    const addedSnippetDeclarations = new Set<string>();
    for (const declaredType of declaredTypes) {
      for (const snippetDeclaration of declaredType.snippetDeclarations({
        features: declaredType.features,
        recursionStack: [],
      })) {
        if (!addedSnippetDeclarations.has(snippetDeclaration)) {
          sourceFile.addStatements([snippetDeclaration]);
          addedSnippetDeclarations.add(snippetDeclaration);
        }
      }
    }

    for (const objectType of objectTypes) {
      sourceFile.addStatements(objectType.declarations);
    }
    for (const objectUnionType of objectUnionTypes) {
      sourceFile.addStatements(objectUnionType.declarations);
    }

    const objectTypesSortedByName = objectTypes.toSorted((left, right) =>
      left.name.localeCompare(right.name),
    );
    const objectUnionTypesSortedByName = objectUnionTypes.toSorted(
      (left, right) => left.name.localeCompare(right.name),
    );

    sourceFile.addStatements(
      objectSetDeclarations({
        objectTypes: objectTypesSortedByName,
        objectUnionTypes: objectUnionTypesSortedByName,
      }),
    );
    sourceFile.addVariableStatements(
      graphqlSchemaVariableStatement({
        objectTypes: objectTypesSortedByName,
        objectUnionTypes: objectUnionTypesSortedByName,
      }).toList(),
    );
  }
}
