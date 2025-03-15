import { rdf } from "@tpluscode/rdf-ns-builders";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import { TsFeature } from "../enums/index.js";
import * as input from "../input/index.js";
import { logger } from "../logger.js";
import type { NodeShapeAstType } from "./NodeShapeAstType.js";
import { pickLiteral } from "./pickLiteral.js";

/**
 * Is an ast.ObjectType actually the shape of an RDF list?
 * If so, return the type of its rdf:first.
 */
function transformNodeShapeToListType(
  this: ShapesGraphToAstTransformer,
  nodeShape: input.NodeShape,
): Either<Error, ast.ListType> {
  invariant(nodeShape.isList);

  // Put a placeholder in the cache to deal with cyclic references
  const listType: ast.ListType = {
    comment: pickLiteral(nodeShape.comments).map((literal) => literal.value),
    identifierNodeKind: nodeShape.nodeKinds.has("BlankNode")
      ? "BlankNode"
      : "NamedNode",
    itemType: {
      kind: "PlaceholderType" as const,
    },
    kind: "ListType" as const,
    label: pickLiteral(nodeShape.labels).map((literal) => literal.value),
    mutable: nodeShape.mutable,
    name: this.shapeAstName(nodeShape),
    identifierMintingStrategy: nodeShape.identifierMintingStrategy,
    toRdfTypes: nodeShape.toRdfTypes,
  };

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
    property.path.iri.equals(rdf.first),
  );
  if (!firstProperty) {
    return Left(new Error(`${nodeShape} does not have an rdf:first property`));
  }

  const restProperty = properties.find((property) =>
    property.path.iri.equals(rdf.rest),
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
        type.name.identifier.equals(nodeShape.identifier),
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
    return transformNodeShapeToListType.bind(this)(nodeShape);
  }

  const export_ = nodeShape.export.orDefault(true);

  if (
    nodeShape.constraints.and.length > 0 ||
    nodeShape.constraints.xone.length > 0
  ) {
    let compositeTypeShapes: readonly input.Shape[];
    let compositeTypeKind:
      | ast.ObjectIntersectionType["kind"]
      | ast.ObjectUnionType["kind"];
    if (nodeShape.constraints.and.length > 0) {
      compositeTypeShapes = nodeShape.constraints.and;
      compositeTypeKind = "ObjectIntersectionType";
    } else {
      compositeTypeShapes = nodeShape.constraints.xone;
      compositeTypeKind = "ObjectUnionType";
    }

    const compositeTypeNodeShapes = compositeTypeShapes.filter(
      (shape) => shape instanceof input.NodeShape,
    );
    if (compositeTypeNodeShapes.length === 0) {
      return Left(
        new Error(`${nodeShape} has no node shapes in its logical constraint`),
      );
    }

    // Put a placeholder in the cache to deal with cyclic references
    const compositeType = {
      comment: pickLiteral(nodeShape.comments).map((literal) => literal.value),
      export: export_,
      kind: compositeTypeKind,
      label: pickLiteral(nodeShape.labels).map((literal) => literal.value),
      memberTypes: [] as ast.ObjectType[],
      name: this.shapeAstName(nodeShape),
      tsFeatures: nodeShape.tsFeatures.orDefault(new Set(TsFeature.MEMBERS)),
    };

    this.nodeShapeAstTypesByIdentifier.set(nodeShape.identifier, compositeType);

    for (const memberNodeShape of compositeTypeNodeShapes) {
      const memberAstTypeEither =
        this.transformNodeShapeToAstType(memberNodeShape);
      if (memberAstTypeEither.isLeft()) {
        return memberAstTypeEither;
      }
      const memberAstType = memberAstTypeEither.unsafeCoerce();
      switch (memberAstType.kind) {
        case "ObjectType":
          compositeType.memberTypes.push(memberAstType);
          break;
        case "ObjectUnionType":
          compositeType.memberTypes.push(...memberAstType.memberTypes);
          break;
        default:
          return Left(
            new Error(
              `${nodeShape} has one or more non-ObjectType node shapes in its logical constraint`,
            ),
          );
      }
    }
    return Either.of(compositeType);
  }

  const identifierIn = nodeShape.constraints.in_.filter(
    (term) => term.termType === "NamedNode",
  );

  // Put a placeholder in the cache to deal with cyclic references
  // If this node shape's properties (directly or indirectly) refer to the node shape itself,
  // we'll return this placeholder.
  const objectType: ast.ObjectType = {
    abstract: nodeShape.abstract.orDefault(false),
    ancestorObjectTypes: [],
    childObjectTypes: [],
    comment: pickLiteral(nodeShape.comments).map((literal) => literal.value),
    descendantObjectTypes: [],
    export: export_,
    extern: nodeShape.extern.orDefault(false),
    fromRdfType: nodeShape.fromRdfType,
    label: pickLiteral(nodeShape.labels).map((literal) => literal.value),
    kind: "ObjectType",
    identifierIn,
    identifierMintingStrategy:
      identifierIn.length === 0
        ? nodeShape.identifierMintingStrategy
        : Maybe.empty(),
    identifierKinds:
      identifierIn.length === 0 ? nodeShape.nodeKinds : new Set(["NamedNode"]),
    name: this.shapeAstName(nodeShape),
    properties: [], // This is mutable, we'll populate it below.
    parentObjectTypes: [], // This is mutable, we'll populate it below
    toRdfTypes: nodeShape.toRdfTypes,
    tsFeatures: nodeShape.tsFeatures.orDefault(new Set(TsFeature.MEMBERS)),
    tsIdentifierPrefixPropertyName:
      nodeShape.tsObjectIdentifierPrefixPropertyName.orDefault(
        "identifierPrefix",
      ),
    tsIdentifierPropertyName:
      nodeShape.tsObjectIdentifierPropertyName.orDefault("identifier"),
    tsImports: nodeShape.tsImports,
    tsObjectDeclarationType:
      nodeShape.tsObjectDeclarationType.orDefault("class"),
    tsTypeDiscriminatorPropertyName:
      nodeShape.tsObjectTypeDiscriminatorPropertyName.orDefault("type"),
  };
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
  objectType.ancestorObjectTypes.push(
    ...relatedObjectTypes(nodeShape.ancestorNodeShapes),
  );
  objectType.childObjectTypes.push(
    ...relatedObjectTypes(nodeShape.childNodeShapes),
  );
  objectType.descendantObjectTypes.push(
    ...relatedObjectTypes(nodeShape.descendantNodeShapes),
  );
  objectType.parentObjectTypes.push(
    ...relatedObjectTypes(nodeShape.parentNodeShapes),
  );

  // Populate properties
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
    objectType.properties.push(propertyEither.unsafeCoerce());
  }

  objectType.properties.sort((left, right) => {
    if (left.order < right.order) {
      return -1;
    }
    if (left.order > right.order) {
      return 1;
    }
    return 0;
  });

  return Either.of(objectType);
}
