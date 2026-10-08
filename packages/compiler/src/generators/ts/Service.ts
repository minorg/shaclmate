import { Memoize } from "typescript-memoize";

import { AbstractConstruct } from "./AbstractConstruct.js";
import type { Operation } from "./Operation.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class Service extends AbstractConstruct {
  readonly name: string;
  readonly operations: readonly Operation[];

  constructor({
    name,
    operations,
    ...superParameters
  }: {
    name: string;
    operations: readonly Operation[];
  } & ConstructorParameters<typeof AbstractConstruct>[0]) {
    super(superParameters);
    this.name = name;
    this.operations = operations;
  }

  @Memoize()
  get httpApiClassDeclaration(): Code {
    return code`\
export class ${this.name}HttpApi<EnvT extends ${this.reusables.imports.HonoEnv} = ${this.reusables.imports.HonoEnv}> extends ${this.reusables.imports.Hono}<EnvT> {
  constructor(delegate: ${this.name}) {
    super();
  }
}`;
  }

  @Memoize()
  get interfaceDeclaration(): Code {
    return code`export interface ${this.name} { ${joinCode(this.operations.map((operation) => operation.interfaceSignature))} }`;
  }

  @Memoize()
  get loggingClassDeclaration(): Code {
    return code`\
export class Logging${this.name} implements ${this.name} {
  private readonly delegate: ${this.name};
  private readonly logger: ${this.reusables.imports.Logger};

  constructor({ delegate, logger }: { delegate: ${this.name}, logger: ${this.reusables.imports.Logger} }) {
    this.delegate = delegate;
    this.logger = logger;
  }

  ${joinCode(this.operations.map((operation) => operation.loggingMethodDeclaration))}  
}`;
  }
}
