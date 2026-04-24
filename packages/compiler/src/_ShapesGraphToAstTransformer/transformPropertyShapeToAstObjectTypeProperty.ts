import dataFactory from "@rdfjs/data-model";
import { Curie, type NodeKind } from "@shaclmate/shacl-ast";
import { Either, Left, List, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { AbstractContainerType } from "../ast/AbstractContainerType.js";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import type { TsFeature } from "../enums/TsFeature.js";
import { Visibility } from "../enums/Visibility.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { ShapeStack } from "./ShapeStack.js";
import { shapeComment } from "./shapeComment.js";
import { shapeLabel } from "./shapeLabel.js";
import { transformShapeToAstType } from "./transformShapeToAstType.js";

function synthesizePartialAstObjectType({
  identifierType,
  tsFeatures,
}: {
  identifierType: ast.BlankNodeType | ast.IdentifierType | ast.IriType;
  tsFeatures: ReadonlySet<TsFeature>;
}): ast.ObjectType {
  let syntheticName: string;
  switch (identifierType.kind) {
    case "BlankNodeType":
      throw new Error("should never happen");
    case "IdentifierType":
      syntheticName = "DefaultPartial";
      break;
    case "IriType":
      syntheticName = "NamedDefaultPartial";
      break;
  }

  return new ast.ObjectType({
    abstract: false,
    comment: Maybe.empty(),
    extern: false,
    fromRdfType: Maybe.empty(),
    identifierType,
    identifierMintingStrategy: Maybe.empty(),
    label: Maybe.empty(),
    name: Maybe.of(syntheticName),
    shapeIdentifier: dataFactory.namedNode(
      `urn:shaclmate:synthetic:${syntheticName}`,
    ),
    synthetic: true,
    toRdfTypes: [],
    tsFeatures,
    tsImports: [],
    tsObjectDeclarationType: "class",
  });
}

function propertyName(
  this: ShapesGraphToAstTransformer,
  objectType: ast.ObjectType,
  propertyShape: input.PropertyShape,
): string {
  // Explicit shaclmate:name or sh:name
  const name = propertyShape.name.alt(List.head(propertyShape.names)).extract();
  if (name) {
    return name;
  }

  // Explicit rdfs:label
  const label = shapeLabel(propertyShape).extract();
  if (label) {
    return label;
  }

  // Pick up the common pattern of a property shape identifier being the node shape's identifier -localName,
  // like ex:NodeShape-property
  if (
    propertyShape.$identifier.termType === "NamedNode" &&
    objectType.shapeIdentifier.termType === "NamedNode"
  ) {
    const propertyShapeIdentifierPrefix = `${objectType.shapeIdentifier.value}-`;
    if (
      propertyShape.$identifier.value.startsWith(
        propertyShapeIdentifierPrefix,
      ) &&
      propertyShape.$identifier.value.length >
        propertyShapeIdentifierPrefix.length
    ) {
      return propertyShape.$identifier.value.substring(
        propertyShapeIdentifierPrefix.length,
      );
    }
  }

  // sh:path CURIE reference
  if (propertyShape.path instanceof Curie) {
    return propertyShape.path.reference;
  }

  // Shape identifier CURIE reference
  if (propertyShape.$identifier instanceof Curie) {
    return propertyShape.$identifier.reference;
  }

  // Shape identifier IRI
  if (propertyShape.$identifier.termType === "NamedNode") {
    return propertyShape.$identifier.value;
  }

  // sh:path IRI
  if (propertyShape.path.termType === "NamedNode") {
    return propertyShape.path.value;
  }

  throw new Error(`${propertyShape}: unable to infer name`);
}

function transformPropertyShapeToAstType(
  this: ShapesGraphToAstTransformer,
  propertyShape: input.PropertyShape,
  shapeStack: ShapeStack,
): Either<Error, ast.Type> {
  // if (
  //   propertyShape.path.kind === "PredicatePath" &&
  //   propertyShape.path.iri.value.endsWith("termProperty")
  // ) {
  // }

  return transformShapeToAstType
    .call(this, propertyShape, shapeStack)
    .chain((propertyShapeAstType) => {
      let maxCount = propertyShape.maxCount.orDefault(Number.MAX_SAFE_INTEGER);
      let minCount = propertyShape.minCount.orDefault(0);
      if (minCount < 0) {
        minCount = 0;
      }
      if (propertyShape.hasValues.length > minCount) {
        minCount = propertyShape.hasValues.length;
      }
      if (maxCount < minCount) {
        maxCount = minCount;
      }

      if (propertyShapeAstType.kind === "DefaultValueType") {
        if (minCount > 0) {
          return Left(
            new Error(
              `${propertyShape}: has sh:minCount > 0 and sh:defaultValue`,
            ),
          );
        }

        if (maxCount > 1) {
          return Left(
            new Error(
              `${propertyShape}: sets with sh:defaultValue are currently unsupported`,
            ),
          );
        }

        return Either.of(propertyShapeAstType);
      }

      if (minCount === 1 && maxCount === 1) {
        return Either.of(propertyShapeAstType);
      }

      if (minCount === 0 && maxCount === 1) {
        if (!ast.OptionType.isItemType(propertyShapeAstType)) {
          return Left(
            new Error(
              `${propertyShape}: ${propertyShapeAstType} is not an OptionType item type`,
            ),
          );
        }

        return Either.of(
          new ast.OptionType({
            itemType: propertyShapeAstType,
          }),
        );
      }

      if (!ast.SetType.isItemType(propertyShapeAstType)) {
        return Left(
          new Error(
            `${propertyShape}: ${propertyShapeAstType} is not a SetType item type`,
          ),
        );
      }
      return Either.of(
        new ast.SetType({
          itemType: propertyShapeAstType,
          minCount,
          mutable: propertyShape.mutable.orDefault(false),
        }),
      );
    });
}

export function transformPropertyShapeToAstObjectTypeProperty(
  this: ShapesGraphToAstTransformer,
  {
    objectType,
    propertyShape,
  }: {
    objectType: ast.ObjectType;
    propertyShape: input.PropertyShape;
  },
): Either<Error, ast.ObjectType.Property> {
  const shapeStack = new ShapeStack(); // Start a new ShapeStack per property shape
  return Eithers.chain2(
    propertyShape.resolve.isJust()
      ? this.shapesGraph
          .nodeShape(propertyShape.resolve.extract()!)
          .map(Maybe.of)
      : Either.of(Maybe.empty()),
    transformPropertyShapeToAstType.call(this, propertyShape, shapeStack),
  ).chain(([propertyShapeResolve, astType]) => {
    let astResolveItemType: ast.ObjectType | ast.ObjectUnionType | undefined;

    if (propertyShapeResolve.isJust()) {
      const astResolveTypeEither = transformShapeToAstType
        .call(this, propertyShapeResolve.unsafeCoerce(), shapeStack)
        .chain((astResolveType) => {
          switch (astResolveType.kind) {
            case "ObjectType":
              return Either.of<Error, ast.ObjectType | ast.ObjectUnionType>(
                astResolveType,
              );
            case "UnionType":
              if (
                // This check relies on .members being populated, which may not happen in cycles
                astResolveType.members.length > 0 &&
                !astResolveType.isObjectUnionType()
              ) {
                return Left(
                  new Error(
                    `${propertyShape} resolve cannot refer to a ${astResolveType.kind} with non-ObjectType members`,
                  ),
                );
              }
              return Either.of<Error, ast.ObjectType | ast.ObjectUnionType>(
                astResolveType as ast.ObjectUnionType,
              );
            default:
              return Left(
                new Error(
                  `${propertyShape} resolve cannot refer to a ${astResolveType.kind}`,
                ),
              );
          }
        });
      if (astResolveTypeEither.isLeft()) {
        return astResolveTypeEither;
      }
      astResolveItemType = astResolveTypeEither.unsafeCoerce();
    }

    if (astResolveItemType) {
      let astItemType: AbstractContainerType.ItemType;
      switch (astType.kind) {
        case "DefaultValueType":
        case "OptionType":
        case "SetType":
          astItemType = astType.itemType;
          break;
        case "LazyObjectOptionType":
        case "LazyObjectSetType":
        // biome-ignore lint/suspicious/noFallthroughSwitchClause: break is unreachable
        case "LazyObjectType":
          invariant(
            false,
            `lazy types should not appear here: ${astType.kind}`,
          );
        default:
          astItemType = astType;
          break;
      }

      let astPartialItemType: ast.ObjectType | ast.ObjectUnionType;
      switch (astItemType.kind) {
        case "BlankNodeType":
        case "IdentifierType":
        case "IriType":
          astPartialItemType = synthesizePartialAstObjectType({
            identifierType: astItemType,
            tsFeatures: astResolveItemType.tsFeatures,
          });
          break;
        case "ObjectType":
          astPartialItemType = astItemType;
          break;
        case "UnionType":
          if (!astItemType.isObjectUnionType()) {
            return Left(
              new Error(
                `${propertyShape} partial type cannot be a ${astItemType.kind} with non-ObjectType members`,
              ),
            );
          }
          astPartialItemType = astItemType;
          break;
        default:
          return Left(
            new Error(
              `${propertyShape} has a resolve with an incompatible partial type ${astItemType.kind}`,
            ),
          );
      }

      const astAbstractTypeProperties = {
        comment: Maybe.empty(),
        label: Maybe.empty(),
        name: Maybe.empty(),
        shapeIdentifier: propertyShape.$identifier,
      };

      switch (astType.kind) {
        case "BlankNodeType":
        case "IdentifierType":
        case "IriType":
        case "ObjectType":
        case "UnionType":
          astType = new ast.LazyObjectType({
            ...astAbstractTypeProperties,
            partialType: astPartialItemType,
            resolveType: astResolveItemType,
          });
          break;
        case "OptionType":
          astType = new ast.LazyObjectOptionType({
            ...astAbstractTypeProperties,
            partialType: new ast.OptionType({
              itemType: astPartialItemType,
            }),
            resolveType: new ast.OptionType({
              itemType: astResolveItemType,
            }),
          });
          break;
        case "SetType":
          astType = new ast.LazyObjectSetType({
            ...astAbstractTypeProperties,
            partialType: new ast.SetType({
              itemType: astPartialItemType,
              minCount: 0,
              mutable: false,
            }),
            resolveType: new ast.SetType({
              itemType: astResolveItemType,
              minCount: 0,
              mutable: false,
            }),
          });
          break;
        default:
          invariant(false, `unexpected lazy AST type ${astType.kind}`);
      }
    }

    if (
      propertyShape.path.termType === "InversePath" &&
      (astType.nodeKinds as ReadonlySet<NodeKind>).has("Literal")
    ) {
      return Left(
        new Error(
          `${propertyShape}: property shapes with inverse paths can only have blank node or IRI node kinds`,
        ),
      );
    }

    return Either.of(
      new ast.ObjectType.Property({
        comment: shapeComment(propertyShape),
        description: List.head(propertyShape.descriptions),
        label: shapeLabel(propertyShape),
        mutable: propertyShape.mutable.orDefault(false),
        name: propertyName.call(this, objectType, propertyShape),
        objectType,
        order: propertyShape.order.orDefault(0),
        path: propertyShape.path,
        shapeIdentifier: propertyShape.$identifier,
        type: astType,
        visibility: propertyShape.visibility
          .map(Visibility.fromIri)
          .orDefault("public"),
      }),
    );
  });
}
