import type { NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind, NodeKind } from "@shaclmate/shacl-ast";
import { owl, rdfs } from "@tpluscode/rdf-ns-builders";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import * as input from "../input/index.js";
import { logger } from "../logger.js";
import type { ShapeStack } from "./ShapeStack.js";
import { flattenAstObjectCompositeTypeMemberTypes } from "./flattenAstObjectCompositeTypeMemberTypes.js";

/**
 * Try to convert a shape to a composite type (intersection or union) using some heuristics.
 */
export function transformShapeToAstCompositeType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  shapeStack: ShapeStack,
): Either<Error, ast.CardinalityType.ItemType> {
  shapeStack.push(shape);
  try {
    let memberTypeEithers: readonly Either<
      Error,
      ast.CardinalityType.ItemType
    >[];
    let compositeTypeKind: "IntersectionType" | "UnionType";

    if (shape.constraints.and.length > 0) {
      memberTypeEithers = shape.constraints.and.map((memberShape) =>
        this.transformShapeToAstType(memberShape, shapeStack),
      );
      compositeTypeKind = "IntersectionType";
    } else if (shape.constraints.classes.length > 0) {
      memberTypeEithers = shape.constraints.classes.map((classIri) => {
        if (
          classIri.equals(owl.Class) ||
          classIri.equals(owl.Thing) ||
          classIri.equals(rdfs.Class)
        ) {
          return Left(
            new Error(`class ${classIri.value} is not transformable`),
          );
        }

        const classNodeShape = this.shapesGraph
          .nodeShapeByIdentifier(classIri)
          .extractNullable();
        if (classNodeShape === null) {
          return Left(
            new Error(
              `class ${classIri.value} did not resolve to a node shape`,
            ),
          );
        }

        return this.transformNodeShapeToAstType(classNodeShape);
      });
      compositeTypeKind = "IntersectionType";

      if (Either.rights(memberTypeEithers).length === 0) {
        // This frequently happens with e.g., sh:class skos:Concept
        logger.debug(
          "shape %s sh:class(es) did not map to any node shapes",
          shape,
        );
        return memberTypeEithers[0];
      }
    } else if (shape.constraints.nodes.length > 0) {
      memberTypeEithers = shape.constraints.nodes.map((nodeShape) =>
        this.transformNodeShapeToAstType(nodeShape),
      );
      compositeTypeKind = "IntersectionType";
    } else if (shape.constraints.xone.length > 0) {
      memberTypeEithers = shape.constraints.xone.map((memberShape) =>
        this.transformShapeToAstType(memberShape, shapeStack),
      );
      compositeTypeKind = "UnionType";
    } else {
      return Left(new Error(`unable to transform ${shape} into an AST type`));
    }
    invariant(memberTypeEithers.length > 0);

    const memberObjectTypes: (
      | ast.ObjectType
      | ast.ObjectIntersectionType
      | ast.ObjectUnionType
    )[] = [];
    let memberTypes: ast.CardinalityType.ItemType[] = [];
    for (const memberTypeEither of memberTypeEithers) {
      if (memberTypeEither.isLeft()) {
        return memberTypeEither;
      }
      const memberType = memberTypeEither.unsafeCoerce();
      memberTypes.push(memberType);
      switch (memberType.kind) {
        case "ObjectType":
        case "ObjectIntersectionType":
        case "ObjectUnionType":
          memberObjectTypes.push(memberType);
          break;
      }
    }

    if (memberTypes.length === 1) {
      return Either.of(memberTypes[0]);
    }

    if (memberTypes.length === memberObjectTypes.length) {
      // If all the member types are ast.ObjectType, flatten them.
      const flattenedMemberObjectTypesEither =
        flattenAstObjectCompositeTypeMemberTypes({
          objectCompositeTypeKind:
            compositeTypeKind === "IntersectionType"
              ? "ObjectIntersectionType"
              : "ObjectUnionType",
          memberTypes: memberObjectTypes,
          shape,
        });
      if (flattenedMemberObjectTypesEither.isLeft()) {
        return flattenedMemberObjectTypesEither;
      }
      const { memberTypes: flattenedMemberTypes } =
        flattenedMemberObjectTypesEither.unsafeCoerce();
      memberTypes = flattenedMemberTypes.concat();
    }

    return widenAstCompositeTypeToSingleType({
      memberTypes,
      shape,
      shapeStack,
    }).altLazy(() =>
      // True composite type
      Either.of({
        kind: compositeTypeKind,
        memberTypes,
      }),
    );
  } finally {
    shapeStack.pop(shape);
  }
}

function widenAstCompositeTypeToSingleType({
  memberTypes,
  shape,
  shapeStack,
}: {
  memberTypes: readonly ast.CardinalityType.ItemType[];
  shape: input.Shape;
  shapeStack: ShapeStack;
}): Either<Error, ast.CardinalityType.ItemType> {
  const defaultValue = shapeStack.defaultValue;
  const hasValues = shapeStack.constraints.hasValues;

  if (hasValues.length > 0) {
    return Left(
      new Error(
        `shape ${shape} hasValues, not attempting to widen composite type into a single type`,
      ),
    );
  }

  if (shape instanceof input.PropertyShape && !shape.widen.orDefault(true)) {
    return Left(new Error(`shape ${shape} has widening disabled`));
  }

  const canWiden = (
    memberType: ast.IdentifierType | ast.LiteralType | ast.TermType,
  ) => {
    if (memberType.in_.length > 0) {
      return false;
    }

    switch (memberType.kind) {
      case "LiteralType": {
        if ((memberType as ast.LiteralType).maxExclusive.isJust()) {
          return false;
        }
        if ((memberType as ast.LiteralType).maxInclusive.isJust()) {
          return false;
        }
        if ((memberType as ast.LiteralType).minExclusive.isJust()) {
          return false;
        }
        if ((memberType as ast.LiteralType).minInclusive.isJust()) {
          return false;
        }
      }
    }

    return true;
  };

  if (
    memberTypes.every(
      (memberType) =>
        memberType.kind === "IdentifierType" && canWiden(memberType),
    )
  ) {
    // Special case: all member types are identifiers without further constraints
    return Either.of({
      defaultValue: defaultValue.filter(
        (term) => term.termType === "NamedNode",
      ) as Maybe<NamedNode>,
      hasValues: [],
      in_: [],
      kind: "IdentifierType",
      nodeKinds: new Set<IdentifierNodeKind>(
        memberTypes
          .filter((memberType) => memberType.kind === "IdentifierType")
          .flatMap((memberType) => [
            ...(memberType as ast.IdentifierType).nodeKinds,
          ]),
      ),
    });
  }

  if (
    memberTypes.every(
      (memberType) => memberType.kind === "LiteralType" && canWiden(memberType),
    )
  ) {
    // Special case: all the member types are Literals without further constraints,
    // like dash:StringOrLangString
    // Don't try to widen range constraints.
    return Either.of({
      datatype: Maybe.empty(),
      defaultValue: defaultValue.filter((term) => term.termType === "Literal"),
      hasValues: [],
      in_: [],
      kind: "LiteralType",
      languageIn: [],
      maxExclusive: Maybe.empty(),
      maxInclusive: Maybe.empty(),
      minExclusive: Maybe.empty(),
      minInclusive: Maybe.empty(),
      nodeKinds: new Set<"Literal">(["Literal"]),
    });
  }

  if (
    memberTypes.every(
      (memberType) =>
        (memberType.kind === "IdentifierType" ||
          memberType.kind === "LiteralType" ||
          memberType.kind === "TermType") &&
        canWiden(memberType),
    )
  ) {
    // Special case: all member types are terms without further constraints
    const nodeKinds = new Set<NodeKind>(
      memberTypes.flatMap((memberType) => [
        ...(memberType as ast.TermType).nodeKinds,
      ]),
    );
    invariant(
      nodeKinds.has("Literal") &&
        (nodeKinds.has("BlankNode") || nodeKinds.has("NamedNode")),
    ); // The identifier-identifier and literal-literal cases should have been caught above
    return Either.of({
      defaultValue,
      hasValues: [],
      in_: [],
      kind: "TermType",
      nodeKinds,
    });
  }

  return Left(
    new Error(
      `shape ${shape} member types could not be widened into a single type`,
    ),
  );
}
