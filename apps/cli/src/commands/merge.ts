import fs from "node:fs";
import { Readable } from "node:stream";
import serializers from "@rdfx/serializers";
import { type Either, EitherAsync } from "purify-ts";
import { parseInputs } from "../parseInputs.js";

export async function merge({
  inputPaths,
  outputFilePath,
  outputFormat,
}: {
  inputPaths: readonly string[];
  outputFilePath: string;
  outputFormat: string;
}): Promise<Either<Error, void>> {
  return EitherAsync(async ({ liftEither }) => {
    const { dataset, prefixMap } = await liftEither(
      await parseInputs(inputPaths),
    );

    const outputStream = serializers({
      prefixes: prefixMap,
      rdfjs: { module: "ts" },
    }).import(outputFormat, Readable.from([...dataset])) as Readable | null;
    if (outputStream === null) {
      throw new RangeError(`invalid output format: ${outputFormat}`);
    }

    if (outputFilePath.length === 0) {
      outputStream.pipe(process.stdout);
    } else {
      outputStream.pipe(fs.createWriteStream(outputFilePath));
    }
  });
}
