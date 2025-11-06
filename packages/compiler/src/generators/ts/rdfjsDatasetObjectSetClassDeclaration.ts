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
    ObjectIdentifierT: {
      constraint: "rdfjs.BlankNode | rdfjs.NamedNode",
      name: "ObjectIdentifierT",
    } satisfies OptionalKind<TypeParameterDeclarationStructure>,
  };

  const objectTypeType = `{ ${syntheticNamePrefix}fromRdf: (resource: rdfjsResource.Resource, options: { objectSet: ${syntheticNamePrefix}ObjectSet }) => purify.Either<Error, ${typeParameters.ObjectT.name}>; ${syntheticNamePrefix}fromRdfTypes: readonly rdfjs.NamedNode[] }`;
  const reusableMethodParameters = {
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

        let runtimeObjectTypes: string;
        const runtimeObjectType = (objectType: {
          descendantFromRdfTypeVariables: readonly string[];
          staticModuleName: string;
          fromRdfTypeVariable: Maybe<string>;
        }) =>
          `{ ${syntheticNamePrefix}fromRdf: ${objectType.staticModuleName}.${syntheticNamePrefix}fromRdf, ${syntheticNamePrefix}fromRdfTypes: [${objectType.fromRdfTypeVariable.toList().concat(objectType.descendantFromRdfTypeVariables).join(", ")}] }`;
        switch (objectType.kind) {
          case "ObjectType":
            runtimeObjectTypes = `[${runtimeObjectType(objectType)}]`;
            break;
          case "ObjectUnionType":
            runtimeObjectTypes = `[${objectType.memberTypes.map((memberType) => runtimeObjectType(memberType)).join(", ")}]`;
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
              `return this.${methodSignatures.objects.name}Sync({ where: [{ identifiers: [identifier], type: "identifiers" }] }).map(objects => objects[0]);`,
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
            statements: `return this.${syntheticNamePrefix}objectIdentifiersSync<${objectType.name}, ${objectType.identifierTypeAlias}>(${runtimeObjectTypes}, query);`,
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
              `return this.${syntheticNamePrefix}objectsSync<${objectType.name}, ${objectType.identifierTypeAlias}>(${runtimeObjectTypes}, query);`,
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
              `return this.${syntheticNamePrefix}objectsCountSync<${objectType.name}, ${objectType.identifierTypeAlias}>(${runtimeObjectTypes}, query);`,
            ],
          },
        ];
      }) satisfies MethodDeclarationStructure[]
    ).concat(
      {
        kind: StructureKind.Method,
        name: `${syntheticNamePrefix}objectIdentifiersSync`,
        parameters: [
          reusableMethodParameters.objectTypes,
          reusableMethodParameters.query,
        ],
        returnType: `purify.Either<Error, readonly ${typeParameters.ObjectIdentifierT.name}[]>`,
        scope: Scope.Protected,
        statements: [
          `\
return this.${syntheticNamePrefix}objectsSync<${typeParameters.ObjectT.name}, ${typeParameters.ObjectIdentifierT.name}>(${reusableMethodParameters.objectTypes.name}, ${reusableMethodParameters.query.name}).map(objects => objects.map(object => object.${syntheticNamePrefix}identifier));`,
        ],
        typeParameters: [
          typeParameters.ObjectT,
          typeParameters.ObjectIdentifierT,
        ],
      },
      {
        kind: StructureKind.Method,
        name: `${syntheticNamePrefix}objectsSync`,
        parameters: [
          reusableMethodParameters.objectTypes,
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

let identifierType: "NamedNode" | undefined;
let ignoreFromRdfTypes = false;

// First pass: gather all resources that meet the where filters.
// We don't limit + offset here because the resources aren't sorted and limit + offset should be deterministic.
const resources: { objectType?: ${objectTypeType}, resource: rdfjsResource.Resource }[] = [];

if (query?.where) {
  for (const where of query.where) {
    if (where.type === "identifier-type") {
      identifierType = where.identifierType;
    }
  }

  for (const where of query.where) {
    switch (where.type) {
      case "identifiers": {
        ignoreFromRdfTypes = true;
        for (const identifier of where.identifiers) {
          if (identifierType && identifier.termType !== identifierType) {
            continue;
          }
          resources.push({ resource: this.resourceSet.resource(identifier) });
        }
        break;
      }

      case "identifier-type":
        break;

      case "triple-objects": {
        ignoreFromRdfTypes = true;
        for (const quad of this.resourceSet.dataset.match(where.subject, where.predicate, null)) {
          if (identifierType && quad.object.termType !== identifierType) {
            continue;
          }

          switch (quad.object.termType) {
            case "BlankNode":
            case "NamedNode":
              break;
            default:
              return purify.Left(new Error(\`subject=\${where.subject.value} predicate=\${where.predicate.value} pattern matches non-identifier (\${quad.object.termType}) triple\`));
          }

          resources.push({ resource: this.resourceSet.resource(quad.object) });
        }
        break;
      }
    }
  }
}

if (!ignoreFromRdfTypes) {
  for (const objectType of objectTypes) {
    if (objectType.${syntheticNamePrefix}fromRdfTypes.length === 0) {
      continue;
    }

    for (const fromRdfType of objectType.${syntheticNamePrefix}fromRdfTypes) {
      for (const resource of (identifierType === "NamedNode" ? this.resourceSet.namedInstancesOf(fromRdfType) : this.resourceSet.instancesOf(fromRdfType))) {
        if (resources.some(({ resource: existingResource }) => existingResource.identifier.equals(resource.identifier))) {
          continue;
        }

        resources.push({ objectType, resource });
      }
    }
  }
}

// Sort resources by identifier so limit and offset are deterministic
resources.sort((left, right) => left.resource.identifier.value.localeCompare(right.resource.identifier.value));

let objectI = 0;
const objects: ${typeParameters.ObjectT.name}[] = [];
for (const { objectType, resource } of resources) {
  if (objectType) {
    const objectEither = objectType.${syntheticNamePrefix}fromRdf(resource, { objectSet: this });
    if (objectEither.isLeft()) {
      return objectEither;
    }
    if (objectI++ >= offset) {
      objects.push(objectEither.unsafeCoerce());
      if (objects.length === limit) {
        return purify.Either.of(objects);
      }
    }
    continue;
  }

  // objectType is unknown, try them all
  const lefts: purify.Either<Error, ${typeParameters.ObjectT.name}>[] = [];
  for (const tryObjectType of objectTypes) {
    const objectEither = tryObjectType.${syntheticNamePrefix}fromRdf(resource, { objectSet: this });
    if (objectEither.isRight()) {
      objects.push(objectEither.unsafeCoerce());
      break;
    }
    lefts.push(objectEither);
  }
  // Doesn't appear to belong to any of the known object types, just assume the first
  if (lefts.length === objectTypes.length) {
    return lefts[0] as unknown as purify.Either<Error, readonly ${typeParameters.ObjectT.name}[]>;
  }
}

return purify.Either.of(objects);`,
        ],
        typeParameters: [
          typeParameters.ObjectT,
          typeParameters.ObjectIdentifierT,
        ],
      },
      {
        kind: StructureKind.Method,
        name: `${syntheticNamePrefix}objectsCountSync`,
        parameters: [
          reusableMethodParameters.objectTypes,
          reusableMethodParameters.query,
        ],
        returnType: "purify.Either<Error, number>",
        scope: Scope.Protected,
        statements: [
          `return this.${syntheticNamePrefix}objectsSync<${typeParameters.ObjectT.name}, ${typeParameters.ObjectIdentifierT.name}>(${reusableMethodParameters.objectTypes.name}, ${reusableMethodParameters.query.name}).map(objects => objects.length);`,
        ],
        typeParameters: [
          typeParameters.ObjectT,
          typeParameters.ObjectIdentifierT,
        ],
      },
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
