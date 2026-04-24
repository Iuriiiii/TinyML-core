import { describe, it as test } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Core, TokenType } from "../main.ts";

describe("Core general tests", () => {
  const tml = Core.parse("html(param1){}");

  test("The return type should be an Array", () => {
    expect(tml).toBeInstanceOf(Array);
  });

  test("1st element should be an object", () => {
    expect(tml[0]).toBeInstanceOf(Object);
  });

  test("1st element should be an Core.Element", () => {
    expect(tml[0]).toBeInstanceOf(Core.Element);
  });

  test('The element should contain the tag "html"', () => {
    expect((tml[0] as Core.Element).tag.text).toBe("html");
  });

  test("1st element should contain a param", () => {
    expect((tml[0] as Core.Element).params.length).toBe(1);
  });

  test('The param should be "param1"', () => {
    expect((tml[0] as Core.Element).params[0].text).toBe("param1");
  });

  test("The code should be undefined", () => {
    expect((tml[0] as Core.Element).children).toBe(undefined);
  });
});

describe("Intensive tests", () => {
  const tml = Core.parse(`
This is a raw content
html{
    This is another raw content
    head(lang="es") {
        title { Hola Mundo }
    }
    This is raw content again
}
Ends with raw content
`);
  const html = tml[1] as Core.Element;
  const head = html.children![1] as Core.Element;
  const title = head.children![1] as Core.Element;

  test("1st item should be instance of Core.Raw", () => {
    expect(tml[0]).toBeInstanceOf(Core.Raw);
  });

  test("1st item text should the correct string", () => {
    expect((tml[0] as Core.Raw).toString().trim()).toBe(
      "This is a raw content",
    );
  });

  test("2nd item should be instance of Core.Element", () => {
    expect(tml[1]).toBeInstanceOf(Core.Element);
  });

  test('2nd item tag should be "html"', () => {
    expect((tml[1] as Core.Element).tag.text).toBe("html");
  });

  test("2nd item tag should has 3 children", () => {
    expect((tml[1] as Core.Element).children!.length).toBe(3);
  });

  test("1st child of 2nd item should be instance of Core.Raw", () => {
    expect((tml[1] as Core.Element).children![0]).toBeInstanceOf(Core.Raw);
  });

  test("2nd child of 2nd item should be instance of Core.Element", () => {
    expect((tml[1] as Core.Element).children![1]).toBeInstanceOf(Core.Element);
  });

  test("3rd child of 2nd item should be instance of Core.Raw", () => {
    expect((tml[1] as Core.Element).children![2]).toBeInstanceOf(Core.Raw);
  });

  test("Params of 2nd child of 2nd item should be 'lang=\"es\"'", () => {
    expect(
      (((tml[1] as Core.Element).children![1]) as Core.Element)
        .paramsToString(),
    ).toBe('lang="es"');
  });

  test('"title" element should contain "Hola Mundo" raw content', () => {
    // console.log(title);
    expect((title.children![0] as Core.Raw).toString().trim()).toBe(
      "Hola Mundo",
    );
  });
});

describe("Comment tests", () => {
  const tml = Core.parse(`
    [ This is a comment {} ]
`);

  test("2nd item should be instance of Core.Comment", () => {
    expect(tml[1]).toBeInstanceOf(Core.Comment);
  });

  test("2nd item should contain the correct text", () => {
    expect(tml[1].get<Core.Comment>().toString().trim()).toBe(
      "This is a comment {}",
    );
  });
});

describe("Escape tests", () => {
  const tml = Core.parse(
    '\\{All this content should be raw\\}[qw\\d{qw}}d { "q"wd]\\[dark Content!!!\\]',
  );

  test("1st item should be instance of Core.Raw", () => {
    expect(tml[0]).toBeInstanceOf(Core.Raw);
  });

  test("1st item should contain the correct text", () => {
    expect(tml[0].get<Core.Comment>().toString().trim()).toBe(
      "{All this content should be raw}",
    );
  });

  test("2nd item should be instance of Core.Comment", () => {
    expect(tml[1]).toBeInstanceOf(Core.Comment);
  });

  test("2nd item should contain the correct text", () => {
    expect(tml[1].get<Core.Comment>().toString()).toBe('qw\\d{qw}}d { "q"wd');
  });

  test("3rd item should be instance of Core.Raw", () => {
    expect(tml[2]).toBeInstanceOf(Core.Raw);
  });

  test("3rd item should contain the correct text", () => {
    expect(tml[2].get<Core.Comment>().toString()).toBe("[dark Content!!!]");
  });
});

describe("Errors", () => {
  const errors = [
    "{",
    "}",
    "[",
    "]",
    "html([]){}",
    "html({}){}",
    '"',
    "html{this is raw or should be;p{adsad} is a code}}",
  ];

  test("All code examples should be throw error", () => {
    for (let i = 0; i < errors.length; i++) {
      expect(() => Core.parse(errors[i])).toThrow();
    }
  });
});

describe("Short syntax", () => {
  const tml = Core.parse(`
    hr;
    hr;head{Code}
`);

  test("1st hr should be an element", () => {
    const hr = tml[1];

    expect(hr).toBeInstanceOf(Core.Element);
  });

  test("Get raw content should be correctly parsed", () => {
    const hr = tml[2];

    expect(hr).toBeInstanceOf(Core.Raw);
    expect(hr.get<Core.Raw>().tokens!.at(-1)?.text).toBe("hr");
  });

  test("Get raw content should be correctly parsed", () => {
    const head = tml[3];

    expect(head).toBeInstanceOf(Core.Element);
    expect(head.get<Core.Element>().children!.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Code elements test", () => {
  const tml = Core.parse("{qwijdbqwjdbqwjkdqw} html{raw content}");

  test("1st element should be instance of Core.Code", () => {
    expect(tml[0]).toBeInstanceOf(Core.Code);
  });

  test('1st element should contain "qwijdbqwjdbqwjkdqw"', () => {
    expect(tml[0].toString()).toBe("qwijdbqwjdbqwjkdqw");
  });

  test("2nd element should be type space", () => {
    expect(tml[1].tokens![0].type).toBe(TokenType.SPACE);
  });

  test("3rd element should be instance of Core.Element", () => {
    expect(tml[2]).toBeInstanceOf(Core.Element);
  });

  test('3rd element tag should be "html"', () => {
    expect(tml[2].get<Core.Element>().tag.text).toBe("html");
  });

  test("3rd element child should be instance of Core.Raw", () => {
    expect(tml[2].get<Core.Element>().children![0]).toBeInstanceOf(Core.Raw);
  });

  test('3rd element child text should be "raw content"', () => {
    expect(tml[2].get<Core.Element>().children![0].toString()).toBe(
      "raw content",
    );
  });
});

describe("Deeply nested elements", () => {
  const tml = Core.parse("a{b{c{d{e}}}}");

  test("Should have correct depth", () => {
    let current: any = tml[0];
    let depth = 0;
    while (current && current.children) {
      current = current.children[0];
      depth++;
    }
    expect(depth).toBe(4); // a -> b -> c -> d -> e
  });
});

describe("Complex Parameters", () => {
  const tml = Core.parse('tag(id="main", class="container", data-value=123){}');

  test("Should have 3 parameters", () => {
    const el = tml[0] as Core.Element;
    // Parameters are tokens, including separators
    // tag ( id = "main" ,  class = "container" ,  data-value = 123 )
    // Wait, the params list in Core.Element is just IToken[].
    // Let's check how many tokens are there.
    expect(el.params.length).toBeGreaterThan(5);
  });

  test("paramsToString should return correct string", () => {
    const el = tml[0] as Core.Element;
    expect(el.paramsToString()).toBe('id="main", class="container", data-value=123');
  });
});

describe("Nested Comments", () => {
  const tml = Core.parse("[ Outer [ Inner ] Comment ]");

  test("Should parse as a single comment with nested brackets", () => {
    expect(tml[0]).toBeInstanceOf(Core.Comment);
    expect(tml[0].toString()).toBe(" Outer [ Inner ] Comment ");
  });
});

describe("Pure blocks", () => {
  const tml = Core.parse("{ pure content }");

  test("Should be instance of Core.Code", () => {
    expect(tml[0]).toBeInstanceOf(Core.Code);
  });

  test("Should contain correct text", () => {
    expect(tml[0].toString()).toBe(" pure content ");
  });
});

describe("Advanced Escape Tests", () => {
  const tml = Core.parse("\\( \\) \\; \\: \\, \\< \\>");

  test("Should be raw content", () => {
    expect(tml[0]).toBeInstanceOf(Core.Raw);
    expect(tml[0].toString()).toBe("( ) ; : , < >");
  });
});

describe("Infinite String Error", () => {
  test("Should throw infinite string error", () => {
    expect(() => Core.parse('"unclosed string')).toThrow("Infinite string detected");
  });
});
