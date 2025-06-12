import {
  type ImportDeclarationStructure,
  Project,
  type SourceFile,
  StructureKind,
  VariableDeclarationKind,
} from "ts-morph";

import * as ast from "../../ast/index.js";

import type { Generator } from "../Generator.js";
import type { Import } from "./Import.js";
import { ObjectType } from "./ObjectType.js";
import { ObjectUnionType } from "./ObjectUnionType.js";
import { TypeFactory } from "./TypeFactory.js";
import { objectInitializer } from "./objectInitializer.js";

export class TsGenerator implements Generator {
  generate(ast_: ast.Ast): string {
    const project = new Project({
      useInMemoryFileSystem: true,
    });
    const sourceFile = project.createSourceFile("generated.ts");

    const typeFactory = new TypeFactory({
      dataFactoryVariable: ast_.tsDataFactoryVariable,
    });

    this.addDeclarations({
      objectTypes: ast.ObjectType.toposort(ast_.objectTypes).flatMap(
        (astObjectType) => {
          const type = typeFactory.createTypeFromAstType(astObjectType);
          return type instanceof ObjectType ? [type] : [];
        },
      ),
      objectUnionTypes: ast_.objectUnionTypes.flatMap((astObjectUnionType) => {
        const type = typeFactory.createTypeFromAstType(astObjectUnionType);
        return type instanceof ObjectUnionType ? [type] : [];
      }),
      sourceFile,
    });

    sourceFile.saveSync();

    return project.getFileSystem().readFileSync(sourceFile.getFilePath());
  }

  private addDeclarations({
    objectTypes,
    objectUnionTypes,
    sourceFile,
  }: {
    objectTypes: readonly ObjectType[];
    objectUnionTypes: readonly ObjectUnionType[];
    sourceFile: SourceFile;
  }): void {
    // sourceFile.addStatements(this.configuration.dataFactoryImport);
    sourceFile.addStatements('import { DataFactory as dataFactory } from "n3"');

    const declaredTypes: (ObjectType | ObjectUnionType)[] = [
      ...objectTypes,
      ...objectUnionTypes,
    ];

    // Gather imports
    const imports: Import[] = [];
    for (const declaredType of declaredTypes) {
      imports.push(...declaredType.declarationImports);
    }
    // Deduplicate and add imports
    const addedStringImports = new Set<string>();
    const addedStructureImports: ImportDeclarationStructure[] = [];
    for (const import_ of imports) {
      if (typeof import_ === "string") {
        if (!addedStringImports.has(import_)) {
          sourceFile.addStatements([import_]);
        }
        addedStringImports.add(import_);
        continue;
      }

      if (
        !addedStructureImports.find(
          (addedStructureImport) =>
            addedStructureImport.moduleSpecifier === import_.moduleSpecifier,
        )
      ) {
        sourceFile.addStatements([import_]);
        addedStructureImports.push(import_);
      }
    }

    // Deduplicate and add snippet declarations
    const addedSnippetDeclarations = new Set<string>();
    for (const declaredType of declaredTypes) {
      for (const snippetDeclaration of declaredType.snippetDeclarations(
        declaredType.features,
      )) {
        if (!addedSnippetDeclarations.has(snippetDeclaration)) {
          sourceFile.addStatements([snippetDeclaration]);
          addedSnippetDeclarations.add(snippetDeclaration);
        }
      }
    }

    // Add declarations
    for (const objectType of objectTypes) {
      sourceFile.addStatements(objectType.declarations);
    }
    for (const objectUnionType of objectUnionTypes) {
      sourceFile.addStatements(objectUnionType.declarations);
    }

    sourceFile.addVariableStatements([
      {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            kind: StructureKind.VariableDeclaration,
            name: "$ObjectTypes",
            initializer: objectInitializer(
              objectTypes
                .toSorted((left, right) => left.name.localeCompare(right.name))
                .reduce(
                  (pointers, objectType) => {
                    pointers[objectType.name!] = objectType.staticModuleName;
                    return pointers;
                  },
                  {} as Record<string, string>,
                ),
            ),
          },
          {
            kind: StructureKind.VariableDeclaration,
            name: "$ObjectUnionTypes",
            initializer: objectInitializer(
              objectUnionTypes
                .toSorted((left, right) => left.name.localeCompare(right.name))
                .reduce(
                  (pointers, objectUnionType) => {
                    pointers[objectUnionType.name!] =
                      objectUnionType.staticModuleName;
                    return pointers;
                  },
                  {} as Record<string, string>,
                ),
            ),
          },
          {
            kind: StructureKind.VariableDeclaration,
            name: "$Types",
            initializer: "{ ...$ObjectTypes, ...$ObjectUnionTypes }",
          },
        ],
        isExported: true,
      },
    ]);
  }
}
