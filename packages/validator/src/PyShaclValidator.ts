import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import type { DatasetCore } from "@rdfjs/types";
import { datasetFactory, type PrefixMap } from "@rdfx/collection";
import dataFactory from "@rdfx/data-factory";
import { type Logger, nopLogger } from "@rdfx/logger";
import parsers from "@rdfx/parser";
import { ResourceSet } from "@rdfx/resource";
import { serialize } from "@rdfx/serializer";
import { ValidationReport } from "@shaclmate/shacl-ast";
import { getStreamAsArray } from "get-stream";
import { type Either, EitherAsync, Maybe } from "purify-ts";
import tmp from "tmp-promise";
import which from "which";
import { execPromisified } from "./execPromisified.js";
import { Validator } from "./Validator.js";

export class PyShaclValidator extends Validator {
  private pyShaclFilePath: string;

  private constructor({
    pyShaclFilePath,
    ...superParameters
  }: { pyShaclFilePath: string } & ConstructorParameters<typeof Validator>[0]) {
    super(superParameters);
    this.pyShaclFilePath = pyShaclFilePath;
  }

  static async create({
    logger = nopLogger,
    prefixMap,
    shapesGraph,
  }: {
    logger?: Logger;
    prefixMap?: PrefixMap;
    shapesGraph: DatasetCore;
  }): Promise<Either<Error, Maybe<PyShaclValidator>>> {
    return EitherAsync(async () => {
      const pyShaclFilePath = await which("pyshacl", { nothrow: true });
      if (pyShaclFilePath === null) {
        return Maybe.empty();
      }
      return Maybe.of(
        new PyShaclValidator({
          prefixMap,
          pyShaclFilePath,
          logger,
          shapesGraph,
        }),
      );
    });
  }

  override async validate(
    dataGraph: DatasetCore,
  ): Promise<Either<Error, ValidationReport>> {
    return EitherAsync(
      async ({ liftEither }) =>
        await tmp.withDir(
          async ({ path: tmpDirectoryPath }) => {
            const dataGraphFilePath = path.join(tmpDirectoryPath, "data.ttl");

            this.logger.debug("writing data graph to %s", dataGraphFilePath);
            await fs.writeFile(
              dataGraphFilePath,
              await liftEither(
                await serialize(dataGraph, {
                  format: "text/turtle",
                  prefixes: this.prefixMap,
                }),
              ),
            );
            this.logger.debug("wrote data graph to %s", dataGraphFilePath);

            const shapesGraphFilePath = path.join(
              tmpDirectoryPath,
              "shapes.ttl",
            );
            this.logger.debug(
              "writing shapes graph to %s",
              shapesGraphFilePath,
            );
            await fs.writeFile(
              shapesGraphFilePath,
              await liftEither(
                await serialize(this.shapesGraph, {
                  format: "text/turtle",
                  prefixes: this.prefixMap,
                }),
              ),
            );
            this.logger.debug("wrote shapes graph to %s", shapesGraphFilePath);

            const args = [
              "-f",
              "turtle",
              "-s",
              shapesGraphFilePath,
              dataGraphFilePath,
            ];
            this.logger.debug("validating with pyshacl (args=%s)", args);
            const { code, stdout } = await execPromisified(
              this.pyShaclFilePath,
              args,
            );
            this.logger.debug(
              "validated with pyshacl: %s",
              code === 0 ? "conforms" : "does not conform",
            );

            const validationReportDataset = datasetFactory.dataset(
              await getStreamAsArray(
                parsers({ dataFactory }).import(
                  "text/turtle",
                  Readable.from(stdout),
                ) as Readable,
              ),
            );

            for (const rdfTypeQuad of validationReportDataset.match(
              null,
              null,
              ValidationReport.schema.fromRdfType,
            )) {
              return await liftEither(
                ValidationReport.fromRdfResource(
                  new ResourceSet({
                    dataFactory,
                    dataset: validationReportDataset,
                  }).resource(rdfTypeQuad.subject),
                ),
              );
            }
            throw new Error(
              "unable to parse validation report from pySHACL shacl output",
            );
          },
          {
            unsafeCleanup: true,
          },
        ),
    );
  }
}
