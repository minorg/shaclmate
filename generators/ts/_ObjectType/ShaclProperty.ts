import type * as rdfjs from "@rdfjs/types";
import { pascalCase } from "change-case";
import { Maybe } from "purify-ts";
import type {
  OptionalKind,
  PropertyDeclarationStructure,
  PropertySignatureStructure,
} from "ts-morph";
import { Memoize } from "typescript-memoize";
import type { Type } from "../Type.js";
import { Property } from "./Property.js";

type ContainerType = "Array" | "Maybe" | null;

export class ShaclProperty extends Property {
  readonly type: Type;
  private readonly maxCount: Maybe<number>;
  private readonly minCount: number;
  private readonly path: rdfjs.NamedNode;

  constructor({
    maxCount,
    minCount,
    name,
    path,
    type,
  }: {
    maxCount: Maybe<number>;
    minCount: number;
    name: string;
    path: rdfjs.NamedNode;
    type: Type;
  }) {
    super({ name });
    this.maxCount = maxCount;
    this.minCount = minCount;
    this.path = path;
    this.type = type;
  }

  get classConstructorParametersPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    // If the interface type name is Maybe<string>
    let hasQuestionToken = false;
    const typeNames: string[] = [this.interfaceTypeName];
    const maxCount = this.maxCount.extractNullable();
    if (this.minCount === 0) {
      if (maxCount === 1) {
        typeNames.push(this.type.name); // Allow Maybe<string> | string | undefined
      }
      hasQuestionToken = true; // Allow Maybe<string> | undefined
    }

    return Maybe.of({
      hasQuestionToken,
      isReadonly: true,
      name: this.name,
      type: typeNames.join(" | "),
    });
  }

  get classPropertyDeclaration(): OptionalKind<PropertyDeclarationStructure> {
    return {
      isReadonly: true,
      name: this.name,
      type: this.interfaceTypeName,
    };
  }

  // biome-ignore lint/suspicious/useGetterReturn: <explanation>
  get equalsFunction(): string {
    const typeEqualsFunction = this.type.equalsFunction("left", "right");
    // const signature = `(left: ${this.interfaceTypeName}, right: ${this.interfaceTypeName})`;
    const signature = "(left, right)";
    switch (this.containerType) {
      case "Array": {
        if (typeEqualsFunction === "purifyHelpers.Equatable.equals") {
          return "purifyHelpers.Equatable.arrayEquals";
        }
        return `${signature} => purifyHelpers.Arrays.equals(left, right, ${typeEqualsFunction})`;
      }
      case "Maybe": {
        if (typeEqualsFunction === "purifyHelpers.Equatable.equals") {
          return "purifyHelpers.Equatable.maybeEquals";
        }
        if (typeEqualsFunction === "purifyHelpers.Equatable.strictEquals") {
          return `${signature} => left.equals(right)`; // Use Maybe.equals
        }
        return `${signature} => purifyHelpers.Maybes.equals(left, right, ${typeEqualsFunction})`;
      }
      case null:
        return typeEqualsFunction;
    }
  }

  get interfacePropertySignature(): OptionalKind<PropertySignatureStructure> {
    return {
      isReadonly: true,
      name: this.name,
      type: this.interfaceTypeName,
    };
  }

  // biome-ignore lint/suspicious/useGetterReturn: <explanation>
  @Memoize()
  get interfaceTypeName(): string {
    switch (this.containerType) {
      case "Array":
        return `readonly (${this.type.name})[]`;
      case "Maybe":
        return `purify.Maybe<${this.type.name}>`;
      case null:
        return this.type.name;
    }
  }

  @Memoize()
  private get containerType(): ContainerType {
    const maxCount = this.maxCount.extractNullable();
    if (this.minCount === 0 && maxCount === 1) {
      return "Maybe";
    }
    if (this.minCount === 1 && maxCount === 1) {
      return null;
    }
    return "Array";
  }

  classConstructorInitializer({
    parameter,
  }: Property.ClassConstructorInitializerParameters): Maybe<string> {
    const maxCount = this.maxCount.extractNullable();
    if (this.minCount === 0) {
      if (maxCount === 1) {
        return Maybe.of(
          `purify.Maybe.isMaybe(${parameter}) ? ${parameter} : purify.Maybe.fromNullable(${parameter})`,
        );
      }
      return Maybe.of(
        `(typeof ${parameter} !== "undefined" ? ${parameter} : [])`,
      );
    }
    return Maybe.of(parameter);
  }

  sparqlGraphPattern({
    dataFactoryVariable,
  }: Property.SparqlGraphPatternParameters): Maybe<string> {
    let sparqlGraphPattern = `sparqlBuilder.GraphPattern.basic(this.subject, ${dataFactoryVariable}.namedNode("${this.path.value}"), this.variable("${pascalCase(this.name)}"))`;
    const typeSparqlGraphPatterns = this.type.sparqlGraphPatterns({
      dataFactoryVariable,
      subjectVariable: this.name,
    });
    if (typeSparqlGraphPatterns.length > 0) {
      sparqlGraphPattern = `sparqlBuilder.GraphPattern.group(${sparqlGraphPattern}.chainObject(${this.name} => [${typeSparqlGraphPatterns.join(", ")}]))`;
    }
    if (this.containerType === "Maybe") {
      sparqlGraphPattern = `sparqlBuilder.GraphPattern.optional(${sparqlGraphPattern})`;
    }
    return Maybe.of(sparqlGraphPattern);
  }

  valueFromRdf({
    dataFactoryVariable,
    resourceVariable,
  }: Property.ValueFromRdfParameters): Maybe<string> {
    const path = `${dataFactoryVariable}.namedNode("${this.path.value}")`;
    const resourceValueVariable = "value";
    if (this.containerType === "Array") {
      return Maybe.of(
        `const ${this.name} = ${resourceVariable}.values(${path}).map(${resourceValueVariable}s => ${resourceValueVariable}s.flatMap(${resourceValueVariable} => (${this.type.valueFromRdf({ dataFactoryVariable, resourceValueVariable })}).toMaybe().toList())).orDefault([]);`,
      );
    }

    const valueFromRdf = `${resourceVariable}.value(${path}).chain(${resourceValueVariable} => ${this.type.valueFromRdf({ dataFactoryVariable, resourceValueVariable })})`;
    switch (this.containerType) {
      case "Maybe":
        return Maybe.of(`const ${this.name} = ${valueFromRdf}.toMaybe();`);
      case null:
        return Maybe.of(
          `const _${this.name}Either = ${valueFromRdf}; if (_${this.name}Either.isLeft()) { return _${this.name}Either; } const ${this.name} = _${this.name}Either.unsafeCoerce();`,
        );
    }
  }

  valueToRdf({
    mutateGraphVariable,
    propertyValueVariable,
    resourceSetVariable,
  }: Property.ValueToRdfParameters): Maybe<string> {
    const path = `${resourceSetVariable}.dataFactory.namedNode("${this.path.value}")`;
    switch (this.containerType) {
      case "Array":
        return Maybe.of(
          `${propertyValueVariable}.forEach((${this.name}Value) => { resource.add(${path}, ${this.type.valueToRdf({ mutateGraphVariable, resourceSetVariable, propertyValueVariable: `${this.name}Value` })}); });`,
        );
      case "Maybe":
        return Maybe.of(
          `${propertyValueVariable}.ifJust((${this.name}Value) => { resource.add(${path}, ${this.type.valueToRdf({ mutateGraphVariable, resourceSetVariable, propertyValueVariable: `${this.name}Value` })}); });`,
        );
      case null:
        return Maybe.of(
          `resource.add(${path}, ${this.type.valueToRdf({
            mutateGraphVariable,
            resourceSetVariable,
            propertyValueVariable,
          })});`,
        );
    }
  }
}