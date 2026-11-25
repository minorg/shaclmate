import { EitherAsync, Maybe } from "purify-ts";
import { logger } from "./logger.js";
import {
  type ExampleService,
  ForbiddenError,
  LoggingExampleService,
  PaymentRequiredError,
} from "./rest.shaclmate.js";

export const service: ExampleService = new LoggingExampleService({
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

        if (identifier.value === "http://example.com/present") {
          return Maybe.of({
            result: identifier.value,
          });
        } else if (identifier.value === "http://example.com/absent") {
          return Maybe.empty();
        } else {
          return throwE({
            $type: "$UnknownError",
            error: new Error(`unexpected identifier: ${identifier.value}`),
          });
        }
      });
    },
  },
  logger,
});
