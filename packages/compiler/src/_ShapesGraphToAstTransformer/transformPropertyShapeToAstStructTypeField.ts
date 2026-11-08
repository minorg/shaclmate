import { Curie } from "@rdfx/curie";
import type { NodeKind } from "@shaclmate/shacl-ast";
import { sh } from "@tpluscode/rdf-ns-builders";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { AbstractContainerType } from "../ast/AbstractContainerType.js";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { ShapeStack } from "./ShapeStack.js";
import { synthesizePartialAstStructType } from "./synthesizePartialAstStructType.js";
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

function propertyCardinality(propertyShape: input.PropertyShape): {
  maxCount: bigint;
  minCount: bigint;
} {
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
  return { maxCount, minCount };
}

function transformPropertyShapeToAstCardinalityType(
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
      const { maxCount, minCount } = propertyCardinality(propertyShape);

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

function transformPropertyShapeToAstLazyType(
  this: ShapesGraphToAstTransformer,
  {
    propertyShape,
    propertyShapeAstCardinalityType,
    shapeStack,
  }: {
    propertyShape: input.PropertyShape;
    propertyShapeAstCardinalityType: ast.Type;
    shapeStack: ShapeStack;
  },
): Either<Error, Maybe<ast.LazyOptionType | ast.LazySetType | ast.LazyType>> {
  if (propertyShape.resolve.isNothing()) {
    return Either.of(Maybe.empty());
  }

  return this.shapesGraph
    .nodeShape(propertyShape.resolve.extract()!)
    .chain((resolveNodeShape) => {
      const resolveAstItemTypeEither = transformShapeToAstType
        .call(this, resolveNodeShape, shapeStack)
        .chain((resolveAstItemType) => {
          switch (resolveAstItemType.kind) {
            case "Struct":
              return Either.of<
                Error,
                ast.StructType | ast.StructDiscriminatedUnionType
              >(resolveAstItemType);
            case "DiscriminatedUnion":
              if (
                // This check relies on .members being populated, which may not happen in cycles
                resolveAstItemType.members.length > 0 &&
                !resolveAstItemType.isStructDiscriminatedUnionType()
              ) {
                return Left(
                  new Error(
                    `${propertyShape} resolve cannot refer to a ${resolveAstItemType.kind} with non-StructType members`,
                  ),
                );
              }
              return Either.of<
                Error,
                ast.StructType | ast.StructDiscriminatedUnionType
              >(resolveAstItemType as ast.StructDiscriminatedUnionType);
            default:
              return Left(
                new Error(
                  `${propertyShape} resolve cannot refer to a ${resolveAstItemType.kind}`,
                ),
              );
          }
        });
      if (resolveAstItemTypeEither.isLeft()) {
        return resolveAstItemTypeEither;
      }
      const resolveAstItemType = resolveAstItemTypeEither.unsafeCoerce();

      let propertyShapeAstItemType: AbstractContainerType.ItemType;
      switch (propertyShapeAstCardinalityType.kind) {
        case "DefaultValue":
        case "Option":
        case "Set":
          propertyShapeAstItemType = propertyShapeAstCardinalityType.itemType;
          break;
        case "LazyOption":
        case "LazySet":
        // biome-ignore lint/suspicious/noFallthroughSwitchClause: break is unreachable
        case "Lazy":
          invariant(
            false,
            `lazy types should not appear here: ${propertyShapeAstCardinalityType.kind}`,
          );
        default:
          propertyShapeAstItemType = propertyShapeAstCardinalityType;
          break;
      }

      let partialAstItemType: ast.StructType | ast.StructDiscriminatedUnionType;
      switch (propertyShapeAstItemType.kind) {
        case "Identifier":
        case "Iri":
          partialAstItemType = synthesizePartialAstStructType.call(this, {
            identifierType: propertyShapeAstItemType,
          });
          break;
        case "Struct":
          partialAstItemType = propertyShapeAstItemType;
          break;
        case "DiscriminatedUnion":
          if (!propertyShapeAstItemType.isStructDiscriminatedUnionType()) {
            return Left(
              new Error(
                `${propertyShape} partial type cannot be a ${propertyShapeAstItemType.kind} with non-StructType members`,
              ),
            );
          }
          partialAstItemType = propertyShapeAstItemType;
          break;
        default:
          return Left(
            new Error(
              `${propertyShape} has a resolve with an incompatible partial type ${propertyShapeAstItemType.kind}`,
            ),
          );
      }

      return Eithers.chain2(
        ast.StructCompoundType.identifierType(partialAstItemType),
        ast.StructCompoundType.identifierType(resolveAstItemType),
      ).chain(
        ([partialAstItemIdentifierType, resolveAstItemIdentifierType]) => {
          if (
            partialAstItemIdentifierType.kind !==
            resolveAstItemIdentifierType.kind
          ) {
            return Left(
              new Error(
                `${propertyShape} has a resolve with a different identifier type (${resolveAstItemIdentifierType.kind}) than the partial's identifier type (${partialAstItemIdentifierType.kind})`,
              ),
            );
          }

          if (partialAstItemIdentifierType.kind === "BlankNode") {
            return Left(
              new Error(
                `${propertyShape} has a ${partialAstItemIdentifierType.kind} identifier type, which is incompatible with shaclmate:resolve`,
              ),
            );
          }

          const astAbstractTypeProperties = {
            comment: Maybe.empty(),
            label: Maybe.empty(),
            name: Maybe.empty(),
            shapeIdentifier: propertyShape.$identifier(),
          };

          switch (propertyShapeAstCardinalityType.kind) {
            case "BlankNode":
            case "Identifier":
            case "Iri":
            case "Struct":
            case "DiscriminatedUnion":
              return Either.of(
                Maybe.of(
                  new ast.LazyType({
                    ...astAbstractTypeProperties,
                    partialType: partialAstItemType,
                    resolveType: resolveAstItemType,
                  }),
                ),
              );
            case "Option":
              return Either.of(
                Maybe.of(
                  new ast.LazyOptionType({
                    ...astAbstractTypeProperties,
                    partialType: new ast.OptionType({
                      itemType: partialAstItemType,
                    }),
                    resolveType: new ast.OptionType({
                      itemType: resolveAstItemType,
                    }),
                  }),
                ),
              );
            case "Set":
              return Either.of(
                Maybe.of(
                  new ast.LazySetType({
                    ...astAbstractTypeProperties,
                    partialType: new ast.SetType({
                      itemType: partialAstItemType,
                      minCount: 0n,
                      mutable: false,
                    }),
                    resolveType: new ast.SetType({
                      itemType: resolveAstItemType,
                      minCount: 0n,
                      mutable: false,
                    }),
                  }),
                ),
              );
            default:
              invariant(
                false,
                `unexpected lazy AST type ${propertyShapeAstCardinalityType.kind}`,
              );
          }
        },
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
): Either<Error, Maybe<ast.StructType.ShaclField>> {
  if (propertyShape.ignore) {
    return Either.of(Maybe.empty());
  }

  switch (propertyShape.severity.orDefault(sh.Violation).value) {
    case "http://www.w3.org/ns/shacl#Info":
    case "http://www.w3.org/ns/shacl#Warning":
      return Either.of(Maybe.empty());
  }

  const shapeStack = new ShapeStack(); // Start a new ShapeStack per property shape
  return transformPropertyShapeToAstCardinalityType
    .call(this, propertyShape, shapeStack)
    .chain((propertyShapeAstCardinalityType) =>
      transformPropertyShapeToAstLazyType
        .call(this, {
          propertyShape,
          propertyShapeAstCardinalityType,
          shapeStack,
        })
        .chain((propertyShapeAstLazyType) => {
          const propertyShapeAstType = (
            propertyShapeAstLazyType as Maybe<ast.Type>
          ).orDefault(propertyShapeAstCardinalityType);

          if (
            propertyShape.path.termType === "InversePath" &&
            (propertyShapeAstType.nodeKinds as ReadonlySet<NodeKind>).has(
              "Literal",
            )
          ) {
            return Left(
              new Error(
                `${propertyShape}: property shapes with inverse paths can only have blank node or IRI node kinds`,
              ),
            );
          }

          return Either.of(
            Maybe.of(
              new ast.StructType.ShaclField({
                comment: propertyShape.comment,
                description: propertyShape.description,
                display: propertyShape.display,
                label: propertyShape.label,
                minCount: propertyCardinality(propertyShape).minCount,
                mutable: propertyShape.mutable.orDefault(false),
                name: fieldName.call(this, propertyShape, structType),
                order: propertyShape.order.orDefault(0),
                path: propertyShape.path,
                shapeIdentifier: propertyShape.$identifier(),
                structType,
                type: propertyShapeAstType,
              }),
            ),
          );
        }),
    );
}
