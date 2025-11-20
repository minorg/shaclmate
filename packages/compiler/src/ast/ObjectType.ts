import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { Maybe } from "purify-ts";
import { Resource } from "rdfjs-resource";
import genericToposort from "toposort";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import type {
  IdentifierMintingStrategy,
  PropertyVisibility,
  TsFeature,
  TsObjectDeclarationType,
} from "../enums/index.js";
import type { Curie } from "./Curie.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { OptionType } from "./OptionType.js";
import type { SetType } from "./SetType.js";
import { Type } from "./Type.js";
import { arrayEquals } from "./equals.js";

export class ObjectType {
  /**
   * Classes generated from this type are abstract / cannot be instantiated themselves.
   *
   * Defaults to false.
   */
  readonly abstract: boolean;

  /**
   * Ancestor (parents, their parents, ad nauseum) ObjectTypes of this ObjectType.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  readonly #ancestorObjectTypes: ObjectType[] = [];

  /**
   * Immediate child ObjectTypes of this ObjectType.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  readonly #childObjectTypes: ObjectType[] = [];

  /**
   * Documentation comment from rdfs:comment.
   */
  readonly comment: Maybe<string>;

  /**
   * Descendant (children, their children, ad nauseum) ObjectTypes of this ObjectType.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  readonly #descendantObjectTypes: ObjectType[] = [];

  /**
   * Should generated code derived from this ObjectType be visible outside its module?
   *
   * Defaults to true.
   */
  readonly export: boolean;

  /**
   * If true, the code for this ObjectType is defined externally and should not be generated.
   *
   * Defaults to false.
   */
  readonly extern: boolean;

  /**
   * The expected rdf:type of instances of this ObjectType.
   *
   * This is usually the identifier of an sh:NodeShape that is also an rdfs:Class (i.e., a node shape with implicit
   * class targets).
   */
  readonly fromRdfType: Maybe<NamedNode>;

  /**
   * Strategy for minting new object identifiers.
   */
  readonly identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;

  /**
   * Identifier type.
   */
  readonly identifierType: IdentifierType;

  /**
   * Type discriminator.
   */
  readonly kind = "ObjectType";

  /**
   * Human-readable label from rdfs:label.
   */
  readonly label: Maybe<string>;

  /**
   * Name of this type, usually derived from sh:name or shaclmate:name.
   */
  readonly name: Maybe<string>;

  /**
   * Immediate parent ObjectTypes of this Object types.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  readonly #parentObjectTypes: ObjectType[] = [];

  /**
   * Properties of this ObjectType.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  readonly #properties: ObjectType.Property[] = [];

  readonly shapeIdentifier: BlankNode | NamedNode;

  /**
   * Was this type synthesized or did it come from SHACL?
   */
  readonly synthetic: boolean;

  /**
   * rdf:type's that will be added to this object when it's serialized toRdf.
   *
   * This is usually the identifier of an sh:NodeShape that is also an rdfs:Class (i.e., a node shape with implicit
   * class targets).
   */
  readonly toRdfTypes: readonly NamedNode[];

  /**
   * TypeScript features to generate.
   */
  readonly tsFeatures: ReadonlySet<TsFeature>;

  /**
   * TypeScript imports to add to generated code.
   *
   * This is often used in conjunction with extern=true to import the extern'd ObjectType code in order for generated
   * code to reference it.
   *
   * import { MyType } from "./MyType.js"
   */
  readonly tsImports: readonly string[];

  /**
   * Whether to generate a TypeScript class or interface for this type.
   */
  readonly tsObjectDeclarationType: TsObjectDeclarationType;

  constructor({
    abstract,
    comment,
    export_,
    extern,
    fromRdfType,
    identifierMintingStrategy,
    identifierType,
    label,
    name,
    shapeIdentifier,
    synthetic,
    toRdfTypes,
    tsFeatures,
    tsImports,
    tsObjectDeclarationType,
  }: {
    abstract: boolean;
    comment: Maybe<string>;
    export_: boolean;
    extern: boolean;
    fromRdfType: Maybe<NamedNode>;
    identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
    identifierType: IdentifierType;
    label: Maybe<string>;
    name: Maybe<string>;
    shapeIdentifier: BlankNode | Curie | NamedNode;
    synthetic: boolean;
    toRdfTypes: readonly NamedNode[];
    tsFeatures: ReadonlySet<TsFeature>;
    tsImports: readonly string[];
    tsObjectDeclarationType: TsObjectDeclarationType;
  }) {
    this.abstract = abstract;
    this.comment = comment;
    this.export = export_;
    this.extern = extern;
    this.fromRdfType = fromRdfType;
    this.identifierMintingStrategy = identifierMintingStrategy;
    this.identifierType = identifierType;
    this.label = label;
    this.name = name;
    this.shapeIdentifier = shapeIdentifier;
    this.synthetic = synthetic;
    this.toRdfTypes = toRdfTypes;
    this.tsFeatures = tsFeatures;
    this.tsImports = tsImports;
    this.tsObjectDeclarationType = tsObjectDeclarationType;
  }

  addAncestorObjectTypes(...ancestorObjectTypes: readonly ObjectType[]): void {
    this.#ancestorObjectTypes.push(...ancestorObjectTypes);
  }

  addChildObjectTypes(...childObjectTypes: readonly ObjectType[]): void {
    this.#childObjectTypes.push(...childObjectTypes);
  }

  addDescendantObjectTypes(
    ...descendantObjectTypes: readonly ObjectType[]
  ): void {
    this.#descendantObjectTypes.push(...descendantObjectTypes);
  }

  addParentObjectTypes(...parentObjectTypes: readonly ObjectType[]): void {
    this.#parentObjectTypes.push(...parentObjectTypes);
  }

  addProperties(...properties: readonly ObjectType.Property[]): void {
    this.#properties.push(...properties);
    for (const property of properties) {
      property.objectType = this;
    }
  }

  get ancestorObjectTypes(): readonly ObjectType[] {
    return this.#ancestorObjectTypes;
  }

  get childObjectTypes(): readonly ObjectType[] {
    return this.#childObjectTypes;
  }

  get descendantObjectTypes(): readonly ObjectType[] {
    return this.#descendantObjectTypes;
  }

  get parentObjectTypes(): readonly ObjectType[] {
    return this.#parentObjectTypes;
  }

  get properties(): readonly ObjectType.Property[] {
    return this.#properties;
  }

  equals(other: ObjectType): boolean {
    // Don't recurse
    return this.shapeIdentifier.equals(other.shapeIdentifier);
  }

  sortProperties(): void {
    this.#properties.sort((left, right) => {
      if (left.order < right.order) {
        return -1;
      }
      if (left.order > right.order) {
        return 1;
      }
      return 0;
    });
  }

  toString(): string {
    return `${this.kind}(shapeIdentifier=${Resource.Identifier.toString(this.shapeIdentifier)})`;
  }
}

export namespace ObjectType {
  export class Property {
    /**
     * Documentation comment from rdfs:comment.
     */
    readonly comment: Maybe<string>;

    /**
     * Description from sh:description.
     */
    readonly description: Maybe<string>;

    /**
     * Human-readable label from rdfs:label.
     */
    readonly label: Maybe<string>;

    /**
     * The property should be mutable in generated code i.e., it should be re-assignable. The property value may or may
     * not be mutable.
     */
    readonly mutable: boolean;

    /**
     * Object type this property belongs to.
     */
    #objectType: ObjectType | null = null;

    /**
     * Name of this property, derived from sh:name or shaclmate:name.
     */
    readonly name: Maybe<string>;

    /**
     * Relative order of this property, derived from sh:order.
     */
    readonly order: number;

    /**
     * The property will be resolved lazily, with this type serving as a partial before resolution of the actual type (type).
     *
     * This type will mirror type: if type is an OptionType<ObjectType>, this will also be an OptionType<ObjectType>.
     */
    readonly partialType: Maybe<
      | ObjectType
      | ObjectUnionType
      | OptionType<ObjectType | ObjectUnionType>
      | SetType<ObjectType | ObjectUnionType>
    >;

    /**
     * SHACL property path (https://www.w3.org/TR/shacl/#property-paths)
     */
    readonly path: Curie | NamedNode;

    /**
     * Identifier of the property shape.
     */
    readonly shapeIdentifier: BlankNode | NamedNode;

    /**
     * Type of this property.
     */
    readonly type: Type;

    /**
     * Visibility: private, protected, public.
     */
    readonly visibility: PropertyVisibility;

    constructor({
      comment,
      description,
      label,
      mutable,
      name,
      order,
      partialType,
      path,
      shapeIdentifier,
      type,
      visibility,
    }: {
      comment: Maybe<string>;
      description: Maybe<string>;
      label: Maybe<string>;
      mutable: boolean;
      name: Maybe<string>;
      order: number;
      partialType: Maybe<
        | ObjectType
        | ObjectUnionType
        | OptionType<ObjectType | ObjectUnionType>
        | SetType<ObjectType | ObjectUnionType>
      >;
      path: Curie | NamedNode;
      shapeIdentifier: BlankNode | NamedNode;
      type: Type;
      visibility: PropertyVisibility;
    }) {
      this.comment = comment;
      this.description = description;
      this.label = label;
      this.mutable = mutable;
      this.name = name;
      this.order = order;
      this.partialType = partialType;
      this.path = path;
      this.shapeIdentifier = shapeIdentifier;
      this.type = type;
      this.visibility = visibility;
    }

    equals(other: Property): boolean {
      return this.shapeIdentifier.equals(other.shapeIdentifier);
    }

    get objectType(): ObjectType {
      invariant(this.#objectType !== null);
      return this.#objectType;
    }

    set objectType(objectType: ObjectType) {
      invariant(this.#objectType === null);
      this.#objectType = objectType;
    }

    /**
     * Does the property directly or indirectly reference the ObjectType itself?
     */
    @Memoize()
    get recursive(): boolean {
      const DEBUG = false;

      const rootObjectType = this.objectType;
      const rootProperty = this;

      function helper(
        stack: {
          objectType: ObjectType;
          property: ObjectType.Property;
          propertyType?: readonly Type[];
        }[],
      ): boolean {
        const currentStackFrame = stack.at(-1)!;
        const { objectType, property, propertyType } = currentStackFrame;

        if (DEBUG) {
          process.stderr.write(
            `${[
              stack.length.toString(),
              rootObjectType,
              rootProperty,
              objectType,
              property,
              propertyType
                ? `[${propertyType.map(Type.toString).join(", ")}]`
                : "undefined",
            ].join(",")}\n`,
          );
        }

        for (const lowerStackFrame of stack.slice(0, -1)) {
          if (
            !Type.equals(
              currentStackFrame.objectType,
              lowerStackFrame.objectType,
            )
          ) {
            continue;
          }
          if (!currentStackFrame.property.equals(lowerStackFrame.property)) {
            continue;
          }
          if (
            !arrayEquals(
              currentStackFrame.propertyType ?? [],
              lowerStackFrame.propertyType ?? [],
              Type.equals,
            )
          ) {
            continue;
          }

          // We've seen this combination before and don't want to recurse further, to avoid infinite recursion
          if (DEBUG) {
            process.stderr.write("recursion detected, halting");
          }
          return true;
        }

        if (!propertyType) {
          const partialType = property.partialType.extract();
          if (partialType) {
            if (
              helper(
                stack.concat({
                  objectType,
                  property,
                  propertyType: [partialType],
                }),
              )
            ) {
              return true;
            }
          }

          return helper(
            stack.concat({
              objectType,
              property,
              propertyType: [property.type],
            }),
          );
        }

        invariant(propertyType.length > 0);
        const currentPropertyType = propertyType.at(-1)!;

        switch (currentPropertyType.kind) {
          case "IdentifierType":
          case "LiteralType":
          case "PlaceholderType":
          case "TermType":
            return false;
          case "ObjectType": {
            if (DEBUG) {
              process.stderr.write(`recurse into ${currentPropertyType}`);
            }
            for (const property of currentPropertyType.properties) {
              if (
                helper(
                  stack.concat({
                    objectType: currentPropertyType,
                    property,
                  }),
                )
              ) {
                return true;
              }
            }

            return false;
          }
          case "IntersectionType":
          case "UnionType": {
            if (DEBUG) {
              process.stderr.write(`recurse into ${currentPropertyType}`);
            }
            for (const memberType of currentPropertyType.memberTypes) {
              if (
                helper(
                  stack.concat({
                    objectType,
                    property,
                    propertyType: propertyType.concat(memberType),
                  }),
                )
              ) {
                return true;
              }
            }
            return false;
          }
          case "ObjectIntersectionType":
          case "ObjectUnionType": {
            if (DEBUG) {
              process.stderr.write(`recurse into ${currentPropertyType}`);
            }
            for (const memberType of currentPropertyType.memberObjectTypes) {
              for (const property of memberType.properties) {
                if (
                  helper(
                    stack.concat({
                      objectType: memberType,
                      property,
                    }),
                  )
                ) {
                  return true;
                }
              }
            }
            return false;
          }
          case "ListType":
          case "OptionType":
          case "SetType":
            return helper(
              stack.concat({
                objectType,
                property,
                propertyType: propertyType.concat(currentPropertyType.itemType),
              }),
            );
        }
      }

      return helper([{ objectType: rootObjectType, property: rootProperty }]);
    }

    toString(): string {
      return `${this.name.orDefault(Resource.Identifier.toString(this.shapeIdentifier))}(path=${this.path.value})`;
    }
  }
}

export namespace ObjectType {
  export function toposort(
    objectTypes: readonly ObjectType[],
  ): readonly ObjectType[] {
    const objectTypesByShapeIdentifier: Record<string, ObjectType> = {};
    const objectTypeGraphNodes: string[] = [];
    const objectTypeGraphEdges: [string, string | undefined][] = [];
    for (const objectType of objectTypes) {
      const objectTypeShapeIdentifier = Resource.Identifier.toString(
        objectType.shapeIdentifier,
      );
      objectTypesByShapeIdentifier[objectTypeShapeIdentifier] = objectType;
      objectTypeGraphNodes.push(objectTypeShapeIdentifier);
      for (const parentAstObjectType of objectType.parentObjectTypes) {
        objectTypeGraphEdges.push([
          objectTypeShapeIdentifier,
          Resource.Identifier.toString(parentAstObjectType.shapeIdentifier),
        ]);
      }
    }
    return genericToposort
      .array(objectTypeGraphNodes, objectTypeGraphEdges)
      .map(
        (objectTypeIdentifier) =>
          objectTypesByShapeIdentifier[objectTypeIdentifier],
      )
      .reverse();
  }
}
