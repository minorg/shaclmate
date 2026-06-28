import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import datasetFactory from "@rdfjs/dataset";
import type { DatasetCore } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import parsers from "@rdfx/parsers";
import { ResourceSet } from "@rdfx/resource";
import { TurtleSerializer } from "@rdfx/serializers";
import { ValidationReport } from "@shaclmate/shacl-ast";
import { getStreamAsArray } from "get-stream";
import { type Either, EitherAsync, Maybe } from "purify-ts";
import tmp from "tmp-promise";
import { dummyLogger, type Logger } from "ts-log";
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
    logger = dummyLogger,
    shapesGraph,
  }: {
    logger?: Logger;
    shapesGraph: DatasetCore;
  }): Promise<Either<Error, Maybe<PyShaclValidator>>> {
    return EitherAsync(async () => {
      const pyShaclFilePath = await which("pyshacl", { nothrow: true });
      if (pyShaclFilePath === null) {
        return Maybe.empty();
      }
      return Maybe.of(
        new PyShaclValidator({
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

            const serializer = new TurtleSerializer({
              prefixes: this.prefixMap,
            });

            this.logger.debug("writing data graph to %s", dataGraphFilePath);
            await fs.writeFile(
              dataGraphFilePath,
              serializer.transform(dataGraph),
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
              serializer.transform(this.shapesGraph),
            );
            this.logger.debug("wrote shapes graph to %s", shapesGraphFilePath);

            const args = [
              "-f",
              "turtle",
              "-s",
              shapesGraphFilePath,
              dataGraphFilePath,
            ];
            this.logger.info("validating with pyshacl (args=%s)", args);
            const { code, stdout } = await execPromisified(
              this.pyShaclFilePath,
              args,
            );
            this.logger.info(
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
