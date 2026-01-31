import TermMap from "@rdfjs/term-map";
import TermSet from "@rdfjs/term-set";
import type { BlankNode, NamedNode } from "@rdfjs/types";
import { rdf, xsd } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { fromRdf } from "rdf-literal";

import type * as ast from "../../ast/index.js";

import { logger } from "../../logger.js";
import { BlankNodeType } from "./BlankNodeType.js";
import { BooleanType } from "./BooleanType.js";
import { DateTimeType } from "./DateTimeType.js";
import { DateType } from "./DateType.js";
import { FloatType } from "./FloatType.js";
import { IdentifierType } from "./IdentifierType.js";
import { IntType } from "./IntType.js";
import { LazyObjectOptionType } from "./LazyObjectOptionType.js";
import { LazyObjectSetType } from "./LazyObjectSetType.js";
import { LazyObjectType } from "./LazyObjectType.js";
import { ListType } from "./ListType.js";
import { LiteralType } from "./LiteralType.js";
import { NamedNodeType } from "./NamedNodeType.js";
import { ObjectType } from "./ObjectType.js";
import { ObjectUnionType } from "./ObjectUnionType.js";
import { OptionType } from "./OptionType.js";
import { SetType } from "./SetType.js";
import { StringType } from "./StringType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
import { tsName } from "./tsName.js";
import { UnionType } from "./UnionType.js";

export class TypeFactory {
  private cachedObjectTypePropertiesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    ObjectType.Property
  > = new TermMap();
  private cachedObjectTypesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    ObjectType
  > = new TermMap();
  private cachedObjectUnionTypesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    ObjectUnionType
  > = new TermMap();

  createObjectType(astType: ast.ObjectType): ObjectType {
    {
      const cachedObjectType = this.cachedObjectTypesByShapeIdentifier.get(
        astType.shapeIdentifier,
      );
      if (cachedObjectType) {
        return cachedObjectType;
      }
    }

    const identifierType = this.createIdentifierType(astType.identifierType);

    const staticModuleName =
      astType.childObjectTypes.length > 0
        ? `${tsName(astType)}Static`
        : tsName(astType);

    const objectType = new ObjectType({
      abstract: astType.abstract,
      comment: astType.comment,
      declarationType: astType.tsObjectDeclarationType,
      export_: astType.export,
      extern: astType.extern,
      features: astType.tsFeatures,
      fromRdfType: astType.fromRdfType,
      identifierType,
      imports: astType.tsImports,
      label: astType.label,
      lazyAncestorObjectTypes: () =>
        astType.ancestorObjectTypes.map((astType) =>
          this.createObjectType(astType),
        ),
      lazyChildObjectTypes: () =>
        astType.childObjectTypes.map((astType) =>
          this.createObjectType(astType),
        ),
      lazyDescendantObjectTypes: () =>
        astType.descendantObjectTypes.map((astType) =>
          this.createObjectType(astType),
        ),
      lazyParentObjectTypes: () =>
        astType.parentObjectTypes.map((astType) =>
          this.createObjectType(astType),
        ),
      lazyProperties: (objectType: ObjectType) => {
        const properties: ObjectType.Property[] = astType.properties
          .toSorted((left, right) => {
            if (left.order < right.order) {
              return -1;
            }
            if (left.order > right.order) {
              return 1;
            }
            return tsName(left).localeCompare(tsName(right));
          })
          .map((astProperty) =>
            this.createObjectTypeProperty({
              astObjectTypeProperty: astProperty,
              objectType,
            }),
          );

        // Type discriminant property
        const typeDiscriminantOwnValue = !astType.abstract
          ? objectType.discriminantValue
          : undefined;
        const typeDiscriminantDescendantValues = new Set<string>();
        for (const descendantObjectType of objectType.descendantObjectTypes) {
          if (!descendantObjectType.abstract) {
            typeDiscriminantDescendantValues.add(
              descendantObjectType.discriminantValue,
            );
          }
        }
        if (
          typeDiscriminantOwnValue ||
          typeDiscriminantDescendantValues.size > 0
        ) {
          properties.splice(
            0,
            0,
            new ObjectType.TypeDiscriminantProperty({
              name: `${syntheticNamePrefix}type`,
              objectType,
              type: new ObjectType.TypeDiscriminantProperty.Type({
                descendantValues: [...typeDiscriminantDescendantValues].sort(),
                mutable: false,
                ownValues: typeDiscriminantOwnValue
                  ? [typeDiscriminantOwnValue]
                  : [],
              }),
              visibility: "public",
            }),
          );
        }

        // Some ObjectTypes have an identifierPrefix property, depending on their identifier minting strategy.
        if (objectTypeNeedsIdentifierPrefixProperty(astType)) {
          properties.splice(
            0,
            0,
            new ObjectType.IdentifierPrefixProperty({
              name: `${syntheticNamePrefix}identifierPrefix`,
              objectType,
              own: !astType.ancestorObjectTypes.some(
                objectTypeNeedsIdentifierPrefixProperty,
              ),
              type: new StringType({
                comment: astType.comment,
                defaultValue: Maybe.empty(),
                hasValues: [],
                in_: [],
                label: astType.label,
                languageIn: [],
                primitiveDefaultValue: Maybe.empty(),
                primitiveIn: [],
              }),
              visibility: "protected",
            }),
          );
        }

        // Every ObjectType has an identifier property. Some are abstract.
        properties.splice(
          0,
          0,
          new ObjectType.IdentifierProperty({
            identifierMintingStrategy: astType.identifierMintingStrategy,
            identifierPrefixPropertyName: `${syntheticNamePrefix}identifierPrefix`,
            name: `${syntheticNamePrefix}identifier`,
            objectType,
            type: identifierType,
            typeAlias: `${staticModuleName}.${syntheticNamePrefix}Identifier`,
            visibility: "public",
          }),
        );

        return properties;
      },
      identifierMintingStrategy: astType.identifierMintingStrategy,
      name: tsName(astType),
      staticModuleName,
      synthetic: astType.synthetic,
      toRdfTypes: astType.toRdfTypes,
    });
    this.cachedObjectTypesByShapeIdentifier.set(
      astType.shapeIdentifier,
      objectType,
    );
    return objectType;
  }

  createObjectUnionType(astType: ast.ObjectUnionType): ObjectUnionType {
    {
      const cachedObjectUnionType =
        this.cachedObjectUnionTypesByShapeIdentifier.get(
          astType.shapeIdentifier,
        );
      if (cachedObjectUnionType) {
        return cachedObjectUnionType;
      }
    }

    const objectUnionType = new ObjectUnionType({
      comment: astType.comment,
      export_: astType.export,
      features: astType.tsFeatures,
      identifierType: this.createIdentifierType(astType.identifierType),
      label: astType.label,
      memberTypes: astType.memberObjectTypes.map((objectType) =>
        this.createObjectType(objectType),
      ),
      name: tsName(astType as ast.ObjectUnionType),
    });

    this.cachedObjectUnionTypesByShapeIdentifier.set(
      astType.shapeIdentifier,
      objectUnionType,
    );
    return objectUnionType;
  }

  createType(astType: ast.Type): Type {
    switch (astType.kind) {
      case "BlankNodeType":
        return this.createBlankNodeType(astType);
      case "IdentifierType":
        return this.createIdentifierType(astType);
      case "IntersectionType":
        throw new Error("not implemented");
      case "LazyObjectOptionType":
        return this.createLazyObjectOptionType(astType);
      case "LazyObjectSetType":
        return this.createLazyObjectSetType(astType);
      case "LazyObjectType":
        return this.createLazyObjectType(astType);
      case "ListType":
        return this.createListType(astType);
      case "LiteralType":
        return this.createLiteralType(astType);
      case "NamedNodeType":
        return this.createNamedNodeType(astType);
      case "ObjectIntersectionType":
        throw new Error("not implemented");
      case "ObjectType":
        return this.createObjectType(astType);
      case "ObjectUnionType":
        return this.createObjectUnionType(astType);
      case "OptionType":
        return this.createOptionType(astType);
      case "PlaceholderType":
        throw new Error(astType.kind);
      case "SetType":
        return this.createSetType(astType);
      case "TermType":
        return this.createTermType(astType);
      case "UnionType":
        return this.createUnionType(astType);
    }
  }

  private createBlankNodeType(astType: ast.BlankNodeType): BlankNodeType {
    return new BlankNodeType({
      comment: astType.comment,
      label: astType.label,
    });
  }

  private createIdentifierType(
    astType: ast.BlankNodeType | ast.IdentifierType | ast.NamedNodeType,
  ): BlankNodeType | IdentifierType | NamedNodeType {
    switch (astType.kind) {
      case "BlankNodeType":
        return this.createBlankNodeType(astType);
      case "IdentifierType":
        return new IdentifierType({
          comment: astType.comment,
          defaultValue: astType.defaultValue,
          label: astType.label,
        });
      case "NamedNodeType":
        return this.createNamedNodeType(astType);
    }
  }

  private createNamedNodeType(astType: ast.NamedNodeType): NamedNodeType {
    return new NamedNodeType({
      comment: astType.comment,
      defaultValue: astType.defaultValue,
      hasValues: astType.hasValues,
      in_: astType.in_,
      label: astType.label,
    });
  }

  private createLazyObjectOptionType(astType: ast.LazyObjectOptionType): Type {
    return new LazyObjectOptionType({
      comment: astType.comment,
      label: astType.label,
      partialType: this.createOptionType(astType.partialType) as OptionType<
        ObjectType | ObjectUnionType
      >,
      resolvedType: this.createOptionType(astType.resolvedType) as OptionType<
        ObjectType | ObjectUnionType
      >,
    });
  }

  private createLazyObjectSetType(astType: ast.LazyObjectSetType): Type {
    return new LazyObjectSetType({
      comment: astType.comment,
      label: astType.label,
      partialType: this.createSetType(astType.partialType) as SetType<
        ObjectType | ObjectUnionType
      >,
      resolvedType: this.createSetType(astType.resolvedType) as SetType<
        ObjectType | ObjectUnionType
      >,
    });
  }

  private createLazyObjectType(astType: ast.LazyObjectType): Type {
    return new LazyObjectType({
      comment: astType.comment,
      label: astType.label,

      partialType: this.createType(astType.partialType) as
        | ObjectType
        | ObjectUnionType,
      resolvedType: this.createType(astType.resolvedType) as
        | ObjectType
        | ObjectUnionType,
    });
  }

  private createListType(astType: ast.ListType) {
    return new ListType({
      comment: astType.comment,
      identifierNodeKind: astType.identifierNodeKind,
      itemType: this.createType(astType.itemType),
      label: astType.label,
      minCount: 0,
      mutable: astType.mutable,
      identifierMintingStrategy: astType.identifierMintingStrategy,
      toRdfTypes: astType.toRdfTypes,
    });
  }

  private createLiteralType(astType: ast.LiteralType): Type {
    // Look at sh:datatype as well as sh:defaultValue/sh:hasValue/sh:in term datatypes
    // If there's one common datatype than we can refine the type
    // Otherwise default to rdfjs.Literal
    const datatypes = new TermSet<NamedNode>();
    astType.datatype.ifJust((datatype) => datatypes.add(datatype));
    astType.defaultValue.ifJust((defaultValue) =>
      datatypes.add(defaultValue.datatype),
    );
    for (const hasValue of astType.hasValues) {
      datatypes.add(hasValue.datatype);
    }
    for (const value of astType.in_) {
      datatypes.add(value.datatype);
    }

    if (datatypes.size === 1) {
      const datatype = [...datatypes][0];

      if (datatype.equals(xsd.boolean)) {
        return new BooleanType({
          comment: astType.comment,
          defaultValue: astType.defaultValue,
          hasValues: astType.hasValues,
          label: astType.label,
          languageIn: [],
          in_: astType.in_,
          primitiveDefaultValue: astType.defaultValue
            .map((value) => fromRdf(value, true))
            .filter((value) => typeof value === "boolean"),
          primitiveIn: astType.in_
            .map((value) => fromRdf(value, true))
            .filter((value) => typeof value === "boolean"),
        });
      }

      if (datatype.equals(xsd.date) || datatype.equals(xsd.dateTime)) {
        return new (datatype.equals(xsd.date) ? DateType : DateTimeType)({
          comment: astType.comment,
          defaultValue: astType.defaultValue,
          hasValues: astType.hasValues,
          in_: astType.in_,
          label: astType.label,
          languageIn: [],
          primitiveDefaultValue: astType.defaultValue
            .map((value) => fromRdf(value, true))
            .filter(
              (value) => typeof value === "object" && value instanceof Date,
            ),
          primitiveIn: astType.in_
            .map((value) => fromRdf(value, true))
            .filter(
              (value) => typeof value === "object" && value instanceof Date,
            ),
        });
      }

      for (const [floatOrInt, numberDatatypes_] of Object.entries(
        numberDatatypes,
      )) {
        for (const numberDatatype of numberDatatypes_) {
          if (datatype.equals(numberDatatype)) {
            return new (floatOrInt === "float" ? FloatType : IntType)({
              comment: astType.comment,
              datatype: numberDatatype,
              defaultValue: astType.defaultValue,
              hasValues: astType.hasValues,
              in_: astType.in_,
              label: astType.label,
              languageIn: [],
              primitiveDefaultValue: astType.defaultValue
                .map((value) => fromRdf(value, true))
                .filter((value) => typeof value === "number"),
              primitiveIn: astType.in_
                .map((value) => fromRdf(value, true))
                .filter((value) => typeof value === "number"),
            });
          }
        }
      }

      if (datatype.equals(xsd.string)) {
        return new StringType({
          comment: astType.comment,
          defaultValue: astType.defaultValue,
          hasValues: astType.hasValues,
          label: astType.label,
          languageIn: astType.languageIn,
          in_: astType.in_,
          primitiveDefaultValue: astType.defaultValue.map(
            (value) => value.value,
          ),
          primitiveIn: astType.in_.map((value) => value.value),
        });
      }

      if (datatype.equals(rdf.langString)) {
        // Drop down
      } else {
        logger.warn("unrecognized literal datatype: %s", datatype.value);
      }
    } else if (datatypes.size > 0) {
      logger.warn(
        "literal type has multiple datatypes: %s",
        JSON.stringify([...datatypes].map((datatype) => datatype.value)),
      );
    } else {
      logger.debug("literal type has no datatypes");
    }

    return new LiteralType({
      comment: astType.comment,
      defaultValue: astType.defaultValue,
      hasValues: astType.hasValues,
      in_: astType.in_,
      label: astType.label,
      languageIn: astType.languageIn,
    });
  }

  private createObjectTypeProperty({
    astObjectTypeProperty,
    objectType,
  }: {
    astObjectTypeProperty: ast.ObjectType.Property;
    objectType: ObjectType;
  }): ObjectType.Property {
    {
      const cachedProperty =
        this.cachedObjectTypePropertiesByShapeIdentifier.get(
          astObjectTypeProperty.shapeIdentifier,
        );
      if (cachedProperty) {
        return cachedProperty;
      }
    }

    const name = tsName(astObjectTypeProperty);

    const property = new ObjectType.ShaclProperty({
      comment: astObjectTypeProperty.comment,
      description: astObjectTypeProperty.description,
      label: astObjectTypeProperty.label,
      mutable: astObjectTypeProperty.mutable,
      objectType,
      name,
      path: astObjectTypeProperty.path,
      recursive: !!astObjectTypeProperty.recursive,
      type: this.createType(astObjectTypeProperty.type),
      visibility: astObjectTypeProperty.visibility,
    });

    this.cachedObjectTypePropertiesByShapeIdentifier.set(
      astObjectTypeProperty.shapeIdentifier,
      property,
    );

    return property;
  }

  private createOptionType(astType: ast.OptionType) {
    return new OptionType({
      comment: astType.comment,
      itemType: this.createType(astType.itemType),
      label: astType.label,
    });
  }

  private createSetType(astType: ast.SetType) {
    return new SetType({
      comment: astType.comment,
      itemType: this.createType(astType.itemType),
      label: astType.label,
      mutable: astType.mutable,
      minCount: astType.minCount,
    });
  }

  private createTermType(astType: ast.TermType) {
    return new TermType({
      comment: astType.comment,
      defaultValue: astType["defaultValue"],
      hasValues: astType["hasValues"],
      in_: astType["in_"],
      label: astType.label,
      nodeKinds: astType["nodeKinds"],
    });
  }

  private createUnionType(astType: ast.UnionType) {
    return new UnionType({
      comment: astType.comment,
      label: astType.label,
      memberDiscriminantValues: astType.memberDiscriminantValues,
      memberTypes: astType.memberTypes.map((astType) =>
        this.createType(astType),
      ),
    });
  }
}

function objectTypeNeedsIdentifierPrefixProperty(
  objectType: ast.ObjectType,
): boolean {
  return objectType.identifierMintingStrategy
    .map((identifierMintingStrategy) => {
      switch (identifierMintingStrategy) {
        case "blankNode":
          return false;
        case "sha256":
        case "uuidv4":
          return true;
        default:
          identifierMintingStrategy satisfies never;
          throw new RangeError(identifierMintingStrategy);
      }
    })
    .orDefault(false);
}

const numberDatatypes = {
  float: [xsd.decimal, xsd.double, xsd.float],
  int: [
    xsd.byte,
    xsd.int,
    xsd.integer,
    xsd.long,
    xsd.negativeInteger,
    xsd.nonNegativeInteger,
    xsd.nonPositiveInteger,
    xsd.positiveInteger,
    xsd.short,
    xsd.unsignedByte,
    xsd.unsignedInt,
    xsd.unsignedLong,
    xsd.unsignedShort,
  ],
};
