import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import type { NodeKind } from "@shaclmate/shacl-ast";
import { owl, rdfs } from "@tpluscode/rdf-ns-builders";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import * as input from "../input/index.js";
import { logger } from "../logger.js";

/**
 * Try to convert a property shape to a composite type (intersection or union) using some heuristics.
 */
export function transformPropertyShapeToAstCompositeType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  inherited: {
    defaultValue: Maybe<BlankNode | Literal | NamedNode>;
    inline: Maybe<boolean>;
  } | null,
): Either<Error, ast.Type> {
  const defaultValue = (
    shape instanceof input.PropertyShape ? shape.defaultValue : Maybe.empty()
  ).alt(inherited !== null ? inherited.defaultValue : Maybe.empty());

  const hasValue = shape.constraints.hasValue;
  const inline = shape.inline.alt(
    inherited !== null ? inherited.inline : Maybe.empty(),
  );

  let memberTypeEithers: readonly Either<Error, ast.Type>[];
  let compositeTypeKind: "IntersectionType" | "UnionType";

  if (shape.constraints.and.length > 0) {
    memberTypeEithers = shape.constraints.and.map((memberShape) =>
      this.transformPropertyShapeToAstType(memberShape, {
        defaultValue,
        inline,
      }),
    );
    compositeTypeKind = "IntersectionType";
  } else if (shape.constraints.classes.length > 0) {
    memberTypeEithers = shape.constraints.classes.map((classIri) => {
      if (
        classIri.equals(owl.Class) ||
        classIri.equals(owl.Thing) ||
        classIri.equals(rdfs.Class)
      ) {
        return Left(new Error(`class ${classIri.value} is not transformable`));
      }

      const classNodeShape = this.shapesGraph
        .nodeShapeByNode(classIri)
        .extractNullable();
      if (classNodeShape === null) {
        return Left(
          new Error(`class ${classIri.value} did not resolve to a node shape`),
        );
      }
      const classAstTypeEither =
        this.transformNodeShapeToAstType(classNodeShape);
      if (classAstTypeEither.isLeft()) {
        return classAstTypeEither;
      }
      const classAstType = classAstTypeEither.unsafeCoerce();
      if (classAstType.kind !== "ObjectType") {
        return Left(
          new Error(
            `class ${classIri.value} was transformed into a non-ObjectType`,
          ),
        );
      }
      const classObjectType: ast.ObjectType = classAstType;

      if (inline.orDefault(false)) {
        return Either.of(classObjectType);
      }

      return Either.of({
        defaultValue: defaultValue.filter(
          (term) => term.termType === "NamedNode",
        ),
        hasValue: Maybe.empty(),
        in_: Maybe.empty(),
        kind: "IdentifierType",
        nodeKinds: classObjectType.nodeKinds,
      });
    });
    compositeTypeKind = "IntersectionType";
  } else if (shape.constraints.nodes.length > 0) {
    memberTypeEithers = shape.constraints.nodes.map((nodeShape) =>
      this.transformNodeShapeToAstType(nodeShape),
    );
    compositeTypeKind = "IntersectionType";
  } else if (shape.constraints.or.length > 0) {
    memberTypeEithers = shape.constraints.or.map((memberShape) =>
      this.transformPropertyShapeToAstType(memberShape, {
        defaultValue,
        inline,
      }),
    );
    compositeTypeKind = "UnionType";
  } else {
    return Left(new Error(`unable to transform ${shape} into an AST type`));
  }
  invariant(memberTypeEithers.length > 0);

  const memberTypes = Either.rights(memberTypeEithers);
  if (memberTypes.length !== memberTypeEithers.length) {
    logger.warn(
      "shape %s composition did not map all member types successfully",
      shape,
    );
    return memberTypeEithers[0];
  }
  invariant(memberTypes.length > 0);

  if (memberTypes.length === 1) {
    return Either.of(memberTypes[0]);
  }

  // Get the type underlying a set or option
  const memberItemTypes = memberTypes.map((memberType) => {
    switch (memberType.kind) {
      case "SetType":
        return memberType.itemType;
      case "OptionType":
        return memberType.itemType;
      default:
        return memberType;
    }
  });

  if (
    hasValue.isNothing() &&
    memberItemTypes.every(
      (memberItemType) =>
        memberItemType.kind === "LiteralType" &&
        memberItemType.maxExclusive.isNothing() &&
        memberItemType.maxInclusive.isNothing() &&
        memberItemType.minExclusive.isNothing() &&
        memberItemType.minInclusive.isNothing(),
    )
  ) {
    // Special case: all the member types are Literals without further constraints,
    // like dash:StringOrLangString
    return Either.of({
      datatype: Maybe.empty(),
      defaultValue: defaultValue.filter((term) => term.termType === "Literal"),
      hasValue: Maybe.empty(),
      in_: Maybe.empty(),
      kind: "LiteralType",
      maxExclusive: Maybe.empty(),
      maxInclusive: Maybe.empty(),
      minExclusive: Maybe.empty(),
      minInclusive: Maybe.empty(),
    });
  }

  if (
    hasValue.isNothing() &&
    memberItemTypes.every(
      (memberItemType) => memberItemType.kind === "IdentifierType",
    )
  ) {
    // Special case: all member types are blank or named nodes without further constraints
    return Either.of({
      defaultValue: defaultValue.filter(
        (term) => term.termType === "NamedNode",
      ),
      hasValue: Maybe.empty(),
      in_: Maybe.empty(),
      kind: "IdentifierType",
      nodeKinds: new Set<NodeKind.BLANK_NODE | NodeKind.IRI>(
        memberItemTypes
          .filter((memberItemType) => memberItemType.kind === "IdentifierType")
          .flatMap((memberItemType) => [...memberItemType.nodeKinds]),
      ),
    });
  }

  return Either.of({
    kind: compositeTypeKind,
    memberTypes: memberTypes,
  });
}