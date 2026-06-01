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
import { LazyOptionType } from "./LazyOptionType.js";
import { LazySetType } from "./LazySetType.js";
import { LazyType } from "./LazyType.js";
import { ListType } from "./ListType.js";
import { LiteralType } from "./LiteralType.js";
import { ObjectType } from "./ObjectType.js";
import { ObjectUnionType } from "./ObjectUnionType.js";
import { OptionType } from "./OptionType.js";
import type { Reusables } from "./Reusables.js";
import { SetType } from "./SetType.js";
import { StringType } from "./StringType.js";
import { TermType } from "./TermType.js";
import type { TsGenerator } from "./TsGenerator.js";
import type { Type } from "./Type.js";
import { UnionType } from "./UnionType.js";

export class TypeFactory {
  private readonly configuration: TsGenerator.Configuration;
  private readonly logger: Logger;
  private readonly reusables: Reusables;

  private cachedObjectUnionTypesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    ObjectUnionType
  > = new TermMap();
  private cachedObjectTypePropertiesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    ObjectType.Property
  > = new TermMap();
  private cachedObjectTypesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    ObjectType
  > = new TermMap();

  constructor({
    configuration,
    logger,
    reusables,
  }: {
    configuration: TsGenerator.Configuration;
    logger: Logger;
    reusables: Reusables;
  }) {
    this.configuration = configuration;
    this.logger = logger;
    this.reusables = reusables;
  }

  createObjectType(astType: ast.StructType): ObjectType {
    {
      const cachedObjectType = this.cachedObjectTypesByShapeIdentifier.get(
        astType.shapeIdentifier,
      );
      if (cachedObjectType) {
        return cachedObjectType;
      }
    }

    const discriminantProperty = astType.name.map(
      (name) =>
        new ObjectType.DiscriminantProperty({
          configuration: this.configuration,
          logger: this.logger,
          name: `${this.configuration.syntheticNamePrefix}type`,
          objectType: { name: astType.name },
          reusables: this.reusables,
          value: name,
        }),
    );

    const identifierType = this.createIdentifierType(astType.identifierType);

    const objectType = new ObjectType({
      discriminantProperty,
      comment: astType.comment,
      configuration: this.configuration,
      extern: astType.extern,
      fromRdfType: astType.fromRdfType,
      identifierType,
      label: astType.label,
      lazyProperties: (objectType: ObjectType) => {
        const properties: ObjectType.Property[] = astType.fields
          .toSorted((left, right) => {
            if (left.order < right.order) {
              return -1;
            }
            if (left.order > right.order) {
              return 1;
            }
            return this.tsName(left.name).localeCompare(
              this.tsName(right.name),
            );
          })
          .map((astField) =>
            this.createObjectTypeProperty({
              astStructField: astField,
              objectType,
            }),
          );

        discriminantProperty.ifJust((discriminantProperty) => {
          properties.splice(0, 0, discriminantProperty);
        });

        properties.splice(
          0,
          0,
          new ObjectType.IdentifierProperty({
            configuration: this.configuration,
            logger: this.logger,
            name: `${this.configuration.syntheticNamePrefix}identifier`,
            objectType,
            reusables: this.reusables,
            type: identifierType,
          }),
        );

        return properties;
      },
      logger: this.logger,
      name: astType.name.map((name) =>
        this.tsName(name, { synthetic: astType.synthetic }),
      ),
      recursive: astType.recursive,
      reusables: this.reusables,
      synthetic: astType.synthetic,
      toRdfTypes: astType.toRdfTypes,
    });
    this.cachedObjectTypesByShapeIdentifier.set(
      astType.shapeIdentifier,
      objectType,
    );
    return objectType;
  }

  createObjectUnionType(astType: ast.StructUnionType): ObjectUnionType {
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
      configuration: this.configuration,
      identifierType: Maybe.of(
        this.createIdentifierType(
          ast.StructCompoundType.identifierType(astType),
        ),
      ),
      label: astType.label,
      logger: this.logger,
      members: ast.StructCompoundType.memberStructTypes(astType).map(
        (astStructType) => ({
          discriminantValue: Maybe.empty(),
          type: this.createObjectType(astStructType),
        }),
      ),
      name: astType.name.map((name) => this.tsName(name)),
      recursive: astType.recursive,
      reusables: this.reusables,
      synthetic: astType.synthetic,
    });

    this.cachedObjectUnionTypesByShapeIdentifier.set(
      astType.shapeIdentifier,
      objectUnionType,
    );

    return objectUnionType;
  }

  createType(
    astType: ast.Type,
    parameters?: { defaultValue?: Literal | NamedNode },
  ): Type {
    switch (astType.kind) {
      case "BlankNode":
        return this.createBlankNodeType(astType);
      case "DefaultValue":
        return this.createDefaultValueType(astType);
      case "Identifier":
        return this.createIdentifierType(astType);
      case "Intersection":
        throw new Error("not implemented");
      case "Iri":
        return this.createIriType(astType);
      case "Lazy":
        return this.createLazyType(astType);
      case "LazyOption":
        return this.createLazyOptionType(astType);
      case "LazySet":
        return this.createLazySetType(astType);
      case "List":
        return this.createListType(astType);
      case "Literal":
        return this.createLiteralType(astType, parameters);
      case "Option":
        return this.createOptionType(astType);
      case "Set":
        return this.createSetType(astType);
      case "Struct":
        return this.createObjectType(astType);
      case "Term":
        return this.createTermType(astType);
      case "Union":
        return this.createUnionType(astType);
    }
  }

  createUnionType(astType: ast.UnionType): ObjectUnionType | UnionType<Type> {
    if (astType.isStructUnionType()) {
      return this.createObjectUnionType(astType);
    }

    return new UnionType<Type>({
      comment: astType.comment,
      configuration: this.configuration,
      identifierType: Maybe.empty(),
      label: astType.label,
      logger: this.logger,
      members: astType.members.map((member) => ({
        discriminantValue: member.discriminantValue,
        type: this.createType(member.type),
      })),
      name: astType.name.map((name) => this.tsName(name)),
      recursive: astType.recursive,
      reusables: this.reusables,
      synthetic: astType.synthetic,
    });
  }

  private createBlankNodeType(astType: ast.BlankNodeType): BlankNodeType {
    return new BlankNodeType({
      comment: astType.comment,
      configuration: this.configuration,
      label: astType.label,
      logger: this.logger,
      name: astType.name.map((name) => this.tsName(name)),
      reusables: this.reusables,
    });
  }

  private createDefaultValueType(astType: ast.DefaultValueType) {
    const itemType = this.createType(astType.itemType, {
      defaultValue: astType.defaultValue,
    });
    invariant(DefaultValueType.isItemType(itemType));
    return new DefaultValueType({
      comment: astType.comment,
      configuration: this.configuration,
      defaultValue: astType.defaultValue,
      itemType,
      label: astType.label,
      logger: this.logger,
      name: astType.name.map((name) => this.tsName(name)),
      reusables: this.reusables,
    });
  }

  private createIdentifierType(
    astType: ast.BlankNodeType | ast.IdentifierType | ast.IriType,
  ): BlankNodeType | IdentifierType | IriType {
    switch (astType.kind) {
      case "BlankNode":
        return this.createBlankNodeType(astType);
      case "Identifier":
        return new IdentifierType({
          comment: astType.comment,
          configuration: this.configuration,
          label: astType.label,
          logger: this.logger,
          name: astType.name.map((name) => this.tsName(name)),
          reusables: this.reusables,
        });
      case "Iri":
        return this.createIriType(astType);
    }
  }

  private createIriType(astType: ast.IriType): IriType {
    return new IriType({
      comment: astType.comment,
      configuration: this.configuration,
      hasValues: astType.hasValues,
      in_: astType.in_,
      label: astType.label,
      logger: this.logger,
      name: astType.name.map((name) => this.tsName(name)),
      reusables: this.reusables,
    });
  }

  private createLazyOptionType(astType: ast.LazyOptionType): Type {
    return new LazyOptionType({
      comment: astType.comment,
      configuration: this.configuration,
      label: astType.label,
      logger: this.logger,
      name: astType.name.map((name) => this.tsName(name)),
      partialType: this.createOptionType(astType.partialType) as OptionType<
        ObjectType | ObjectUnionType
      >,
      resolveType: this.createOptionType(astType.resolveType) as OptionType<
        ObjectType | ObjectUnionType
      >,
      reusables: this.reusables,
    });
  }

  private createLazySetType(astType: ast.LazySetType): Type {
    return new LazySetType({
      comment: astType.comment,
      configuration: this.configuration,
      label: astType.label,
      logger: this.logger,
      name: astType.name.map((name) => this.tsName(name)),
      partialType: this.createSetType(astType.partialType) as SetType<
        ObjectType | ObjectUnionType
      >,
      resolveType: this.createSetType(astType.resolveType) as SetType<
        ObjectType | ObjectUnionType
      >,
      reusables: this.reusables,
    });
  }

  private createLazyType(astType: ast.LazyType): Type {
    return new LazyType({
      comment: astType.comment,
      configuration: this.configuration,
      label: astType.label,
      logger: this.logger,
      name: astType.name.map((name) => this.tsName(name)),
      partialType: this.createType(astType.partialType) as
        | ObjectType
        | ObjectUnionType,
      resolveType: this.createType(astType.resolveType) as
        | ObjectType
        | ObjectUnionType,
      reusables: this.reusables,
    });
  }

  private createListType(astType: ast.ListType) {
    const itemType = this.createType(astType.itemType);
    invariant(ListType.isItemType(itemType));
    return new ListType({
      comment: astType.comment,
      configuration: this.configuration,
      identifierNodeKind: astType.identifierNodeKind,
      itemType,
      label: astType.label,
      logger: this.logger,
      mutable: astType.mutable,
      name: astType.name.map((name) => this.tsName(name)),
      reusables: this.reusables,
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
              configuration: this.configuration,
              hasValues: astType.hasValues,
              in_: astType.in_,
              label: astType.label,
              languageIn: [],
              logger: this.logger,
              name: astType.name.map((name) => this.tsName(name)),
              reusables: this.reusables,
            });
          case "bigint":
            return new BigIntType({
              comment: astType.comment,
              configuration: this.configuration,
              datatype,
              hasValues: astType.hasValues,
              in_: astType.in_,
              label: astType.label,
              languageIn: [],
              logger: this.logger,
              name: astType.name.map((name) => this.tsName(name)),
              primitiveIn: astType.in_.map((value) =>
                LiteralDecoder.decodeBigIntLiteral(value).unsafeCoerce(),
              ),
              reusables: this.reusables,
            });
          case "boolean":
            return new BooleanType({
              comment: astType.comment,
              configuration: this.configuration,
              datatype,
              hasValues: astType.hasValues,
              label: astType.label,
              languageIn: [],
              in_: astType.in_,
              logger: this.logger,
              name: astType.name.map((name) => this.tsName(name)),
              primitiveIn: astType.in_.map((value) =>
                LiteralDecoder.decodeBooleanLiteral(value).unsafeCoerce(),
              ),
              reusables: this.reusables,
            });
          case "date":
          case "datetime":
            return new (
              datatypeDefinition.kind === "date" ? DateType : DateTimeType
            )({
              comment: astType.comment,
              configuration: this.configuration,
              datatype,
              hasValues: astType.hasValues,
              in_: astType.in_,
              label: astType.label,
              languageIn: [],
              logger: this.logger,
              name: astType.name.map((name) => this.tsName(name)),
              primitiveIn: astType.in_.map((value) =>
                (datatypeDefinition.kind === "date"
                  ? LiteralDecoder.decodeDateLiteral
                  : LiteralDecoder.decodeDateTimeLiteral)(value).unsafeCoerce(),
              ),
              reusables: this.reusables,
            });
          case "float":
          case "int":
            return new (
              datatypeDefinition.kind === "float" ? FloatType : IntType
            )({
              comment: astType.comment,
              configuration: this.configuration,
              datatype,
              hasValues: astType.hasValues,
              in_: astType.in_,
              label: astType.label,
              languageIn: [],
              logger: this.logger,
              name: astType.name.map((name) => this.tsName(name)),
              primitiveIn: astType.in_.map((value) =>
                (datatypeDefinition.kind === "float"
                  ? LiteralDecoder.decodeFloatLiteral
                  : LiteralDecoder.decodeIntLiteral)(value).unsafeCoerce(),
              ),
              reusables: this.reusables,
            });
          case "string":
            if (!datatype.equals(rdf.langString)) {
              return new StringType({
                comment: astType.comment,
                configuration: this.configuration,
                datatype,
                hasValues: astType.hasValues,
                in_: astType.in_,
                label: astType.label,
                languageIn: astType.languageIn,
                logger: this.logger,
                name: astType.name.map((name) => this.tsName(name)),
                primitiveIn: astType.in_.map((value) => value.value),
                reusables: this.reusables,
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
      configuration: this.configuration,
      hasValues: astType.hasValues,
      in_: astType.in_,
      label: astType.label,
      languageIn: astType.languageIn,
      logger: this.logger,
      name: astType.name.map((name) => this.tsName(name)),
      reusables: this.reusables,
    });
  }

  private createObjectTypeProperty({
    astStructField,
    objectType,
  }: {
    astStructField: ast.StructType.Field;
    objectType: ObjectType;
  }): ObjectType.Property {
    {
      const cachedProperty =
        this.cachedObjectTypePropertiesByShapeIdentifier.get(
          astStructField.shapeIdentifier,
        );
      if (cachedProperty) {
        return cachedProperty;
      }
    }

    const property = new ObjectType.ShaclProperty({
      comment: astStructField.comment,
      configuration: this.configuration,
      description: astStructField.description,
      display: astStructField.display,
      label: astStructField.label,
      logger: this.logger,
      mutable: astStructField.mutable,
      name: this.tsName(astStructField.name),
      objectType,
      path: astStructField.path,
      recursive: !!astStructField.recursive,
      reusables: this.reusables,
      type: this.createType(astStructField.type),
    });

    this.cachedObjectTypePropertiesByShapeIdentifier.set(
      astStructField.shapeIdentifier,
      property,
    );

    return property;
  }

  private createOptionType(astType: ast.OptionType) {
    const itemType = this.createType(astType.itemType);
    invariant(OptionType.isItemType(itemType));
    return new OptionType({
      comment: astType.comment,
      configuration: this.configuration,
      itemType,
      label: astType.label,
      logger: this.logger,
      name: astType.name.map((name) => this.tsName(name)),
      reusables: this.reusables,
    });
  }

  private createSetType(astType: ast.SetType) {
    const itemType = this.createType(astType.itemType);
    invariant(SetType.isItemType(itemType));
    return new SetType({
      comment: astType.comment,
      configuration: this.configuration,
      itemType,
      label: astType.label,
      logger: this.logger,
      mutable: astType.mutable,
      minCount: astType.minCount,
      name: astType.name.map((name) => this.tsName(name)),
      reusables: this.reusables,
    });
  }

  private createTermType(astType: ast.TermType) {
    return new TermType({
      comment: astType.comment,
      configuration: this.configuration,
      hasValues: astType.hasValues,
      in_: astType.in_,
      label: astType.label,
      logger: this.logger,
      name: astType.name.map((name) => this.tsName(name)),
      nodeKinds: astType.nodeKinds,
      reusables: this.reusables,
    });
  }

  private tsName(name: string, options?: { synthetic?: boolean }): string {
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
      tsName = `${this.configuration.syntheticNamePrefix}${tsName}`;
    }
    return tsName;
  }
}

const reservedTsIdentifiers = reservedTsIdentifiers_({
  includeGlobalProperties: true,
});
