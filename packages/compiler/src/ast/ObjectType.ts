import type { NamedNode } from "@rdfjs/types";
import type { NodeKind, PredicatePath } from "@shaclmate/shacl-ast";
import type { Maybe } from "purify-ts";
import { Resource } from "rdfjs-resource";
import genericToposort from "toposort";
import type {
  IdentifierMintingStrategy,
  PropertyVisibility,
  TsFeature,
  TsObjectDeclarationType,
} from "../enums/index.js";
import type { CardinalityType } from "./CardinalityType.js";
import type { Name } from "./Name.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { Type } from "./Type.js";

export interface ObjectType {
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
  readonly ancestorObjectTypes: ObjectType[];

  /**
   * Immediate child ObjectTypes of this ObjectType.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  readonly childObjectTypes: ObjectType[];

  /**
   * Documentation comment from rdfs:comment.
   */
  readonly comment: Maybe<string>;

  /**
   * Descendant (children, their children, ad nauseum) ObjectTypes of this ObjectType.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  readonly descendantObjectTypes: ObjectType[];

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
   * Instances of this ObjectType must have explicit identifiers and the identifiers must be in this list of IRIs.
   *
   * Mutually exclusive with minting strategies
   */
  readonly identifierIn: readonly NamedNode[];

  /**
   * The RDF node kinds this ObjectType may be identified by.
   *
   * Used to associate instances with an RDF identifier.
   */
  readonly identifierNodeKinds: Set<Exclude<NodeKind, "Literal">>;

  /**
   * Strategy for minting new object identifiers.
   */
  readonly identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;

  /**
   * Type discriminator.
   */
  readonly kind: "ObjectType";

  /**
   * Human-readable label from rdfs:label.
   */
  readonly label: Maybe<string>;

  /**
   * Name of this type, usually derived from sh:name or shaclmate:name.
   */
  readonly name: Name;

  /**
   * Immediate parent ObjectTypes of this Object types.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  readonly parentObjectTypes: ObjectType[];

  /**
   * Properties of this ObjectType.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  readonly properties: ObjectType.Property[];

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
  readonly tsFeatures: Set<TsFeature>;

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
}

export namespace ObjectType {
  export interface Property {
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
    readonly mutable: Maybe<boolean>;

    /**
     * Name of this property.
     */
    readonly name: Name;

    /**
     * Relative order of this property, derived from sh:order.
     */
    readonly order: number;

    /**
     * SHACL property path (https://www.w3.org/TR/shacl/#property-paths)
     */
    readonly path: PredicatePath;

    /**
     * Does the property directly or indirectly reference the ObjectType itself?
     */
    readonly recursive?: boolean;

    /**
     * The property will be resolved lazily, with this type serving as a stub before resolution of the actual type (type).
     *
     * This type will mirror type: if type is an OptionType<ObjectType>, this will also be an OptionType<ObjectType>.
     */
    readonly stubType: Maybe<CardinalityType<ObjectType | ObjectUnionType>>;

    /**
     * Type of this property.
     */
    readonly type: Type;

    /**
     * Visibility: private, protected, public.
     */
    readonly visibility: PropertyVisibility;
  }

  export function toposort(
    objectTypes: readonly ObjectType[],
  ): readonly ObjectType[] {
    const objectTypesByIdentifier: Record<string, ObjectType> = {};
    const objectTypeGraphNodes: string[] = [];
    const objectTypeGraphEdges: [string, string | undefined][] = [];
    for (const objectType of objectTypes) {
      const objectTypeIdentifier = Resource.Identifier.toString(
        objectType.name.identifier,
      );
      objectTypesByIdentifier[objectTypeIdentifier] = objectType;
      objectTypeGraphNodes.push(objectTypeIdentifier);
      for (const parentAstObjectType of objectType.parentObjectTypes) {
        objectTypeGraphEdges.push([
          objectTypeIdentifier,
          Resource.Identifier.toString(parentAstObjectType.name.identifier),
        ]);
      }
    }
    return genericToposort
      .array(objectTypeGraphNodes, objectTypeGraphEdges)
      .map(
        (objectTypeIdentifier) => objectTypesByIdentifier[objectTypeIdentifier],
      )
      .reverse();
  }
}
