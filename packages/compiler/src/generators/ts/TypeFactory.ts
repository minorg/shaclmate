import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { TermMap, TermSet } from "@rdfx/collection";
import { literalDatatypeDefinitions } from "@rdfx/literal";
import type { Logger } from "@rdfx/logger";
import base62 from "@sindresorhus/base62";
import { rdf } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import reservedTsIdentifiers_ from "reserved-identifiers";
import { invariant } from "ts-invariant";
import * as ast from "../../ast/index.js";
import { AbstractType_JsonTypeFactory } from "./_AbstractType/AbstractType_JsonType.js";
import type { AbstractType } from "./AbstractType.js";
import { BigDecimalType } from "./BigDecimalType.js";
import { BigIntType } from "./BigIntType.js";
import { BlankNodeType } from "./BlankNodeType.js";
import { BooleanType } from "./BooleanType.js";
import { DateTimeType } from "./DateTimeType.js";
import { DateType } from "./DateType.js";
import { DefaultValueType } from "./DefaultValueType.js";
import { DiscriminatedUnionType } from "./DiscriminatedUnionType.js";
import { FloatType } from "./FloatType.js";
import { IdentifierType } from "./IdentifierType.js";
import { IntType } from "./IntType.js";
import { IriType } from "./IriType.js";
import { LangStringType } from "./LangStringType.js";
import { LazyOptionType } from "./LazyOptionType.js";
import { LazySetType } from "./LazySetType.js";
import { LazyType } from "./LazyType.js";
import { ListType } from "./ListType.js";
import { LiteralType } from "./LiteralType.js";
import { ObjectDiscriminatedUnionType } from "./ObjectDiscriminatedUnionType.js";
import { ObjectType } from "./ObjectType.js";
import { OptionType } from "./OptionType.js";
import type { Reusables } from "./Reusables.js";
import { SetType } from "./SetType.js";
import { StringType } from "./StringType.js";
import { TermType } from "./TermType.js";
import type { TsGenerator } from "./TsGenerator.js";
import type { Type } from "./Type.js";

export class TypeFactory {
  private readonly configuration: TsGenerator.Configuration;
  private readonly constructorParameters: {
    configuration: TsGenerator.Configuration;
    jsonTypeFactory: AbstractType.JsonTypeFactory;
    logger: Logger;
    reusables: Reusables;
  };
  private readonly jsonTypeFactory: AbstractType.JsonTypeFactory;
  private readonly logger: Logger;

  private cachedObjectDiscriminatedUnionTypesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    ObjectDiscriminatedUnionType
  > = new TermMap();
  private cachedObjectTypeShaclPropertiesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    ObjectType.ShaclProperty<Type>
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
    this.jsonTypeFactory = new AbstractType_JsonTypeFactory({
      configuration,
      reusables,
    });
    this.logger = logger;
    this.constructorParameters = {
      configuration,
      logger,
      jsonTypeFactory: this.jsonTypeFactory,
      reusables,
    };
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

    const objectTypeName = astType.name.map((name) =>
      this.tsName(name, { synthetic: astType.synthetic }),
    );
    const objectTypeStub = { name: objectTypeName };

    const discriminantProperty = astType.name.map(
      (name) =>
        new ObjectType.DiscriminantProperty({
          ...this.constructorParameters,
          objectType: objectTypeStub,
          value: name,
        }),
    );

    const identifierType = this.createIdentifierType(astType.identifierType);

    const identifierProperty = astType.identifierField.map(
      () =>
        new ObjectType.IdentifierProperty({
          ...this.constructorParameters,
          name: `${this.configuration.syntheticNamePrefix}identifier`,
          objectType: objectTypeStub,
          type: identifierType,
        }),
    );

    const rdfTypeProperty = astType.fromRdfType.map(
      (fromRdfType) =>
        new ObjectType.RdfTypeProperty({
          ...this.constructorParameters,
          fromRdfType,
          objectType: objectTypeStub,
          toRdfTypes: astType.toRdfTypes,
        }),
    );

    const objectType = new ObjectType({
      ...this.constructorParameters,
      discriminantProperty,
      comment: astType.comment,
      extern: astType.extern,
      identifierProperty,
      identifierType,
      label: astType.label,
      lazyProperties: (objectType: ObjectType) => {
        const properties: ObjectType.Property[] = astType.fields
          .filter((field) => field.kind === "Shacl")
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
            this.createObjectTypeShaclProperty({
              astStructField: astField,
              objectType,
            }),
          );

        for (const specialProperty of [
          discriminantProperty,
          rdfTypeProperty,
          identifierProperty,
        ]) {
          specialProperty.ifJust((specialProperty) => {
            properties.splice(0, 0, specialProperty);
          });
        }

        return properties;
      },
      name: objectTypeName,
      rdfTypeProperty,
      recursive: astType.recursive,
      shapeIdentifier: astType.shapeIdentifier,
      synthetic: astType.synthetic,
    });
    this.cachedObjectTypesByShapeIdentifier.set(
      astType.shapeIdentifier,
      objectType,
    );
    return objectType;
  }

  createObjectDiscriminatedUnionType(
    astType: ast.StructDiscriminatedUnionType,
  ): ObjectDiscriminatedUnionType {
    {
      const cachedObjectDiscriminatedUnionType =
        this.cachedObjectDiscriminatedUnionTypesByShapeIdentifier.get(
          astType.shapeIdentifier,
        );
      if (cachedObjectDiscriminatedUnionType) {
        return cachedObjectDiscriminatedUnionType;
      }
    }

    const objectDiscriminatedUnionIdentifierType = this.createIdentifierType(
      ast.StructCompoundType.identifierType(astType),
    );

    const objectDiscriminatedUnionTypeName = astType.name.map((name) =>
      this.tsName(name),
    );

    const objectDiscriminatedUnionType = new ObjectDiscriminatedUnionType({
      ...this.constructorParameters,
      comment: astType.comment,
      identifierProperty:
        astType.isStructDiscriminatedUnionType() &&
        astType.members.every((member) => {
          switch (member.type.kind) {
            case "DiscriminatedUnion":
              return member.type.members.every((member) =>
                member.type.identifierField.isJust(),
              );
            case "Struct":
              return member.type.identifierField.isJust();
            default:
              member.type satisfies never;
              throw new Error("should never reach this point");
          }
        })
          ? Maybe.of(
              new ObjectType.IdentifierProperty({
                ...this.constructorParameters,
                name: `${this.configuration.syntheticNamePrefix}identifier`,
                objectType: { name: objectDiscriminatedUnionTypeName },
                type: objectDiscriminatedUnionIdentifierType,
              }),
            )
          : Maybe.empty(),
      identifierType: objectDiscriminatedUnionIdentifierType,
      label: astType.label,
      members: ast.StructCompoundType.memberStructTypes(astType).map(
        (astStructType) => ({
          discriminantValue: Maybe.empty(),
          type: this.createObjectType(astStructType),
        }),
      ),
      name: objectDiscriminatedUnionTypeName,
      recursive: astType.recursive,
      shapeIdentifier: astType.shapeIdentifier,
      synthetic: astType.synthetic,
    });

    this.cachedObjectDiscriminatedUnionTypesByShapeIdentifier.set(
      astType.shapeIdentifier,
      objectDiscriminatedUnionType,
    );

    return objectDiscriminatedUnionType;
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
      case "DiscriminatedUnion":
        return this.createDiscriminatedUnionType(astType);
    }
  }

  createDiscriminatedUnionType(
    astType: ast.DiscriminatedUnionType,
  ): DiscriminatedUnionType | ObjectDiscriminatedUnionType {
    if (astType.isStructDiscriminatedUnionType()) {
      return this.createObjectDiscriminatedUnionType(astType);
    }

    return new DiscriminatedUnionType({
      ...this.constructorParameters,
      comment: astType.comment,
      identifierProperty: Maybe.empty(),
      label: astType.label,
      members: astType.members.map((member) => ({
        discriminantValue: member.discriminantValue,
        type: this.createType(member.type),
      })),
      name: astType.name.map((name) => this.tsName(name)),
      recursive: astType.recursive,
      shapeIdentifier: astType.shapeIdentifier,
      synthetic: astType.synthetic,
    });
  }

  private createBlankNodeType(astType: ast.BlankNodeType): BlankNodeType {
    return new BlankNodeType({
      ...this.constructorParameters,
      comment: astType.comment,
      label: astType.label,
      name: astType.name.map((name) => this.tsName(name)),
      shapeIdentifier: astType.shapeIdentifier,
    });
  }

  private createDefaultValueType(astType: ast.DefaultValueType) {
    const itemType = this.createType(astType.itemType, {
      defaultValue: astType.defaultValue,
    });
    invariant(DefaultValueType.isItemType(itemType));
    return new DefaultValueType({
      ...this.constructorParameters,
      comment: astType.comment,
      defaultValue: astType.defaultValue,
      itemType,
      label: astType.label,
      name: astType.name.map((name) => this.tsName(name)),
      shapeIdentifier: astType.shapeIdentifier,
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
          ...this.constructorParameters,
          comment: astType.comment,
          label: astType.label,
          name: astType.name.map((name) => this.tsName(name)),
          shapeIdentifier: astType.shapeIdentifier,
        });
      case "Iri":
        return this.createIriType(astType);
    }
  }

  private createIriType(astType: ast.IriType): IriType {
    return new IriType({
      ...this.constructorParameters,
      comment: astType.comment,
      hasValues: astType.hasValues,
      in_: astType.in_,
      label: astType.label,
      name: astType.name.map((name) => this.tsName(name)),
      shapeIdentifier: astType.shapeIdentifier,
    });
  }

  private createLazyOptionType(astType: ast.LazyOptionType): Type {
    return new LazyOptionType({
      ...this.constructorParameters,
      comment: astType.comment,
      label: astType.label,
      name: astType.name.map((name) => this.tsName(name)),
      partialType: this.createOptionType(astType.partialType) as OptionType<
        ObjectType | ObjectDiscriminatedUnionType
      >,
      resolveType: this.createOptionType(astType.resolveType) as OptionType<
        ObjectType | ObjectDiscriminatedUnionType
      >,
      shapeIdentifier: astType.shapeIdentifier,
    });
  }

  private createLazySetType(astType: ast.LazySetType): Type {
    return new LazySetType({
      ...this.constructorParameters,
      comment: astType.comment,
      label: astType.label,
      name: astType.name.map((name) => this.tsName(name)),
      partialType: this.createSetType(astType.partialType) as SetType<
        ObjectType | ObjectDiscriminatedUnionType
      >,
      resolveType: this.createSetType(astType.resolveType) as SetType<
        ObjectType | ObjectDiscriminatedUnionType
      >,
      shapeIdentifier: astType.shapeIdentifier,
    });
  }

  private createLazyType(astType: ast.LazyType): Type {
    return new LazyType({
      ...this.constructorParameters,
      comment: astType.comment,
      label: astType.label,
      name: astType.name.map((name) => this.tsName(name)),
      partialType: this.createType(astType.partialType) as
        | ObjectType
        | ObjectDiscriminatedUnionType,
      resolveType: this.createType(astType.resolveType) as
        | ObjectType
        | ObjectDiscriminatedUnionType,
      shapeIdentifier: astType.shapeIdentifier,
    });
  }

  private createListType(astType: ast.ListType) {
    const itemType = this.createType(astType.itemType);
    invariant(ListType.isItemType(itemType));
    return new ListType({
      ...this.constructorParameters,
      comment: astType.comment,
      identifierNodeKind: astType.identifierNodeKind,
      itemType,
      label: astType.label,
      mutable: astType.mutable,
      name: astType.name.map((name) => this.tsName(name)),
      shapeIdentifier: astType.shapeIdentifier,
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

      const constructorParameters = {
        ...this.constructorParameters,
        comment: astType.comment,
        datatype,
        hasValues: astType.hasValues,
        in_: astType.in_,
        label: astType.label,
        languageIn: astType.languageIn,
        name: astType.name.map((name) => this.tsName(name)),
        shapeIdentifier: astType.shapeIdentifier,
      };

      if (datatype.equals(rdf.langString)) {
        return new LangStringType(constructorParameters);
      }

      const datatypeDefinition = literalDatatypeDefinitions[datatype.value];
      if (datatypeDefinition) {
        switch (datatypeDefinition.kind) {
          case "bigdecimal":
            return new BigDecimalType(constructorParameters);
          case "bigint":
            return new BigIntType(constructorParameters);
          case "boolean":
            return new BooleanType(constructorParameters);
          case "date":
          case "datetime":
            return new (
              datatypeDefinition.kind === "date" ? DateType : DateTimeType
            )(constructorParameters);
          case "float":
          case "int":
            return new (
              datatypeDefinition.kind === "float" ? FloatType : IntType
            )(constructorParameters);
          case "string":
            return new StringType(constructorParameters);
        }
      }

      this.logger.warn("unrecognized literal datatype: %s", datatype.value);
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
      ...this.constructorParameters,
      comment: astType.comment,
      hasValues: astType.hasValues,
      in_: astType.in_,
      label: astType.label,
      languageIn: astType.languageIn,
      name: astType.name.map((name) => this.tsName(name)),
      shapeIdentifier: astType.shapeIdentifier,
    });
  }

  private createObjectTypeShaclProperty({
    astStructField,
    objectType,
  }: {
    astStructField: ast.StructType.ShaclField;
    objectType: ObjectType;
  }): ObjectType.ShaclProperty<Type> {
    {
      const cachedProperty =
        this.cachedObjectTypeShaclPropertiesByShapeIdentifier.get(
          astStructField.shapeIdentifier,
        );
      if (cachedProperty) {
        return cachedProperty;
      }
    }

    const property = new ObjectType.ShaclProperty({
      ...this.constructorParameters,
      comment: astStructField.comment,
      description: astStructField.description,
      display: astStructField.display,
      label: astStructField.label,
      mutable: astStructField.mutable,
      name: this.tsName(astStructField.name),
      objectType,
      path: astStructField.path,
      recursive: !!astStructField.recursive,
      type: this.createType(astStructField.type),
    });

    this.cachedObjectTypeShaclPropertiesByShapeIdentifier.set(
      astStructField.shapeIdentifier,
      property,
    );

    return property;
  }

  private createOptionType(astType: ast.OptionType) {
    const itemType = this.createType(astType.itemType);
    invariant(OptionType.isItemType(itemType));
    return new OptionType({
      ...this.constructorParameters,
      comment: astType.comment,
      itemType,
      label: astType.label,
      name: astType.name.map((name) => this.tsName(name)),
      shapeIdentifier: astType.shapeIdentifier,
    });
  }

  private createSetType(astType: ast.SetType) {
    const itemType = this.createType(astType.itemType);
    invariant(SetType.isItemType(itemType));
    return new SetType({
      ...this.constructorParameters,
      comment: astType.comment,
      itemType,
      label: astType.label,
      mutable: astType.mutable,
      minCount: astType.minCount,
      name: astType.name.map((name) => this.tsName(name)),
      shapeIdentifier: astType.shapeIdentifier,
    });
  }

  private createTermType(astType: ast.TermType) {
    return new TermType({
      ...this.constructorParameters,
      comment: astType.comment,
      hasValues: astType.hasValues,
      in_: astType.in_,
      label: astType.label,
      name: astType.name.map((name) => this.tsName(name)),
      nodeKinds: astType.nodeKinds,
      shapeIdentifier: astType.shapeIdentifier,
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
