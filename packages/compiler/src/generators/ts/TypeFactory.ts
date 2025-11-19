import TermMap from "@rdfjs/term-map";
import TermSet from "@rdfjs/term-set";
import type { BlankNode, NamedNode } from "@rdfjs/types";
import { rdf, xsd } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { fromRdf } from "rdf-literal";
import { invariant } from "ts-invariant";

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
  private cachedObjectTypePropertiesByIdentifier: TermMap<
    BlankNode | NamedNode,
    ObjectType.Property
  > = new TermMap();
  private cachedObjectTypesByIdentifier: TermMap<
    BlankNode | NamedNode,
    ObjectType
  > = new TermMap();
  private cachedObjectUnionTypesByIdentifier: TermMap<
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

  createObjectType(astType: ast.ObjectType): ObjectType {
    {
      const cachedObjectType = this.cachedObjectTypesByIdentifier.get(
        astType.name.identifier,
      );
      if (cachedObjectType) {
        return cachedObjectType;
      }
    }

    const identifierType = this.createIdentifierType(astType.identifierType);

    const staticModuleName =
      astType.childObjectTypes.length > 0
        ? `${tsName(astType.name)}Static`
        : tsName(astType.name);

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
            return tsName(left.name).localeCompare(tsName(right.name));
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
      name: tsName(astType.name),
      staticModuleName,
      synthetic: astType.synthetic,
      toRdfTypes: astType.toRdfTypes,
    });
    this.cachedObjectTypesByIdentifier.set(astType.name.identifier, objectType);
    return objectType;
  }

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

  createType(astType: ast.Type): Type {
    switch (astType.kind) {
      case "IdentifierType":
        return this.createIdentifierType(astType);
      case "IntersectionType":
        throw new Error("not implemented");
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

  private createObjectTypeProperty({
    astObjectTypeProperty,
    objectType,
  }: {
    astObjectTypeProperty: ast.ObjectType.Property;
    objectType: ObjectType;
  }): ObjectType.Property {
    {
      const cachedProperty = this.cachedObjectTypePropertiesByIdentifier.get(
        astObjectTypeProperty.name.identifier,
      );
      if (cachedProperty) {
        return cachedProperty;
      }
    }

    let property: ObjectType.Property;

    const name = tsName(astObjectTypeProperty.name);

    if (astObjectTypeProperty.partialType.isJust()) {
      const resolvedType = this.createType(astObjectTypeProperty.type);
      let lazyType: ObjectType.LazyShaclProperty.Type<
        ObjectType.LazyShaclProperty.Type.ResolvedTypeConstraint,
        ObjectType.LazyShaclProperty.Type.PartialTypeConstraint
      >;
      const partialType = this.createType(
        astObjectTypeProperty.partialType.unsafeCoerce(),
      );

      if (resolvedType instanceof OptionType) {
        invariant(
          resolvedType.itemType instanceof ObjectType ||
            resolvedType.itemType instanceof ObjectUnionType,
          `lazy property ${name} on ${objectType.name} has ${resolvedType.kind} ${resolvedType.itemType.kind} items`,
        );
        invariant(
          partialType instanceof OptionType,
          `lazy property ${name} on ${objectType.name} has ${(partialType as any).kind} partials`,
        );

        lazyType = new ObjectType.LazyShaclProperty.OptionalObjectType({
          resolvedType,
          partialType,
        });
      } else if (
        resolvedType instanceof ObjectType ||
        resolvedType instanceof ObjectUnionType
      ) {
        invariant(
          partialType instanceof ObjectType ||
            partialType instanceof ObjectUnionType,
          `lazy property ${name} on ${objectType.name} has ${(partialType as any).kind} partials`,
        );

        lazyType = new ObjectType.LazyShaclProperty.RequiredObjectType({
          resolvedType: resolvedType,
          partialType: partialType,
        });
      } else if (resolvedType instanceof SetType) {
        invariant(
          resolvedType.itemType instanceof ObjectType ||
            resolvedType.itemType instanceof ObjectUnionType,
          `lazy property ${name} on ${objectType.name} has ${resolvedType.kind} ${resolvedType.itemType.kind} items`,
        );
        invariant(
          partialType instanceof SetType,
          `lazy property ${name} on ${objectType.name} has ${(partialType as any).kind} partials`,
        );

        lazyType = new ObjectType.LazyShaclProperty.ObjectSetType({
          resolvedType,
          partialType,
        });
      } else {
        throw new Error(
          `lazy property ${name} on ${objectType.name} has ${(resolvedType as any).kind}`,
        );
      }

      property = new ObjectType.LazyShaclProperty({
        comment: astObjectTypeProperty.comment,
        description: astObjectTypeProperty.description,
        label: astObjectTypeProperty.label,
        objectType,
        name,
        path: astObjectTypeProperty.path.iri,
        type: lazyType,
        visibility: astObjectTypeProperty.visibility,
      });
    } else {
      property = new ObjectType.EagerShaclProperty({
        comment: astObjectTypeProperty.comment,
        description: astObjectTypeProperty.description,
        label: astObjectTypeProperty.label,
        mutable: astObjectTypeProperty.mutable,
        objectType,
        name,
        path: astObjectTypeProperty.path.iri,
        recursive: !!astObjectTypeProperty.recursive,
        type: this.createType(astObjectTypeProperty.type),
        visibility: astObjectTypeProperty.visibility,
      });
    }
    this.cachedObjectTypePropertiesByIdentifier.set(
      astObjectTypeProperty.name.identifier,
      property,
    );
    return property;
  }

  private createObjectUnionType(astType: ast.ObjectUnionType): ObjectUnionType {
    {
      const cachedObjectUnionType = this.cachedObjectUnionTypesByIdentifier.get(
        astType.name.identifier,
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
      name: tsName((astType as ast.ObjectUnionType).name),
    });

    this.cachedObjectUnionTypesByIdentifier.set(
      astType.name.identifier,
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
