import type { Maybe } from "purify-ts";
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
    ObjectFilterT: {
      constraint:
        "{ readonly $identifier?: { readonly in?: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[] } }",
      name: "ObjectFilterT",
    },
    ObjectIdentifierT: {
      constraint: "rdfjs.BlankNode | rdfjs.NamedNode",
      name: "ObjectIdentifierT",
    } satisfies OptionalKind<TypeParameterDeclarationStructure>,
  };

  const objectTypeType = `\
{
  ${syntheticNamePrefix}filter: (filter: ${typeParameters.ObjectFilterT.name}, value: ${typeParameters.ObjectT.name}) => boolean;
  ${syntheticNamePrefix}fromRdf: (resource: rdfjsResource.Resource, options: { objectSet: ${syntheticNamePrefix}ObjectSet }) => purify.Either<Error, ${typeParameters.ObjectT.name}>;
  ${syntheticNamePrefix}fromRdfTypes: readonly rdfjs.NamedNode[]
}`;
  const reusableMethodParameters = {
    query: {
      hasQuestionToken: true,
      name: "query",
      type: `${syntheticNamePrefix}ObjectSet.Query<${typeParameters.ObjectFilterT.name}>`,
    } satisfies OptionalKind<ParameterDeclarationStructure>,
  };

  const reusableMethods: MethodDeclarationStructure[] = [];
  if (objectTypes.length > 0) {
    reusableMethods.push({
      kind: StructureKind.Method,
      name: `${syntheticNamePrefix}objectsSync`,
      parameters: [
        {
          name: "objectType",
          type: objectTypeType,
        },
        reusableMethodParameters.query,
      ],
      returnType: `purify.Either<Error, readonly ${typeParameters.ObjectT.name}[]>`,
      scope: Scope.Protected,
      statements: [
        `\
const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
if (limit <= 0) { return purify.Either.of([]); }

let offset = query?.offset ?? 0;
if (offset < 0) { offset = 0; }

let resources: { object?: ${typeParameters.ObjectT.name}, resource: rdfjsResource.Resource }[];
let sortResources: boolean;
if (query?.filter?.${syntheticNamePrefix}identifier?.in) {
  resources = query.filter.${syntheticNamePrefix}identifier.in.map(identifier => ({ resource: this.resourceSet.resource(identifier) }));
  sortResources = false;
} else if (objectType.${syntheticNamePrefix}fromRdfTypes.length > 0) {
  const identifierSet = new ${syntheticNamePrefix}IdentifierSet();
  resources = [];
  sortResources = true;
  for (const fromRdfType of objectType.${syntheticNamePrefix}fromRdfTypes) {
    for (const resource of this.resourceSet.instancesOf(fromRdfType)) {
      if (!identifierSet.has(resource.identifier)) {
        identifierSet.add(resource.identifier);
        resources.push({ resource });
      }
    }
  }
} else {
  const identifierSet = new ${syntheticNamePrefix}IdentifierSet();
  resources = [];
  sortResources = true;
  for (const quad of this.resourceSet.dataset) {
    switch (quad.subject.termType) {
      case "BlankNode":
      case "NamedNode":
        break;
      default:
        continue;
    }

    if (identifierSet.has(quad.subject)) {
      continue;
    }
    identifierSet.add(quad.subject);
    const resource = this.resourceSet.resource(quad.subject);
    // Eagerly eliminate the majority of resources that won't match the object type
    objectType.${syntheticNamePrefix}fromRdf(resource, { objectSet: this }).ifRight(object => {
      resources.push({ object, resource });
    });
  }
}

if (sortResources) {
  // Sort resources by identifier so limit and offset are deterministic
  resources.sort((left, right) => left.resource.identifier.value.localeCompare(right.resource.identifier.value));
}

let objectI = 0;
const objects: ${typeParameters.ObjectT.name}[] = [];
for (let { object, resource } of resources) {
  if (!object) {
    const objectEither = objectType.${syntheticNamePrefix}fromRdf(resource, { objectSet: this });
    if (objectEither.isLeft()) {
      return objectEither;
    }
    object = objectEither.unsafeCoerce();
  }

  if (query?.filter && !objectType.${syntheticNamePrefix}filter(query.filter, object)) {
    continue;
  }

  if (objectI++ >= offset) {
    objects.push(object);
    if (objects.length === limit) {
      return purify.Either.of(objects);
    }
  }
}
return purify.Either.of(objects);`,
      ],
      typeParameters: [
        typeParameters.ObjectT,
        typeParameters.ObjectFilterT,
        typeParameters.ObjectIdentifierT,
      ],
    });
  }

  if (objectUnionTypes.length > 0) {
    reusableMethods.push({
      kind: StructureKind.Method,
      name: `${syntheticNamePrefix}objectUnionsSync`,
      parameters: [
        {
          name: "objectTypes",
          type: `readonly ${objectTypeType}[]`,
        },
        reusableMethodParameters.query,
      ],
      returnType: `purify.Either<Error, readonly ${typeParameters.ObjectT.name}[]>`,
      scope: Scope.Protected,
      statements: [
        `\
const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
if (limit <= 0) { return purify.Either.of([]); }

let offset = query?.offset ?? 0;
if (offset < 0) { offset = 0; }

let resources: { object?: ${typeParameters.ObjectT.name}, objectType?: ${objectTypeType}, resource: rdfjsResource.Resource }[];
let sortResources: boolean;
if (query?.filter?.${syntheticNamePrefix}identifier?.in) {
  resources = query.filter.${syntheticNamePrefix}identifier.in.map(identifier => ({ resource: this.resourceSet.resource(identifier) }));
  sortResources = false;
} else if (objectTypes.every(objectType => objectType.${syntheticNamePrefix}fromRdfTypes.length > 0)) {
  const identifierSet = new ${syntheticNamePrefix}IdentifierSet();
  resources = [];
  sortResources = true;
  for (const objectType of objectTypes) {
    for (const fromRdfType of objectType.${syntheticNamePrefix}fromRdfTypes) {
      for (const resource of this.resourceSet.instancesOf(fromRdfType)) {
        if (!identifierSet.has(resource.identifier)) {
          identifierSet.add(resource.identifier);
          resources.push({ objectType, resource });
        }
      }
    }
  }
} else {
  const identifierSet = new ${syntheticNamePrefix}IdentifierSet();
  resources = [];
  sortResources = true;
  for (const quad of this.resourceSet.dataset) {
    switch (quad.subject.termType) {
      case "BlankNode":
      case "NamedNode":
        break;
      default:
        continue;
    }

    if (identifierSet.has(quad.subject)) {
      continue;
    }
    identifierSet.add(quad.subject);
    // Eagerly eliminate the majority of resources that won't match the object types
    const resource = this.resourceSet.resource(quad.subject);
    for (const objectType of objectTypes) {
      if (objectType.${syntheticNamePrefix}fromRdf(resource, { objectSet: this }).ifRight(object => {
        resources.push({ object, objectType, resource });
      }).isRight()) {
        break;
      }
    }
  }
}

if (sortResources) {
  // Sort resources by identifier so limit and offset are deterministic
  resources.sort((left, right) => left.resource.identifier.value.localeCompare(right.resource.identifier.value));
}

let objectI = 0;
const objects: ${typeParameters.ObjectT.name}[] = [];
for (let { object, objectType, resource } of resources) {
  if (!object) {
    let objectEither: purify.Either<Error, ${typeParameters.ObjectT.name}>;
    if (objectType) {
      objectEither = objectType.${syntheticNamePrefix}fromRdf(resource, { objectSet: this });
    } else {
      objectEither = purify.Left(new Error("no object types"));
      for (const tryObjectType of objectTypes) {
        objectEither = tryObjectType.${syntheticNamePrefix}fromRdf(resource, { objectSet: this });
        if (objectEither.isRight()) {
          objectType = tryObjectType;
          break;
        }
      }
    }
    if (objectEither.isLeft()) {
      return objectEither;
    }
    object = objectEither.unsafeCoerce();
  }
  if (!objectType) {
    throw new Error("objectType should be set here");
  }

  if (query?.filter && !objectType.${syntheticNamePrefix}filter(query.filter, object)) {
    continue;
  }

  if (objectI++ >= offset) {
    objects.push(object);
    if (objects.length === limit) {
      return purify.Either.of(objects);
    }
  }
}
return purify.Either.of(objects);`,
      ],
      typeParameters: [
        typeParameters.ObjectT,
        typeParameters.ObjectFilterT,
        typeParameters.ObjectIdentifierT,
      ],
    });
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
    methods: [...objectTypes, ...objectUnionTypes]
      .flatMap((objectType) => {
        if (!objectType.features.has("rdf")) {
          return unsupportedObjectSetMethodDeclarations({
            objectType,
          });
        }

        const methodSignatures = objectSetMethodSignatures({ objectType });

        const delegatingMethods: MethodDeclarationStructure[] = [
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
              `return this.${methodSignatures.objects.name}Sync({ filter: { ${syntheticNamePrefix}identifier: { in: [identifier] } } }).map(objects => objects[0]);`,
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
            statements: [
              `return this.${methodSignatures.objects.name}Sync(${methodSignatures.objectIdentifiers.parameters!.map((parameter) => parameter.name).join(", ")}).map(objects => objects.map(object => object.${syntheticNamePrefix}identifier));`,
            ],
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
            statements: `return this.${methodSignatures.objects.name}Sync(${methodSignatures.objectIdentifiers.parameters!.map((parameter) => parameter.name).join(", ")}).map(objects => objects.length);`,
          },
        ];

        const runtimeObjectType = (
          filterFunction: string,
          objectType: {
            descendantFromRdfTypeVariables: readonly string[];
            staticModuleName: string;
            fromRdfTypeVariable: Maybe<string>;
          },
        ) =>
          `{ ${syntheticNamePrefix}filter: ${filterFunction}, ${syntheticNamePrefix}fromRdf: ${objectType.staticModuleName}.${syntheticNamePrefix}fromRdf, ${syntheticNamePrefix}fromRdfTypes: [${objectType.fromRdfTypeVariable.toList().concat(objectType.descendantFromRdfTypeVariables).join(", ")}] }`;
        // switch (objectType.kind) {
        //   case "ObjectType":
        //     runtimeObjectTypes = `[${runtimeObjectType(objectType)}]`;
        //     break;
        //   case "ObjectUnionType":
        //     runtimeObjectTypes = `[${objectType.memberTypes.map((memberType) => runtimeObjectType(memberType)).join(", ")}]`;
        //     break;
        // }

        switch (objectType.kind) {
          case "ObjectType": {
            return delegatingMethods.concat({
              ...methodSignatures.objects,
              kind: StructureKind.Method,
              name: `${methodSignatures.objects.name}Sync`,
              returnType: `purify.Either<Error, readonly ${objectType.name}[]>`,
              statements: [
                `return this.${syntheticNamePrefix}objectsSync<${objectType.name}, ${objectType.filterType}, ${objectType.identifierTypeAlias}>(${runtimeObjectType(`${objectType.staticModuleName}.${syntheticNamePrefix}filter`, objectType)}, query);`,
              ],
            });
          }
          case "ObjectUnionType":
            return delegatingMethods.concat({
              ...methodSignatures.objects,
              kind: StructureKind.Method,
              name: `${methodSignatures.objects.name}Sync`,
              returnType: `purify.Either<Error, readonly ${objectType.name}[]>`,
              statements: [
                `return this.${syntheticNamePrefix}objectUnionsSync<${objectType.name}, ${objectType.filterType}, ${objectType.identifierTypeAlias}>([${objectType.memberTypes.map((memberType) => runtimeObjectType(`${objectType.staticModuleName}.${syntheticNamePrefix}filter`, memberType)).join(", ")}], query);`,
              ],
            });
          default:
            objectType satisfies never;
            return [];
        }
      })
      .concat(reusableMethods),
    properties: [
      {
        isReadonly: true,
        name: "resourceSet",
        type: "rdfjsResource.ResourceSet",
      },
    ],
  };
}
