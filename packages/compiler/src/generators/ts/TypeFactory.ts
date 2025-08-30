import TermMap from "@rdfjs/term-map";
import TermSet from "@rdfjs/term-set";
import type { BlankNode, NamedNode } from "@rdfjs/types";
import { rdf, xsd } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { fromRdf } from "rdf-literal";

import type * as ast from "../../ast/index.js";

import { Scope } from "ts-morph";
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

export class TypeFactory {
  private readonly dataFactoryVariable: string;

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

  constructor({ dataFactoryVariable }: { dataFactoryVariable: string }) {
    this.dataFactoryVariable = dataFactoryVariable;
  }

  createTypeFromAstType(astType: ast.Type): Type {
    switch (astType.kind) {
      case "IdentifierType":
        return new IdentifierType({
          dataFactoryVariable: this.dataFactoryVariable,
          defaultValue: astType.defaultValue,
          hasValues: astType.hasValues,
          in_: astType.in_.filter((_) => _.termType === "NamedNode"),
          nodeKinds: astType.nodeKinds,
        });
      case "IntersectionType":
        throw new Error("not implemented");
      case "ListType": {
        return new ListType({
          dataFactoryVariable: this.dataFactoryVariable,
          identifierNodeKind: astType.identifierNodeKind,
          itemType: this.createTypeFromAstType(astType.itemType),
          mutable: astType.mutable.orDefault(false),
          identifierMintingStrategy: astType.identifierMintingStrategy,
          toRdfTypes: astType.toRdfTypes,
        });
      }
      case "LiteralType": {
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
              dataFactoryVariable: this.dataFactoryVariable,
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
            return new (datatype.equals(xsd.date) ? DateType : DateTimeType)({
              dataFactoryVariable: this.dataFactoryVariable,
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
                return new (floatOrInt === "float" ? FloatType : IntType)({
                  dataFactoryVariable: this.dataFactoryVariable,
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
            return new StringType({
              dataFactoryVariable: this.dataFactoryVariable,
              defaultValue: astType.defaultValue,
              hasValues: astType.hasValues,
              languageIn: [],
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
          dataFactoryVariable: this.dataFactoryVariable,
          defaultValue: astType.defaultValue,
          hasValues: astType.hasValues,
          in_: astType.in_,
          languageIn: astType.languageIn,
        });
      }
      case "ObjectIntersectionType":
        throw new Error("not implemented");
      case "ObjectType":
        return this.createObjectTypeFromAstType(astType);
      case "ObjectUnionType":
        return this.createObjectUnionTypeFromAstType(astType);
      case "OptionType":
        return new OptionType({
          dataFactoryVariable: this.dataFactoryVariable,
          itemType: this.createTypeFromAstType(astType.itemType),
        });
      case "PlaceholderType":
        throw new Error(astType.kind);
      case "SetType":
        return new SetType({
          dataFactoryVariable: this.dataFactoryVariable,
          itemType: this.createTypeFromAstType(astType.itemType),
          mutable: astType.mutable.orDefault(false),
          minCount: astType.minCount,
        });
      case "TermType":
        return new TermType({
          dataFactoryVariable: this.dataFactoryVariable,
          defaultValue: astType["defaultValue"],
          hasValues: astType["hasValues"],
          in_: astType["in_"],
          nodeKinds: astType["nodeKinds"],
        });
      case "UnionType":
        return new UnionType({
          dataFactoryVariable: this.dataFactoryVariable,
          memberTypes: astType.memberTypes.map((astType) =>
            this.createTypeFromAstType(astType),
          ),
        });
    }
  }

  private createObjectTypeFromAstType(astType: ast.ObjectType): ObjectType {
    {
      const cachedObjectType = this.cachedObjectTypesByIdentifier.get(
        astType.name.identifier,
      );
      if (cachedObjectType) {
        return cachedObjectType;
      }
    }

    const identifierType = new IdentifierType({
      dataFactoryVariable: this.dataFactoryVariable,
      defaultValue: Maybe.empty(),
      hasValues: [],
      in_: astType.identifierIn,
      nodeKinds: astType.identifierKinds,
    });

    const staticModuleName =
      astType.childObjectTypes.length > 0
        ? `${tsName(astType.name)}Static`
        : tsName(astType.name);

    const objectType = new ObjectType({
      abstract: astType.abstract,
      comment: astType.comment,
      dataFactoryVariable: this.dataFactoryVariable,
      declarationType: astType.tsObjectDeclarationType,
      export_: astType.export,
      extern: astType.extern,
      features: astType.tsFeatures,
      fromRdfType: astType.fromRdfType,
      imports: astType.tsImports,
      label: astType.label,
      lazyAncestorObjectTypes: () =>
        astType.ancestorObjectTypes.map((astType) =>
          this.createObjectTypeFromAstType(astType),
        ),
      lazyChildObjectTypes: () =>
        astType.childObjectTypes.map((astType) =>
          this.createObjectTypeFromAstType(astType),
        ),
      lazyDescendantObjectTypes: () =>
        astType.descendantObjectTypes.map((astType) =>
          this.createObjectTypeFromAstType(astType),
        ),
      lazyParentObjectTypes: () =>
        astType.parentObjectTypes.map((astType) =>
          this.createObjectTypeFromAstType(astType),
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
            this.createObjectTypePropertyFromAstProperty({
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
              abstract: astType.abstract,
              dataFactoryVariable: this.dataFactoryVariable,
              name: `${syntheticNamePrefix}type`,
              initializer: objectType.discriminatorValue,
              objectType,
              override: objectType.parentObjectTypes.length > 0,
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
              dataFactoryVariable: this.dataFactoryVariable,
              own: !astType.ancestorObjectTypes.some(
                objectTypeNeedsIdentifierPrefixProperty,
              ),
              name: `${syntheticNamePrefix}identifierPrefix`,
              objectType,
              type: new StringType({
                dataFactoryVariable: this.dataFactoryVariable,
                defaultValue: Maybe.empty(),
                hasValues: [],
                in_: [],
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
            abstract: astType.abstract,
            classGetAccessorScope: (() => {
              if (astType.abstract) {
                return Maybe.empty();
              }

              if (
                astType.identifierMintingStrategy.isJust() ||
                astType.ancestorObjectTypes.some((ancestorObjectType) =>
                  ancestorObjectType.identifierMintingStrategy.isJust(),
                )
              ) {
                return Maybe.of(Scope.Public);
              }

              return Maybe.empty();
            })(),
            classPropertyDeclarationVisibility: (() => {
              if (astType.abstract) {
                // If the type is abstract, don't declare an identifier property.
                return Maybe.empty();
              }

              if (
                astType.ancestorObjectTypes.some(
                  (ancestorObjectType) => !ancestorObjectType.abstract,
                )
              ) {
                // If the type has a non-abstract ancestor, that ancestor will declare the identifier property.
                return Maybe.empty();
              }

              if (
                astType.descendantObjectTypes.some(
                  (descendantObjectType) => !descendantObjectType.abstract,
                )
              ) {
                // If the type has a non-abstract descendant, declare the identifier property for it.
                return Maybe.of("protected");
              }

              return Maybe.of("private");
            })(),
            dataFactoryVariable: this.dataFactoryVariable,
            identifierMintingStrategy: astType.identifierMintingStrategy,
            identifierPrefixPropertyName: `${syntheticNamePrefix}identifierPrefix`,
            name: `${syntheticNamePrefix}identifier`,
            objectType,
            override: astType.parentObjectTypes.length > 0,
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
      toRdfTypes: astType.toRdfTypes,
    });
    this.cachedObjectTypesByIdentifier.set(astType.name.identifier, objectType);
    return objectType;
  }

  private createObjectTypePropertyFromAstProperty({
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

    const property = new ObjectType.ShaclProperty({
      comment: astObjectTypeProperty.comment,
      dataFactoryVariable: this.dataFactoryVariable,
      description: astObjectTypeProperty.description,
      label: astObjectTypeProperty.label,
      mutable: astObjectTypeProperty.mutable.orDefault(false),
      objectType,
      name: tsName(astObjectTypeProperty.name),
      path: astObjectTypeProperty.path.iri,
      recursive: !!astObjectTypeProperty.recursive,
      type: this.createTypeFromAstType(astObjectTypeProperty.type),
      visibility: astObjectTypeProperty.visibility,
    });
    this.cachedObjectTypePropertiesByIdentifier.set(
      astObjectTypeProperty.name.identifier,
      property,
    );
    return property;
  }

  private createObjectUnionTypeFromAstType(
    astType: ast.ObjectUnionType,
  ): ObjectUnionType {
    {
      const cachedObjectUnionType = this.cachedObjectUnionTypesByIdentifier.get(
        astType.name.identifier,
      );
      if (cachedObjectUnionType) {
        return cachedObjectUnionType;
      }
    }

    const memberTypes = astType.memberTypes
      .map((astType) => this.createTypeFromAstType(astType))
      .filter((memberType) => memberType instanceof ObjectType);

    const memberIdentifierTypeNodeKinds = new Set<"BlankNode" | "NamedNode">();
    const memberIdentifierTypesIn = new TermSet<NamedNode>();
    for (const memberType of memberTypes) {
      for (const nodeKind of memberType.identifierType.nodeKinds) {
        memberIdentifierTypeNodeKinds.add(nodeKind);
      }
      for (const in_ of memberType.identifierType.in_) {
        memberIdentifierTypesIn.add(in_);
      }
    }

    const objectUnionType = new ObjectUnionType({
      comment: astType.comment,
      dataFactoryVariable: this.dataFactoryVariable,
      export_: astType.export,
      features: astType.tsFeatures,
      identifierType: new IdentifierType({
        dataFactoryVariable: this.dataFactoryVariable,
        defaultValue: Maybe.empty(),
        hasValues: [],
        in_: [...memberIdentifierTypesIn],
        nodeKinds: memberIdentifierTypeNodeKinds,
      }),
      label: astType.label,
      memberTypes,
      name: tsName((astType as ast.ObjectUnionType).name),
    });

    this.cachedObjectUnionTypesByIdentifier.set(
      astType.name.identifier,
      objectUnionType,
    );
    return objectUnionType;
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
