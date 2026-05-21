import type { Maybe } from "purify-ts";

import type { NamedObjectType } from "./NamedObjectType.js";
import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";

import type { TsGenerator } from "./TsGenerator.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export function rdfjsDatasetObjectSetClassDeclaration(
  this: TsGenerator,
  {
    namedObjectTypes,
    namedObjectUnionTypes,
  }: {
    namedObjectTypes: readonly NamedObjectType[];
    namedObjectUnionTypes: readonly NamedObjectUnionType[];
  },
): Code {
  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;

  const namedObjectTypeType = code`\
{
  filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
  fromRdfResource: ${this.reusables.snippets.FromRdfResourceFunction}<ObjectT>;
  fromRdfTypes: readonly ${this.reusables.imports.NamedNode}[]
}`;

  const parameters = {
    query: `query?: ${syntheticNamePrefix}ObjectSet.Query<ObjectFilterT, ObjectIdentifierT>`,
  };

  const typeParameters = {
    ObjectT: code`ObjectT extends { readonly $identifier: () => ObjectIdentifierT }`,
    ObjectFilterT: code`ObjectFilterT`,
    ObjectIdentifierT: code`ObjectIdentifierT extends ${this.reusables.imports.BlankNode} | ${this.reusables.imports.NamedNode}`,
  };

  return code`\
export class ${syntheticNamePrefix}RdfjsDatasetObjectSet implements ${syntheticNamePrefix}ObjectSet {
  readonly #dataset: ${this.reusables.imports.DatasetCore} | (() => ${this.reusables.imports.DatasetCore});
  readonly #graph?: Exclude<${this.reusables.imports.Quad_Graph}, ${this.reusables.imports.Variable}>;

  constructor(dataset: ${this.reusables.imports.DatasetCore} | (() => ${this.reusables.imports.DatasetCore}), options?: { graph?: Exclude<${this.reusables.imports.Quad_Graph}, ${this.reusables.imports.Variable}> }) {
    this.#dataset = dataset;
    this.#graph = options?.graph;
  }

  protected ${syntheticNamePrefix}dataset(): DatasetCore {
    if (typeof this.#dataset === "object") {
      return this.#dataset;
    }
    return this.#dataset();
  }

  protected ${syntheticNamePrefix}resourceSet(): ${this.reusables.imports.ResourceSet} {
    return new ${this.reusables.imports.ResourceSet}({ dataFactory: ${this.reusables.imports.dataFactory}, dataset: this.${syntheticNamePrefix}dataset() });
  }

  ${joinCode(
    [
      ...[...namedObjectTypes, ...namedObjectUnionTypes].flatMap(
        (namedObjectType): readonly Code[] => {
          const methodSignatures = objectSetMethodSignatures.call(this, {
            namedObjectType,
          });

          const delegatingMethods: Code[] = [
            // object
            code`\
async ${methodSignatures.object.name}(${methodSignatures.object.parameters}): ${methodSignatures.object.returnType} {
  return this.${methodSignatures.object.name}Sync(identifier, options);
}`,
            // objectSync
            code`\
${methodSignatures.object.name}Sync(${methodSignatures.object.parameters}): ${this.reusables.imports.Either}<Error, ${namedObjectType.name}> {
  return this.${methodSignatures.objects.name}Sync({ identifiers: [identifier], preferredLanguages: options?.preferredLanguages }).map(objects => objects[0]);
}`,

            // objectCount
            code`\
async ${methodSignatures.objectCount.name}(${methodSignatures.objectCount.parameters}): ${methodSignatures.objectCount.returnType} {
  return this.${methodSignatures.objectCount.name}Sync(query);
}`,
            // objectCountSync
            code`\
${methodSignatures.objectCount.name}Sync(${methodSignatures.objectCount.parameters}): ${this.reusables.imports.Either}<Error, number> {
  return this.${methodSignatures.objects.name}Sync(query).map(objects => objects.length);
}`,

            // objectIdentifiers
            code`\
async ${methodSignatures.objectIdentifiers.name}(${methodSignatures.objectIdentifiers.parameters}): ${methodSignatures.objectIdentifiers.returnType} {
  return this.${methodSignatures.objectIdentifiers.name}Sync(query);
}`,
            // objectIdentifiersSync
            code`\
${methodSignatures.objectIdentifiers.name}Sync(${methodSignatures.objectIdentifiers.parameters}): ${this.reusables.imports.Either}<Error, readonly ${namedObjectType.identifierTypeAlias}[]> {
  return this.${methodSignatures.objects.name}Sync(query).map(objects => objects.map(object => object.${syntheticNamePrefix}identifier()));
}`,

            // objects
            code`\
async ${methodSignatures.objects.name}(${methodSignatures.objects.parameters}): ${methodSignatures.objects.returnType} {
  return this.${methodSignatures.objects.name}Sync(query);
}`,
            // objectsSync has per-object type logic, not just forwarding
          ];

          const runtimeObjectType = (
            filterFunction: Code,
            namedObjectType: {
              descendantFromRdfTypeVariables: readonly Code[];
              name: string;
              fromRdfTypeVariable: Maybe<Code>;
            },
          ): Code => {
            const fromRdfTypes = namedObjectType.fromRdfTypeVariable
              .toList()
              .concat(namedObjectType.descendantFromRdfTypeVariables);
            return code`{ filter: ${filterFunction}, fromRdfResource: ${namedObjectType.name}.fromRdfResource, fromRdfTypes: ${fromRdfTypes.length > 0 ? code`[${joinCode(fromRdfTypes, { on: ", " })}]` : "[]"} }`;
          };

          switch (namedObjectType.kind) {
            case "NamedObjectType": {
              return delegatingMethods.concat(code`\
${methodSignatures.objects.name}Sync(${methodSignatures.objects.parameters}): ${this.reusables.imports.Either}<Error, readonly ${namedObjectType.name}[]> {
  return this.#objectsSync<${namedObjectType.name}, ${namedObjectType.filterType}, ${namedObjectType.identifierTypeAlias}>(${runtimeObjectType(namedObjectType.filterFunction, namedObjectType)}, query);
}`);
            }
            case "NamedObjectUnionType":
              return delegatingMethods.concat(code`\
${methodSignatures.objects.name}Sync(${methodSignatures.objects.parameters}): ${this.reusables.imports.Either}<Error, readonly ${namedObjectType.name}[]> {
  return this.#objectUnionsSync<${namedObjectType.name}, ${namedObjectType.filterType}, ${namedObjectType.identifierTypeAlias}>([
    ${joinCode(
      namedObjectType.members.map((member) =>
        runtimeObjectType(namedObjectType.filterFunction, member.type),
      ),
      { on: ", " },
    )}
  ], query);
}`);
            default:
              namedObjectType satisfies never;
              return [];
          }
        },
      ),

      ...(namedObjectTypes.length > 0
        ? [
            code`\
#objectsSync<${typeParameters.ObjectT}, ${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(namedObjectType: ${namedObjectTypeType}, ${parameters.query}): ${this.reusables.imports.Either}<Error, readonly ObjectT[]> {
  const graph = query?.graph ?? this.#graph;

  const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
  if (limit <= 0) { return ${this.reusables.imports.Right}([]); }

  let offset = query?.offset ?? 0;
  if (offset < 0) { offset = 0; }

  const fromRdfResourceOptions: Parameters<${this.reusables.snippets.FromRdfResourceFunction}<ObjectT>>[1] = { graph, objectSet: this, preferredLanguages: query?.preferredLanguages };

  let resources: { object?: ObjectT, resource: ${this.reusables.imports.Resource} }[];
  const resourceSet = this.${syntheticNamePrefix}resourceSet(); // Access once, in case it's instantiated lazily
  let sortResources: boolean;
  if (query?.identifiers) {
    resources = query.identifiers.map(identifier => ({ resource: resourceSet.resource(identifier) }));
    sortResources = false;
  } else if (namedObjectType.fromRdfTypes.length > 0) {
    const identifierSet = new ${this.reusables.snippets.IdentifierSet}();
    resources = [];
    sortResources = true;
    for (const fromRdfType of namedObjectType.fromRdfTypes) {
      for (const resource of resourceSet.instancesOf(fromRdfType, { graph })) {
        if (!identifierSet.has(resource.identifier)) {
          identifierSet.add(resource.identifier);
          resources.push({ resource });
        }
      }
    }
  } else {
    const identifierSet = new ${this.reusables.snippets.IdentifierSet}();
    resources = [];
    sortResources = true;
    for (const quad of resourceSet.dataset) {
      if (graph && !quad.graph.equals(graph)) {
        continue;
      }

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
      const resource = resourceSet.resource(quad.subject);
      // Eagerly eliminate the majority of resources that won't match the object type
      namedObjectType.fromRdfResource(resource, fromRdfResourceOptions).ifRight(object => {
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
      const objectEither = namedObjectType.fromRdfResource(resource, fromRdfResourceOptions);
      if (objectEither.isLeft()) {
        return objectEither;
      }
      object = objectEither.unsafeCoerce();
    }

    if (query?.filter && !namedObjectType.filter(query.filter, object)) {
      continue;
    }

    if (objectI++ >= offset) {
      objects.push(object);
      if (objects.length === limit) {
        return ${this.reusables.imports.Right}(objects);
      }
    }
  }
  return ${this.reusables.imports.Right}(objects);
  }`,
          ]
        : []),

      ...(namedObjectUnionTypes.length > 0
        ? [
            code`\
#objectUnionsSync<${typeParameters.ObjectT}, ${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(namedObjectTypes: readonly ${namedObjectTypeType}[], ${parameters.query}): ${this.reusables.imports.Either}<Error, readonly ObjectT[]> {
  const graph = query?.graph ?? this.#graph;

  const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
  if (limit <= 0) { return ${this.reusables.imports.Right}([]); }

  let offset = query?.offset ?? 0;
  if (offset < 0) { offset = 0; }

  const fromRdfResourceOptions: Parameters<${this.reusables.snippets.FromRdfResourceFunction}<ObjectT>>[1] = { graph, objectSet: this, preferredLanguages: query?.preferredLanguages };

  let resources: { object?: ObjectT, namedObjectType?: ${namedObjectTypeType}, resource: ${this.reusables.imports.Resource} }[];
  const resourceSet = this.${syntheticNamePrefix}resourceSet(); // Access once, in case it's instantiated lazily
  let sortResources: boolean;
  if (query?.identifiers) {
    resources = query.identifiers.map(identifier => ({ resource: resourceSet.resource(identifier) }));
    sortResources = false;
  } else if (namedObjectTypes.every(namedObjectType => namedObjectType.fromRdfTypes.length > 0)) {
    const identifierSet = new ${this.reusables.snippets.IdentifierSet}();
    resources = [];
    sortResources = true;
    for (const namedObjectType of namedObjectTypes) {
      for (const fromRdfType of namedObjectType.fromRdfTypes) {
        for (const resource of resourceSet.instancesOf(fromRdfType, { graph })) {
          if (!identifierSet.has(resource.identifier)) {
            identifierSet.add(resource.identifier);
            resources.push({ namedObjectType, resource });
          }
        }
      }
    }
  } else {
    const identifierSet = new ${this.reusables.snippets.IdentifierSet}();
    resources = [];
    sortResources = true;
    for (const quad of resourceSet.dataset) {
      if (graph && !quad.graph.equals(graph)) {
        continue;
      }
    
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
      const resource = resourceSet.resource(quad.subject);
      for (const namedObjectType of namedObjectTypes) {
        if (namedObjectType.fromRdfResource(resource, fromRdfResourceOptions).ifRight(object => {
          resources.push({ object, namedObjectType, resource });
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
  for (let { object, namedObjectType, resource } of resources) {
    if (!object) {
      let objectEither: ${this.reusables.imports.Either}<Error, ObjectT>;
      if (namedObjectType) {
        objectEither = namedObjectType.fromRdfResource(resource, fromRdfResourceOptions);
      } else {
        objectEither = ${this.reusables.imports.Left}(new Error("no object types"));
        for (const tryObjectType of namedObjectTypes) {
          objectEither = tryObjectType.fromRdfResource(resource, fromRdfResourceOptions);
          if (objectEither.isRight()) {
            namedObjectType = tryObjectType;
            break;
          }
        }
      }
      if (objectEither.isLeft()) {
        return objectEither;
      }
      object = objectEither.unsafeCoerce();
    }
    if (!namedObjectType) {
      throw new Error("namedObjectType should be set here");
    }

    if (query?.filter && !namedObjectType.filter(query.filter, object)) {
      continue;
    }

    if (objectI++ >= offset) {
      objects.push(object);
      if (objects.length === limit) {
        return ${this.reusables.imports.Right}(objects);
      }
    }
  }
  return ${this.reusables.imports.Right}(objects);
}`,
          ]
        : []),
    ],
    { on: "\n\n" },
  )}
}`;
}
