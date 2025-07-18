import {
  type ClassDeclarationStructure,
  type MethodDeclarationStructure,
  Scope,
  StructureKind,
} from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectSetInterfaceMethodSignaturesByObjectTypeName } from "./objectSetInterfaceDeclaration.js";
import { unsupportedObjectSetMethodDeclarations } from "./unsupportedObjectSetMethodDeclarations.js";

export function rdfjsDatasetObjectSetClassDeclaration({
  objectSetInterfaceMethodSignaturesByObjectTypeName,
  objectTypes,
}: {
  objectSetInterfaceMethodSignaturesByObjectTypeName: ObjectSetInterfaceMethodSignaturesByObjectTypeName;
  objectTypes: readonly ObjectType[];
}): ClassDeclarationStructure {
  return {
    ctors: [
      {
        parameters: [
          {
            name: "{ dataset }",
            type: "{ dataset: rdfjs.DatasetCore }",
          },
        ],
        statements: [
          "this.resourceSet = new rdfjsResource.ResourceSet({ dataset })",
        ],
      },
    ],
    implements: ["$ObjectSet"],
    isExported: true,
    kind: StructureKind.Class,
    name: "$RdfjsDatasetObjectSet",
    methods: objectTypes
      .flatMap((objectType) => {
        const objectSetInterfaceMethodSignatures =
          objectSetInterfaceMethodSignaturesByObjectTypeName[objectType.name];

        if (!objectType.features.has("rdf")) {
          return unsupportedObjectSetMethodDeclarations({
            objectSetInterfaceMethodSignatures,
          });
        }

        return [
          {
            ...objectSetInterfaceMethodSignatures.object,
            isAsync: true,
            kind: StructureKind.Method,
            statements: [
              `return this.${objectSetInterfaceMethodSignatures.object.name}Sync(identifier);`,
            ],
          },
          {
            ...objectSetInterfaceMethodSignatures.object,
            kind: StructureKind.Method,
            name: `${objectSetInterfaceMethodSignatures.object.name}Sync`,
            returnType: `purify.Either<Error, ${objectType.name}>`,
            statements: [
              `return this.${objectSetInterfaceMethodSignatures.objects.name}Sync([identifier])[0];`,
            ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objectIdentifiers,
            isAsync: true,
            kind: StructureKind.Method,
            statements: [
              `return this.${objectSetInterfaceMethodSignatures.objectIdentifiers.name}Sync(options);`,
            ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objectIdentifiers,
            kind: StructureKind.Method,
            name: `${objectSetInterfaceMethodSignatures.objectIdentifiers.name}Sync`,
            parameters: objectType.fromRdfType.isJust()
              ? objectSetInterfaceMethodSignatures.objectIdentifiers.parameters
              : objectSetInterfaceMethodSignatures.objectIdentifiers.parameters!.map(
                  (parameter) => ({ ...parameter, name: `_${parameter.name}` }),
                ),
            returnType: `purify.Either<Error, readonly ${objectType.identifierType.name}[]>`,
            statements: objectType.fromRdfType.isJust()
              ? [
                  `return this.$objectIdentifiersSync<${objectType.identifierType.name}, ${objectType.name}>(this.${objectType.objectSetMethodNames.objects}GeneratorSync(), options);`,
                ]
              : [
                  `return purify.Left(new Error("${objectType.name} has no fromRdfType"));`,
                ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objects,
            isAsync: true,
            kind: StructureKind.Method,
            statements: [
              `return this.${objectSetInterfaceMethodSignatures.objects.name}Sync(identifiers);`,
            ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objects,
            kind: StructureKind.Method,
            name: `${objectSetInterfaceMethodSignatures.objects.name}Sync`,
            returnType: `readonly purify.Either<Error, ${objectType.name}>[]`,
            statements: [
              `return identifiers.map(identifier => ${objectType.staticModuleName}.fromRdf({ resource: this.resourceSet.${objectType.identifierType.isNamedNodeKind ? "namedResource" : "resource"}(identifier) }));`,
            ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objectsCount,
            isAsync: true,
            kind: StructureKind.Method,
            statements: [
              `return this.${objectSetInterfaceMethodSignatures.objectsCount.name}Sync();`,
            ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objectsCount,
            kind: StructureKind.Method,
            name: `${objectSetInterfaceMethodSignatures.objectsCount.name}Sync`,
            returnType: "purify.Either<Error, number>",
            statements: objectType.fromRdfType.isJust()
              ? [
                  `return this.$objectsCountSync(this.${objectType.objectSetMethodNames.objects}GeneratorSync());`,
                ]
              : [
                  `return purify.Left(new Error("${objectType.name} has no fromRdfType"));`,
                ],
          },
          ...(objectType.fromRdfType.isJust()
            ? [
                {
                  isGenerator: true,
                  kind: StructureKind.Method,
                  name: `${objectSetInterfaceMethodSignatures.objects.name}GeneratorSync`,
                  returnType: `Generator<${objectType.name}>`,
                  scope: Scope.Protected,
                  statements: [
                    `for (const resource of this.resourceSet.${objectType.identifierType.isNamedNodeKind ? "namedInstancesOf" : "instancesOf"}(${objectType.staticModuleName}.fromRdfType)) {
                     const object = ${objectType.staticModuleName}.fromRdf({ resource });
                     if (object.isRight()) {
                       yield object.unsafeCoerce();
                     }
                   }`,
                  ],
                } satisfies MethodDeclarationStructure,
              ]
            : []),
        ] satisfies MethodDeclarationStructure[];
      })
      .concat(
        {
          kind: StructureKind.Method,
          name: "$objectIdentifiersSync",
          parameters: [
            {
              name: "objects",
              type: "Iterable<ObjectT>",
            },
            {
              hasQuestionToken: true,
              name: "options",
              type: "{ limit?: number; offset?: number; }",
            },
          ],
          returnType: "purify.Either<Error, readonly IdentifierT[]>",
          statements: [
            "const limit = options?.limit ?? Number.MAX_SAFE_INTEGER;",
            "if (limit <= 0) { return purify.Either.of([]); }",
            "let offset = options?.offset ?? 0;",
            "if (offset < 0) { offset = 0; }",
            "let identifierI = 0;",
            "const result: IdentifierT[] = []",
            `for (const object of objects) {
              if (identifierI++ >= offset) {
                result.push(object.identifier);
              }
              if (result.length === limit) { break; }
             }`,
            "return purify.Either.of(result);",
          ],
          typeParameters: [
            {
              constraint: "rdfjs.BlankNode | rdfjs.NamedNode",
              name: "IdentifierT",
            },
            {
              constraint: "{ readonly identifier: IdentifierT }",
              name: "ObjectT",
            },
          ],
        } satisfies MethodDeclarationStructure,
        {
          kind: StructureKind.Method,
          name: "$objectsCountSync",
          parameters: [
            {
              name: "objects",
              type: "Iterable<ObjectT>",
            },
          ],
          returnType: "purify.Either<Error, number>",
          statements: [
            "let count = 0;",
            "for (const _object of objects) { count++; }",
            "return purify.Either.of(count);",
          ],
          typeParameters: [
            {
              name: "ObjectT",
            },
          ],
          scope: Scope.Protected,
        } satisfies MethodDeclarationStructure,
      ),
    properties: [
      {
        isReadonly: true,
        name: "resourceSet",
        type: "rdfjsResource.ResourceSet",
      },
    ],
  };
}
