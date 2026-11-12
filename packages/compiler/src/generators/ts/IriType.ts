import type { NamedNode } from "@rdfjs/types";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { BuiltinCallable } from "./BuiltinCallable.js";
import type { Callable } from "./Callable.js";
import { InlineCallable } from "./InlineCallable.js";
import { SchemaObject } from "./SchemaObject.js";
import { arrayOf, type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class IriType extends AbstractIdentifierType<NamedNode> {
  override readonly filterFunction = new BuiltinCallable(
    this.reusables.snippets.filterIri,
  );
  override readonly filterType = code`${this.reusables.snippets.IriFilter}`;
  override readonly kind = "Iri";
  override readonly nodeKinds = nodeKinds;
  override readonly valueSparqlWherePatternsFunction = new BuiltinCallable(
    this.reusables.snippets.iriSparqlWherePatterns,
  );

  @Memoize()
  override get fromJsonValueFunction(): AbstractIdentifierType<NamedNode>["fromJsonValueFunction"] {
    if (this.in_.length > 0) {
      return new BuiltinCallable(
        code`${this.reusables.snippets.iriLiteralFromJsonString}<${this.valueTypeExpression}>`,
      );
    } else {
      return new BuiltinCallable(this.reusables.snippets.iriFromJsonString);
    }
  }

  @Memoize()
  override get fromJsonObjectFunction(): AbstractIdentifierType<NamedNode>["fromJsonObjectFunction"] {
    if (this.in_.length > 0) {
      return new BuiltinCallable(
        code`${this.reusables.snippets.iriLiteralFromJsonObject}<${this.valueTypeExpression}>`,
      );
    } else {
      return new BuiltinCallable(this.reusables.snippets.iriFromJsonObject);
    }
  }

  @Memoize()
  override get toJsonValueFunction(): AbstractIdentifierType<NamedNode>["toJsonValueFunction"] {
    return new BuiltinCallable(
      code`${this.reusables.snippets.iriToJsonString}<${this.valueTypeExpression}>`,
    );
  }

  @Memoize()
  override get toJsonObjectFunction(): AbstractIdentifierType<NamedNode>["toJsonObjectFunction"] {
    return new BuiltinCallable(
      code`${this.reusables.snippets.iriToJsonObject}<${this.valueTypeExpression}>`,
    );
  }

  @Memoize()
  override get jsonValueType(): AbstractIdentifierType<NamedNode>["jsonValueType"] {
    if (this.in_.length === 0) {
      return super.jsonValueType;
    }

    return this.jsonTypeFactory.createJsonStringType({
      in_: this.in_.map((in_) => in_.value),
      inReference:
        this.name.isJust() && this.configuration.features.has("Object.schema")
          ? code`${this.name.extract()!}.schema.in.map(_ => _.value)`
          : undefined,
    });
  }

  @Memoize()
  override get jsonObjectType(): AbstractIdentifierType<NamedNode>["jsonObjectType"] {
    if (this.in_.length === 0) {
      return super.jsonObjectType;
    }

    return this.jsonTypeFactory.createJsonObjectType({
      "@id": { type: this.jsonValueType },
    });
  }

  @Memoize()
  override get conversionFunction(): Maybe<AbstractIdentifierType.ConversionFunction> {
    invariant(this.jsTypes.length === 1);
    return Maybe.of({
      code:
        this.in_.length > 0
          ? code`${this.reusables.snippets.convertToIriLiteral}<${this.valueTypeExpression}>`
          : code`${this.reusables.snippets.convertToIri}`,
      sourceTypes: [
        {
          expression:
            this.in_.length > 0
              ? this.valueTypeExpression
              : code`(keyof ${this.configuration.syntheticNamePrefix}DefaultNamespaceT & string)`,
          jsType: { typeof: "string" },
        },
        {
          expression: this.expression,
          jsType: this.jsTypes[0],
        },
      ],
    });
  }

  @Memoize()
  get fromRdfResourceValuesFunction(): Callable {
    return new BuiltinCallable(
      code`${this.reusables.snippets.iriFromRdfResourceValues}<${this.valueTypeExpression}>`,
    );
  }

  @Memoize()
  get parseFunction(): Callable {
    if (this.in_.length > 0) {
      return new InlineCallable(
        code`(identifier: string) => ${this.reusables.snippets.parseIri}(identifier).chain((identifier) => { switch (identifier.value) { ${joinCode(this.in_.map((iri) => code`case "${iri.value}": return ${this.reusables.imports.Right}(identifier as ${this.expression});`))} default: return ${this.reusables.imports.Left}(new Error("expected NamedNode identifier to be one of ${this.in_.map((iri) => iri.value).join(" ")}")); } })`,
      );
    }
    return new BuiltinCallable(this.reusables.snippets.parseIri);
  }

  @Memoize()
  protected override get inlineExpression(): Code {
    if (this.in_.length > 0) {
      return code`${this.reusables.imports.NamedNode}<${this.inlineValueTypeExpression}>`;
    }

    return code`${this.reusables.imports.NamedNode}`;
  }

  protected override staticModuleDeclarations(
    name: string,
  ): Record<string, Code> {
    if (this.in_.length === 0) {
      return super.staticModuleDeclarations(name);
    }
    return {
      ...super.staticModuleDeclarations(name),
      inValues: code`const inValues = ${arrayOf(...this.in_.map((in_) => in_.value))} as const;`,
    };
  }

  @Memoize()
  override get schema(): SchemaObject<SchemaObject.BuiltinType> {
    const thisProperties: Record<string, Code> = {};
    if (this.hasValues.length > 0) {
      thisProperties["hasValues"] =
        code`hasValues: ${arrayOf(...this.hasValues.map((hasValue) => this.rdfjsTermExpression(hasValue)))}`;
    }
    if (this.in_.length > 0) {
      thisProperties["in"] =
        code`in: inValues.map(inValue => ${this.reusables.imports.dataFactory}.namedNode(inValue))`;
      thisProperties["inValues"] = code`inValues`;
    }

    return new SchemaObject({
      properties: { ...super.schema.properties, ...thisProperties },
      type: new SchemaObject.BuiltinType(
        code`${this.reusables.snippets.IriSchema}<${this.valueTypeExpression}>`,
      ),
      variable: super.schema.variable,
    });
  }

  @Memoize()
  protected get inlineValueTypeExpression(): Code {
    if (this.in_.length === 0) {
      return code`string`;
    }

    const name = this.name.extract();
    if (name && this.configuration.features.has("Object.schema")) {
      // Reuse the type from schema to cut down code
      return code`(typeof ${name}.schema)["inValues"][number]`;
    }

    return code`(${this.in_.map((in_) => `"${in_.value}"`).join(" | ")})`;
  }

  @Memoize()
  private get valueTypeExpression(): Code {
    return this.name
      .map((name) => code`${name}["value"]`)
      .orDefaultLazy(() => this.inlineValueTypeExpression);
  }
}

const nodeKinds: ReadonlySet<"IRI"> = new Set(["IRI"]);
