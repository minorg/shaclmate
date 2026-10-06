import type { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractConstruct } from "./AbstractConstruct.js";
import type { ObjectDiscriminatedUnionType } from "./ObjectDiscriminatedUnionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class Operation extends AbstractConstruct {
  private readonly error: Maybe<ObjectType | ObjectDiscriminatedUnionType>;
  private readonly name: string;
  private readonly parameter: Maybe<ObjectType>;
  private readonly result: Maybe<Type>;

  constructor({
    error,
    name,
    parameter,
    result,
    service,
    ...superParameters
  }: {
    error: Maybe<ObjectType | ObjectDiscriminatedUnionType>;
    name: string;
    parameter: Maybe<ObjectType>;
    result: Maybe<Type>;
    service: { name: string };
  } & ConstructorParameters<typeof AbstractConstruct>[0]) {
    super(superParameters);
    this.error = error;
    this.name = name;
    this.parameter = parameter;
    this.result = result;
  }

  @Memoize()
  get interfaceSignature(): Code {
    return code`${this.name}(${this.parameterDeclaration}): ${this.returnTypeAnnotation}`;
  }

  @Memoize()
  get loggingMethodDeclaration(): Code {
    let logContext: Code;
    if (this.parameter.isJust()) {
      logContext = code`JSON.parse(JSON.stringify({ ${joinCode(
        this.parameter.extract()!.properties.flatMap((property) =>
          property.kind === "Shacl"
            ? property
                .toJsonInitializer({
                  variables: {
                    object: code`parameters`,
                  },
                })
                .toList()
            : [],
        ),
        { on: "," },
      )} }`;
    } else {
      logContext = code`{}`;
    }

    return code`\
async ${this.name}(${this.parameterDeclaration}): ${this.returnTypeAnnotation} {
  const logContext: Record<string, unknown> = ${logContext};
  
}`;
  }

  @Memoize()
  private get returnTypeAnnotation(): Code {
    return code`Promise<${this.reusables.imports.Either}<${this.error.map((error) => error.expression).orDefault(code`Error`)}, ${this.result.map((result) => result.expression).orDefault(code`void`)}>>`;
  }

  @Memoize()
  private get parameterDeclaration(): Code {
    return this.parameter
      .map(
        (parameter) =>
          code`parameters: ${parameter.name
            .map(
              (name) =>
                code`Omit<${name}, ${this.configuration.syntheticNamePrefix}identifier>`,
            )
            .orDefault(
              code`{ ${joinCode(
                parameter.properties.flatMap((property) =>
                  property.kind === "Shacl"
                    ? property.declaration.toList()
                    : [],
                ),
                { on: "\n\n" },
              )} }`,
            )}`,
      )
      .orDefault(code``);
  }
}
