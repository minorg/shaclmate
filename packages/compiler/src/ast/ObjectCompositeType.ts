import TermSet from "@rdfjs/term-set";
import type { NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import type { TsFeature } from "enums/TsFeature.js";
import { Maybe } from "purify-ts";
import { Resource } from "rdfjs-resource";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { CompositeType } from "./CompositeType.js";
import { IdentifierType } from "./IdentifierType.js";
import { Name } from "./Name.js";
import type { ObjectIntersectionType } from "./ObjectIntersectionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";

/**
 * A composite of object types, such as an intersection or union.
 */
export abstract class ObjectCompositeType<
  ObjectCompositeTypeT extends ObjectIntersectionType | ObjectUnionType,
> extends CompositeType<ObjectCompositeTypeT | ObjectType> {
  /**
   * Documentation comment from rdfs:comment.
   */
  readonly comment: Maybe<string>;

  /**
   * Should generated code derived from this type be visible outside its module?
   *
   * Defaults to true.
   */
  readonly export: boolean;

  abstract readonly kind: "ObjectIntersectionType" | "ObjectUnionType";

  /**
   * Human-readable label from rdfs:label.
   */
  readonly label: Maybe<string>;

  /**
   * Name of this type, usually derived from sh:name or shaclmate:name.
   */
  readonly name: Name;

  /**
   * TypeScript features to generate.
   */
  readonly #tsFeatures: Maybe<ReadonlySet<TsFeature>>;

  constructor({
    comment,
    export_,
    label,
    name,
    tsFeatures,
  }: {
    comment: Maybe<string>;
    export_: boolean;
    label: Maybe<string>;
    name: Name;
    tsFeatures: Maybe<ReadonlySet<TsFeature>>;
  }) {
    super();
    this.comment = comment;
    this.export = export_;
    this.label = label;
    this.name = name;
    this.#tsFeatures = tsFeatures;
  }

  @Memoize()
  get identifierType(): IdentifierType {
    const memberIdentifierTypeNodeKinds = new Set<IdentifierNodeKind>();
    const memberIdentifierTypesIn = new TermSet<NamedNode>();
    for (const memberType of this.memberTypes) {
      for (const nodeKind of memberType.identifierType.nodeKinds) {
        memberIdentifierTypeNodeKinds.add(nodeKind);
      }
      for (const in_ of memberType.identifierType.in_) {
        memberIdentifierTypesIn.add(in_);
      }
    }
    invariant(
      memberIdentifierTypeNodeKinds.size > 0,
      // `could not infer ${ast.Name.toString(astType.name)} member type node kinds`,
    );

    return new IdentifierType({
      defaultValue: Maybe.empty(),
      hasValues: [],
      in_: [...memberIdentifierTypesIn],
      nodeKinds: memberIdentifierTypeNodeKinds,
    });
  }

  @Memoize()
  get memberObjectTypes(): readonly ObjectType[] {
    const memberObjectTypes: ObjectType[] = [];

    for (const memberType of this.memberTypes) {
      switch (memberType.kind) {
        case "ObjectType":
          memberObjectTypes.push(memberType);
          break;
        case "ObjectIntersectionType":
        case "ObjectUnionType": {
          invariant(memberType.kind === this.kind);
          memberObjectTypes.push(...memberType.memberObjectTypes);
          break;
        }
      }
    }

    invariant(memberObjectTypes.length >= this.memberTypes.length);

    // Member object types must have distinct RDF types or no RDF types at all.
    const fromRdfTypes = new TermSet<NamedNode>();
    let expectUniqueFromRdfTypesCount = 0;
    for (const memberObjectType of memberObjectTypes) {
      if (memberObjectType.extern) {
        continue;
      }
      expectUniqueFromRdfTypesCount++;
      memberObjectType.fromRdfType.ifJust((fromRdfType) =>
        fromRdfTypes.add(fromRdfType),
      );
    }
    if (
      fromRdfTypes.size > 0 &&
      fromRdfTypes.size !== expectUniqueFromRdfTypesCount
    ) {
      throw new Error(
        `one or more ${Name.toString(this.name)} members ([${memberObjectTypes.map((memberType) => Name.toString(memberType.name)).join(", ")}]) lack distinguishing fromRdfType's ({${[...fromRdfTypes].map((fromRdfType) => Resource.Identifier.toString(fromRdfType)).join(", ")}})`,
      );
    }

    return memberObjectTypes;
  }

  @Memoize()
  get tsFeatures(): ReadonlySet<TsFeature> {
    // Members of the composite type must have the same tsFeatures.
    // They must also have distinct RDF types or no RDF types at all.
    const mergedMemberTsFeatures = new Set<TsFeature>();
    for (
      let memberTypeI = 0;
      memberTypeI < this.memberObjectTypes.length;
      memberTypeI++
    ) {
      const memberType = this.memberObjectTypes[memberTypeI];

      if (memberTypeI === 0) {
        for (const tsFeature of memberType.tsFeatures) {
          mergedMemberTsFeatures.add(tsFeature);
        }
      }

      if (memberType.tsFeatures.size !== mergedMemberTsFeatures.size) {
        throw new Error(
          `${Name.toString(this.name)} has a member ObjectType (${Name.toString(memberType.name)}) with different tsFeatures than the other member ObjectType's`,
        );
      }

      for (const tsFeature of memberType.tsFeatures) {
        if (!mergedMemberTsFeatures.has(tsFeature)) {
          throw new Error(
            `${Name.toString(this.name)} has a member ObjectType (${Name.toString(memberType.name)}) with different tsFeatures than the other member ObjectType's`,
          );
        }
      }
    }

    return this.#tsFeatures.orDefault(mergedMemberTsFeatures);
  }
}
