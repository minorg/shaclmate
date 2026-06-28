import type { DatasetCore } from "@rdfjs/types";
import type { ValidationReport } from "@shaclmate/shacl-ast";
import type { Either } from "purify-ts";
import { dummyLogger, type Logger } from "ts-log";

/**
 * Abstract base class for SHACL validator implementations.
 */
export abstract class Validator {
  protected readonly logger: Logger;
  protected readonly shapesGraph: DatasetCore;

  constructor({
    logger = dummyLogger,
    shapesGraph,
  }: { logger: Logger; shapesGraph: DatasetCore }) {
    this.logger = logger;
    this.shapesGraph = shapesGraph;
  }

  abstract validate(
    dataGraph: DatasetCore,
  ): Promise<Either<Error, ValidationReport>>;
}
