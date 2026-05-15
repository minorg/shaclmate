import type { Logger } from "ts-log";
import { Imports } from "./Imports.js";
import { Snippets } from "./Snippets.js";
import type { TsGenerator } from "./TsGenerator.js";

export class Reusables {
  readonly imports: Imports;
  readonly snippets: Snippets;

  constructor({
    configuration,
    logger,
  }: { configuration: TsGenerator.Configuration; logger: Logger }) {
    this.imports = new Imports();
    this.snippets = new Snippets({
      configuration,
      imports: this.imports,
      logger,
    });
  }
}
