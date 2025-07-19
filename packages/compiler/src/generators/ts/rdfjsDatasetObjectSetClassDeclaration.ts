import {
  type ClassDeclarationStructure,
  type MethodDeclarationStructure,
  Scope,
  StructureKind,
} from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectSetInterfaceMethodSignaturesByObjectTypeName } from "./objectSetInterfaceMethodSignaturesByObjectTypeName.js";
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
              `return this.${objectSetInterfaceMethodSignatures.objects.name}Sync({ where: { identifiers: [identifier], type: "identifiers" } })[0];`,
            ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objectIdentifiers,
            isAsync: true,
            kind: StructureKind.Method,
            statements: [
              `return this.${objectSetInterfaceMethodSignatures.objectIdentifiers.name}Sync(query);`,
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
                  `return this.$objectIdentifiersSync<${objectType.name}, ${objectType.identifierType.name}>(this.${objectType.objectSetMethodNames.objects}GeneratorSync(), query);`,
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
              `return this.${objectSetInterfaceMethodSignatures.objects.name}Sync(query);`,
            ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objects,
            kind: StructureKind.Method,
            name: `${objectSetInterfaceMethodSignatures.objects.name}Sync`,
            returnType: `readonly purify.Either<Error, ${objectType.name}>[]`,
            statements: [
              `return this.${objectSetInterfaceMethodSignatures.objectIdentifiers.name}Sync(query).map(identifiers => identifiers.map(identifier => ${objectType.staticModuleName}.fromRdf({ resource: this.resourceSet.${objectType.identifierType.isNamedNodeKind ? "namedResource" : "resource"}(identifier) })));`,
            ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objectsCount,
            isAsync: true,
            kind: StructureKind.Method,
            statements: [
              `return this.${objectSetInterfaceMethodSignatures.objectsCount.name}Sync(query);`,
            ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objectsCount,
            kind: StructureKind.Method,
            name: `${objectSetInterfaceMethodSignatures.objectsCount.name}Sync`,
            returnType: "purify.Either<Error, number>",
            statements: objectType.fromRdfType.isJust()
              ? [
                  `return this.$objectsCountSync(this.${objectType.objectSetMethodNames.objects}GeneratorSync(), query);`,
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
                  returnType: `Generator<purify.Either<Error, ${objectType.name}>`,
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
              name: "query",
              type: "$ObjectSet.Query<ObjectIdentifierT>",
            },
          ],
          returnType: "purify.Either<Error, readonly ObjectIdentifierT[]>",
          statements: [
            "const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;",
            "if (limit <= 0) { return purify.Either.of([]); }",
            "let offset = query?.offset ?? 0;",
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
              constraint: "{ readonly identifier: ObjectIdentifierT }",
              name: "ObjectT",
            },
            {
              constraint: "rdfjs.BlankNode | rdfjs.NamedNode",
              name: "ObjectIdentifierT",
            },
          ],
        } satisfies MethodDeclarationStructure,
        //         {
        //           kind: StructureKind.Method,
        //           name: "$objectsSync",
        //           parameters: [
        //             {
        //               name: "objectType",
        //               type: `{
        // fromRdf: (parameters: { resource: rdfjsResource.Resource<ResourceIdentifierT> }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
        // fromRdfType?: rdfjs.NamedNode;
        //             }`,
        //             },
        //             {
        //               hasQuestionToken: true,
        //               name: "query",
        //               type: "$ObjectSet.Query<ObjectIdentifierT>",
        //             },
        //             {
        //               name: "resourceIdentifierTypes",
        //               type: `Set<"BlankNode" | "NamedNode">`,
        //             },
        //           ],
        //           returnType: "Generator<purify.Either<Error, ObjectT>>",
        //           statements: [
        //             `function* allObjects() {
        //               if (!fromRdfType) { return; }
        //               if (resourceIdentifierTypes.has("BlankNode")) {
        //                 for (const resource of this.resourceSet.instancesOf(fromRdfType)) {
        //                   yield fromRdf({ resource });
        //                 }
        //               } else {
        //                 for (const resource of this.resourceSet.namedInstancesOf(fromRdfType)) {
        //                   yield fromRdf({ resource });
        //                 }
        //               }
        //             }`,
        //             `function* limitObjects(objects: Generator<purify.Either<Error, ObjectT>>) {
        //                const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
        //                if (limit <= 0) { return; }
        //                let objectI = 0;
        //                for (const object of objects) {
        //                  yield object;
        //                  if (++objectI === limit) { break; }
        //                }
        //             }`,
        //             `function* offsetObjects(objects: Generator<purify.Either<Error, ObjectT>>) {
        //                let offset = query?.offset ?? 0;
        //                if (offset < 0) { offset = 0; }
        //                let objectI = 0;
        //                for (const object of objects) {
        //                  if (objectI++ >= offset) {
        //                    yield object;
        //                  }
        //                }
        //             }`,
        //             "if (!query.where) { yield* limitObjects(offsetObjects(allObjects())); return; }",
        //             `if (resourceIdentifierTypes.has("BlankNode")) { return query.where.identifiers.map(identifier => fromRdf({ resource: this.resourceSet.resource(identifier) })); }`,
        //           ],
        //           typeParameters: [
        //             {
        //               constraint: "{ readonly identifier: ObjectIdentifierT }",
        //               name: "ObjectT",
        //             },
        //             {
        //               constraint: "rdfjs.BlankNode | rdfjs.NamedNode",
        //               name: "ObjectIdentifierT",
        //             },
        //             {
        //               constraint: "rdfjs.BlankNode | rdfjs.NamedNode",
        //               name: "ResourceIdentifierT",
        //             },
        //           ],
        //         },
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
