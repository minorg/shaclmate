import TermMap from "@rdfjs/term-map";
import TermSet from "@rdfjs/term-set";
import type { BlankNode, NamedNode } from "@rdfjs/types";
import { rdf, xsd } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { fromRdf } from "rdf-literal";

import { LazyObjectOptionType } from "generators/ts/LazyObjectOptionType.js";
import { LazyObjectSetType } from "generators/ts/LazyObjectSetType.js";
import { LazyObjectType } from "generators/ts/LazyObjectType.js";
import type * as ast from "../../ast/index.js";
import { logger } from "../../logger.js";
import { BooleanType } from "./BooleanType.js";
import { DateTimeType } from "./DateTimeType.js";
import { DateType } from "./DateType.js";
import { FloatType } from "./FloatType.js";
import { IdentifierType } from "./IdentifierType.js";
import { IntType } from "./IntType.js";
import { ListType } from "./ListType.js";
import { LiteralType } from "./LiteralType.js";
import { ObjectType } from "./ObjectType.js";
import { ObjectUnionType } from "./ObjectUnionType.js";
import { OptionType } from "./OptionType.js";
import { SetType } from "./SetType.js";
import { StringType } from "./StringType.js";
import { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
import { UnionType } from "./UnionType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { tsName } from "./tsName.js";

export class TypeFactory {
  private cachedBooleanType = new BooleanType({
    defaultValue: Maybe.empty(),
    hasValues: [],
    in_: [],
    languageIn: [],
    primitiveDefaultValue: Maybe.empty(),
    primitiveIn: [],
  });
  private cachedDateType = new DateType({
    defaultValue: Maybe.empty(),
    hasValues: [],
    in_: [],
    languageIn: [],
    primitiveDefaultValue: Maybe.empty(),
    primitiveIn: [],
  });
  private cachedDateTimeType = new DateTimeType({
    defaultValue: Maybe.empty(),
    hasValues: [],
    in_: [],
    languageIn: [],
    primitiveDefaultValue: Maybe.empty(),
    primitiveIn: [],
  });
  private cachedFloatType = new FloatType({
    defaultValue: Maybe.empty(),
    hasValues: [],
    in_: [],
    languageIn: [],
    primitiveDefaultValue: Maybe.empty(),
    primitiveIn: [],
  });
  private cachedIdentifierType = new IdentifierType({
    defaultValue: Maybe.empty(),
    hasValues: [],
    in_: [],
    nodeKinds: new Set(["BlankNode", "NamedNode"]),
  });
  private cachedIntType = new IntType({
    defaultValue: Maybe.empty(),
    hasValues: [],
    in_: [],
    languageIn: [],
    primitiveDefaultValue: Maybe.empty(),
    primitiveIn: [],
  });
  private cachedNamedIdentifierType = new IdentifierType({
    defaultValue: Maybe.empty(),
    hasValues: [],
    in_: [],
    nodeKinds: new Set(["NamedNode"]),
  });
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
  private cachedStringType = new StringType({
    defaultValue: Maybe.empty(),
    hasValues: [],
    in_: [],
    languageIn: [],
    primitiveDefaultValue: Maybe.empty(),
    primitiveIn: [],
  });

  private createIdentifierType(astType: ast.IdentifierType): IdentifierType {
    if (
      astType.defaultValue.isNothing() &&
      astType.hasValues.length === 0 &&
      astType.in_.length === 0
    ) {
      if (astType.nodeKinds.size === 2) {
        return this.cachedIdentifierType;
      }
      if (astType.nodeKinds.size === 1 && astType.nodeKinds.has("NamedNode")) {
        return this.cachedNamedIdentifierType;
      }
    }

    return new IdentifierType({
      defaultValue: astType.defaultValue,
      hasValues: astType.hasValues,
      in_: astType.in_.filter((_) => _.termType === "NamedNode"),
      nodeKinds: astType.nodeKinds,
    });
  }

  private createLazyObjectOptionType(astType: ast.LazyObjectOptionType): Type {
    return new LazyObjectOptionType({
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
      identifierNodeKind: astType.identifierNodeKind,
      itemType: this.createType(astType.itemType),
      minCount: 0,
      mutable: astType.mutable,
      identifierMintingStrategy: astType.identifierMintingStrategy,
      toRdfTypes: astType.toRdfTypes,
    });
  }

  private createLiteralType(astType: ast.LiteralType): LiteralType {
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
        if (
          astType.defaultValue.isNothing() &&
          astType.hasValues.length === 0 &&
          astType.in_.length === 0
        ) {
          return this.cachedBooleanType;
        }

        return new BooleanType({
          defaultValue: astType.defaultValue,
          hasValues: astType.hasValues,
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
        if (
          astType.defaultValue.isNothing() &&
          astType.hasValues.length === 0 &&
          astType.in_.length === 0
        ) {
          return datatype.equals(xsd.date)
            ? this.cachedDateType
            : this.cachedDateTimeType;
        }

        return new (datatype.equals(xsd.date) ? DateType : DateTimeType)({
          defaultValue: astType.defaultValue,
          hasValues: astType.hasValues,
          in_: astType.in_,
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
            if (
              astType.defaultValue.isNothing() &&
              astType.hasValues.length === 0 &&
              astType.in_.length === 0
            ) {
              return floatOrInt === "float"
                ? this.cachedFloatType
                : this.cachedIntType;
            }

            return new (floatOrInt === "float" ? FloatType : IntType)({
              defaultValue: astType.defaultValue,
              hasValues: astType.hasValues,
              in_: astType.in_,
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

      if (datatype.equals(xsd.anyURI) || datatype.equals(xsd.string)) {
        if (
          astType.defaultValue.isNothing() &&
          astType.hasValues.length === 0 &&
          astType.in_.length === 0 &&
          astType.languageIn.length === 0
        ) {
          return this.cachedStringType;
        }

        return new StringType({
          defaultValue: astType.defaultValue,
          hasValues: astType.hasValues,
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
      defaultValue: astType.defaultValue,
      hasValues: astType.hasValues,
      in_: astType.in_,
      languageIn: astType.languageIn,
    });
  }

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

        // Type discriminator property
        const typeDiscriminatorOwnValue = !astType.abstract
          ? objectType.discriminatorValue
          : undefined;
        const typeDiscriminatorDescendantValues = new Set<string>();
        for (const descendantObjectType of objectType.descendantObjectTypes) {
          if (!descendantObjectType.abstract) {
            typeDiscriminatorDescendantValues.add(
              descendantObjectType.discriminatorValue,
            );
          }
        }
        if (
          typeDiscriminatorOwnValue ||
          typeDiscriminatorDescendantValues.size > 0
        ) {
          properties.splice(
            0,
            0,
            new ObjectType.TypeDiscriminatorProperty({
              name: `${syntheticNamePrefix}type`,
              objectType,
              type: new ObjectType.TypeDiscriminatorProperty.Type({
                descendantValues: [...typeDiscriminatorDescendantValues].sort(),
                mutable: false,
                ownValues: typeDiscriminatorOwnValue
                  ? [typeDiscriminatorOwnValue]
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
              type: this.cachedStringType,
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

  private createOptionType(astType: ast.OptionType) {
    return new OptionType({
      itemType: this.createType(astType.itemType),
    });
  }

  private createSetType(astType: ast.SetType) {
    return new SetType({
      itemType: this.createType(astType.itemType),
      mutable: astType.mutable,
      minCount: astType.minCount,
    });
  }

  private createTermType(astType: ast.TermType) {
    return new TermType({
      defaultValue: astType["defaultValue"],
      hasValues: astType["hasValues"],
      in_: astType["in_"],
      nodeKinds: astType["nodeKinds"],
    });
  }

  createType(astType: ast.Type): Type {
    switch (astType.kind) {
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

  private createUnionType(astType: ast.UnionType) {
    return new UnionType({
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
