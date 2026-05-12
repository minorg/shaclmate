import type { Logger } from "ts-log";
import { Imports } from "./Imports.js";
import { Snippets } from "./Snippets.js";

export class Reusables {
  readonly imports: Imports;
  readonly snippets: Snippets;

  constructor({ logger }: { logger: Logger }) {
    this.imports = new Imports();
    this.snippets = new Snippets({
      imports: this.imports,
      logger,
    });
  }
}
