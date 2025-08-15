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
    extern: Maybe<boolean>;
  } | null,
): Either<Error, ast.Type> {
  const defaultValue = (
    shape instanceof input.PropertyShape ? shape.defaultValue : Maybe.empty()
  ).alt(inherited !== null ? inherited.defaultValue : Maybe.empty());

  const extern = shape.extern.alt(
    inherited !== null ? inherited.extern : Maybe.empty(),
  );

  let memberTypeEithers: readonly Either<Error, ast.Type>[];
  let compositeTypeKind: "IntersectionType" | "UnionType";

  const transformNodeShapeToAstCompositeMemberType = (
    nodeShape: input.NodeShape,
  ): Either<Error, ast.Type> => {
    const astTypeEither = this.transformNodeShapeToAstType(nodeShape);
    if (astTypeEither.isLeft()) {
      return astTypeEither;
    }
    const astType = astTypeEither.unsafeCoerce();

    if (extern.orDefault(false)) {
      // Use the identifier type instead
      let nodeKinds: Set<"BlankNode" | "NamedNode">;
      switch (astType.kind) {
        case "ListType":
          nodeKinds = new Set();
          nodeKinds.add(astType.identifierNodeKind);
          break;
        case "ObjectType":
          nodeKinds = astType.identifierKinds;
          break;
        case "ObjectIntersectionType":
        case "ObjectUnionType":
          nodeKinds = new Set();
          for (const memberType of astType.memberTypes) {
            for (const nodeKind of memberType.identifierKinds) {
              nodeKinds.add(nodeKind);
            }
          }
      }

      return Either.of({
        defaultValue: defaultValue.filter(
          (term) => term.termType === "NamedNode",
        ) as Maybe<NamedNode>,
        hasValues: [],
        in_: [],
        kind: "IdentifierType",
        nodeKinds,
      });
    }

    // Not extern, use the type
    return Either.of(astType);
  };

  if (shape.constraints.and.length > 0) {
    memberTypeEithers = shape.constraints.and.map((memberShape) =>
      this.transformPropertyShapeToAstType(memberShape, {
        defaultValue,
        extern: extern,
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
        .nodeShapeByIdentifier(classIri)
        .extractNullable();
      if (classNodeShape === null) {
        return Left(
          new Error(`class ${classIri.value} did not resolve to a node shape`),
        );
      }

      return transformNodeShapeToAstCompositeMemberType(classNodeShape);
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
      transformNodeShapeToAstCompositeMemberType(nodeShape),
    );
    compositeTypeKind = "IntersectionType";
  } else if (shape.constraints.xone.length > 0) {
    memberTypeEithers = shape.constraints.xone.map((memberShape) =>
      this.transformPropertyShapeToAstType(memberShape, {
        defaultValue,
        extern: extern,
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
      "shape %s composition did not map all member types successfully: %s",
      shape,
      Either.lefts(memberTypeEithers)
        .map((left) => left.message)
        .join("; "),
    );
    return memberTypeEithers[0];
  }
  invariant(memberTypes.length > 0);

  if (memberTypes.length === 1) {
    return Either.of(memberTypes[0]);
  }

  return widenAstCompositeTypeToSingleType({
    defaultValue,
    memberTypes,
    shape,
  }).altLazy(() =>
    Either.of({
      kind: compositeTypeKind,
      memberTypes,
    }),
  );
}

function widenAstCompositeTypeToSingleType({
  defaultValue,
  memberTypes,
  shape,
}: {
  defaultValue: Maybe<BlankNode | Literal | NamedNode>;
  memberTypes: readonly ast.Type[];
  shape: input.Shape;
}): Either<Error, ast.Type> {
  if (shape.constraints.hasValues.length > 0) {
    return Left(
      new Error(
        `shape ${shape} hasValues, not attempting to widen composite type into a single type`,
      ),
    );
  }

  if (shape instanceof input.PropertyShape && !shape.widen.orDefault(true)) {
    return Left(new Error(`shape ${shape} has widening disabled`));
  }

  // Get the type underlying a set or option
  const memberItemTypes = memberTypes.map((memberType) => {
    switch (memberType.kind) {
      case "OptionType":
        return memberType.itemType;
      case "SetType":
        return memberType.itemType;
      default:
        return memberType;
    }
  });

  const canWiden = (
    memberItemType: ast.IdentifierType | ast.LiteralType | ast.TermType,
  ) => {
    if (memberItemType.in_.length > 0) {
      return false;
    }

    switch (memberItemType.kind) {
      case "LiteralType": {
        if ((memberItemType as ast.LiteralType).maxExclusive.isJust()) {
          return false;
        }
        if ((memberItemType as ast.LiteralType).maxInclusive.isJust()) {
          return false;
        }
        if ((memberItemType as ast.LiteralType).minExclusive.isJust()) {
          return false;
        }
        if ((memberItemType as ast.LiteralType).minInclusive.isJust()) {
          return false;
        }
      }
    }

    return true;
  };

  if (
    memberItemTypes.every(
      (memberItemType) =>
        memberItemType.kind === "IdentifierType" && canWiden(memberItemType),
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
      nodeKinds: new Set<"BlankNode" | "NamedNode">(
        memberItemTypes
          .filter((memberItemType) => memberItemType.kind === "IdentifierType")
          .flatMap((memberItemType) => [
            ...(memberItemType as ast.IdentifierType).nodeKinds,
          ]),
      ),
    });
  }

  if (
    memberItemTypes.every(
      (memberItemType) =>
        memberItemType.kind === "LiteralType" && canWiden(memberItemType),
    )
  ) {
    // Special case: all the member types are Literals without further constraints,
    // like dash:StringOrLangString
    // Don't try to widen range constraints.
    return Either.of({
      datatype: Maybe.empty(),
      defaultValue: defaultValue.filter(
        (term) => term.termType === "Literal",
      ) as Maybe<Literal>,
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
    memberItemTypes.every(
      (memberItemType) =>
        (memberItemType.kind === "IdentifierType" ||
          memberItemType.kind === "LiteralType" ||
          memberItemType.kind === "TermType") &&
        canWiden(memberItemType),
    )
  ) {
    // Special case: all member types are terms without further constraints
    const nodeKinds = new Set<NodeKind>(
      memberItemTypes.flatMap((memberItemType) => [
        ...(memberItemType as ast.TermType).nodeKinds,
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
