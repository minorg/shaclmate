import dataFactory from "@rdfx/data-factory";
import { Curie, type NodeKind } from "@shaclmate/shacl-ast";
import { sh } from "@tpluscode/rdf-ns-builders";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { AbstractContainerType } from "../ast/AbstractContainerType.js";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { ShapeStack } from "./ShapeStack.js";
import { transformShapeToAstType } from "./transformShapeToAstType.js";

function fieldName(
  this: ShapesGraphToAstTransformer,
  propertyShape: input.PropertyShape,
  structType: ast.StructType,
): string {
  // Explicit shaclmate:name or sh:name
  const name = propertyShape.shaclmateName.alt(propertyShape.name).extract();
  if (name) {
    return name;
  }

  // Explicit rdfs:label
  const label = propertyShape.label.extract();
  if (label) {
    return label;
  }

  // Pick up the common pattern of a property shape identifier being the node shape's identifier -localName,
  // like ex:NodeShape-property
  const propertyShapeIdentifier = propertyShape.$identifier();
  if (
    propertyShapeIdentifier.termType === "NamedNode" &&
    structType.shapeIdentifier.termType === "NamedNode"
  ) {
    const propertyShapeIdentifierPrefix = `${structType.shapeIdentifier.value}-`;
    if (
      propertyShapeIdentifier.value.startsWith(propertyShapeIdentifierPrefix) &&
      propertyShapeIdentifier.value.length >
        propertyShapeIdentifierPrefix.length
    ) {
      return propertyShapeIdentifier.value.substring(
        propertyShapeIdentifierPrefix.length,
      );
    }
  }

  // sh:path CURIE reference
  if (propertyShape.path instanceof Curie) {
    return propertyShape.path.reference;
  }

  // Shape identifier CURIE reference
  if (propertyShapeIdentifier instanceof Curie) {
    return propertyShapeIdentifier.reference;
  }

  // Shape identifier IRI
  if (propertyShapeIdentifier.termType === "NamedNode") {
    return propertyShapeIdentifier.value;
  }

  // sh:path IRI
  if (propertyShape.path.termType === "NamedNode") {
    return propertyShape.path.value;
  }

  throw new Error(`${propertyShape}: unable to infer name`);
}

function synthesizePartialAstStructType(
  this: ShapesGraphToAstTransformer,
  {
    identifierType,
  }: {
    identifierType: ast.BlankNodeType | ast.IdentifierType | ast.IriType;
  },
): ast.StructType {
  let syntheticName: string;
  switch (identifierType.kind) {
    case "BlankNode":
      throw new Error("should never happen");
    case "Identifier":
      syntheticName = "DefaultPartial";
      break;
    case "Iri":
      syntheticName = "NamedDefaultPartial";
      break;
  }

  let partialAstStructType = this.syntheticAstStructTypes.find(
    (syntheticAstStructType) =>
      syntheticAstStructType.name.extract() === syntheticName &&
      ast.Type.equals(syntheticAstStructType.identifierType, identifierType),
  );
  if (partialAstStructType) {
    return partialAstStructType;
  }

  partialAstStructType = new ast.StructType({
    comment: Maybe.empty(),
    extern: false,
    fromRdfType: Maybe.empty(),
    identifierType,
    label: Maybe.empty(),
    name: Maybe.of(syntheticName),
    shapeIdentifier: dataFactory.namedNode(
      `urn:shaclmate:synthetic:${syntheticName}`,
    ),
    synthetic: true,
    toRdfTypes: [],
    tsImports: [],
  });

  this.syntheticAstStructTypes.push(partialAstStructType);

  return partialAstStructType;
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
      let maxCount = propertyShape.maxCount.orDefault(
        BigInt(Number.MAX_SAFE_INTEGER),
      );
      let minCount = propertyShape.minCount.orDefault(0n);
      if (minCount < 0n) {
        minCount = 0n;
      }
      if (propertyShape.hasValues.length > minCount) {
        minCount = BigInt(propertyShape.hasValues.length);
      }
      if (maxCount < minCount) {
        maxCount = minCount;
      }

      if (propertyShapeAstType.kind === "DefaultValue") {
        if (minCount > 0n) {
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

      if (minCount === 1n && maxCount === 1n) {
        return Either.of(propertyShapeAstType);
      }

      if (minCount === 0n && maxCount === 1n) {
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

/**
 * Try to transform a property shape to an ast.StructType.Field.
 *
 * Returns:
 *  - Right<Just<ast.StructType.Field>> if the transformation succeeds
 *  - Right<Nothing> if the property shape should be ignored
 *  - Left<Error> if the transformation fails
 */
export function transformPropertyShapeToAstStructTypeField(
  this: ShapesGraphToAstTransformer,
  {
    propertyShape,
    structType,
  }: {
    propertyShape: input.PropertyShape;
    structType: ast.StructType;
  },
): Either<Error, Maybe<ast.StructType.Field>> {
  if (propertyShape.ignore) {
    return Either.of(Maybe.empty());
  }

  switch (propertyShape.severity.orDefault(sh.Violation).value) {
    case "http://www.w3.org/ns/shacl#Info":
    case "http://www.w3.org/ns/shacl#Warning":
      return Either.of(Maybe.empty());
  }

  const shapeStack = new ShapeStack(); // Start a new ShapeStack per property shape
  return Eithers.chain2(
    propertyShape.resolve.isJust()
      ? this.shapesGraph
          .nodeShape(propertyShape.resolve.extract()!)
          .map(Maybe.of)
      : Either.of(Maybe.empty()),
    transformPropertyShapeToAstType.call(this, propertyShape, shapeStack),
  ).chain(([propertyShapeResolve, astType]) => {
    let astResolveItemType: ast.StructType | ast.StructUnionType | undefined;

    if (propertyShapeResolve.isJust()) {
      const astResolveTypeEither = transformShapeToAstType
        .call(this, propertyShapeResolve.unsafeCoerce(), shapeStack)
        .chain((astResolveType) => {
          switch (astResolveType.kind) {
            case "Struct":
              return Either.of<Error, ast.StructType | ast.StructUnionType>(
                astResolveType,
              );
            case "Union":
              if (
                // This check relies on .members being populated, which may not happen in cycles
                astResolveType.members.length > 0 &&
                !astResolveType.isStructUnionType()
              ) {
                return Left(
                  new Error(
                    `${propertyShape} resolve cannot refer to a ${astResolveType.kind} with non-StructType members`,
                  ),
                );
              }
              return Either.of<Error, ast.StructType | ast.StructUnionType>(
                astResolveType as ast.StructUnionType,
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
        case "DefaultValue":
        case "Option":
        case "Set":
          astItemType = astType.itemType;
          break;
        case "LazyOption":
        case "LazySet":
        // biome-ignore lint/suspicious/noFallthroughSwitchClause: break is unreachable
        case "Lazy":
          invariant(
            false,
            `lazy types should not appear here: ${astType.kind}`,
          );
        default:
          astItemType = astType;
          break;
      }

      let astPartialItemType: ast.StructType | ast.StructUnionType;
      switch (astItemType.kind) {
        case "BlankNode":
        case "Identifier":
        case "Iri":
          astPartialItemType = synthesizePartialAstStructType.call(this, {
            identifierType: astItemType,
          });
          break;
        case "Struct":
          astPartialItemType = astItemType;
          break;
        case "Union":
          if (!astItemType.isStructUnionType()) {
            return Left(
              new Error(
                `${propertyShape} partial type cannot be a ${astItemType.kind} with non-StructType members`,
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
        shapeIdentifier: propertyShape.$identifier(),
      };

      switch (astType.kind) {
        case "BlankNode":
        case "Identifier":
        case "Iri":
        case "Struct":
        case "Union":
          astType = new ast.LazyType({
            ...astAbstractTypeProperties,
            partialType: astPartialItemType,
            resolveType: astResolveItemType,
          });
          break;
        case "Option":
          astType = new ast.LazyOptionType({
            ...astAbstractTypeProperties,
            partialType: new ast.OptionType({
              itemType: astPartialItemType,
            }),
            resolveType: new ast.OptionType({
              itemType: astResolveItemType,
            }),
          });
          break;
        case "Set":
          astType = new ast.LazySetType({
            ...astAbstractTypeProperties,
            partialType: new ast.SetType({
              itemType: astPartialItemType,
              minCount: 0n,
              mutable: false,
            }),
            resolveType: new ast.SetType({
              itemType: astResolveItemType,
              minCount: 0n,
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
      Maybe.of(
        new ast.StructType.Field({
          comment: propertyShape.comment,
          description: propertyShape.description,
          display: propertyShape.display,
          label: propertyShape.label,
          mutable: propertyShape.mutable.orDefault(false),
          name: fieldName.call(this, propertyShape, structType),
          order: propertyShape.order.orDefault(0),
          path: propertyShape.path,
          shapeIdentifier: propertyShape.$identifier(),
          structType,
          type: astType,
        }),
      ),
    );
  });
}
