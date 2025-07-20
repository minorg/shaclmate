import {
  type ClassDeclarationStructure,
  type MethodDeclarationStructure,
  type OptionalKind,
  type ParameterDeclarationStructure,
  Scope,
  StructureKind,
  type TypeParameterDeclarationStructure,
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
  const parameters = {
    query: {
      hasQuestionToken: true,
      name: "query",
      type: "$ObjectSet.Query<ObjectIdentifierT>",
    } satisfies OptionalKind<ParameterDeclarationStructure>,
    objectType: {
      name: "objectType",
      type: `{\
  fromRdf: (parameters: { resource: rdfjsResource.Resource }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
  fromRdfType?: rdfjs.NamedNode;
}`,
    } satisfies OptionalKind<ParameterDeclarationStructure>,
  };

  const typeParameters: OptionalKind<TypeParameterDeclarationStructure>[] = [
    {
      constraint: "{ readonly identifier: ObjectIdentifierT }",
      name: "ObjectT",
    },
    {
      constraint: "rdfjs.BlankNode | rdfjs.NamedNode",
      name: "ObjectIdentifierT",
    },
  ];

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
            returnType: `purify.Either<Error, readonly ${objectType.identifierType.name}[]>`,
            statements: `return this.$objectIdentifiersSync<${objectType.name}, ${objectType.identifierType.name}>(${objectType.staticModuleName}, query);`,
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
              `return [...this.$objectsSync<${objectType.name}, ${objectType.identifierType.name}>(${objectType.staticModuleName}, query)];`,
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
            statements: [
              `return this.$objectsCountSync<${objectType.name}, ${objectType.identifierType.name}>(${objectType.staticModuleName}, query);`,
            ],
          },
        ] satisfies MethodDeclarationStructure[];
      })
      .concat(
        {
          kind: StructureKind.Method,
          name: "$objectIdentifiersSync",
          parameters: [parameters.objectType, parameters.query],
          returnType: "purify.Either<Error, readonly ObjectIdentifierT[]>",
          statements: [
            "const result: ObjectIdentifierT[] = [];",
            `for (const object of this.$objectsSync<ObjectT, ObjectIdentifierT>(objectType, query)) {
              object.ifRight(object => {
                result.push(object.identifier);
              });
             }`,
            "return purify.Either.of(result);",
          ],
          typeParameters,
        } satisfies MethodDeclarationStructure,
        {
          isGenerator: true,
          kind: StructureKind.Method,
          name: "$objectsSync",
          parameters: [parameters.objectType, parameters.query],
          returnType: "Generator<purify.Either<Error, ObjectT>>",
          statements: [
            "const resourceSet = this.resourceSet",
            `function* allObjects() {
                if (!objectType.fromRdfType) { return; }
                for (const resource of resourceSet.instancesOf(objectType.fromRdfType)) {
                  yield objectType.fromRdf({ resource });
                }
              }`,
            `function* limitObjects(objects: Generator<purify.Either<Error, ObjectT>>) {
                const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
                if (limit <= 0) { return; }
                let objectI = 0;
                for (const object of objects) {
                  yield object;
                  if (++objectI === limit) { break; }
                }
             }`,
            `function* offsetObjects(objects: Generator<purify.Either<Error, ObjectT>>) {
                let offset = query?.offset ?? 0;
                if (offset < 0) { offset = 0; }
                let objectI = 0;
                for (const object of objects) {
                  if (objectI++ >= offset) {
                    yield object;
                  }
                }
              }`,
            "if (!query?.where) { yield* limitObjects(offsetObjects(allObjects())); return; }",
            "return query.where.identifiers.map(identifier => objectType.fromRdf({ resource: this.resourceSet.resource(identifier) }));",
          ],
          typeParameters,
        },
        {
          kind: StructureKind.Method,
          name: "$objectsCountSync",
          parameters: [parameters.objectType, parameters.query],
          returnType: "purify.Either<Error, number>",
          statements: [
            "let count = 0;",
            "for (const _object of this.$objectsSync<ObjectT, ObjectIdentifierT>(objectType, query)) { count++; }",
            "return purify.Either.of(count);",
          ],
          typeParameters,
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
