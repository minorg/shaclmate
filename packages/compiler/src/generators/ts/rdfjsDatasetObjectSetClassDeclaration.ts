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

// First pass: gather all resources that meet the where filters.
// We don't limit + offset here because the resources aren't sorted and limit + offset should be deterministic.
const resources: { object?: ${typeParameters.ObjectT.name}, objectType?: ${objectTypeType}, resource: rdfjsResource.Resource }[] = [];
const where = query?.where ?? { "type": "type" };
switch (where.type) {
  case "identifiers": {
    for (const identifier of where.identifiers) {
      // Don't deduplicate
      resources.push({ resource: this.resourceSet.resource(identifier) });
    }
    break;
  }

  case "triple-objects": {
    for (const quad of this.resourceSet.dataset.match(where.subject, where.predicate, null)) {
      if (where.objectTermType && quad.object.termType !== where.objectTermType) {
        continue;
      }

      switch (quad.object.termType) {
        case "BlankNode":
        case "NamedNode":
          break;
        default:
          return purify.Left(new Error(\`subject=\${where.subject?.value} predicate=\${where.predicate.value} pattern matches non-identifier (\${quad.object.termType}) object\`));
      }

      const resource = this.resourceSet.resource(quad.object);
      if (!resources.some(({ resource: existingResource }) => existingResource.identifier.equals(resource.identifier))) {
        resources.push({ resource });
      }
    }
    break;
  }

  case "triple-subjects": {
    for (const quad of this.resourceSet.dataset.match(null, where.predicate, where.object)) {
      if (where.subjectTermType && quad.subject.termType !== where.subjectTermType) {
        continue;
      }

      switch (quad.subject.termType) {
        case "BlankNode":
        case "NamedNode":
          break;
        default:
          return purify.Left(new Error(\`predicate=\${where.predicate.value} object=\${where.object?.value} pattern matches non-identifier (\${quad.subject.termType}) subject\`));
      }

      const resource = this.resourceSet.resource(quad.subject);
      if (!resources.some(({ resource: existingResource }) => existingResource.identifier.equals(resource.identifier))) {
        resources.push({ resource });
      }
    }
    break;
  }

  case "type": {
    for (const objectType of objectTypes) {
      if (objectType.${syntheticNamePrefix}fromRdfTypes.length > 0) {
        for (const fromRdfType of objectType.${syntheticNamePrefix}fromRdfTypes) {
          for (const resource of (where.identifierType === "NamedNode" ? this.resourceSet.namedInstancesOf(fromRdfType) : this.resourceSet.instancesOf(fromRdfType))) {
            if (!resources.some(({ resource: existingResource }) => existingResource.identifier.equals(resource.identifier))) {
              resources.push({ objectType, resource });
            }
          }
        }
      } else {
        // The objectType has no fromRdfType
        // Try to deserialize every resource in the dataset
        const blankNodeSubjects = new Set<string>();
        const namedNodeSubjects = new Set<string>();
        for (const quad of this.resourceSet.dataset) {
          let resource: rdfjsResource.Resource;
          switch (quad.subject.termType) {
            case "BlankNode": {
              if (blankNodeSubjects.has(quad.subject.value)) {
                continue;
              }
              resource = this.resourceSet.resource(quad.subject);
              blankNodeSubjects.add(quad.subject.value);
              break;
            }
            case "NamedNode": {
              if (namedNodeSubjects.has(quad.subject.value)) {
                continue;
              }
              resource = this.resourceSet.namedResource(quad.subject);
              namedNodeSubjects.add(quad.subject.value);
              break;
            }
            default:
              continue;
          }
          objectType.${syntheticNamePrefix}fromRdf(resource, { objectSet: this }).ifRight(object => {
            resources.push({ object, objectType, resource });
          });
        }
      }
    }

    break;
  }
}

// Sort resources by identifier so limit and offset are deterministic
resources.sort((left, right) => left.resource.identifier.value.localeCompare(right.resource.identifier.value));

let objectI = 0;
const objects: ${typeParameters.ObjectT.name}[] = [];
for (let { object, objectType, resource } of resources) {
  if (object) {
    objects.push(object);
    continue;
  }

  let objectEither: purify.Either<Error, ${typeParameters.ObjectT.name}>;
  if (objectType) {
    objectEither = objectType.${syntheticNamePrefix}fromRdf(resource, { objectSet: this });
  } else {
    for (const tryObjectType of objectTypes) {
      objectEither = tryObjectType.${syntheticNamePrefix}fromRdf(resource, { objectSet: this });
      if (objectEither.isRight()) {
        objectType = tryObjectType;
        break;
      }
    }
  }

  if (objectEither!.isLeft()) {
  // Doesn't appear to belong to any of the known object types, just assume the first
    return objectEither as unknown as purify.Either<Error, readonly ${typeParameters.ObjectT.name}[]>;
  }
  object = objectEither!.unsafeCoerce();
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
