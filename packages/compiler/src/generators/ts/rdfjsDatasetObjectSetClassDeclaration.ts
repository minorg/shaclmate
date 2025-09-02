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
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
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
      constraint: "{ readonly $identifier: ObjectIdentifierT }",
      name: "ObjectT",
    } satisfies OptionalKind<TypeParameterDeclarationStructure>,
    ObjectIdentifierT: {
      constraint: "rdfjs.BlankNode | rdfjs.NamedNode",
      name: "ObjectIdentifierT",
    } satisfies OptionalKind<TypeParameterDeclarationStructure>,
  };

  const fromRdfFunctionType = `(parameters: { resource: rdfjsResource.Resource }) => purify.Either<Error, ${typeParameters.ObjectT.name}>`;

  const reusableMethodDeclarations: MethodDeclarationStructure[] = [];
  if (objectTypes.length > 0) {
    const parameters = {
      objectType: {
        name: "objectType",
        type: `{ ${syntheticNamePrefix}fromRdf: ${fromRdfFunctionType}; ${syntheticNamePrefix}fromRdfType?: rdfjs.NamedNode }`,
      } satisfies OptionalKind<ParameterDeclarationStructure>,
      query: {
        hasQuestionToken: true,
        name: "query",
        type: `${syntheticNamePrefix}ObjectSet.Query<${typeParameters.ObjectIdentifierT.name}>`,
      } satisfies OptionalKind<ParameterDeclarationStructure>,
    };

    reusableMethodDeclarations.push(
      {
        kind: StructureKind.Method,
        name: `${syntheticNamePrefix}objectIdentifiersSync`,
        parameters: [parameters.objectType, parameters.query],
        returnType: `purify.Either<Error, readonly ${typeParameters.ObjectIdentifierT.name}[]>`,
        scope: Scope.Protected,
        statements: [
          `\
return this.${syntheticNamePrefix}objectsSync<${typeParameters.ObjectT.name}, ${typeParameters.ObjectIdentifierT.name}>(${parameters.objectType.name}, ${parameters.query.name}).map(objects => objects.map(object => object.${syntheticNamePrefix}identifier));`,
        ],
        typeParameters: [
          typeParameters.ObjectT,
          typeParameters.ObjectIdentifierT,
        ],
      },
      {
        kind: StructureKind.Method,
        name: `${syntheticNamePrefix}objectsSync`,
        parameters: [parameters.objectType, parameters.query],
        returnType: `purify.Either<Error, readonly ${typeParameters.ObjectT.name}[]>`,
        scope: Scope.Protected,
        statements: [
          `\
const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
if (limit <= 0) { return purify.Either.of([]); }

let offset = query?.offset ?? 0;
if (offset < 0) { offset = 0; }

if (query?.where) {
  const objects: ${typeParameters.ObjectT.name}[] = [];
  for (const identifier of query.where.identifiers.slice(offset, offset + limit)) {
    const either = objectType.${syntheticNamePrefix}fromRdf({ resource: this.resourceSet.resource(identifier) });
    if (either.isLeft()) {
      return either;
    }
    objects.push(either.unsafeCoerce());
  }
  return purify.Either.of(objects);
}

if (!objectType.${syntheticNamePrefix}fromRdfType) {
  return purify.Either.of([]);
}

const resources = [...this.resourceSet.instancesOf(objectType.${syntheticNamePrefix}fromRdfType)];
// Sort resources by identifier so limit and offset are deterministic
resources.sort((left, right) => left.identifier.value.localeCompare(right.identifier.value));

const objects: ${typeParameters.ObjectT.name}[] = [];
let objectI = 0;
for (const resource of resources) {
  const either = objectType.${syntheticNamePrefix}fromRdf({ resource });
  if (either.isLeft()) {
    return either;
  }
  if (objectI++ >= offset) {
     objects.push(either.unsafeCoerce());
     if (objects.length === limit) {
      return purify.Either.of(objects);
     }
  }
}
return purify.Either.of(objects);
`,
        ],
        typeParameters: [
          typeParameters.ObjectT,
          typeParameters.ObjectIdentifierT,
        ],
      },
      {
        kind: StructureKind.Method,
        name: `${syntheticNamePrefix}objectsCountSync`,
        parameters: [parameters.objectType, parameters.query],
        returnType: "purify.Either<Error, number>",
        scope: Scope.Protected,
        statements: [
          `return this.${syntheticNamePrefix}objectsSync<${typeParameters.ObjectT.name}, ${typeParameters.ObjectIdentifierT.name}>(${parameters.objectType.name}, ${parameters.query.name}).map(objects => objects.length);`,
        ],
        typeParameters: [
          typeParameters.ObjectT,
          typeParameters.ObjectIdentifierT,
        ],
      },
    );
  }

  if (objectUnionTypes.length > 0) {
    const objectTypeType = `{ ${syntheticNamePrefix}fromRdf: ${fromRdfFunctionType}; ${syntheticNamePrefix}fromRdfType?: rdfjs.NamedNode }`;

    const parameters = {
      objectTypes: {
        name: "objectTypes",
        type: `readonly ${objectTypeType}[]`,
      } satisfies OptionalKind<ParameterDeclarationStructure>,
      query: {
        hasQuestionToken: true,
        name: "query",
        type: `${syntheticNamePrefix}ObjectSet.Query<${typeParameters.ObjectIdentifierT.name}>`,
      } satisfies OptionalKind<ParameterDeclarationStructure>,
    };

    reusableMethodDeclarations.push(
      {
        kind: StructureKind.Method,
        name: `${syntheticNamePrefix}objectUnionIdentifiersSync`,
        parameters: [parameters.objectTypes, parameters.query],
        returnType: `purify.Either<Error, readonly ${typeParameters.ObjectIdentifierT.name}[]>`,
        scope: Scope.Protected,
        statements: [
          `return this.${syntheticNamePrefix}objectUnionsSync<${typeParameters.ObjectT.name}, ${typeParameters.ObjectIdentifierT.name}>(${parameters.objectTypes.name}, ${parameters.query.name}).map(objects => objects.map(object => object.${syntheticNamePrefix}identifier));`,
        ],
        typeParameters: [
          typeParameters.ObjectT,
          typeParameters.ObjectIdentifierT,
        ],
      },
      {
        kind: StructureKind.Method,
        name: `${syntheticNamePrefix}objectUnionsSync`,
        parameters: [parameters.objectTypes, parameters.query],
        returnType: `purify.Either<Error, readonly ${typeParameters.ObjectT.name}[]>`,
        scope: Scope.Protected,
        statements: [
          `\
const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
if (limit <= 0) { return purify.Either.of([]); }

let offset = query?.offset ?? 0;
if (offset < 0) { offset = 0; }

if (query?.where) {
  // Figure out which object type the identifiers belong to
  const objects: ${typeParameters.ObjectT.name}[] = [];
  for (const identifier of query.where.identifiers.slice(offset, offset + limit)) {
    const resource = this.resourceSet.resource(identifier);
    const lefts: purify.Either<Error, ${typeParameters.ObjectT.name}>[] = [];
    for (const objectType of objectTypes) {
      const either = objectType.${syntheticNamePrefix}fromRdf({ resource });
      if (either.isRight()) {
         objects.push(either.unsafeCoerce());
         break;
      }
      lefts.push(either);
    }
    // Doesn't appear to belong to any of the known object types, just assume the first
    if (lefts.length === objectTypes.length) {
      return lefts[0] as unknown as purify.Either<Error, readonly ${typeParameters.ObjectT.name}[]>;
    }
  }
  return purify.Either.of(objects);
}

const resources: { objectType: ${objectTypeType}, resource: rdfjsResource.Resource }[] = [];
for (const objectType of objectTypes) {
  if (!objectType.${syntheticNamePrefix}fromRdfType) {
    continue;
  }

  for (const resource of this.resourceSet.instancesOf(objectType.${syntheticNamePrefix}fromRdfType)) {
    resources.push({ objectType, resource });
  }
}

// Sort resources by identifier so limit and offset are deterministic
resources.sort((left, right) => left.resource.identifier.value.localeCompare(right.resource.identifier.value));

let objectI = 0;
const objects: ${typeParameters.ObjectT.name}[] = [];
for (const { objectType, resource } of resources) {
  const either = objectType.${syntheticNamePrefix}fromRdf({ resource });
  if (either.isLeft()) {
    return either;
  }
  if (objectI++ >= offset) {
    objects.push(either.unsafeCoerce());
    if (objects.length === limit) {
      return purify.Either.of(objects);
    }
  }
}
return purify.Either.of(objects);
`,
        ],
        typeParameters: [
          typeParameters.ObjectT,
          typeParameters.ObjectIdentifierT,
        ],
      },
      {
        kind: StructureKind.Method,
        name: `${syntheticNamePrefix}objectUnionsCountSync`,
        parameters: [parameters.objectTypes, parameters.query],
        returnType: "purify.Either<Error, number>",
        statements: [
          `return this.${syntheticNamePrefix}objectUnionIdentifiersSync<${typeParameters.ObjectT.name}, ${typeParameters.ObjectIdentifierT.name}>(${parameters.objectTypes.name}, ${parameters.query.name}).map(objects => objects.length);`,
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
    implements: [`${syntheticNamePrefix}ObjectSet`],
    isExported: true,
    kind: StructureKind.Class,
    name: `${syntheticNamePrefix}RdfjsDatasetObjectSet`,
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
              : `{ ...${objectType.staticModuleName}, ${syntheticNamePrefix}fromRdfType: undefined }`;
            break;
          case "ObjectUnionType":
            runtimeObjectType = `[${objectType.memberTypes.map((memberType) =>
              memberType.fromRdfType.isJust()
                ? `${memberType.staticModuleName}`
                : `{ ...${memberType.staticModuleName}, ${syntheticNamePrefix}fromRdfType: undefined }`,
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
              `return this.${methodSignatures.objects.name}Sync({ where: { identifiers: [identifier], type: "identifiers" } }).map(objects => objects[0]);`,
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
            statements: `return this.${syntheticNamePrefix}object${objectType.kind === "ObjectUnionType" ? "Union" : ""}IdentifiersSync<${objectType.name}, ${objectType.identifierTypeAlias}>(${runtimeObjectType}, query);`,
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
            returnType: `purify.Either<Error, readonly ${objectType.name}[]>`,
            statements: [
              `return this.${syntheticNamePrefix}object${objectType.kind === "ObjectUnionType" ? "Union" : ""}sSync<${objectType.name}, ${objectType.identifierTypeAlias}>(${runtimeObjectType}, query);`,
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
              `return this.${syntheticNamePrefix}object${objectType.kind === "ObjectUnionType" ? "Union" : ""}sCountSync<${objectType.name}, ${objectType.identifierTypeAlias}>(${runtimeObjectType}, query);`,
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
