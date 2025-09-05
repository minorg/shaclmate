import type * as rdfjs from "@rdfjs/types";
import { Maybe } from "purify-ts";
import type {
  GetAccessorDeclarationStructure,
  OptionalKind,
  PropertyDeclarationStructure,
  PropertySignatureStructure,
} from "ts-morph";
import { Memoize } from "typescript-memoize";
import type { Import } from "../Import.js";
import type { Type } from "../Type.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { tsComment } from "../tsComment.js";
import { Property } from "./Property.js";

export abstract class ShaclProperty<
  TypeT extends Pick<
    Type,
    | "conversions"
    | "equalsFunction"
    | "mutable"
    | "name"
    | "useImports"
    | "snippetDeclarations"
  >,
> extends Property<TypeT> {
  protected readonly comment: Maybe<string>;
  protected readonly description: Maybe<string>;
  protected readonly label: Maybe<string>;

  readonly path: rdfjs.NamedNode;

  constructor({
    comment,
    description,
    label,
    path,
    ...superParameters
  }: {
    comment: Maybe<string>;
    description: Maybe<string>;
    label: Maybe<string>;
    path: rdfjs.NamedNode;
  } & ConstructorParameters<typeof Property<TypeT>>[0]) {
    super(superParameters);
    this.comment = comment;
    this.description = description;
    this.label = label;
    this.path = path;
  }

  override get equalsFunction(): string {
    return this.type.equalsFunction;
  }

  @Memoize()
  override get constructorParametersPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    let hasQuestionToken = false;
    const typeNames = new Set<string>(); // Remove duplicates with a set
    for (const conversion of this.type.conversions) {
      if (conversion.sourceTypeName === "undefined") {
        hasQuestionToken = true;
      } else {
        typeNames.add(conversion.sourceTypeName);
      }
    }

    return Maybe.of({
      hasQuestionToken,
      isReadonly: true,
      leadingTrivia: this.declarationComment,
      name: this.name,
      type: [...typeNames].sort().join(" | "),
    });
  }

  override get getAccessorDeclaration(): Maybe<
    OptionalKind<GetAccessorDeclarationStructure>
  > {
    return Maybe.empty();
  }

  @Memoize()
  override get propertyDeclaration(): Maybe<
    OptionalKind<PropertyDeclarationStructure>
  > {
    return Maybe.of({
      isReadonly: !this.mutable,
      leadingTrivia: this.declarationComment,
      name: this.name,
      scope: ShaclProperty.visibilityToScope(this.visibility),
      type: this.type.name,
    });
  }

  @Memoize()
  override get declarationImports(): readonly Import[] {
    return this.type.useImports({ features: this.objectType.features });
  }

  @Memoize()
  override get propertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    return Maybe.of({
      isReadonly: !this.mutable,
      leadingTrivia: this.declarationComment,
      name: this.name,
      type: this.type.name,
    });
  }

  override snippetDeclarations(
    parameters: Parameters<Property<Type>["snippetDeclarations"]>[0],
  ): readonly string[] {
    return this.type.snippetDeclarations(parameters);
  }

  protected get declarationComment(): string | undefined {
    return this.comment
      .alt(this.description)
      .alt(this.label)
      .map(tsComment)
      .extract();
  }

  @Memoize()
  protected get predicate(): string {
    return `${this.objectType.staticModuleName}.${syntheticNamePrefix}properties.${this.name}["identifier"]`;
  }
}
