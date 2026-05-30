import type { BlankNode, NamedNode } from "@rdfjs/types";
import { PropertyPath } from "@rdfx/resource";
import { NTriplesIdentifier } from "@rdfx/string";
import type { NodeKind } from "@shaclmate/shacl-ast";
import type { Maybe } from "purify-ts";
import genericToposort from "toposort";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import { arrayEquals } from "./equals.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import { Type } from "./Type.js";

export class ObjectType extends AbstractType {
  /**
   * Properties of this ObjectType.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  readonly #properties: ObjectType.Property[] = [];

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
   * Identifier type.
   */
  readonly identifierType: BlankNodeType | IdentifierType | IriType;

  /**
   * Type discriminant.
   */
  readonly kind = "Object";
  override readonly nodeKinds = nodeKinds;

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
   * TypeScript imports to add to generated code.
   *
   * This is often used in conjunction with extern=true to import the extern'd ObjectType code in order for generated
   * code to reference it.
   *
   * import { MyType } from "./MyType.js"
   */
  readonly tsImports: readonly string[];

  constructor({
    extern,
    fromRdfType,
    identifierType,
    synthetic,
    toRdfTypes,
    tsImports,
    ...superParameters
  }: {
    extern: boolean;
    fromRdfType: Maybe<NamedNode>;
    identifierType: BlankNodeType | IdentifierType | IriType;
    synthetic: boolean;
    toRdfTypes: readonly NamedNode[];
    tsImports: readonly string[];
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.extern = extern;
    this.fromRdfType = fromRdfType;
    this.identifierType = identifierType;
    this.synthetic = synthetic;
    this.toRdfTypes = toRdfTypes;
    this.tsImports = tsImports;
  }

  get properties(): readonly ObjectType.Property[] {
    return this.#properties;
  }

  override get recursive(): boolean {
    return this.properties.some((property) => property.recursive);
  }

  addProperties(...properties: readonly ObjectType.Property[]): void {
    this.#properties.push(...properties);
    for (const property of properties) {
      invariant(Object.is(property.objectType, this));
    }
  }

  override equals(other: ObjectType): boolean {
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

  override toJSON() {
    return {
      ...super.toJSON(),
      fromRdfType: this.fromRdfType.extract(),
      identifierType: this.identifierType.toJSON(),
      synthetic: this.synthetic ? true : undefined,
      toRdfTypes: this.toRdfTypes.length > 0 ? this.toRdfTypes : undefined,
    };
  }
}

const nodeKinds: ReadonlySet<NodeKind> = new Set(["BlankNode", "IRI"]);

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
     * Should the property and its value be displayed in a toString()-type representation?
     */
    readonly display: boolean;

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
     * Name of this property, derived from sh:name or shaclmate:name.
     */
    readonly name: string;

    /**
     * Object type this property belongs to.
     */
    readonly objectType: ObjectType;

    /**
     * Relative order of this property, derived from sh:order.
     */
    readonly order: number;

    /**
     * SHACL property path (https://www.w3.org/TR/shacl/#property-paths)
     */
    readonly path: PropertyPath;

    /**
     * Identifier of the property shape.
     */
    readonly shapeIdentifier: BlankNode | NamedNode;

    /**
     * Type of this property.
     */
    readonly type: Type;

    constructor({
      comment,
      description,
      display,
      label,
      mutable,
      name,
      objectType,
      order,
      path,
      shapeIdentifier,
      type,
    }: {
      comment: Maybe<string>;
      description: Maybe<string>;
      display: boolean;
      label: Maybe<string>;
      mutable: boolean;
      name: string;
      objectType: ObjectType;
      order: number;
      path: PropertyPath;
      shapeIdentifier: BlankNode | NamedNode;
      type: Type;
    }) {
      this.comment = comment;
      this.description = description;
      this.display = display;
      this.label = label;
      this.mutable = mutable;
      this.name = name;
      this.objectType = objectType;
      this.order = order;
      this.path = path;
      this.shapeIdentifier = shapeIdentifier;
      this.type = type;
    }

    equals(other: Property): boolean {
      return this.shapeIdentifier.equals(other.shapeIdentifier);
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
            !arrayEquals(Type.equals)(
              currentStackFrame.propertyType ?? [],
              lowerStackFrame.propertyType ?? [],
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
          case "BlankNode":
          case "Identifier":
          case "Iri":
          case "Literal":
          case "Term":
            return false;
          case "LazyObjectOption":
          case "LazyObjectSet":
          case "LazyObject": {
            if (
              helper(
                stack.concat({
                  objectType,
                  property,
                  propertyType: propertyType.concat(
                    currentPropertyType.partialType,
                  ),
                }),
              )
            ) {
              return true;
            }

            if (
              helper(
                stack.concat({
                  objectType,
                  property,
                  propertyType: propertyType.concat(
                    currentPropertyType.resolveType,
                  ),
                }),
              )
            ) {
              return true;
            }

            return false;
          }

          case "Object": {
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
          case "Intersection":
          case "Union": {
            if (DEBUG) {
              process.stderr.write(`recurse into ${currentPropertyType}`);
            }
            for (const member of currentPropertyType.members) {
              if (
                helper(
                  stack.concat({
                    objectType,
                    property,
                    propertyType: propertyType.concat(member.type),
                  }),
                )
              ) {
                return true;
              }
            }
            return false;
          }
          case "DefaultValue":
          case "List":
          case "Option":
          case "Set":
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

    toJSON() {
      return {
        comment: this.comment.extract(),
        description: this.description.extract(),
        label: this.label.extract(),
        mutable: this.mutable ? true : undefined,
        name: this.name,
        order: this.order,
        path: PropertyPath.toString(this.path),
        recursive: this.recursive ? true : undefined,
        shapeIdentifier: this.shapeIdentifier,
        type: this.type.toJSON(),
      };
    }

    toString(): string {
      return JSON.stringify(this.toJSON());
    }
  }
}
