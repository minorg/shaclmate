import dataFactory from "@rdfx/data-factory";
import { describe, it } from "vitest";
import {
  ExampleServiceHttpApi,
  ExampleServiceHttpClient,
} from "../src/rest.shaclmate.js";
import { service } from "../src/service.js";

describe("client", () => {
  const api = ExampleServiceHttpApi.create(service);
  const client = new ExampleServiceHttpClient("/", { fetch: api.request });

  it("200 success response", async ({ expect }) => {
    const successResponse = (
      await client.get({
        identifier: dataFactory.namedNode("http://example.com/present"),
      })
    )
      .unsafeCoerce()
      .extract();
    expect(successResponse?.result).toStrictEqual("http://example.com/present");
  });

  it("404 not found response", async ({ expect }) => {
    const notFoundResponse = (
      await client.get({
        identifier: dataFactory.namedNode("http://example.com/absent"),
      })
    )
      .unsafeCoerce()
      .extract();
    expect(notFoundResponse).toBeUndefined();
  });

  it("402 PaymentRequired response", async ({ expect }) => {
    const either = await client.get({
      identifier: dataFactory.namedNode(
        "http://example.com/PaymentRequiredError",
      ),
    });
    expect(either.isLeft()).toStrictEqual(true);
    either.ifLeft((error) => {
      expect(error.$type).toStrictEqual("PaymentRequiredError");
    });
  });

  it("403 ForbiddenError response", async ({ expect }) => {
    const either = await client.get({
      identifier: dataFactory.namedNode("http://example.com/ForbiddenError"),
    });
    expect(either.isLeft()).toStrictEqual(true);
    either.ifLeft((error) => {
      expect(error.$type).toStrictEqual("ForbiddenError");
    });
  });

  it("500 unknown error response", async ({ expect }) => {
    const either = await client.get({
      identifier: dataFactory.namedNode("http://example.com/foo"),
    });
    expect(either.isLeft()).toStrictEqual(true);
    either.ifLeft((error) => {
      expect(error.$type).toStrictEqual("$UnknownError");
    });
  });
});
