import { ZazukoValidator } from "@shaclmate/validator";
import { JenaValidator } from "@shaclmate/validator/JenaValidator";
import { PyShaclValidator } from "@shaclmate/validator/PyShaclValidator";
import { type Either, EitherAsync } from "purify-ts";
import { logger } from "../logger.js";
import { parseInputs } from "../parseInputs.js";

export async function validate({
  dataGraphPaths,
  shapesGraphPaths,
}: {
  dataGraphPaths: readonly string[];
  shapesGraphPaths: readonly string[];
}): Promise<Either<Error, void>> {
  return EitherAsync(async ({ liftEither }) => {
    const { dataset: dataGraph, prefixMap } = await liftEither(
      await parseInputs(dataGraphPaths),
    );
    if (dataGraph.size === 0) {
      throw new Error("data graph is empty!");
    }
    logger.debug("data graph size: %d", dataGraph.size);

    const { dataset: shapesGraph } = await liftEither(
      await parseInputs(shapesGraphPaths),
    );
    if (shapesGraph.size === 0) {
      throw new Error("shapes graph is empty!");
    }
    logger.debug("shapes graph size: %d", shapesGraph.size);

    for (const [validatorId, validator] of Object.entries({
      zazuko: new ZazukoValidator({ logger, prefixMap, shapesGraph }),
      jena: (
        await liftEither(
          await JenaValidator.create({ logger, prefixMap, shapesGraph }),
        )
      ).extractNullable(),
      pyshacl: (
        await liftEither(
          await PyShaclValidator.create({ logger, prefixMap, shapesGraph }),
        )
      ).extractNullable(),
    })) {
      if (validator === null) {
        continue;
      }

      logger.debug("validating with %s", validatorId);
      const validationReport = await liftEither(
        await validator.validate(dataGraph),
      );
      if (!validationReport.conforms) {
        logger.warn(validationReport.toString());
        process.exit(1);
      }
      logger.info("validated with %s", validatorId);
    }
  });
}
