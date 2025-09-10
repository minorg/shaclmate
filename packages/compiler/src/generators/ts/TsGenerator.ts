import {
  type ImportDeclarationStructure,
  Project,
  type SourceFile,
} from "ts-morph";

import N3 from "n3";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import * as ast from "../../ast/index.js";
import type { TsFeature } from "../../enums/TsFeature.js";
import type { Generator } from "../Generator.js";
import type { Import } from "./Import.js";
import { ObjectType } from "./ObjectType.js";
import { ObjectUnionType } from "./ObjectUnionType.js";
import { TypeFactory } from "./TypeFactory.js";
import { graphqlSchemaVariableStatement } from "./graphqlSchemaVariableStatement.js";
import { objectSetDeclarations } from "./objectSetDeclarations.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class TsGenerator implements Generator {
  private readonly typeFactory = new TypeFactory();

  generate(ast_: ast.Ast): string {
    const project = new Project({
      useInMemoryFileSystem: true,
    });
    const sourceFile = project.createSourceFile("generated.ts");

    this.addStatements({
      objectTypes: this.synthesizeObjectTypes({
        astObjectTypes: ast_.objectTypes,
      }).concat(
        ast.ObjectType.toposort(ast_.objectTypes).flatMap((astObjectType) => {
          const type = this.typeFactory.createTypeFromAstType(astObjectType);
          return type instanceof ObjectType ? [type] : [];
        }),
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
    // sourceFile.addStatements(this.configuration.dataFactoryImport);
    sourceFile.addStatements(
      'import N3, { DataFactory as dataFactory } from "n3"',
    );

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

  private synthesizeObjectTypes({
    astObjectTypes,
  }: { astObjectTypes: readonly ast.ObjectType[] }): readonly ObjectType[] {
    const synthesizeStubObjectType = ({
      features,
      identifierKinds,
      name,
    }: {
      features: Set<TsFeature>;
      identifierKinds: Set<"BlankNode" | "NamedNode">;
      name: string;
    }): ObjectType =>
      this.typeFactory.createObjectTypeFromAstType({
        abstract: false,
        ancestorObjectTypes: [],
        childObjectTypes: [],
        comment: Maybe.empty(),
        descendantObjectTypes: [],
        export: true,
        extern: false,
        fromRdfType: Maybe.empty(),
        identifierIn: [],
        identifierKinds,
        identifierMintingStrategy: Maybe.empty(),
        kind: "ObjectType",
        label: Maybe.empty(),
        name: {
          identifier: N3.DataFactory.blankNode(),
          label: Maybe.empty(),
          propertyPath: Maybe.empty(),
          shName: Maybe.empty(),
          shaclmateName: Maybe.empty(),
          syntheticName: Maybe.of(name),
        },
        parentObjectTypes: [],
        properties: [],
        toRdfTypes: [],
        tsFeatures: features,
        tsImports: [],
        tsObjectDeclarationType: "class",
      } satisfies ast.ObjectType);

    let defaultStubObjectType: ObjectType | undefined;
    let namedDefaultStubObjectType: ObjectType | undefined;
    for (const astObjectType of astObjectTypes) {
      if (!astObjectType.properties.some((property) => property.lazy)) {
        continue;
      }

      if (
        astObjectType.identifierKinds.size === 1 &&
        astObjectType.identifierKinds.has("NamedNode")
      ) {
        if (!namedDefaultStubObjectType) {
          namedDefaultStubObjectType = synthesizeStubObjectType({
            features: astObjectType.tsFeatures,
            identifierKinds: astObjectType.identifierKinds,
            name: `${syntheticNamePrefix}NamedDefaultStub`,
          });
        }
      } else if (!defaultStubObjectType) {
        invariant(astObjectType.identifierKinds.size === 2);
        defaultStubObjectType = synthesizeStubObjectType({
          features: astObjectType.tsFeatures,
          identifierKinds: astObjectType.identifierKinds,
          name: `${syntheticNamePrefix}DefaultStub`,
        });
      }

      if (defaultStubObjectType && namedDefaultStubObjectType) {
        break;
      }
    }

    const syntheticObjectTypes: ObjectType[] = [];
    if (defaultStubObjectType) {
      syntheticObjectTypes.push(defaultStubObjectType);
    }
    if (namedDefaultStubObjectType) {
      syntheticObjectTypes.push(namedDefaultStubObjectType);
    }

    return syntheticObjectTypes;
  }
}
