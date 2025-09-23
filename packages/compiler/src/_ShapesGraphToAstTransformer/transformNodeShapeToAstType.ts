import { rdf } from "@tpluscode/rdf-ns-builders";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import type { TsFeature } from "../enums/TsFeature.js";
import * as input from "../input/index.js";
import { tsFeaturesDefault } from "../input/tsFeatures.js";
import { logger } from "../logger.js";
import type { NodeShapeAstType } from "./NodeShapeAstType.js";
import { flattenAstObjectCompositeTypeMemberTypes } from "./flattenAstObjectCompositeTypeMemberTypes.js";
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
  if (firstProperty.type.kind !== "PlainType") {
    return Left(new Error(`${nodeShape} rdf:first property is not required`));
  }

  const restProperty = properties.find((property) =>
    property.path.iri.equals(rdf.rest),
  );
  if (!restProperty) {
    return Left(new Error(`${nodeShape} does not have an rdf:rest property`));
  }
  if (restProperty.type.kind !== "PlainType") {
    return Left(new Error(`${nodeShape} rdf:rest property is not required`));
  }
  if (restProperty.type.itemType.kind !== "UnionType") {
    return Left(new Error(`${nodeShape} rdf:rest property is not sh:xone`));
  }
  if (restProperty.type.itemType.memberTypes.length !== 2) {
    return Left(
      new Error(
        `${nodeShape} rdf:rest property sh:xone does not have exactly two member types`,
      ),
    );
  }
  // rdf:rest should be sh:xone ( [ sh:class nodeShape ] [ sh:hasValue rdf:nil ] )
  if (
    !restProperty.type.itemType.memberTypes.find(
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
    !restProperty.type.itemType.memberTypes.find(
      (type) => type.kind === "IdentifierType",
    )
  ) {
    return Left(
      new Error(
        `${nodeShape} rdf:rest property sh:xone does not include sh:hasValue rdf:nil`,
      ),
    );
  }

  listType.itemType = firstProperty.type.itemType;

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
  const compositeType = {
    comment: pickLiteral(nodeShape.comments).map((literal) => literal.value),
    export: export_,
    kind: compositeTypeKind,
    label: pickLiteral(nodeShape.labels).map((literal) => literal.value),
    memberTypes: [] as ast.ObjectType[],
    name: this.shapeAstName(nodeShape),
    tsFeatures: new Set<TsFeature>(),
  };

  this.nodeShapeAstTypesByIdentifier.set(nodeShape.identifier, compositeType);

  const memberTypes: (
    | ast.ObjectType
    | ast.ObjectIntersectionType
    | ast.ObjectUnionType
  )[] = [];
  for (const memberNodeShape of compositeTypeNodeShapes) {
    const memberTypeEither = this.transformNodeShapeToAstType(memberNodeShape);
    if (memberTypeEither.isLeft()) {
      return memberTypeEither;
    }
    const memberType = memberTypeEither.unsafeCoerce();
    switch (memberType.kind) {
      case "ObjectType":
      case "ObjectIntersectionType":
      case "ObjectUnionType":
        memberTypes.push(memberType);
        break;
      default:
        return Left(
          new Error(
            `${nodeShape} has one or more non-ObjectType node shapes in its logical constraint`,
          ),
        );
    }
  }

  return flattenAstObjectCompositeTypeMemberTypes({
    objectCompositeTypeKind: compositeTypeKind,
    memberTypes,
    shape: nodeShape,
  }).map(({ memberTypes, tsFeatures }) => {
    // Add to the placeholder composite type and return it.
    for (const memberType of memberTypes) {
      compositeType.memberTypes.push(memberType);
    }
    for (const tsFeature of tsFeatures) {
      compositeType.tsFeatures.add(tsFeature);
    }
    return compositeType;
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
    fromRdfType,
    label: pickLiteral(nodeShape.labels).map((literal) => literal.value),
    kind: "ObjectType",
    identifierIn,
    identifierMintingStrategy:
      identifierIn.length === 0
        ? nodeShape.identifierMintingStrategy
        : Maybe.empty(),
    identifierNodeKinds:
      identifierIn.length === 0 ? nodeShape.nodeKinds : new Set(["NamedNode"]),
    name: this.shapeAstName(nodeShape),
    properties: [], // This is mutable, we'll populate it below.
    parentObjectTypes: [], // This is mutable, we'll populate it below
    synthetic: false,
    toRdfTypes,
    tsFeatures: nodeShape.tsFeatures.orDefault(new Set(tsFeaturesDefault)),
    tsImports: nodeShape.tsImports,
    tsObjectDeclarationType:
      nodeShape.tsObjectDeclarationType.orDefault("class"),
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
  // Check whether a type refers to this ObjectType
  const isPropertyRecursive = (astType: ast.Type): boolean => {
    switch (astType.kind) {
      case "IdentifierType":
      case "LiteralType":
      case "PlaceholderType":
      case "TermType":
        return false;
      case "ObjectType":
        if (astType.name === objectType.name) {
          return true;
        }
        for (const property of astType.properties) {
          if (isPropertyRecursive(property.type)) {
            return true;
          }
        }
        return false;
      case "IntersectionType":
      case "ObjectIntersectionType":
      case "ObjectUnionType":
      case "UnionType":
        for (const memberType of astType.memberTypes) {
          if (isPropertyRecursive(memberType)) {
            return true;
          }
        }
        return false;
      case "ListType":
      case "OptionType":
      case "PlainType":
      case "SetType":
        return isPropertyRecursive(astType.itemType);
    }
  };
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
    const property = propertyEither.unsafeCoerce();
    objectType.properties.push({
      ...property,
      recursive: isPropertyRecursive(property.type),
    });
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
