import { Core, TokenType } from '../common';

describe('Core general tests', () => {
    const tml = Core.parse('html(param1){}');

    test('The return type should be an Array', () => {
        expect(tml).toBeInstanceOf(Array);
    });

    test('1st element should be an object', () => {
        expect(tml[0]).toBeInstanceOf(Object);
    });

    test('1st element should be an Core.Element', () => {
        expect(tml[0]).toBeInstanceOf(Core.Element);
    });

    test('The element should contain the tag "html"', () => {
        expect((tml[0] as Core.Element).tag.text).toBe('html');
    });

    test('1st element should contain a param', () => {
        expect((tml[0] as Core.Element).params.length).toBe(1);
    });

    test('The param should be "param1"', () => {
        expect((tml[0] as Core.Element).params[0].text).toBe('param1');
    });

    test('The code should be undefined', () => {
        expect((tml[0] as Core.Element).children).toBe(undefined);
    });

});

describe('Intensive tests', () => {
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

    test('1st item should be instance of Core.Raw', () => {
        expect(tml[0]).toBeInstanceOf(Core.Raw);
    });

    test('1st item text should the correct string', () => {
        expect((tml[0] as Core.Raw).toString().trim()).toBe('This is a raw content');
    });

    test('2nd item should be instance of Core.Element', () => {
        expect(tml[1]).toBeInstanceOf(Core.Element);
    });

    test('2nd item tag should be "html"', () => {
        expect((tml[1] as Core.Element).tag.text).toBe('html');
    });

    test('2nd item tag should has 3 children', () => {
        expect((tml[1] as Core.Element).children!.length).toBe(3);
    });

    test('1st child of 2nd item should be instance of Core.Raw', () => {
        expect((tml[1] as Core.Element).children![0]).toBeInstanceOf(Core.Raw);
    });

    test('2nd child of 2nd item should be instance of Core.Element', () => {
        expect((tml[1] as Core.Element).children![1]).toBeInstanceOf(Core.Element);
    });

    test('3rd child of 2nd item should be instance of Core.Raw', () => {
        expect((tml[1] as Core.Element).children![2]).toBeInstanceOf(Core.Raw);
    });

    test('Params of 2nd child of 2nd item should be \'lang="es"\'', () => {
        expect((((tml[1] as Core.Element).children![1]) as Core.Element).paramsToString()).toBe('lang="es"');
    });

    test('"title" element should contain "Hola Mundo" raw content', () => {
        // console.log(title);
        expect((title.children![0] as Core.Raw).toString().trim()).toBe('Hola Mundo');
    });
});

describe('Comment tests', () => {
    const tml = Core.parse(`
    [ This is a comment {} ]
`);

    test('2nd item should be instance of Core.Comment', () => {
        expect(tml[1]).toBeInstanceOf(Core.Comment);
    });

    test('2nd item should contain the correct text', () => {
        expect(tml[1].get<Core.Comment>().toString().trim()).toBe('This is a comment {}');
    });
});

describe('Escape tests', () => {
    const tml = Core.parse("\\{All this content should be raw\\}[qw\\d{qw}}d { \"q\"wd]\\[dark Content!!!\\]");

    test('1st item should be instance of Core.Raw', () => {
        expect(tml[0]).toBeInstanceOf(Core.Raw);
    });

    test('1st item should contain the correct text', () => {
        expect(tml[0].get<Core.Comment>().toString().trim()).toBe('{All this content should be raw}');
    });

    test('2nd item should be instance of Core.Comment', () => {
        expect(tml[1]).toBeInstanceOf(Core.Comment);
    });

    test('2nd item should contain the correct text', () => {
        expect(tml[1].get<Core.Comment>().toString()).toBe('qw\\d{qw}}d { \"q\"wd');
    });

    test('3rd item should be instance of Core.Raw', () => {
        expect(tml[2]).toBeInstanceOf(Core.Raw);
    });

    test('3rd item should contain the correct text', () => {
        expect(tml[2].get<Core.Comment>().toString()).toBe('[dark Content!!!]');
    });

});

describe('Errors', () => {
    const errors = ['{', '}', '[', ']', 'html([]){}', 'html({}){}', '"', 'html{this is raw or should be;p{adsad} is a code}}'];

    test('All code examples should be throw error', () => {
        for (let i = 0; i < errors.length; i++)
            expect(() => Core.parse(errors[i])).toThrowError();
    });
});

describe('Short syntax', () => {
    const tml = Core.parse(`
    hr;
    hr;head{Code}
`);

    test('1st hr should be an element', () => {
        const hr = tml[1];

        expect(hr).toBeInstanceOf(Core.Element);
    });

    test('Get raw content should be correctly parsed', () => {
        const hr = tml[2];

        expect(hr).toBeInstanceOf(Core.Raw);
        expect(hr.get<Core.Raw>().tokens!.at(-1)?.text).toBe('hr');
    });

    test('Get raw content should be correctly parsed', () => {
        const head = tml[3];

        expect(head).toBeInstanceOf(Core.Element);
        expect(head.get<Core.Element>().children!.length).toBeGreaterThanOrEqual(1);
    });
});

describe('Code elements test', () => {
    const tml = Core.parse('{qwijdbqwjdbqwjkdqw} html{raw content}');

    test('1st element should be instance of Core.Code', () => {
        expect(tml[0]).toBeInstanceOf(Core.Code);
    });

    test('1st element should contain "qwijdbqwjdbqwjkdqw"', () => {
        expect(tml[0].toString()).toBe('qwijdbqwjdbqwjkdqw');
    });

    test('2nd element should be type space', () => {
        expect(tml[1].tokens![0].type).toBe(TokenType.SPACE);
    });

    test('3rd element should be instance of Core.Element', () => {
        expect(tml[2]).toBeInstanceOf(Core.Element);
    });

    test('3rd element tag should be "html"', () => {
        expect(tml[2].get<Core.Element>().tag.text).toBe('html');
    });

    test('3rd element child should be instance of Core.Raw', () => {
        expect(tml[2].get<Core.Element>().children![0]).toBeInstanceOf(Core.Raw);
    });

    test('3rd element child text should be "raw content"', () => {
        expect(tml[2].get<Core.Element>().children![0].toString()).toBe('raw content');
    });
});
