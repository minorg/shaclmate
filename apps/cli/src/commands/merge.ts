import fs from "node:fs";
import Serializer from "@rdfjs/serializer-turtle";
import { type Either, EitherAsync } from "purify-ts";
import { parseInputs } from "./parseInputs.js";

export async function merge({
  inputPaths,
  outputFilePath,
}: {
  inputPaths: readonly string[];
  outputFilePath: string;
}): Promise<Either<Error, void>> {
  return EitherAsync(async ({ liftEither }) => {
    const { dataset, prefixMap } = await liftEither(
      await parseInputs(inputPaths),
    );

    const output = new Serializer({ prefixes: prefixMap }).transform(dataset);

    if (outputFilePath.length === 0) {
      process.stdout.write(output);
    } else {
      await fs.promises.writeFile(outputFilePath, output);
    }
  });
}
