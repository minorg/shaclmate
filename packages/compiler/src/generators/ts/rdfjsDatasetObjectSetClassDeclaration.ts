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
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";
import { unsupportedObjectSetMethodDeclarations } from "./unsupportedObjectSetMethodDeclarations.js";

export function rdfjsDatasetObjectSetClassDeclaration({
  objectTypes,
  objectUnionTypes,
}: {
  objectTypes: readonly ObjectType[];
  objectUnionTypes: readonly ObjectUnionType[];
}): ClassDeclarationStructure {
  const typeParameters = {
    ObjectT: {
      constraint: "{ readonly identifier: ObjectIdentifierT }",
      name: "ObjectT",
    } satisfies OptionalKind<TypeParameterDeclarationStructure>,
    ObjectIdentifierT: {
      constraint: "rdfjs.BlankNode | rdfjs.NamedNode",
      name: "ObjectIdentifierT",
    } satisfies OptionalKind<TypeParameterDeclarationStructure>,
  };

  const fromRdfFunctionType = `(parameters: { resource: rdfjsResource.Resource }) => purify.Either<rdfjsResource.Resource.ValueError, ${typeParameters.ObjectT.name}>`;

  const reusableMethodDeclarations: MethodDeclarationStructure[] = [];
  if (objectTypes.length > 0) {
    const parameters = {
      objectType: {
        name: "objectType",
        type: `{ fromRdf: ${fromRdfFunctionType}; fromRdfType?: rdfjs.NamedNode }`,
      } satisfies OptionalKind<ParameterDeclarationStructure>,
      query: {
        hasQuestionToken: true,
        name: "query",
        type: `$ObjectSet.Query<${typeParameters.ObjectIdentifierT.name}>`,
      } satisfies OptionalKind<ParameterDeclarationStructure>,
    };

    reusableMethodDeclarations.push(
      {
        kind: StructureKind.Method,
        isGenerator: true,
        name: "$objectIdentifiersSync",
        parameters: [parameters.objectType, parameters.query],
        returnType: `Generator<${typeParameters.ObjectIdentifierT.name}>`,
        scope: Scope.Protected,
        statements: [
          `\
for (const object of this.$objectsSync<${typeParameters.ObjectT.name}, ${typeParameters.ObjectIdentifierT.name}>(${parameters.objectType.name}, ${parameters.query.name})) {
  if (object.isRight()) {
    yield object.unsafeCoerce().identifier;
  }
}
`,
        ],
        typeParameters: [
          typeParameters.ObjectT,
          typeParameters.ObjectIdentifierT,
        ],
      },
      {
        isGenerator: true,
        kind: StructureKind.Method,
        name: "$objectsSync",
        parameters: [parameters.objectType, parameters.query],
        returnType: `Generator<purify.Either<Error, ${typeParameters.ObjectT.name}>>`,
        scope: Scope.Protected,
        statements: [
          `\
const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
if (limit <= 0) { return; }

let offset = query?.offset ?? 0;
if (offset < 0) { offset = 0; }

if (query?.where) {
  for (const identifier of query.where.identifiers.slice(offset, offset + limit)) {
    yield objectType.fromRdf({ resource: this.resourceSet.resource(identifier) });
  }
  return;
}

if (!objectType.fromRdfType) {
  return;
}

const resources = [...this.resourceSet.instancesOf(objectType.fromRdfType)];
// Sort resources by identifier so limit and offset are deterministic
resources.sort((left, right) => left.identifier.value.localeCompare(right.identifier.value));

let objectCount = 0;
let objectI = 0;
for (const resource of resources) {
  const object = objectType.fromRdf({ resource });
  if (object.isLeft()) {
    continue;
  }
  if (objectI++ >= offset) {
     yield object;
     if (++objectCount === limit) {
       return;
     }
  }
}`,
        ],
        typeParameters: [
          typeParameters.ObjectT,
          typeParameters.ObjectIdentifierT,
        ],
      },
      {
        kind: StructureKind.Method,
        name: "$objectsCountSync",
        parameters: [parameters.objectType, parameters.query],
        returnType: "purify.Either<Error, number>",
        scope: Scope.Protected,
        statements: [
          "let count = 0;",
          `for (const _ of this.$objectIdentifiersSync<${typeParameters.ObjectT.name}, ${typeParameters.ObjectIdentifierT.name}>(${parameters.objectType.name}, ${parameters.query.name})) { count++; }`,
          "return purify.Either.of(count);",
        ],
        typeParameters: [
          typeParameters.ObjectT,
          typeParameters.ObjectIdentifierT,
        ],
      },
    );
  }

  if (objectUnionTypes.length > 0) {
    const objectTypeType = `{ fromRdf: ${fromRdfFunctionType}; fromRdfType?: rdfjs.NamedNode }`;

    const parameters = {
      objectTypes: {
        name: "objectTypes",
        type: `readonly ${objectTypeType}[]`,
      } satisfies OptionalKind<ParameterDeclarationStructure>,
      query: {
        hasQuestionToken: true,
        name: "query",
        type: `$ObjectSet.Query<${typeParameters.ObjectIdentifierT.name}>`,
      } satisfies OptionalKind<ParameterDeclarationStructure>,
    };

    reusableMethodDeclarations.push(
      {
        kind: StructureKind.Method,
        isGenerator: true,
        name: "$objectUnionIdentifiersSync",
        parameters: [parameters.objectTypes, parameters.query],
        returnType: `Generator<${typeParameters.ObjectIdentifierT.name}>`,
        scope: Scope.Protected,
        statements: [
          `\
for (const object of this.$objectUnionsSync<${typeParameters.ObjectT.name}, ${typeParameters.ObjectIdentifierT.name}>(${parameters.objectTypes.name}, ${parameters.query.name})) {
  if (object.isRight()) {
    yield object.unsafeCoerce().identifier;
  }
}
`,
        ],
        typeParameters: [
          typeParameters.ObjectT,
          typeParameters.ObjectIdentifierT,
        ],
      },
      {
        isGenerator: true,
        kind: StructureKind.Method,
        name: "$objectUnionsSync",
        parameters: [parameters.objectTypes, parameters.query],
        returnType: `Generator<purify.Either<Error, ${typeParameters.ObjectT.name}>>`,
        scope: Scope.Protected,
        statements: [
          `\
const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
if (limit <= 0) { return; }

let offset = query?.offset ?? 0;
if (offset < 0) { offset = 0; }

if (query?.where) {
  // Figure out which object type the identifiers belong to
  for (const identifier of query.where.identifiers.slice(offset, offset + limit)) {
    const resource = this.resourceSet.resource(identifier);
    const lefts: purify.Either<Error, ${typeParameters.ObjectT.name}>[] = [];
    for (const objectType of objectTypes) {
      const object = objectType.fromRdf({ resource });
      if (object.isRight()) {
         yield object;
         break;
      }
      lefts.push(object);
    }
    // Doesn't appear to belong to any of the known object types, just assume the first
    if (lefts.length === objectTypes.length) {
      yield lefts[0];
    }
  }

  return;
}

let objectCount = 0;
let objectI = 0;

const resources: { objectType: ${objectTypeType}, resource: rdfjsResource.Resource }[] = [];
for (const objectType of objectTypes) {
  if (!objectType.fromRdfType) {
    continue;
  }

  for (const resource of this.resourceSet.instancesOf(objectType.fromRdfType)) {
    resources.push({ objectType, resource });
  }
}

// Sort resources by identifier so limit and offset are deterministic
resources.sort((left, right) => left.resource.identifier.value.localeCompare(right.resource.identifier.value));

for (const { objectType, resource } of resources) {
  const object = objectType.fromRdf({ resource });
  if (object.isLeft()) {
    continue;
  }
  if (objectI++ >= offset) {
    yield object;
    if (++objectCount === limit) {
      return;
    }
  }
}`,
        ],
        typeParameters: [
          typeParameters.ObjectT,
          typeParameters.ObjectIdentifierT,
        ],
      },
      {
        kind: StructureKind.Method,
        name: "$objectUnionsCountSync",
        parameters: [parameters.objectTypes, parameters.query],
        returnType: "purify.Either<Error, number>",
        statements: [
          "let count = 0;",
          `for (const _ of this.$objectUnionIdentifiersSync<${typeParameters.ObjectT.name}, ${typeParameters.ObjectIdentifierT.name}>(${parameters.objectTypes.name}, ${parameters.query.name})) { count++; }`,
          "return purify.Either.of(count);",
        ],
        typeParameters: [
          typeParameters.ObjectT,
          typeParameters.ObjectIdentifierT,
        ],
        scope: Scope.Protected,
      },
    );
  }

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
    methods: (
      [...objectTypes, ...objectUnionTypes].flatMap((objectType) => {
        if (!objectType.features.has("rdf")) {
          return unsupportedObjectSetMethodDeclarations({
            objectType,
          });
        }

        const methodSignatures = objectSetMethodSignatures({ objectType });

        let runtimeObjectType: string;
        switch (objectType.kind) {
          case "ObjectType":
            runtimeObjectType = objectType.fromRdfType.isJust()
              ? `${objectType.staticModuleName}`
              : `{ ...${objectType.staticModuleName}, fromRdfType: undefined }`;
            break;
          case "ObjectUnionType":
            runtimeObjectType = `[${objectType.memberTypes.map((memberType) =>
              memberType.fromRdfType.isJust()
                ? `${memberType.staticModuleName}`
                : `{ ...${memberType.staticModuleName}, fromRdfType: undefined }`,
            )}]`;
            break;
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
            statements: `return purify.Either.of([...this.$object${objectType.kind === "ObjectUnionType" ? "Union" : ""}IdentifiersSync<${objectType.name}, ${objectType.identifierTypeAlias}>(${runtimeObjectType}, query)]);`,
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
              `return [...this.$object${objectType.kind === "ObjectUnionType" ? "Union" : ""}sSync<${objectType.name}, ${objectType.identifierTypeAlias}>(${runtimeObjectType}, query)];`,
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
              `return this.$object${objectType.kind === "ObjectUnionType" ? "Union" : ""}sCountSync<${objectType.name}, ${objectType.identifierTypeAlias}>(${runtimeObjectType}, query);`,
            ],
          },
        ];
      }) satisfies MethodDeclarationStructure[]
    ).concat(reusableMethodDeclarations),
    properties: [
      {
        isReadonly: true,
        name: "resourceSet",
        type: "rdfjsResource.ResourceSet",
      },
    ],
  };
}
