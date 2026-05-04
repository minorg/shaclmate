import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import Serializer from "@rdfjs/serializer-turtle";
import { type Either, EitherAsync } from "purify-ts";
import SHACLValidator from "rdf-validate-shacl";
import * as tmp from "tmp-promise";
import which from "which";
import { logger } from "../logger.js";
import { parseInputs } from "./parseInputs.js";

function execFileStreaming(
  cmd: string,
  args: string[],
): Promise<number | null> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("close", (code) => {
      resolve(code);
    });
  });
}

export async function validate({
  dataGraphPaths,
  shapesGraphPaths,
}: {
  dataGraphPaths: readonly string[];
  shapesGraphPaths: readonly string[];
}): Promise<Either<Error, void>> {
  return EitherAsync(async ({ liftEither }) => {
    const { dataset: dataGraphDataset, prefixMap: dataGraphPrefixMap } =
      await liftEither(await parseInputs(dataGraphPaths));
    if (dataGraphDataset.size === 0) {
      throw new Error("data graph is empty!");
    }
    logger.info("data graph size: %d", dataGraphDataset.size);

    const { dataset: shapesGraphDataset } = await liftEither(
      await parseInputs(shapesGraphPaths),
    );
    if (shapesGraphDataset.size === 0) {
      throw new Error("shapes graph is empty!");
    }
    logger.info("shapes graph size: %d", shapesGraphDataset.size);

    const serializer = new Serializer({
      prefixes: dataGraphPrefixMap,
    });

    logger.info("validating with rdf-shacl-validate");
    const validationReport = await new SHACLValidator(
      shapesGraphDataset,
      {},
    ).validate(dataGraphDataset);
    if (validationReport.conforms) {
      logger.info("validated with rdf-shacl-validate: conforms");
    } else {
      logger.info("validated with rdf-shacl-validate: does not conform");
      process.stderr.write(serializer.transform(validationReport.dataset));
      return;
    }

    const jenaShaclFilePath = await which("shacl", { nothrow: true });
    const pyshaclFilePath = await which("pyshacl", { nothrow: true });

    if (jenaShaclFilePath === null && pyshaclFilePath === null) {
      logger.debug("neither Jena nor pyshacl found on PATH");
      return;
    }

    await tmp.withDir(
      async ({ path: tmpDirectoryPath }) => {
        const dataGraphFilePath = path.join(tmpDirectoryPath, "data.ttl");
        logger.debug("writing data graph to %s", dataGraphFilePath);
        await fs.writeFile(
          dataGraphFilePath,
          serializer.transform(dataGraphDataset),
        );
        logger.debug("wrote data graph to %s", dataGraphFilePath);

        const shapesGraphFilePath = path.join(tmpDirectoryPath, "shapes.ttl");
        logger.debug("writing shapes graph to %s", shapesGraphFilePath);
        await fs.writeFile(
          shapesGraphFilePath,
          serializer.transform(shapesGraphDataset),
        );
        logger.debug("wrote shapes graph to %s", shapesGraphFilePath);

        if (jenaShaclFilePath !== null) {
          const args = [
            "validate",
            "--data",
            dataGraphFilePath,
            "--shapes",
            shapesGraphFilePath,
          ];
          logger.info("validating with Jena (args=%s)", args);
          const code = await execFileStreaming(jenaShaclFilePath, args);
          logger.info(
            "validated with Jena: %s",
            code === 0 ? "conforms" : "does not conform",
          );
          if (code !== 0) {
            return;
          }
        } else {
          logger.info("Jena not found on PATH, skipping");
        }

        if (pyshaclFilePath !== null) {
          const args = ["-s", shapesGraphFilePath, dataGraphFilePath];
          logger.info("validating with pyshacl (args=%s)", args);
          const code = await execFileStreaming(pyshaclFilePath, args);
          logger.info(
            "validated with pyshacl: %s",
            code === 0 ? "conforms" : "does not conform",
          );
          if (code !== 0) {
            return;
          }
        } else {
          logger.info("pyshacl not found on PATH, skipping");
        }
      },
      {
        unsafeCleanup: true,
      },
    );
  });
}
