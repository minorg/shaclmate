import { ConsoleLogger } from "@rdfx/logger";
import { EitherAsync, Maybe } from "purify-ts";
import {
  type ExampleService,
  ExampleServiceHttpApi,
  ForbiddenError,
  LoggingExampleService,
  PaymentRequiredError,
} from "./rest.shaclmate.js";

const logger = new ConsoleLogger("info");

const service: ExampleService = new LoggingExampleService({
  delegate: {
    async get({ identifier }) {
      return EitherAsync(async ({ throwE }) => {
        switch (identifier.value) {
          case "http://example.com/ForbiddenError":
            throwE(ForbiddenError.createUnsafe({ detail: "forbidden" }));
            break;
          case "http://example.com/PaymentRequiredError":
            throwE(
              PaymentRequiredError.createUnsafe({
                detail: "payment required",
              }),
            );
            break;
        }

        return Maybe.of({
          result: identifier.value,
        });
      });
    },
  },
  logger,
});

const serviceHttpApi = ExampleServiceHttpApi.create(service, { logger });

// Export the Hono API as the default so bun run picks it up.
export default serviceHttpApi;
