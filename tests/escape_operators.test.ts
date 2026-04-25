import { describe, it as test } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Core } from "../src/core.ts";

describe("Operator and Separator Escape Tests", () => {
  test("Should escape operators like +", () => {
    const tml = Core.parse("\\+");
    const firstItem = tml[0];

    expect(firstItem).toBeInstanceOf(Core.Raw);
    expect(firstItem.toString()).toBe("+");
  });

  test("Should escape operators like !", () => {
    const tml = Core.parse("\\!");
    const firstItem = tml[0];

    expect(firstItem).toBeInstanceOf(Core.Raw);
    expect(firstItem.toString()).toBe("!");
  });

  test("Should escape separators like (", () => {
    const tml = Core.parse("\\(");
    const firstItem = tml[0];

    expect(firstItem).toBeInstanceOf(Core.Raw);
    expect(firstItem.toString()).toBe("(");
  });

  test("Should escape separators like {", () => {
    const tml = Core.parse("\\{");
    const firstItem = tml[0];

    expect(firstItem).toBeInstanceOf(Core.Raw);
    expect(firstItem.toString()).toBe("{");
  });

  test("Should escape mixed operators and separators with text", () => {
    const tml = Core.parse("a\\+b\\(c\\)\\{d\\}");
    const firstItem = tml[0];

    expect(firstItem).toBeInstanceOf(Core.Raw);
    expect(firstItem.toString()).toBe("a+b(c){d}");
  });

  test("Should handle escaped backslash", () => {
    // Note: The parser logic for \ might need careful check for double backslash
    // Currently: \ followed by something else.
    // In TinyML, \ escapes the NEXT token if it is a separator or operator.
    // If we want to escape \ itself, it's not explicitly in the current requirement
    // but let's test what happens.
    const tml = Core.parse("\\\\");
    const firstItem = tml[0];
    
    // In the current implementation: 
    // \ is separator. next is \ which is separator. 
    // it escapes \.
    expect(firstItem).toBeInstanceOf(Core.Raw);
    expect(firstItem.toString()).toBe("\\");
  });
});
