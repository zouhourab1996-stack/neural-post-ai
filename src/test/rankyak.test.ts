import { describe, expect, it } from "vitest";
import { isConnectionTest, payloadSchema, sameSecret } from "../../supabase/functions/rankyak-webhook/payload";

const input = { event: "article.published", status: "published", article: { id: 42, slug: "new-guide", title: "New guide", html: "<p>Body</p>" } };
describe("RankYak delivery rules", () => {
  it("retains the external numeric ID for updates", () => {
    const result = payloadSchema.parse({ ...input, event: "article.updated" });
    if (result.event === "ping") throw new Error("Expected article");
    expect(result.article.id).toBe(42);
  });
  it("accepts ping without an article", () => expect(isConnectionTest(payloadSchema.parse({ event: "ping" }))).toBe(true));
  it("does not persist the provider connection sample with ID zero", () => expect(isConnectionTest(payloadSchema.parse({ ...input, article: { ...input.article, id: 0 } }))).toBe(true));
  it("accepts draft status for unpublishing", () => {
    const result = payloadSchema.parse({ ...input, status: "draft" });
    if (result.event === "ping") throw new Error("Expected article");
    expect(result.status).toBe("draft");
  });
  it("rejects traversal slugs", () => expect(payloadSchema.safeParse({ ...input, article: { ...input.article, slug: "../admin" } }).success).toBe(false));
  it("rejects unknown publication status", () => expect(payloadSchema.safeParse({ ...input, status: "private" }).success).toBe(false));
  it("rejects missing and different credentials", () => {
    expect(sameSecret(null, "test-only-value")).toBe(false);
    expect(sameSecret("wrong", "test-only-value")).toBe(false);
    expect(sameSecret("test-only-value", "test-only-value")).toBe(true);
  });
});