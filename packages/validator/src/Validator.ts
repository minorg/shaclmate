import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import type { DatasetCore } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import type { ValidationReport } from "@shaclmate/shacl-ast";
import type { Either } from "purify-ts";
import { dummyLogger, type Logger } from "ts-log";

/**
 * Abstract base class for SHACL validator implementations.
 */
export abstract class Validator {
  protected readonly logger: Logger;
  protected readonly prefixMap: PrefixMap;
  protected readonly shapesGraph: DatasetCore;

  constructor({
    logger = dummyLogger,
    prefixMap,
    shapesGraph,
  }: { logger?: Logger; prefixMap?: PrefixMap; shapesGraph: DatasetCore }) {
    this.logger = logger;
    this.prefixMap =
      prefixMap ?? new PrefixMap(undefined, { factory: dataFactory });
    this.shapesGraph = shapesGraph;
  }

  abstract validate(
    dataGraph: DatasetCore,
  ): Promise<Either<Error, ValidationReport>>;
}
