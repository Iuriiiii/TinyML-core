import { describe, it as test } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Core } from "../src/core.ts";

describe("Raw code blocks {{{ }}}", () => {
  test("Should parse raw code with nested braces", () => {
    const tml = Core.parse("{{{ { nested } }}}");
    expect(tml.length).toBe(1);
    expect(tml[0]).toBeInstanceOf(Core.Code);
    expect(tml[0].toString()).toBe(" { nested } ");
  });

  test("Should parse multiple raw code blocks", () => {
    const tml = Core.parse("{{{ code1 }}} text {{{ code2 }}}");
    expect(tml.length).toBe(3);
    expect(tml[0]).toBeInstanceOf(Core.Code);
    expect(tml[0].toString()).toBe(" code1 ");
    expect(tml[1]).toBeInstanceOf(Core.Raw);
    expect(tml[1].toString()).toBe(" text ");
    expect(tml[2]).toBeInstanceOf(Core.Code);
    expect(tml[2].toString()).toBe(" code2 ");
  });

  test("Should work inside elements", () => {
    const tml = Core.parse("div { {{{ raw { } code }}} }");
    expect(tml.length).toBe(1);
    const div = tml[0] as Core.Element;
    expect(div.children![1]).toBeInstanceOf(Core.Code);
    expect(div.children![1].toString()).toBe(" raw { } code ");
  });

  test("Should throw error on unclosed raw code block", () => {
    expect(() => Core.parse("{{{ unclosed")).toThrow("Raw code closure expected");
  });

  test("Should handle empty raw code block", () => {
    const tml = Core.parse("{{{}}}");
    expect(tml.length).toBe(1);
    expect(tml[0]).toBeInstanceOf(Core.Code);
    expect(tml[0].toString()).toBe("");
  });
  
  test("Should treat {{{ as raw text inside comments", () => {
    const tml = Core.parse("[ comment with {{{ ]");
    expect(tml.length).toBe(1);
    expect(tml[0]).toBeInstanceOf(Core.Comment);
    expect(tml[0].toString()).toBe(" comment with {{{ ");
  });
});
