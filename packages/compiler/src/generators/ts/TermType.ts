import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { NodeKind } from "@shaclmate/shacl-ast";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractTermType } from "./AbstractTermType.js";
import { BuiltinCallable } from "./BuiltinCallable.js";
import type { Callable } from "./Callable.js";
import { SchemaObject } from "./SchemaObject.js";
import {
  arrayOf,
  type Code,
  code,
  joinCode,
  literalOf,
} from "./ts-poet-wrapper.js";

export class TermType<
  ConstantTermT extends Literal | NamedNode = Literal | NamedNode,
  RuntimeTermT extends BlankNode | Literal | NamedNode =
    | BlankNode
    | Literal
    | NamedNode,
> extends AbstractTermType {
  override readonly conversionFunction: Maybe<AbstractTermType.ConversionFunction> =
    Maybe.empty();
  override readonly filterFunction = new BuiltinCallable(
    this.reusables.snippets.filterTerm,
  );
  override readonly jsTypes = [
    { instanceof: "Object", typeof: "object" },
  ] as const;
  override readonly kind = "Term";
  override readonly nodeKinds: ReadonlySet<NodeKind>;
  override readonly toJsonObjectFunction = new BuiltinCallable(
    this.reusables.snippets.termToJsonObject,
  );
  override readonly toJsonValueFunction = this.toJsonObjectFunction;
  override readonly valueSparqlWherePatternsFunction = new BuiltinCallable(
    this.reusables.snippets.termSparqlWherePatterns,
  );

  constructor({
    nodeKinds,
    ...superParameters
  }: ConstructorParameters<
    typeof AbstractTermType<ConstantTermT, RuntimeTermT>
  >[0] & {
    nodeKinds: ReadonlySet<NodeKind>;
  }) {
    super(superParameters);
    this.nodeKinds = nodeKinds;
    invariant(
      this.nodeKinds.has("Literal") &&
        (this.nodeKinds.has("BlankNode") || this.nodeKinds.has("IRI")),
      "should be IdentifierType or LiteralType",
    );
  }

  @Memoize()
  override get discriminatedType(): Maybe<AbstractTermType.DiscriminatedType> {
    return Maybe.of({
      discriminantProperty: {
        jsonName: "termType",
        name: "termType",
        values: [...this.termTypes],
      },
      expression: this.expression,
    });
  }

  @Memoize()
  override get filterType(): Code {
    return code`${this.reusables.snippets.TermFilter}<${this.expression}>`;
  }

  @Memoize()
  override get fromJsonObjectFunction(): Callable {
    return new BuiltinCallable(
      code`${this.reusables.snippets.termFromJsonObject}<${this.expression}>`,
    );
  }

  get fromJsonValueFunction(): Callable {
    return this.fromJsonObjectFunction;
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Callable {
    return new BuiltinCallable(
      code`${this.reusables.snippets.termFromRdfResourceValues}<${this.expression}>`,
    );
  }

  override get graphqlType(): AbstractTermType.GraphqlType {
    throw new Error("not implemented");
  }

  @Memoize()
  override get jsonObjectType(): AbstractTermType["jsonObjectType"] {
    // This is a z.union in the snippet but an object here so a discriminant can be added if necessary.
    return this.jsonTypeFactory.createJsonObjectType(
      {
        "@id": {
          type: this.jsonTypeFactory.createJsonStringType({
            minLength: 1n,
          }),
        },
        "@language": {
          optional: true,
          type: this.jsonTypeFactory.createJsonStringType(),
        },
        "@type": {
          optional: true,
          type: this.jsonTypeFactory.createJsonStringType(),
        },
        "@value": {
          type: this.jsonTypeFactory.createJsonStringType(),
        },
      },
      {
        snippet: this.reusables.snippets.TermJsonObject,
      },
    );
  }

  get jsonValueType(): AbstractTermType["jsonValueType"] {
    return this.jsonObjectType;
  }

  @Memoize()
  protected override get inlineExpression(): Code {
    return code`(${joinCode(
      [...this.nodeKinds]
        .map((nodeKind) => {
          switch (nodeKind) {
            case "BlankNode":
              return this.reusables.imports.BlankNode;
            case "IRI":
              return this.reusables.imports.NamedNode;
            case "Literal":
              return this.reusables.imports.Literal;
            default:
              nodeKind satisfies never;
              throw new RangeError(nodeKind);
          }
        })
        .map((import_) => code`${import_}`),
      { on: " | " },
    )})`;
  }

  @Memoize()
  override get schema(): SchemaObject {
    return new SchemaObject({
      properties: super.schema.properties.concat(
        code`types: ${arrayOf(...[...this.nodeKinds].map(NodeKind.toTermType))}`,
      ),
      type: new SchemaObject.Type({
        members: super.schema.type.members.concat(
          code`types: ${joinCode(
            [...this.nodeKinds]
              .map(NodeKind.toTermType)
              .map((termType) => code`${literalOf(termType)}`),
            { on: " | " },
          )}`,
        ),
        name: Maybe.of(
          code`${this.reusables.snippets.TermSchema}<${this.expression}>`,
        ),
      }),
      variable: super.schema.variable,
    });
  }

  protected override get schemaInitializers() {
    return super.schemaInitializers.concat();
  }

  override graphqlResolveExpression(
    _parameters: Parameters<AbstractTermType["graphqlResolveExpression"]>[0],
  ): Code {
    throw new Error("not implemented");
  }

  override toLoggableExpression({
    variables,
  }: Parameters<AbstractTermType["toLoggableExpression"]>[0]): Code {
    return code`${this.toJsonObjectFunction.annotatedUsage}(${variables.value})`;
  }
}
