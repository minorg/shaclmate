import TermMap from "@rdfjs/term-map";
import TermSet from "@rdfjs/term-set";
import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { LiteralDecoder, literalDatatypeDefinitions } from "@rdfx/literal";
import base62 from "@sindresorhus/base62";
import { rdf } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import reservedTsIdentifiers_ from "reserved-identifiers";
import { invariant } from "ts-invariant";
import type { Logger } from "ts-log";
import * as ast from "../../ast/index.js";
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
import type { Imports } from "./Imports.js";
import { IntType } from "./IntType.js";
import { IriType } from "./IriType.js";
import { LazyObjectOptionType } from "./LazyObjectOptionType.js";
import { LazyObjectSetType } from "./LazyObjectSetType.js";
import { LazyObjectType } from "./LazyObjectType.js";
import { ListType } from "./ListType.js";
import { LiteralType } from "./LiteralType.js";
import { NamedObjectType } from "./NamedObjectType.js";
import { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import { NamedUnionType } from "./NamedUnionType.js";
import { OptionType } from "./OptionType.js";
import { SetType } from "./SetType.js";
import type { Snippets } from "./Snippets.js";
import { StringType } from "./StringType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
import { code } from "./ts-poet-wrapper.js";

export class TypeFactory {
  private cachedNamedObjectUnionTypesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    NamedObjectUnionType
  > = new TermMap();
  private cachedObjectTypePropertiesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    NamedObjectType.Property
  > = new TermMap();
  private cachedObjectTypesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    NamedObjectType
  > = new TermMap();
  private readonly imports: Imports;
  private readonly logger: Logger;
  private readonly snippets: Snippets;

  constructor({
    imports,
    logger,
    snippets,
  }: { imports: Imports; logger: Logger; snippets: Snippets }) {
    this.imports = imports;
    this.logger = logger;
    this.snippets = snippets;
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
      imports: this.imports,
      label: astType.label,
      logger: this.logger,
      members: ast.ObjectCompoundType.memberObjectTypes(astType).map(
        (namedObjectType) => ({
          discriminantValue: Maybe.empty(),
          type: this.createNamedObjectType(namedObjectType),
        }),
      ),
      name: tsName(astType.name.unsafeCoerce()),
      recursive: astType.recursive,
      snippets: this.snippets,
    });

    this.cachedNamedObjectUnionTypesByShapeIdentifier.set(
      astType.shapeIdentifier,
      namedObjectUnionType,
    );

    return namedObjectUnionType;
  }

  createNamedObjectType(astType: ast.ObjectType): NamedObjectType {
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

    const namedObjectType = new NamedObjectType({
      comment: astType.comment,
      extern: astType.extern,
      features: astType.tsFeatures,
      fromRdfType: astType.fromRdfType,
      imports: this.imports,
      identifierType,
      label: astType.label,
      lazyAncestorObjectTypes: () =>
        astType.ancestorObjectTypes.map((astType) =>
          this.createNamedObjectType(astType),
        ),
      lazyChildObjectTypes: () =>
        astType.childObjectTypes.map((astType) =>
          this.createNamedObjectType(astType),
        ),
      lazyDescendantObjectTypes: () =>
        astType.descendantObjectTypes.map((astType) =>
          this.createNamedObjectType(astType),
        ),
      lazyDiscriminantProperty: (namedObjectType: NamedObjectType) => {
        // Discriminant property
        const discriminantDescendantValues = new Set<string>();
        for (const descendantObjectType of namedObjectType.descendantObjectTypes) {
          discriminantDescendantValues.add(
            descendantObjectType.discriminantValue,
          );
        }

        return new NamedObjectType.DiscriminantProperty({
          logger: this.logger,
          name: `${syntheticNamePrefix}type`,
          namedObjectType,
          type: new NamedObjectType.DiscriminantProperty.Type({
            descendantValues: [...discriminantDescendantValues].sort(),
            mutable: false,
            ownValues: [namedObjectType.discriminantValue],
          }),
        });
      },
      lazyParentObjectTypes: () =>
        astType.parentObjectTypes.map((astType) =>
          this.createNamedObjectType(astType),
        ),
      lazyProperties: (namedObjectType: NamedObjectType) => {
        const properties: NamedObjectType.Property[] = astType.properties
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
              namedObjectType,
            }),
          );

        properties.splice(0, 0, namedObjectType._discriminantProperty);

        properties.splice(
          0,
          0,
          new NamedObjectType.IdentifierProperty({
            logger: this.logger,
            name: `${syntheticNamePrefix}identifier`,
            namedObjectType,
            type: identifierType,
            typeAlias: code`${name}.${syntheticNamePrefix}Identifier`,
          }),
        );

        return properties;
      },
      logger: this.logger,
      name,
      recursive: astType.recursive,
      snippets: this.snippets,
      synthetic: astType.synthetic,
      toRdfTypes: astType.toRdfTypes,
    });
    this.cachedObjectTypesByShapeIdentifier.set(
      astType.shapeIdentifier,
      namedObjectType,
    );
    return namedObjectType;
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
        return this.createNamedObjectType(astType);
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

  createUnionType(
    astType: ast.UnionType,
  ): AnonymousUnionType | NamedUnionType | NamedObjectUnionType {
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
            imports: this.imports,
            label: astType.label,
            logger: this.logger,
            members: astType.members.map((member) => ({
              discriminantValue: member.discriminantValue,
              type: this.createType(member.type),
            })),
            name,
            recursive: astType.recursive,
            snippets: this.snippets,
          }),
      )
      .orDefaultLazy(
        () =>
          new AnonymousUnionType({
            comment: astType.comment,
            label: astType.label,
            identifierType: Maybe.empty(),
            imports: this.imports,
            logger: this.logger,
            members: astType.members.map((member) => ({
              discriminantValue: member.discriminantValue,
              type: this.createType(member.type),
            })),
            recursive: astType.recursive,
            snippets: this.snippets,
          }),
      );
  }

  private createBlankNodeType(astType: ast.BlankNodeType): BlankNodeType {
    return new BlankNodeType({
      comment: astType.comment,
      imports: this.imports,
      label: astType.label,
      logger: this.logger,
      snippets: this.snippets,
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
      imports: this.imports,
      itemType,
      label: astType.label,
      logger: this.logger,
      snippets: this.snippets,
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
          imports: this.imports,
          label: astType.label,
          logger: this.logger,
          snippets: this.snippets,
        });
      case "IriType":
        return this.createIriType(astType);
    }
  }

  private createIriType(astType: ast.IriType): IriType {
    return new IriType({
      comment: astType.comment,
      hasValues: astType.hasValues,
      imports: this.imports,
      in_: astType.in_,
      label: astType.label,
      logger: this.logger,
      snippets: this.snippets,
    });
  }

  private createLazyObjectOptionType(astType: ast.LazyObjectOptionType): Type {
    return new LazyObjectOptionType({
      comment: astType.comment,
      imports: this.imports,
      label: astType.label,
      logger: this.logger,
      partialType: this.createOptionType(astType.partialType) as OptionType<
        NamedObjectType | NamedObjectUnionType
      >,
      resolveType: this.createOptionType(astType.resolveType) as OptionType<
        NamedObjectType | NamedObjectUnionType
      >,
      snippets: this.snippets,
    });
  }

  private createLazyObjectSetType(astType: ast.LazyObjectSetType): Type {
    return new LazyObjectSetType({
      comment: astType.comment,
      imports: this.imports,
      label: astType.label,
      logger: this.logger,
      partialType: this.createSetType(astType.partialType) as SetType<
        NamedObjectType | NamedObjectUnionType
      >,
      resolveType: this.createSetType(astType.resolveType) as SetType<
        NamedObjectType | NamedObjectUnionType
      >,
      snippets: this.snippets,
    });
  }

  private createLazyObjectType(astType: ast.LazyObjectType): Type {
    return new LazyObjectType({
      comment: astType.comment,
      imports: this.imports,
      label: astType.label,
      logger: this.logger,
      partialType: this.createType(astType.partialType) as
        | NamedObjectType
        | NamedObjectUnionType,
      resolveType: this.createType(astType.resolveType) as
        | NamedObjectType
        | NamedObjectUnionType,
      snippets: this.snippets,
    });
  }

  private createListType(astType: ast.ListType) {
    const itemType = this.createType(astType.itemType);
    invariant(ListType.isItemType(itemType));
    return new ListType({
      comment: astType.comment,
      identifierNodeKind: astType.identifierNodeKind,
      imports: this.imports,
      itemType,
      label: astType.label,
      logger: this.logger,
      minCount: 0n,
      mutable: astType.mutable,
      snippets: this.snippets,
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
              imports: this.imports,
              in_: astType.in_,
              label: astType.label,
              languageIn: [],
              logger: this.logger,
              snippets: this.snippets,
            });
          case "bigint":
            return new BigIntType({
              comment: astType.comment,
              datatype,
              hasValues: astType.hasValues,
              imports: this.imports,
              in_: astType.in_,
              label: astType.label,
              languageIn: [],
              logger: this.logger,
              primitiveIn: astType.in_.map((value) =>
                LiteralDecoder.decodeBigIntLiteral(value).unsafeCoerce(),
              ),
              snippets: this.snippets,
            });
          case "boolean":
            return new BooleanType({
              comment: astType.comment,
              datatype,
              hasValues: astType.hasValues,
              imports: this.imports,
              label: astType.label,
              languageIn: [],
              in_: astType.in_,
              logger: this.logger,
              primitiveIn: astType.in_.map((value) =>
                LiteralDecoder.decodeBooleanLiteral(value).unsafeCoerce(),
              ),
              snippets: this.snippets,
            });
          case "date":
          case "datetime":
            return new (
              datatypeDefinition.kind === "date" ? DateType : DateTimeType
            )({
              comment: astType.comment,
              datatype,
              hasValues: astType.hasValues,
              imports: this.imports,
              in_: astType.in_,
              label: astType.label,
              languageIn: [],
              logger: this.logger,
              primitiveIn: astType.in_.map((value) =>
                (datatypeDefinition.kind === "date"
                  ? LiteralDecoder.decodeDateLiteral
                  : LiteralDecoder.decodeDateTimeLiteral)(value).unsafeCoerce(),
              ),
              snippets: this.snippets,
            });
          case "float":
          case "int":
            return new (
              datatypeDefinition.kind === "float" ? FloatType : IntType
            )({
              comment: astType.comment,
              datatype,
              hasValues: astType.hasValues,
              imports: this.imports,
              in_: astType.in_,
              label: astType.label,
              languageIn: [],
              logger: this.logger,
              primitiveIn: astType.in_.map((value) =>
                (datatypeDefinition.kind === "float"
                  ? LiteralDecoder.decodeFloatLiteral
                  : LiteralDecoder.decodeIntLiteral)(value).unsafeCoerce(),
              ),
              snippets: this.snippets,
            });
          case "string":
            if (!datatype.equals(rdf.langString)) {
              return new StringType({
                comment: astType.comment,
                datatype,
                hasValues: astType.hasValues,
                imports: this.imports,
                in_: astType.in_,
                label: astType.label,
                languageIn: astType.languageIn,
                logger: this.logger,
                primitiveIn: astType.in_.map((value) => value.value),
                snippets: this.snippets,
              });
            }
            break;
        }
      }

      if (datatype.equals(rdf.langString)) {
        // Drop down
      } else {
        this.logger.warn("unrecognized literal datatype: %s", datatype.value);
      }
    } else if (datatypes.size > 0) {
      this.logger.warn(
        "literal type has multiple datatypes: %s",
        JSON.stringify([...datatypes].map((datatype) => datatype.value)),
      );
    }
    // } else {
    //   // this.logger.debug("literal type has no datatypes");
    // }

    return new LiteralType({
      comment: astType.comment,
      hasValues: astType.hasValues,
      imports: this.imports,
      in_: astType.in_,
      label: astType.label,
      languageIn: astType.languageIn,
      logger: this.logger,
      snippets: this.snippets,
    });
  }

  private createObjectTypeProperty({
    astObjectTypeProperty,
    namedObjectType,
  }: {
    astObjectTypeProperty: ast.ObjectType.Property;
    namedObjectType: NamedObjectType;
  }): NamedObjectType.Property {
    {
      const cachedProperty =
        this.cachedObjectTypePropertiesByShapeIdentifier.get(
          astObjectTypeProperty.shapeIdentifier,
        );
      if (cachedProperty) {
        return cachedProperty;
      }
    }

    const property = new NamedObjectType.ShaclProperty({
      comment: astObjectTypeProperty.comment,
      description: astObjectTypeProperty.description,
      display: astObjectTypeProperty.display,
      label: astObjectTypeProperty.label,
      logger: this.logger,
      mutable: astObjectTypeProperty.mutable,
      namedObjectType,
      name: tsName(astObjectTypeProperty.name),
      path: astObjectTypeProperty.path,
      recursive: !!astObjectTypeProperty.recursive,
      type: this.createType(astObjectTypeProperty.type),
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
      imports: this.imports,
      itemType,
      label: astType.label,
      logger: this.logger,
      snippets: this.snippets,
    });
  }

  private createSetType(astType: ast.SetType) {
    const itemType = this.createType(astType.itemType);
    invariant(SetType.isItemType(itemType));
    return new SetType({
      comment: astType.comment,
      imports: this.imports,
      itemType,
      label: astType.label,
      logger: this.logger,
      mutable: astType.mutable,
      minCount: astType.minCount,
      snippets: this.snippets,
    });
  }

  private createTermType(astType: ast.TermType) {
    return new TermType({
      comment: astType.comment,
      hasValues: astType.hasValues,
      imports: this.imports,
      in_: astType.in_,
      label: astType.label,
      logger: this.logger,
      nodeKinds: astType.nodeKinds,
      snippets: this.snippets,
    });
  }
}

function tsName(name: string, options?: { synthetic?: boolean }): string {
  if (name[0] === "$") {
    return name;
  }

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

const reservedTsIdentifiers = reservedTsIdentifiers_({
  includeGlobalProperties: true,
});
