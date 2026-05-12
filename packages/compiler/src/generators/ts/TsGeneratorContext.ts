import type { Logger } from "ts-log";
import type { Imports } from "./Imports.js";
import type { Snippets } from "./Snippets.js";

export abstract class TsGeneratorContext {
  protected abstract readonly imports: Imports;
  protected abstract readonly logger: Logger;
  protected abstract readonly snippets: Snippets;
}
