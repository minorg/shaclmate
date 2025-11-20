import { rdf } from "@tpluscode/rdf-ns-builders";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import * as ast from "../ast/index.js";
import * as input from "../input/index.js";
import { tsFeaturesDefault } from "../input/tsFeatures.js";
import { logger } from "../logger.js";
import type { NodeShapeAstType } from "./NodeShapeAstType.js";
import { pickLiteral } from "./pickLiteral.js";

/**
 * Is an ast.ObjectType actually the shape of an RDF list?
 * If so, return the type of its rdf:first.
 */
function transformNodeShapeToAstListType(
  this: ShapesGraphToAstTransformer,
  nodeShape: input.NodeShape,
): Either<Error, ast.ListType> {
  invariant(nodeShape.isList);

  // Put a placeholder in the cache to deal with cyclic references
  const listType = new ast.ListType({
    comment: pickLiteral(nodeShape.comments).map((literal) => literal.value),
    identifierNodeKind: nodeShape.nodeKinds.has("BlankNode")
      ? "BlankNode"
      : "NamedNode",
    itemType: ast.PlaceholderType.instance,
    label: pickLiteral(nodeShape.labels).map((literal) => literal.value),
    mutable: nodeShape.mutable.orDefault(false),
    name: nodeShape.shaclmateName,
    identifierMintingStrategy: nodeShape.identifierMintingStrategy,
    shapeIdentifier: this.shapeIdentifier(nodeShape),
    toRdfTypes: nodeShape.toRdfTypes,
  });

  this.nodeShapeAstTypesByIdentifier.set(nodeShape.identifier, listType);

  const properties: ast.ObjectType.Property[] = [];
  for (const propertyShape of nodeShape.constraints.properties) {
    const propertyEither =
      this.transformPropertyShapeToAstObjectTypeProperty(propertyShape);
    if (propertyEither.isLeft()) {
      logger.warn(
        "error transforming %s %s: %s",
        nodeShape,
        propertyShape,
        (propertyEither.extract() as Error).message,
      );
      continue;
      // return property;
    }
    properties.push(propertyEither.unsafeCoerce());
  }

  if (properties.length !== 2) {
    return Left(new Error(`${nodeShape} does not have exactly two properties`));
  }

  // rdf:first can have any type
  // The type of the rdf:first property is the list item type.
  const firstProperty = properties.find((property) =>
    property.path.equals(rdf.first),
  );
  if (!firstProperty) {
    return Left(new Error(`${nodeShape} does not have an rdf:first property`));
  }

  const restProperty = properties.find((property) =>
    property.path.equals(rdf.rest),
  );
  if (!restProperty) {
    return Left(new Error(`${nodeShape} does not have an rdf:rest property`));
  }
  if (restProperty.type.kind !== "UnionType") {
    return Left(new Error(`${nodeShape} rdf:rest property is not sh:xone`));
  }
  if (restProperty.type.memberTypes.length !== 2) {
    return Left(
      new Error(
        `${nodeShape} rdf:rest property sh:xone does not have exactly two member types`,
      ),
    );
  }
  // rdf:rest should be sh:xone ( [ sh:class nodeShape ] [ sh:hasValue rdf:nil ] )
  if (
    !restProperty.type.memberTypes.find(
      (type) =>
        type.kind === "ListType" &&
        type.shapeIdentifier.equals(nodeShape.identifier),
    )
  ) {
    return Left(
      new Error(
        `${nodeShape} rdf:rest property sh:xone is not recursive into the node shape`,
      ),
    );
  }
  if (
    !restProperty.type.memberTypes.find(
      (type) => type.kind === "IdentifierType",
    )
  ) {
    return Left(
      new Error(
        `${nodeShape} rdf:rest property sh:xone does not include sh:hasValue rdf:nil`,
      ),
    );
  }

  listType.itemType = firstProperty.type;

  return Either.of(listType);
}

export function transformNodeShapeToAstObjectCompositeType(
  this: ShapesGraphToAstTransformer,
  {
    export_,
    nodeShape,
  }: {
    export_: boolean;
    nodeShape: input.NodeShape;
  },
): Either<Error, ast.ObjectIntersectionType | ast.ObjectUnionType> {
  let compositeTypeShapes: readonly input.Shape[];
  let compositeTypeKind:
    | ast.ObjectIntersectionType["kind"]
    | ast.ObjectUnionType["kind"];
  if (nodeShape.constraints.and.length > 0) {
    compositeTypeShapes = nodeShape.constraints.and;
    compositeTypeKind = "ObjectIntersectionType";
  } else if (nodeShape.constraints.xone.length > 0) {
    compositeTypeShapes = nodeShape.constraints.xone;
    compositeTypeKind = "ObjectUnionType";
  } else {
    throw new Error("should never be reached");
  }

  const compositeTypeNodeShapes: input.NodeShape[] = [];
  for (const compositeTypeShape of compositeTypeShapes) {
    if (!(compositeTypeShape instanceof input.NodeShape)) {
      return Left(
        new Error(`${nodeShape} has non-NodeShape in its logical constraint`),
      );
    }
    compositeTypeNodeShapes.push(compositeTypeShape);
  }
  if (compositeTypeNodeShapes.length === 0) {
    return Left(
      new Error(`${nodeShape} has no NodeShapes in its logical constraint`),
    );
  }

  // Put a placeholder in the cache to deal with cyclic references
  const compositeType: ast.ObjectIntersectionType | ast.ObjectUnionType = new (
    compositeTypeKind === "ObjectIntersectionType"
      ? ast.ObjectIntersectionType
      : ast.ObjectUnionType
  )({
    comment: pickLiteral(nodeShape.comments).map((literal) => literal.value),
    export_,
    label: pickLiteral(nodeShape.labels).map((literal) => literal.value),
    name: nodeShape.shaclmateName,
    tsFeatures: nodeShape.tsFeatures,
  });

  this.nodeShapeAstTypesByIdentifier.set(nodeShape.identifier, compositeType);

  for (const memberNodeShape of compositeTypeNodeShapes) {
    const memberTypeEither = this.transformNodeShapeToAstType(memberNodeShape);
    if (memberTypeEither.isLeft()) {
      return memberTypeEither;
    }
    const memberType = memberTypeEither.unsafeCoerce();
    switch (memberType.kind) {
      case "ObjectType":
        compositeType.addMemberType(memberType);
        break;
      case "ObjectIntersectionType":
        if (compositeType.kind === memberType.kind) {
          compositeType.addMemberType(memberType);
        } else {
          return Left(
            new Error(
              `${nodeShape}: has incompatible composite type composition (${compositeType.kind} has-a ${memberType.kind})`,
            ),
          );
        }
        break;
      case "ObjectUnionType":
        if (compositeType.kind === memberType.kind) {
          compositeType.addMemberType(memberType);
        } else {
          return Left(
            new Error(
              `${nodeShape}: has incompatible composite type composition (${compositeType.kind} has-a ${memberType.kind})`,
            ),
          );
        }
        break;
      default:
        return Left(
          new Error(
            `${nodeShape} has one or more non-(ObjectIntersectionType | ObjectType | ObjectUnionType) node shapes in its logical constraint`,
          ),
        );
    }
  }

  return Either.of(compositeType);
}

export function transformNodeShapeToAstType(
  this: ShapesGraphToAstTransformer,
  nodeShape: input.NodeShape,
): Either<Error, NodeShapeAstType> {
  {
    const type = this.nodeShapeAstTypesByIdentifier.get(nodeShape.identifier);
    if (type) {
      return Either.of(type);
    }
  }

  if (nodeShape.isList) {
    return transformNodeShapeToAstListType.bind(this)(nodeShape);
  }

  const abstract = nodeShape.abstract.orDefault(false);

  const export_ = nodeShape.export.orDefault(true);

  if (
    nodeShape.constraints.and.length > 0 ||
    nodeShape.constraints.xone.length > 0
  ) {
    return transformNodeShapeToAstObjectCompositeType.bind(this)({
      export_,
      nodeShape,
    });
  }

  const fromRdfType = nodeShape.fromRdfType.alt(nodeShape.rdfType);
  const toRdfTypes = nodeShape.toRdfTypes.concat();
  if (toRdfTypes.length === 0) {
    toRdfTypes.push(...nodeShape.rdfType.toList());
  }
  // Ensure toRdfTypes has fromRdfType
  fromRdfType.ifJust((fromRdfType) => {
    if (!toRdfTypes.some((toRdfType) => toRdfType.equals(fromRdfType))) {
      toRdfTypes.push(fromRdfType);
    }
  });

  const identifierIn = nodeShape.constraints.in_.filter(
    (term) => term.termType === "NamedNode",
  );

  let identifierMintingStrategy = nodeShape.identifierMintingStrategy;
  if (identifierMintingStrategy.isJust() && identifierIn.length > 0) {
    logger.debug(
      "%s cannot have an identifier minting strategy AND sh:in",
      nodeShape,
    );
    identifierMintingStrategy = Maybe.empty();
  }

  // Put a placeholder in the cache to deal with cyclic references
  // If this node shape's properties (directly or indirectly) refer to the node shape itself,
  // we'll return this placeholder.
  const objectType = new ast.ObjectType({
    abstract,
    comment: pickLiteral(nodeShape.comments).map((literal) => literal.value),
    export_: export_,
    extern: nodeShape.extern.orDefault(false),
    fromRdfType,
    label: pickLiteral(nodeShape.labels).map((literal) => literal.value),
    identifierType: new ast.IdentifierType({
      defaultValue: Maybe.empty(),
      hasValues: [],
      in_: identifierIn,
      nodeKinds:
        identifierIn.length === 0
          ? nodeShape.nodeKinds
          : new Set(["NamedNode"]),
    }),
    identifierMintingStrategy,
    name: nodeShape.shaclmateName,
    shapeIdentifier: this.shapeIdentifier(nodeShape),
    synthetic: false,
    toRdfTypes,
    tsFeatures: nodeShape.tsFeatures.orDefault(new Set(tsFeaturesDefault)),
    tsImports: nodeShape.tsImports,
    tsObjectDeclarationType:
      nodeShape.tsObjectDeclarationType.orDefault("class"),
  });
  this.nodeShapeAstTypesByIdentifier.set(nodeShape.identifier, objectType);

  // Populate ancestor and descendant object types
  const relatedObjectTypes = (
    relatedNodeShapes: readonly input.NodeShape[],
  ): readonly ast.ObjectType[] => {
    return relatedNodeShapes.flatMap((relatedNodeShape) =>
      this.transformNodeShapeToAstType(relatedNodeShape)
        .toMaybe()
        .filter((astType) => astType.kind === "ObjectType")
        .toList(),
    );
  };
  objectType.addAncestorObjectTypes(
    ...relatedObjectTypes(nodeShape.ancestorNodeShapes),
  );
  objectType.addChildObjectTypes(
    ...relatedObjectTypes(nodeShape.childNodeShapes),
  );
  objectType.addDescendantObjectTypes(
    ...relatedObjectTypes(nodeShape.descendantNodeShapes),
  );
  objectType.addParentObjectTypes(
    ...relatedObjectTypes(nodeShape.parentNodeShapes),
  );

  // Populate properties
  for (const propertyShape of nodeShape.constraints.properties) {
    this.transformPropertyShapeToAstObjectTypeProperty(propertyShape)
      .ifLeft((error) => {
        logger.warn(
          "error transforming %s %s: %s",
          nodeShape,
          propertyShape,
          error.message,
        );
      })
      .ifRight((property) => {
        objectType.addProperties(property);
      });
  }

  objectType.sortProperties();

  return Either.of(objectType);
}
