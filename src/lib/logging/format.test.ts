import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { serializeError, formatLog, LOG_LEVEL_NUM } from "@/lib/logging/format";

describe("serializeError", () => {
  it("serializes an Error instance with type, message, and stack", () => {
    const err = new Error("something broke");
    const result = serializeError(err) as Record<string, unknown>;
    expect(result.type).toBe("Error");
    expect(result.message).toBe("something broke");
    expect(result.stack).toBeDefined();
    expect(typeof result.stack).toBe("string");
  });

  it("preserves error name for custom Error subclasses", () => {
    class CustomError extends Error {
      constructor(msg: string) {
        super(msg);
        this.name = "CustomError";
      }
    }
    const err = new CustomError("custom fail");
    const result = serializeError(err) as Record<string, unknown>;
    expect(result.type).toBe("CustomError");
    expect(result.message).toBe("custom fail");
  });

  it("includes code property when present on Error", () => {
    const err = new Error("not found") as Error & { code: string };
    err.code = "ENOENT";
    const result = serializeError(err) as Record<string, unknown>;
    expect(result.code).toBe("ENOENT");
  });

  it("recursively serializes error.cause", () => {
    const cause = new Error("root cause");
    const err = new Error("wrapper", { cause });
    const result = serializeError(err) as Record<string, unknown>;
    expect(result.cause).toBeDefined();
    const serializedCause = result.cause as Record<string, unknown>;
    expect(serializedCause.type).toBe("Error");
    expect(serializedCause.message).toBe("root cause");
  });

  it("does not include cause when it is null or undefined", () => {
    const err = new Error("no cause");
    const result = serializeError(err) as Record<string, unknown>;
    expect(result).not.toHaveProperty("cause");
  });

  it("serializes error-like plain objects (has message or stack)", () => {
    const errLike = { name: "TypeError", message: "bad type", stack: "at ..." };
    const result = serializeError(errLike) as Record<string, unknown>;
    expect(result.type).toBe("TypeError");
    expect(result.message).toBe("bad type");
    expect(result.stack).toBe("at ...");
  });

  it("defaults type to Error for plain objects without name", () => {
    const errLike = { message: "oops" };
    const result = serializeError(errLike) as Record<string, unknown>;
    expect(result.type).toBe("Error");
    expect(result.message).toBe("oops");
  });

  it("passes through plain objects without message/stack untouched", () => {
    const obj = { foo: "bar", count: 42 };
    expect(serializeError(obj)).toBe(obj);
  });

  it("passes through primitives untouched", () => {
    expect(serializeError("string error")).toBe("string error");
    expect(serializeError(42)).toBe(42);
    expect(serializeError(null)).toBe(null);
    expect(serializeError(undefined)).toBe(undefined);
    expect(serializeError(true)).toBe(true);
  });
});

describe("formatLog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("produces valid JSON with required fields", () => {
    const output = formatLog("info", "server started");
    const parsed = JSON.parse(output);
    expect(parsed.level).toBe(LOG_LEVEL_NUM.info);
    expect(parsed.time).toBe(Date.now());
    expect(parsed.service).toBe("app");
    expect(parsed.msg).toBe("server started");
  });

  it("uses numeric level values matching LOG_LEVEL_NUM", () => {
    for (const [level, num] of Object.entries(LOG_LEVEL_NUM)) {
      const parsed = JSON.parse(formatLog(level as any, "test"));
      expect(parsed.level).toBe(num);
    }
  });

  it("includes service and environment from options", () => {
    const output = formatLog("warn", "disk low", undefined, {
      service: "FS-Public",
      environment: "production",
    });
    const parsed = JSON.parse(output);
    expect(parsed.service).toBe("FS-Public");
    expect(parsed.environment).toBe("production");
  });

  it("includes requestId when provided in options", () => {
    const output = formatLog("debug", "trace", undefined, {
      service: "svc",
      requestId: "req-abc-123",
    });
    const parsed = JSON.parse(output);
    expect(parsed.requestId).toBe("req-abc-123");
  });

  it("omits requestId when not provided", () => {
    const output = formatLog("info", "test");
    const parsed = JSON.parse(output);
    expect(parsed).not.toHaveProperty("requestId");
  });

  it("flattens meta fields into the payload", () => {
    const output = formatLog("info", "order placed", {
      orderId: "ord-1",
      amount: 50_000,
    });
    const parsed = JSON.parse(output);
    expect(parsed.orderId).toBe("ord-1");
    expect(parsed.amount).toBe(50_000);
  });

  it("renames meta 'error' key to 'err' and serializes Error instances", () => {
    const err = new Error("boom");
    const output = formatLog("error", "fail", { error: err });
    const parsed = JSON.parse(output);
    expect(parsed.err).toBeDefined();
    expect(parsed.err.type).toBe("Error");
    expect(parsed.err.message).toBe("boom");
    // 'error' key should NOT appear
    expect(parsed).not.toHaveProperty("error");
  });

  it("serializes Error instances in other meta keys too", () => {
    const err = new TypeError("bad type");
    const output = formatLog("error", "fail", { cause: err });
    const parsed = JSON.parse(output);
    expect(parsed.cause.type).toBe("TypeError");
    expect(parsed.cause.message).toBe("bad type");
  });

  it("skips empty meta objects", () => {
    const output = formatLog("info", "clean", {});
    const parsed = JSON.parse(output);
    expect(Object.keys(parsed)).toEqual(["level", "time", "service", "environment", "msg"]);
  });
});
