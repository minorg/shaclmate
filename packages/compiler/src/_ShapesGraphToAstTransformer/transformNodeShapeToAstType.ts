import { rdf } from "@tpluscode/rdf-ns-builders";
import type { TsFeature } from "enums/TsFeature.js";
import { DataFactory } from "n3";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import * as ast from "../ast/index.js";
import * as input from "../input/index.js";
import { tsFeaturesDefault } from "../input/tsFeatures.js";
import { logger } from "../logger.js";
import type { NodeShapeAstType } from "./NodeShapeAstType.js";

const listPropertiesObjectType = new ast.ObjectType({
  abstract: false,
  export_: false,
  extern: false,
  comment: Maybe.empty(),
  label: Maybe.empty(),
  identifierMintingStrategy: Maybe.empty(),
  identifierType: new ast.IdentifierType({
    comment: Maybe.empty(),
    defaultValue: Maybe.empty(),
    hasValues: [],
    label: Maybe.empty(),
    in_: [],
    nodeKinds: new Set(["BlankNode", "NamedNode"]),
  }),
  fromRdfType: Maybe.empty(),
  name: Maybe.empty(),
  toRdfTypes: [],
  tsFeatures: new Set<TsFeature>([]),
  tsObjectDeclarationType: "class",
  shapeIdentifier: DataFactory.blankNode(),
  synthetic: true,
  tsImports: [],
});

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
  // Remove the placeholder if the transformation fails.
  const listType = new ast.ListType<ast.Type>({
    comment: nodeShape.comment,
    identifierNodeKind: nodeShape.nodeKinds.has("BlankNode")
      ? "BlankNode"
      : "NamedNode",
    itemType: ast.PlaceholderType.instance,
    label: nodeShape.label,
    mutable: nodeShape.mutable.orDefault(false),
    identifierMintingStrategy: nodeShape.identifierMintingStrategy,
    shapeIdentifier: this.shapeIdentifier(nodeShape),
    toRdfTypes: nodeShape.toRdfTypes,
  });

  this.nodeShapeAstTypesByIdentifier.set(nodeShape.identifier, listType);

  return (() => {
    const properties: ast.ObjectType.Property[] = [];
    for (const propertyShape of nodeShape.constraints.properties) {
      const propertyEither = this.transformPropertyShapeToAstObjectTypeProperty(
        {
          // Just need a dummy ast.ObjectType here to get the properties transformed.
          objectType: listPropertiesObjectType,
          propertyShape,
        },
      );
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
      return Left(
        new Error(`${nodeShape} does not have exactly two properties`),
      );
    }

    // rdf:first can have any type
    // The type of the rdf:first property is the list item type.
    const firstProperty = properties.find((property) =>
      property.path.equals(rdf.first),
    );
    if (!firstProperty) {
      return Left(
        new Error(`${nodeShape} does not have an rdf:first property`),
      );
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
    // rdf:rest should be sh:xone ( [ sh:node nodeShape ] [ sh:hasValue rdf:nil ] )
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

    return Either.of<Error, ast.ListType<ast.Type>>(listType);
  })().ifLeft(() => {
    this.nodeShapeAstTypesByIdentifier.delete(nodeShape.identifier);
  });
}

export function transformNodeShapeToAstObjectCompoundType(
  this: ShapesGraphToAstTransformer,
  {
    export_,
    nodeShape,
  }: {
    export_: boolean;
    nodeShape: input.NodeShape;
  },
): Either<Error, ast.ObjectIntersectionType | ast.ObjectUnionType> {
  let compoundTypeShapes: readonly input.Shape[];
  let compoundTypeKind:
    | ast.ObjectIntersectionType["kind"]
    | ast.ObjectUnionType["kind"];
  if (nodeShape.constraints.and.length > 0) {
    compoundTypeShapes = nodeShape.constraints.and;
    compoundTypeKind = "ObjectIntersectionType";
  } else if (nodeShape.constraints.xone.length > 0) {
    compoundTypeShapes = nodeShape.constraints.xone;
    compoundTypeKind = "ObjectUnionType";
  } else {
    throw new Error("should never be reached");
  }

  const compoundTypeNodeShapes: input.NodeShape[] = [];
  for (const compoundTypeShape of compoundTypeShapes) {
    if (!(compoundTypeShape instanceof input.NodeShape)) {
      return Left(
        new Error(`${nodeShape} has non-NodeShape in its logical constraint`),
      );
    }
    compoundTypeNodeShapes.push(compoundTypeShape);
  }
  if (compoundTypeNodeShapes.length === 0) {
    return Left(
      new Error(`${nodeShape} has no NodeShapes in its logical constraint`),
    );
  }

  // Put a placeholder in the cache to deal with cyclic references
  const compoundType: ast.ObjectIntersectionType | ast.ObjectUnionType = new (
    compoundTypeKind === "ObjectIntersectionType"
      ? ast.ObjectIntersectionType
      : ast.ObjectUnionType
  )({
    comment: nodeShape.comment,
    export_,
    label: nodeShape.label,
    name: nodeShape.shaclmateName,
    shapeIdentifier: this.shapeIdentifier(nodeShape),
    tsFeatures: nodeShape.tsFeatures,
  });

  this.nodeShapeAstTypesByIdentifier.set(nodeShape.identifier, compoundType);
  return (() => {
    for (const memberNodeShape of compoundTypeNodeShapes) {
      const memberTypeEither =
        this.transformNodeShapeToAstType(memberNodeShape);
      if (memberTypeEither.isLeft()) {
        return memberTypeEither;
      }
      const addMemberTypeResult = compoundType.addMemberType(
        memberTypeEither.unsafeCoerce(),
      );
      if (addMemberTypeResult.isLeft()) {
        return addMemberTypeResult;
      }
    }

    return Either.of<Error, ast.ObjectIntersectionType | ast.ObjectUnionType>(
      compoundType,
    );
  })().ifLeft(() => {
    this.nodeShapeAstTypesByIdentifier.delete(nodeShape.identifier);
  });
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
    return transformNodeShapeToAstObjectCompoundType.bind(this)({
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
  // Remove the placeholder if the transformation fails.
  // If this node shape's properties (directly or indirectly) refer to the node shape itself,
  // we'll return this placeholder.
  const objectType = new ast.ObjectType({
    abstract,
    comment: nodeShape.comment,
    export_: export_,
    extern: nodeShape.extern.orDefault(false),
    fromRdfType,
    label: nodeShape.label,
    identifierType: new ast.IdentifierType({
      comment: Maybe.empty(),
      defaultValue: Maybe.empty(),
      hasValues: [],
      in_: identifierIn,
      label: Maybe.empty(),
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

  return (() => {
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
      this.transformPropertyShapeToAstObjectTypeProperty({
        objectType,
        propertyShape,
      })
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

    return Either.of<Error, ast.ObjectType>(objectType);
  })().ifLeft(() => {
    this.nodeShapeAstTypesByIdentifier.delete(nodeShape.identifier);
  });
}
