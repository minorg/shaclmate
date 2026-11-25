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
  get httpApiDeclaration(): Code {
    const variables = { logger: code`logger`, service: code`service` };
    return code`\
export type ${this.name}HttpApi<EnvT extends ${this.reusables.imports.HonoEnv}> = ReturnType<typeof ${this.name}HttpApi.create<EnvT>>;

export namespace ${this.name}HttpApi {
  export function create<EnvT extends ${this.reusables.imports.HonoEnv}>(service: ${this.name}, options?: { logger?: ${this.reusables.imports.Logger} }) {
    const logger: ${this.reusables.imports.Logger} = options?.logger ?? ${this.reusables.imports.nopLogger};
    return new ${this.reusables.imports.Hono}<EnvT>()${joinCode(this.operations.map((operation) => code`.${operation.httpApiRouteRegistration({ variables })}`))};
  }
}`;
  }

  @Memoize()
  get httpClientClassDeclaration(): Code {
    return code`\
export class ${this.name}HttpClient implements ${this.name} {
  private readonly honoClient: ReturnType<typeof hc<${this.name}HttpApi<${this.reusables.imports.HonoEnv}>>>;

  constructor(baseUrl: string, options?: ${this.reusables.imports.HonoClientRequestOptions}) {
    this.honoClient = ${this.reusables.imports.hc}<${this.name}HttpApi<${this.reusables.imports.HonoEnv}>>(baseUrl, options);
  }

${joinCode(this.operations.map((operation) => operation.httpClientMethodDeclaration({ variables: { honoClient: code`this.honoClient` } })))}
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
