import { describe, it as test } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Core } from "../main.ts";

describe("TinyML Limits - Deep Nesting", () => {
  test("Should handle 100 levels of nesting", () => {
    const depth = 100;
    let source = "leaf { content }";
    for (let i = 0; i < depth; i++) {
      source = `node${i} { ${source} }`;
    }

    const tml = Core.parse(source);
    expect(tml).toBeInstanceOf(Array);
    expect(tml.length).toBe(1);

    let current: any = tml[0];
    for (let i = depth; i >= 0; i--) {
      expect(current).toBeInstanceOf(Core.Element);
      if (i > 0) {
        expect(current.children).toBeDefined();
        // Find the next element child
        const next = current.children.find((c: any) => c.isElement());
        expect(next).toBeDefined();
        current = next;
      } else {
        expect(current.tag.text).toBe("leaf");
        const contentRaw = current.children.find((c: any) =>
          c.isRaw() && c.toString().trim() === "content"
        );
        expect(contentRaw).toBeDefined();
      }
    }
  });

  test("Should handle 500 levels of nesting (recursion limit test)", () => {
    const depth = 500;
    let source = "a;";
    for (let i = 0; i < depth; i++) {
      source = `n{${source}}`;
    }

    const tml = Core.parse(source);
    expect(tml).toBeInstanceOf(Array);

    let current: any = tml[0];
    for (let i = 0; i < depth; i++) {
      current = current.children[0];
    }
    expect(current.tag.text).toBe("a");
  });
});

describe("TinyML Limits - Large Input", () => {
  test("Should handle large raw text (1MB)", () => {
    const largeString = "a".repeat(1024 * 1024);
    const source = `tag { ${largeString} }`;
    const tml = Core.parse(source);

    const element = tml[0] as Core.Element;
    // Find the raw text that matches our large string (ignoring surrounding spaces)
    const raw = element.children!.find((c) =>
      c.isRaw() && c.toString().trim() === largeString
    ) as Core.Raw;
    expect(raw).toBeDefined();
    expect(raw.toString().trim().length).toBe(largeString.length);
  });

  test("Should handle 10000 sibling elements", () => {
    const count = 10000;
    let source = "";
    for (let i = 0; i < count; i++) {
      source += `item${i}; `;
    }
    const tml = Core.parse(source);
    // Each item; is followed by a space raw token, except maybe the last one if we were careful
    // Actually item0; space item1; space ...
    // result will have many items.
    const elements = tml.filter((i) => i.isElement());
    expect(elements.length).toBe(count);
  });
});

describe("TinyML Limits - Complex Parameters and Escaping", () => {
  test("Should handle complex nested escaping", () => {
    // Escaping separators outside strings
    const source = `tag(p1="val", p2=123) {
            \\[not a comment\\]
            \\{not a code block\\}
            \\\\ [this is a comment]
            \\; [this is another comment]
        }`;
    const tml = Core.parse(source);
    const element = tml[0] as Core.Element;

    const children = element.children!;
    const rawTexts = children.filter((c) => c.isRaw()).map((c) => c.toString());

    expect(rawTexts.some((t) => t.includes("[not a comment]"))).toBe(true);
    expect(rawTexts.some((t) => t.includes("{not a code block}"))).toBe(true);
    expect(children.some((c) => c.isComment())).toBe(true);
  });

  test("Should handle multiple parameters with various separators", () => {
    const source = `tag(a=1, b:2; c=3) { content }`;
    const tml = Core.parse(source);
    const element = tml[0] as Core.Element;
    // params are just tokens, it's up to the consumer to interpret them,
    // but let's check they are all there.
    expect(element.params.length).toBeGreaterThan(5);
  });
});

describe("TinyML Limits - Density and Mixed Content", () => {
  test("Should handle dense mixed content with state reset", () => {
    // The language seems to require a non-identifier to reset the 'last tag' state
    // if we want an unnamed block after a short-syntax element.
    // Using a comma or other separator to reset lastNonSpaceToken
    const source = `a{b; c{d} [e] {f} g} h;, [i], {j}, k`;
    const tml = Core.parse(source);

    const filtered = tml.filter((i) => {
      if (!i.isRaw()) return true;
      const s = i.toString().trim();
      return s !== "" && s !== ",";
    });

    expect(filtered[0]).toBeInstanceOf(Core.Element); // a
    expect(filtered[1]).toBeInstanceOf(Core.Element); // h
    expect(filtered[2]).toBeInstanceOf(Core.Comment); // [i]
    expect(filtered[3]).toBeInstanceOf(Core.Code); // {j}
    expect(filtered[4]).toBeInstanceOf(Core.Raw); // k
  });
});
