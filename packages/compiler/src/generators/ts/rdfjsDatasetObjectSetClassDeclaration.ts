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
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";
import { unsupportedObjectSetMethodDeclarations } from "./unsupportedObjectSetMethodDeclarations.js";

export function rdfjsDatasetObjectSetClassDeclaration({
  objectTypes,
}: {
  objectTypes: readonly ObjectType[];
}): ClassDeclarationStructure {
  const parameters = {
    objectType: {
      name: "objectType",
      type: `{\
  fromRdf: (parameters: { resource: rdfjsResource.Resource }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
  fromRdfType?: rdfjs.NamedNode;
}`,
    } satisfies OptionalKind<ParameterDeclarationStructure>,
    query: {
      hasQuestionToken: true,
      name: "query",
      type: "$ObjectSet.Query<ObjectIdentifierT>",
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
        const methodSignatures = objectSetMethodSignatures({ objectType });

        if (!objectType.features.has("rdf")) {
          return unsupportedObjectSetMethodDeclarations({
            objectSetMethodSignatures: methodSignatures,
          });
        }

        return [
          {
            ...methodSignatures.object,
            isAsync: true,
            kind: StructureKind.Method,
            statements: [
              `return this.${methodSignatures.object.name}Sync(identifier);`,
            ],
          },
          {
            ...methodSignatures.object,
            kind: StructureKind.Method,
            name: `${methodSignatures.object.name}Sync`,
            returnType: `purify.Either<Error, ${objectType.name}>`,
            statements: [
              `return this.${methodSignatures.objects.name}Sync({ where: { identifiers: [identifier], type: "identifiers" } })[0];`,
            ],
          },
          {
            ...methodSignatures.objectIdentifiers,
            isAsync: true,
            kind: StructureKind.Method,
            statements: [
              `return this.${methodSignatures.objectIdentifiers.name}Sync(query);`,
            ],
          },
          {
            ...methodSignatures.objectIdentifiers,
            kind: StructureKind.Method,
            name: `${methodSignatures.objectIdentifiers.name}Sync`,
            returnType: `purify.Either<Error, readonly ${objectType.identifierTypeAlias}[]>`,
            statements: `return purify.Either.of([...this.$objectIdentifiersSync<${objectType.name}, ${objectType.identifierTypeAlias}>(${objectType.staticModuleName}, query)]);`,
          },
          {
            ...methodSignatures.objects,
            isAsync: true,
            kind: StructureKind.Method,
            statements: [
              `return this.${methodSignatures.objects.name}Sync(query);`,
            ],
          },
          {
            ...methodSignatures.objects,
            kind: StructureKind.Method,
            name: `${methodSignatures.objects.name}Sync`,
            returnType: `readonly purify.Either<Error, ${objectType.name}>[]`,
            statements: [
              `return [...this.$objectsSync<${objectType.name}, ${objectType.identifierTypeAlias}>(${objectType.staticModuleName}, query)];`,
            ],
          },
          {
            ...methodSignatures.objectsCount,
            isAsync: true,
            kind: StructureKind.Method,
            statements: [
              `return this.${methodSignatures.objectsCount.name}Sync(query);`,
            ],
          },
          {
            ...methodSignatures.objectsCount,
            kind: StructureKind.Method,
            name: `${methodSignatures.objectsCount.name}Sync`,
            returnType: "purify.Either<Error, number>",
            statements: [
              `return this.$objectsCountSync<${objectType.name}, ${objectType.identifierTypeAlias}>(${objectType.staticModuleName}, query);`,
            ],
          },
        ] satisfies MethodDeclarationStructure[];
      })
      .concat(
        {
          kind: StructureKind.Method,
          isGenerator: true,
          name: "$objectIdentifiersSync",
          parameters: [parameters.objectType, parameters.query],
          returnType: "Generator<ObjectIdentifierT>",
          statements: [
            `\
const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
if (limit <= 0) { return; }

let offset = query?.offset ?? 0;
if (offset < 0) { offset = 0; }

if (query?.where) {
  yield* query.where.identifiers.slice(offset, offset + limit);
  return;
}

if (!objectType.fromRdfType) {
  return;
}

let identifierCount = 0;
let identifierI = 0;
for (const resource of this.resourceSet.instancesOf(objectType.fromRdfType)) {
  if (identifierI++ >= offset) {
     yield resource.identifier as ObjectIdentifierT;
     if (++identifierCount === limit) {
       break;
     }
  }
}
`,
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
            `\
for (const identifier of this.$objectIdentifiersSync<ObjectT, ObjectIdentifierT>(objectType, query)) {
  yield objectType.fromRdf({ resource: this.resourceSet.resource(identifier) });
}
`,
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
            "for (const _ of this.$objectIdentifiersSync<ObjectT, ObjectIdentifierT>(objectType, query)) { count++; }",
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
