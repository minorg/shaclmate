import type { Logger } from "@rdfx/logger";

import type { Maybe } from "purify-ts";

import type { Reusables } from "./Reusables.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { TsGenerator } from "./TsGenerator.js";
import type { Code } from "./ts-poet-wrapper.js";

/**
 * Abstract base class for operations, services, and types.
 */
export abstract class AbstractConstruct {
  protected readonly configuration: TsGenerator.Configuration;
  protected readonly logger: Logger;
  protected readonly reusables: Reusables;

  /**
   * Comment from rdfs:comment.
   */
  readonly comment: Maybe<string>;

  /**
   * Label from rdfs:label.
   */
  readonly label: Maybe<string>;

  constructor({
    comment,
    configuration,
    label,
    logger,
    reusables,
  }: {
    comment: Maybe<string>;
    configuration: TsGenerator.Configuration;
    label: Maybe<string>;
    logger: Logger;
    reusables: Reusables;
  }) {
    this.comment = comment;
    this.configuration = configuration;
    this.label = label;
    this.logger = logger;
    this.reusables = reusables;
    this.rdfjsTermExpression = rdfjsTermExpression.bind({
      imports: this.reusables.imports,
      logger: this.logger,
      snippets: this.reusables.snippets,
    });
  }

  protected readonly rdfjsTermExpression: (
    parameters: Parameters<typeof rdfjsTermExpression>[0],
  ) => Code;
}
