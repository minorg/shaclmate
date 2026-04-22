import TermMap from "@rdfjs/term-map";
import TermSet from "@rdfjs/term-set";
import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import base62 from "@sindresorhus/base62";
import { rdf, xsd } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import { LiteralDecoder, literalDatatypeDefinitions } from "rdfjs-resource";
import reservedTsIdentifiers_ from "reserved-identifiers";
import { invariant } from "ts-invariant";
import * as ast from "../../ast/index.js";
import { logger } from "../../logger.js";
import { AnonymousUnionType } from "./AnonymousUnionType.js";
import { BigDecimalType } from "./BigDecimalType.js";
import { BigIntType } from "./BigIntType.js";
import { BlankNodeType } from "./BlankNodeType.js";
import { BooleanType } from "./BooleanType.js";
import { DateTimeType } from "./DateTimeType.js";
import { DateType } from "./DateType.js";
import { DefaultValueType } from "./DefaultValueType.js";
import { FloatType } from "./FloatType.js";
import { IdentifierType } from "./IdentifierType.js";
import { IntType } from "./IntType.js";
import { IriType } from "./IriType.js";
import { LazyObjectOptionType } from "./LazyObjectOptionType.js";
import { LazyObjectSetType } from "./LazyObjectSetType.js";
import { LazyObjectType } from "./LazyObjectType.js";
import { ListType } from "./ListType.js";
import { LiteralType } from "./LiteralType.js";
import { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import { NamedUnionType } from "./NamedUnionType.js";
import { ObjectType } from "./ObjectType.js";
import { OptionType } from "./OptionType.js";
import { SetType } from "./SetType.js";
import { StringType } from "./StringType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
import { code } from "./ts-poet-wrapper.js";

const reservedTsIdentifiers = reservedTsIdentifiers_({
  includeGlobalProperties: true,
});

function tsName(name: string, options?: { synthetic?: boolean }): string {
  // Adapted from https://github.com/sindresorhus/to-valid-identifier , MIT license
  if (reservedTsIdentifiers.has(name)) {
    // We prefix with underscore to avoid any potential conflicts with the Base62 encoded string.
    return `$_${name}$`;
  }

  let tsName = name.replaceAll(
    /\P{ID_Continue}/gu,
    (x) => `$${base62.encodeInteger(x.codePointAt(0)!)}$`,
  );
  if (options?.synthetic) {
    tsName = `${syntheticNamePrefix}${tsName}`;
  }
  return tsName;
}

export class TypeFactory {
  private cachedNamedObjectUnionTypesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    NamedObjectUnionType
  > = new TermMap();
  private cachedObjectTypePropertiesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    ObjectType.Property
  > = new TermMap();
  private cachedObjectTypesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    ObjectType
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

    const name = tsName(astType.name.unsafeCoerce(), {
      synthetic: astType.synthetic,
    });
    const staticModuleName =
      astType.childObjectTypes.length > 0 ? `${name}Static` : name;

    const objectType = new ObjectType({
      abstract: astType.abstract,
      comment: astType.comment,
      declarationType: astType.tsObjectDeclarationType,
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
      lazyDiscriminantProperty: (objectType: ObjectType) => {
        // Discriminant property
        const discriminantOwnValue = !astType.abstract
          ? objectType.discriminantValue
          : undefined;
        const discriminantDescendantValues = new Set<string>();
        for (const descendantObjectType of objectType.descendantObjectTypes) {
          if (!descendantObjectType.abstract) {
            discriminantDescendantValues.add(
              descendantObjectType.discriminantValue,
            );
          }
        }

        return new ObjectType.DiscriminantProperty({
          name: `${syntheticNamePrefix}type`,
          objectType,
          type: new ObjectType.DiscriminantProperty.Type({
            descendantValues: [...discriminantDescendantValues].sort(),
            mutable: false,
            ownValues: discriminantOwnValue ? [discriminantOwnValue] : [],
          }),
          visibility: "public",
        });
      },
      lazyIdentifierProperty: (objectType: ObjectType) =>
        new ObjectType.IdentifierProperty({
          identifierMintingStrategy: astType.identifierMintingStrategy,
          identifierPrefixPropertyName: `${syntheticNamePrefix}identifierPrefix`,
          name: `${syntheticNamePrefix}identifier`,
          objectType,
          type: identifierType,
          typeAlias: code`${staticModuleName}.${syntheticNamePrefix}Identifier`,
          visibility: "public",
        }),
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

        if (
          objectType._discriminantProperty.type.ownValues.length > 0 ||
          objectType._discriminantProperty.type.descendantValues.length > 0
        ) {
          properties.splice(0, 0, objectType._discriminantProperty);
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
                datatype: xsd.string,
                hasValues: [],
                in_: [],
                label: astType.label,
                languageIn: [],
                primitiveIn: [],
              }),
              visibility: "protected",
            }),
          );
        }

        // Every ObjectType has an identifier property. Some are abstract.
        properties.splice(0, 0, objectType.identifierProperty);

        return properties;
      },
      name,
      recursive: astType.recursive,
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

  createNamedObjectUnionType(
    astType: ast.ObjectUnionType,
  ): NamedObjectUnionType {
    {
      const cachedNamedObjectUnionType =
        this.cachedNamedObjectUnionTypesByShapeIdentifier.get(
          astType.shapeIdentifier,
        );
      if (cachedNamedObjectUnionType) {
        return cachedNamedObjectUnionType;
      }
    }

    const namedObjectUnionType = new NamedObjectUnionType({
      comment: astType.comment,
      features: astType.tsFeatures,
      identifierType: this.createIdentifierType(
        ast.ObjectCompoundType.identifierType(astType),
      ),
      label: astType.label,
      memberDiscriminantValues: [],
      memberTypes: ast.ObjectCompoundType.memberObjectTypes(astType).map(
        (objectType) => this.createObjectType(objectType),
      ),
      name: tsName(astType.name.unsafeCoerce()),
      recursive: astType.recursive,
    });

    this.cachedNamedObjectUnionTypesByShapeIdentifier.set(
      astType.shapeIdentifier,
      namedObjectUnionType,
    );

    return namedObjectUnionType;
  }

  createType(
    astType: ast.Type,
    parameters?: { defaultValue?: Literal | NamedNode },
  ): Type {
    switch (astType.kind) {
      case "BlankNodeType":
        return this.createBlankNodeType(astType);
      case "DefaultValueType":
        return this.createDefaultValueType(astType);
      case "IdentifierType":
        return this.createIdentifierType(astType);
      case "IntersectionType":
        throw new Error("not implemented");
      case "IriType":
        return this.createIriType(astType);
      case "LazyObjectOptionType":
        return this.createLazyObjectOptionType(astType);
      case "LazyObjectSetType":
        return this.createLazyObjectSetType(astType);
      case "LazyObjectType":
        return this.createLazyObjectType(astType);
      case "ListType":
        return this.createListType(astType);
      case "LiteralType":
        return this.createLiteralType(astType, parameters);
      case "ObjectType":
        return this.createObjectType(astType);
      case "OptionType":
        return this.createOptionType(astType);
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

  private createDefaultValueType(astType: ast.DefaultValueType) {
    const itemType = this.createType(astType.itemType, {
      defaultValue: astType.defaultValue,
    });
    invariant(DefaultValueType.isItemType(itemType));
    return new DefaultValueType({
      comment: astType.comment,
      defaultValue: astType.defaultValue,
      itemType,
      label: astType.label,
    });
  }

  private createIdentifierType(
    astType: ast.BlankNodeType | ast.IdentifierType | ast.IriType,
  ): BlankNodeType | IdentifierType | IriType {
    switch (astType.kind) {
      case "BlankNodeType":
        return this.createBlankNodeType(astType);
      case "IdentifierType":
        return new IdentifierType({
          comment: astType.comment,
          label: astType.label,
        });
      case "IriType":
        return this.createIriType(astType);
    }
  }

  private createIriType(astType: ast.IriType): IriType {
    return new IriType({
      comment: astType.comment,
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
        ObjectType | NamedObjectUnionType
      >,
      resolveType: this.createOptionType(astType.resolveType) as OptionType<
        ObjectType | NamedObjectUnionType
      >,
    });
  }

  private createLazyObjectSetType(astType: ast.LazyObjectSetType): Type {
    return new LazyObjectSetType({
      comment: astType.comment,
      label: astType.label,
      partialType: this.createSetType(astType.partialType) as SetType<
        ObjectType | NamedObjectUnionType
      >,
      resolveType: this.createSetType(astType.resolveType) as SetType<
        ObjectType | NamedObjectUnionType
      >,
    });
  }

  private createLazyObjectType(astType: ast.LazyObjectType): Type {
    return new LazyObjectType({
      comment: astType.comment,
      label: astType.label,

      partialType: this.createType(astType.partialType) as
        | ObjectType
        | NamedObjectUnionType,
      resolveType: this.createType(astType.resolveType) as
        | ObjectType
        | NamedObjectUnionType,
    });
  }

  private createListType(astType: ast.ListType) {
    const itemType = this.createType(astType.itemType);
    invariant(ListType.isItemType(itemType));
    return new ListType({
      comment: astType.comment,
      identifierNodeKind: astType.identifierNodeKind,
      itemType,
      label: astType.label,
      minCount: 0,
      mutable: astType.mutable,
      identifierMintingStrategy: astType.identifierMintingStrategy,
      toRdfTypes: astType.toRdfTypes,
    });
  }

  private createLiteralType(
    astType: ast.LiteralType,
    parameters?: { defaultValue?: Literal | NamedNode },
  ): Type {
    // Look at sh:datatype as well as sh:defaultValue, sh:hasValue, and sh:in datatypes
    // If there's one common datatype than we can refine the type
    // Otherwise default to rdfjs.Literal
    const datatypes = new TermSet<NamedNode>();
    astType.datatype.ifJust((datatype) => datatypes.add(datatype));
    if (datatypes.size === 0) {
      if (
        parameters?.defaultValue &&
        parameters.defaultValue.termType === "Literal"
      ) {
        datatypes.add(parameters.defaultValue.datatype);
      }
      for (const hasValue of astType.hasValues) {
        datatypes.add(hasValue.datatype);
      }
      for (const value of astType.in_) {
        datatypes.add(value.datatype);
      }
    }

    if (datatypes.size === 1) {
      const datatype = [...datatypes][0];

      const datatypeDefinition = literalDatatypeDefinitions[datatype.value];
      if (datatypeDefinition) {
        switch (datatypeDefinition.kind) {
          case "bigdecimal":
            return new BigDecimalType({
              comment: astType.comment,
              hasValues: astType.hasValues,
              in_: astType.in_,
              label: astType.label,
              languageIn: [],
            });
          case "bigint":
            return new BigIntType({
              comment: astType.comment,
              datatype,
              hasValues: astType.hasValues,
              in_: astType.in_,
              label: astType.label,
              languageIn: [],
              primitiveIn: astType.in_.map((value) =>
                LiteralDecoder.decodeBigIntLiteral(value).unsafeCoerce(),
              ),
            });
          case "boolean":
            return new BooleanType({
              comment: astType.comment,
              datatype,
              hasValues: astType.hasValues,
              label: astType.label,
              languageIn: [],
              in_: astType.in_,
              primitiveIn: astType.in_.map((value) =>
                LiteralDecoder.decodeBooleanLiteral(value).unsafeCoerce(),
              ),
            });
          case "date":
          case "datetime":
            return new (
              datatypeDefinition.kind === "date" ? DateType : DateTimeType
            )({
              comment: astType.comment,
              datatype,
              hasValues: astType.hasValues,
              in_: astType.in_,
              label: astType.label,
              languageIn: [],
              primitiveIn: astType.in_.map((value) =>
                (datatypeDefinition.kind === "date"
                  ? LiteralDecoder.decodeDateLiteral
                  : LiteralDecoder.decodeDateTimeLiteral)(value).unsafeCoerce(),
              ),
            });
          case "float":
          case "int":
            return new (
              datatypeDefinition.kind === "float" ? FloatType : IntType
            )({
              comment: astType.comment,
              datatype,
              hasValues: astType.hasValues,
              in_: astType.in_,
              label: astType.label,
              languageIn: [],
              primitiveIn: astType.in_.map((value) =>
                (datatypeDefinition.kind === "float"
                  ? LiteralDecoder.decodeFloatLiteral
                  : LiteralDecoder.decodeIntLiteral)(value).unsafeCoerce(),
              ),
            });
          case "string":
            if (!datatype.equals(rdf.langString)) {
              return new StringType({
                comment: astType.comment,
                datatype,
                hasValues: astType.hasValues,
                label: astType.label,
                languageIn: astType.languageIn,
                in_: astType.in_,
                primitiveIn: astType.in_.map((value) => value.value),
              });
            }
            break;
        }
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

    const property = new ObjectType.ShaclProperty({
      comment: astObjectTypeProperty.comment,
      description: astObjectTypeProperty.description,
      label: astObjectTypeProperty.label,
      mutable: astObjectTypeProperty.mutable,
      objectType,
      name: tsName(astObjectTypeProperty.name),
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
    const itemType = this.createType(astType.itemType);
    invariant(OptionType.isItemType(itemType));
    return new OptionType({
      comment: astType.comment,
      itemType,
      label: astType.label,
    });
  }

  private createSetType(astType: ast.SetType) {
    const itemType = this.createType(astType.itemType);
    invariant(SetType.isItemType(itemType));
    return new SetType({
      comment: astType.comment,
      itemType,
      label: astType.label,
      mutable: astType.mutable,
      minCount: astType.minCount,
    });
  }

  private createTermType(astType: ast.TermType) {
    return new TermType({
      comment: astType.comment,
      hasValues: astType.hasValues,
      in_: astType.in_,
      label: astType.label,
      nodeKinds: astType.nodeKinds,
    });
  }

  private createUnionType(astType: ast.UnionType) {
    if (astType.isObjectUnionType()) {
      return this.createNamedObjectUnionType(astType);
    }

    return astType.name
      .map<AnonymousUnionType | NamedUnionType>(
        (name) =>
          new NamedUnionType({
            comment: astType.comment,
            features: astType.tsFeatures,
            identifierType: Maybe.empty(),
            label: astType.label,
            memberDiscriminantValues: astType.memberDiscriminantValues,
            memberTypes: astType.memberTypes.map((astType) =>
              this.createType(astType),
            ),
            name,
            recursive: astType.recursive,
          }),
      )
      .orDefaultLazy(
        () =>
          new AnonymousUnionType({
            comment: astType.comment,
            label: astType.label,
            identifierType: Maybe.empty(),
            memberDiscriminantValues: astType.memberDiscriminantValues,
            memberTypes: astType.memberTypes.map((astType) =>
              this.createType(astType),
            ),
            recursive: astType.recursive,
          }),
      );
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
