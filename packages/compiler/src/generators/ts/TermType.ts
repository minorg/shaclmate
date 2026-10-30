import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { NodeKind } from "@shaclmate/shacl-ast";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractTermType } from "./AbstractTermType.js";
import type { Callable } from "./Callable.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
import { arrayOf, type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class TermType<
  ConstantTermT extends Literal | NamedNode = Literal | NamedNode,
  RuntimeTermT extends BlankNode | Literal | NamedNode =
    | BlankNode
    | Literal
    | NamedNode,
> extends AbstractTermType {
  override readonly conversionFunction: Maybe<AbstractTermType.ConversionFunction> =
    Maybe.empty();
  override readonly filterFunction = new ReferenceCallable(
    this.reusables.snippets.filterTerm,
  );
  override readonly jsTypes = [
    { instanceof: "Object", typeof: "object" },
  ] as const;
  override readonly kind = "Term";
  override readonly nodeKinds: ReadonlySet<NodeKind>;
  override readonly toJsonObjectFunction = new ReferenceCallable(
    this.reusables.snippets.termToJsonObject,
  );
  override readonly toJsonValueFunction = this.toJsonObjectFunction;
  override readonly valueSparqlWherePatternsFunction = new ReferenceCallable(
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
  override get filterType(): Code {
    return code`${this.reusables.snippets.TermFilter}<${this.expression}>`;
  }

  get fromJsonValueFunction(): Callable {
    return this.fromJsonObjectFunction;
  }

  @Memoize()
  override get fromJsonObjectFunction(): Callable {
    return new ReferenceCallable(
      code`${this.reusables.snippets.termFromJsonObject}<${this.jsonObjectType.expression}, ${this.expression}>`,
    );
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Callable {
    return new ReferenceCallable(
      code`${this.reusables.snippets.termFromRdfResourceValues}<${this.expression}>`,
    );
  }

  override get graphqlType(): AbstractTermType.GraphqlType {
    throw new Error("not implemented");
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${this.reusables.snippets.TermSchema}<${this.expression}>`;
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

  protected override get schemaInitializers() {
    return super.schemaInitializers.concat(
      code`types: ${arrayOf(...[...this.nodeKinds].map(NodeKind.toTermType))}`,
    );
  }

  override graphqlResolveExpression(
    _parameters: Parameters<AbstractTermType["graphqlResolveExpression"]>[0],
  ): Code {
    throw new Error("not implemented");
  }

  get jsonValueType(): AbstractTermType["jsonValueType"] {
    return this.jsonObjectType;
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

  override toLoggableExpression({
    variables,
  }: Parameters<AbstractTermType["toLoggableExpression"]>[0]): Code {
    return code`${this.toJsonObjectFunction.annotatedUsage}(${variables.value})`;
  }
}
