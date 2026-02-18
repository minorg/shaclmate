import type { Maybe } from "purify-ts";
import { imports } from "./imports.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";
import { snippets } from "./snippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";
import { unsupportedObjectSetMethodDeclarations } from "./unsupportedObjectSetMethodDeclarations.js";

export function rdfjsDatasetObjectSetClassDeclaration({
  objectTypes,
  objectUnionTypes,
}: {
  objectTypes: readonly ObjectType[];
  objectUnionTypes: readonly ObjectUnionType[];
}): Code {
  const objectTypeType = code`\
{
  ${syntheticNamePrefix}filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
  ${syntheticNamePrefix}fromRdf: (resource: ${imports.Resource}, options: { objectSet: ${syntheticNamePrefix}ObjectSet }) => ${imports.Either}<Error, ObjectT>;
  ${syntheticNamePrefix}fromRdfTypes: readonly ${imports.NamedNode}[]
}`;

  const parameters = {
    query: `query?: ${syntheticNamePrefix}ObjectSet.Query<ObjectFilterT, ObjectIdentifierT>`,
  };

  const typeParameters = {
    ObjectT: code`ObjectT extends { readonly $identifier: ObjectIdentifierT }`,
    ObjectFilterT: code`ObjectFilterT`,
    ObjectIdentifierT: code`ObjectIdentifierT extends ${imports.BlankNode} | ${imports.NamedNode}`,
  };

  return code`\
export class ${syntheticNamePrefix}RdfjsDatasetObjectSet implements ${syntheticNamePrefix}ObjectSet {
  protected readonly resourceSet: ${imports.ResourceSet};

  constructor(dataset: ${imports.DatasetCore}) {
    this.resourceSet = new ${imports.ResourceSet}({ dataset });
  }

  ${joinCode(
    [
      ...[...objectTypes, ...objectUnionTypes].flatMap(
        (objectType): readonly Code[] => {
          if (!objectType.features.has("rdf")) {
            return Object.values(
              unsupportedObjectSetMethodDeclarations({
                objectType,
              }),
            );
          }

          const methodSignatures = objectSetMethodSignatures({ objectType });

          const delegatingMethods: Code[] = [
            // object
            code`\
async ${methodSignatures.object.name}(${methodSignatures.object.parameters}): ${methodSignatures.object.returnType} {
  return this.${methodSignatures.object.name}Sync(identifier);
}`,
            // objectSync
            code`\
${methodSignatures.object.name}Sync(${methodSignatures.object.parameters}): ${imports.Either}<Error, ${objectType.name}> {
  return this.${methodSignatures.objects.name}Sync({ identifiers: [identifier] }).map(objects => objects[0]);
}`,

            // objectIdentifiers
            code`\
async ${methodSignatures.objectIdentifiers.name}(${methodSignatures.objectIdentifiers.parameters}): ${methodSignatures.objectIdentifiers.returnType} {
  return this.${methodSignatures.objectIdentifiers.name}Sync(query);
}`,
            // objectIdentifiersSync
            code`\
${methodSignatures.objectIdentifiers.name}Sync(${methodSignatures.objectIdentifiers.parameters}): ${imports.Either}<Error, readonly ${objectType.identifierTypeAlias}[]> {
  return this.${methodSignatures.objects.name}Sync(query).map(objects => objects.map(object => object.${syntheticNamePrefix}identifier));
}`,

            // objects
            code`\
async ${methodSignatures.objects.name}(${methodSignatures.objects.parameters}): ${methodSignatures.objects.returnType} {
  return this.${methodSignatures.objects.name}Sync(query);
}`,
            // objectsSync has per-object type logic, not just forwarding

            // objectsCount
            code`\
async ${methodSignatures.objectsCount.name}(${methodSignatures.objectsCount.parameters}): ${methodSignatures.objectsCount.returnType} {
  return this.${methodSignatures.objectsCount.name}Sync(query);
}`,
            // objectsCountSync
            code`\
${methodSignatures.objectsCount.name}Sync(${methodSignatures.objectsCount.parameters}): ${imports.Either}<Error, number> {
  return this.${methodSignatures.objects.name}Sync(query).map(objects => objects.length);
}`,
          ];

          const runtimeObjectType = (
            filterFunction: Code,
            objectType: {
              descendantFromRdfTypeVariables: readonly Code[];
              staticModuleName: string;
              fromRdfTypeVariable: Maybe<Code>;
            },
          ): Code => {
            const fromRdfTypes = objectType.fromRdfTypeVariable
              .toList()
              .concat(objectType.descendantFromRdfTypeVariables);
            return code`{ ${syntheticNamePrefix}filter: ${filterFunction}, ${syntheticNamePrefix}fromRdf: ${objectType.staticModuleName}.${syntheticNamePrefix}fromRdf, ${syntheticNamePrefix}fromRdfTypes: ${fromRdfTypes.length > 0 ? code`[${joinCode(fromRdfTypes, { on: ", " })}]` : "[]"} }`;
          };

          switch (objectType.kind) {
            case "ObjectType": {
              return delegatingMethods.concat(code`\
${methodSignatures.objects.name}Sync(${methodSignatures.objects.parameters}): ${imports.Either}<Error, readonly ${objectType.name}[]> {
  return this.${syntheticNamePrefix}objectsSync<${objectType.name}, ${objectType.filterType}, ${objectType.identifierTypeAlias}>(${runtimeObjectType(objectType.filterFunction, objectType)}, query);
}`);
            }
            case "ObjectUnionType":
              return delegatingMethods.concat(code`\
${methodSignatures.objects.name}Sync(${methodSignatures.objects.parameters}): ${imports.Either}<Error, readonly ${objectType.name}[]> {
  return this.${syntheticNamePrefix}objectUnionsSync<${objectType.name}, ${objectType.filterType}, ${objectType.identifierTypeAlias}>([
    ${joinCode(
      objectType.memberTypes
        .filter((memberType) => !memberType.abstract)
        .map((memberType) =>
          runtimeObjectType(objectType.filterFunction, memberType),
        ),
      { on: ", " },
    )}
  ], query);
}`);
            default:
              objectType satisfies never;
              return [];
          }
        },
      ),

      ...(objectTypes.length > 0
        ? [
            code`\
protected ${syntheticNamePrefix}objectsSync<${typeParameters.ObjectT}, ${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(objectType: ${objectTypeType}, ${parameters.query}): ${imports.Either}<Error, readonly ObjectT[]> {
  const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
  if (limit <= 0) { return ${imports.Either}.of([]); }

  let offset = query?.offset ?? 0;
  if (offset < 0) { offset = 0; }

  let resources: { object?: ObjectT, resource: ${imports.Resource} }[];
  let sortResources: boolean;
  if (query?.identifiers) {
    resources = query.identifiers.map(identifier => ({ resource: this.resourceSet.resource(identifier) }));
    sortResources = false;
  } else if (objectType.${syntheticNamePrefix}fromRdfTypes.length > 0) {
    const identifierSet = new ${snippets.IdentifierSet}();
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
    const identifierSet = new ${snippets.IdentifierSet}();
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
  const objects: ObjectT[] = [];
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
        return ${imports.Either}.of(objects);
      }
    }
  }
  return ${imports.Either}.of(objects);
  }`,
          ]
        : []),

      ...(objectUnionTypes.length > 0
        ? [
            code`\
protected ${syntheticNamePrefix}objectUnionsSync<${typeParameters.ObjectT}, ${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(objectTypes: readonly ${objectTypeType}[], ${parameters.query}): ${imports.Either}<Error, readonly ObjectT[]> {
  const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
  if (limit <= 0) { return ${imports.Either}.of([]); }

  let offset = query?.offset ?? 0;
  if (offset < 0) { offset = 0; }

  let resources: { object?: ObjectT, objectType?: ${objectTypeType}, resource: ${imports.Resource} }[];
  let sortResources: boolean;
  if (query?.identifiers) {
    resources = query.identifiers.map(identifier => ({ resource: this.resourceSet.resource(identifier) }));
    sortResources = false;
  } else if (objectTypes.every(objectType => objectType.${syntheticNamePrefix}fromRdfTypes.length > 0)) {
    const identifierSet = new ${snippets.IdentifierSet}();
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
    const identifierSet = new ${snippets.IdentifierSet}();
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
  const objects: ObjectT[] = [];
  for (let { object, objectType, resource } of resources) {
    if (!object) {
      let objectEither: ${imports.Either}<Error, ObjectT>;
      if (objectType) {
        objectEither = objectType.${syntheticNamePrefix}fromRdf(resource, { objectSet: this });
      } else {
        objectEither = ${imports.Left}(new Error("no object types"));
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
        return ${imports.Either}.of(objects);
      }
    }
  }
  return ${imports.Either}.of(objects);
}`,
          ]
        : []),
    ],
    { on: "\n\n" },
  )}
}`;
}
