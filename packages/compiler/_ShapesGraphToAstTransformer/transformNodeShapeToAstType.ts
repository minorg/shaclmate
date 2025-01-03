import { NodeKind } from "@shaclmate/shacl-ast";
import { rdf } from "@tpluscode/rdf-ns-builders";
import { Either, Left } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import type { TsFeature } from "../enums/index.js";
import * as input from "../input/index.js";
import { logger } from "../logger.js";
import type { NodeShapeAstType } from "./NodeShapeAstType.js";

const tsFeaturesDefault: Set<TsFeature> = new Set([
  "equals",
  "fromRdf",
  "hash",
  "toJson",
  "toRdf",
  "sparql-graph-patterns",
]);

/**
 * Is an ast.ObjectType actually the shape of an RDF list?
 * If so, return the type of its rdf:first.
 */
function transformNodeShapeToListType(
  this: ShapesGraphToAstTransformer,
  nodeShape: input.NodeShape,
): Either<Error, ast.ListType> {
  invariant(nodeShape.resource.isSubClassOf(rdf.List));

  // Put a placeholder in the cache to deal with cyclic references
  const listType: ast.ListType = {
    comment: nodeShape.comment.map((literal) => literal.value),
    fromRdfType: nodeShape.fromRdfType,
    identifierNodeKind: nodeShape.nodeKinds.has(NodeKind.BLANK_NODE)
      ? NodeKind.BLANK_NODE
      : NodeKind.IRI,
    itemType: {
      kind: "PlaceholderType" as const,
    },
    kind: "ListType" as const,
    label: nodeShape.label.map((literal) => literal.value),
    mutable: nodeShape.mutable,
    name: this.shapeAstName(nodeShape),
    mintingStrategy: nodeShape.mintingStrategy.toMaybe(),
    toRdfTypes: nodeShape.toRdfTypes,
  };

  this.nodeShapeAstTypesByIdentifier.set(
    nodeShape.resource.identifier,
    listType,
  );

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
    return Left(new Error(`${nodeShape} rdf:rest property is not sh:or`));
  }
  if (restProperty.type.memberTypes.length !== 2) {
    return Left(
      new Error(
        `${nodeShape} rdf:rest property sh:or does not have exactly two member types`,
      ),
    );
  }
  // rdf:rest should be sh:or ( [ sh:class nodeShape ] [ sh:hasValue rdf:nil ] )
  if (
    !restProperty.type.memberTypes.find(
      (type) =>
        type.kind === "ListType" &&
        type.name.identifier.equals(nodeShape.resource.identifier),
    )
  ) {
    return Left(
      new Error(
        `${nodeShape} rdf:rest property sh:or is not recursive into the node shape`,
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
        `${nodeShape} rdf:rest property sh:or does not include sh:hasValue rdf:nil`,
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
    const type = this.nodeShapeAstTypesByIdentifier.get(
      nodeShape.resource.identifier,
    );
    if (type) {
      return Either.of(type);
    }
  }

  if (nodeShape.resource.isSubClassOf(rdf.List)) {
    return transformNodeShapeToListType.bind(this)(nodeShape);
  }

  const export_ = nodeShape.export.orDefault(true);

  if (nodeShape.constraints.and.isJust() || nodeShape.constraints.or.isJust()) {
    let compositeTypeShapes: readonly input.Shape[];
    let compositeTypeKind:
      | ast.ObjectIntersectionType["kind"]
      | ast.ObjectUnionType["kind"];
    if (nodeShape.constraints.and.isJust()) {
      compositeTypeShapes = nodeShape.constraints.and.unsafeCoerce();
      compositeTypeKind = "ObjectIntersectionType";
    } else {
      compositeTypeShapes = nodeShape.constraints.or.unsafeCoerce();
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
      comment: nodeShape.comment.map((literal) => literal.value),
      export: export_,
      kind: compositeTypeKind,
      label: nodeShape.label.map((literal) => literal.value),
      memberTypes: [] as ast.ObjectType[],
      name: this.shapeAstName(nodeShape),
      tsFeatures: nodeShape.tsFeatures.orDefault(tsFeaturesDefault),
    };

    this.nodeShapeAstTypesByIdentifier.set(
      nodeShape.resource.identifier,
      compositeType,
    );

    compositeType.memberTypes.push(
      ...Either.rights(
        compositeTypeNodeShapes.map((nodeShape) =>
          this.transformNodeShapeToAstType(nodeShape),
        ),
      ).filter((nodeShapeAstType) => nodeShapeAstType.kind === "ObjectType"),
    );
    if (compositeType.memberTypes.length < compositeTypeNodeShapes.length) {
      return Left(
        new Error(
          `${nodeShape} has one or more non-ObjectType node shapes in its logical constraint`,
        ),
      );
    }
    return Either.of(compositeType);
  }

  // Put a placeholder in the cache to deal with cyclic references
  // If this node shape's properties (directly or indirectly) refer to the node shape itself,
  // we'll return this placeholder.
  const objectType: ast.ObjectType = {
    abstract: nodeShape.abstract.orDefault(false),
    ancestorObjectTypes: [],
    childObjectTypes: [],
    comment: nodeShape.comment.map((literal) => literal.value),
    descendantObjectTypes: [],
    export: export_,
    extern: nodeShape.extern.orDefault(false),
    fromRdfType: nodeShape.fromRdfType,
    label: nodeShape.label.map((literal) => literal.value),
    kind: "ObjectType",
    mintingStrategy: nodeShape.mintingStrategy.toMaybe(),
    name: this.shapeAstName(nodeShape),
    nodeKinds: nodeShape.nodeKinds,
    properties: [], // This is mutable, we'll populate it below.
    parentObjectTypes: [], // This is mutable, we'll populate it below
    toRdfTypes: nodeShape.toRdfTypes,
    tsFeatures: nodeShape.tsFeatures.orDefault(tsFeaturesDefault),
    tsIdentifierPropertyName:
      nodeShape.tsObjectIdentifierPropertyName.orDefault("identifier"),
    tsImport: nodeShape.tsImport,
    tsObjectDeclarationType:
      nodeShape.tsObjectDeclarationType.orDefault("class"),
    tsTypeDiscriminatorPropertyName:
      nodeShape.tsObjectTypeDiscriminatorPropertyName.orDefault("type"),
  };
  this.nodeShapeAstTypesByIdentifier.set(
    nodeShape.resource.identifier,
    objectType,
  );

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

  return Either.of(objectType);
}
