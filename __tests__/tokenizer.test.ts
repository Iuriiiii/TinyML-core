import { Tokenizer, TokenType } from '../common';

describe('Return Types', () => {
    test('Tokenizer should return an array', () => {
        expect(Tokenizer.tokenizate('')).toBeInstanceOf(Array);
    });

    test('The array should contain objects', () => {
        expect(Tokenizer.tokenizate('')[0]).toBeInstanceOf(Object);
    });
});


describe('Token Types', () => {
    test('Tokenizer should return just an eof token', () => {
        expect(Tokenizer.tokenizate('')[0].type === TokenType.eof).toBe(true);
    });

    test('Tokenizer should return just an number token', () => {
        expect(Tokenizer.tokenizate('1')[0].type === TokenType.number).toBe(true);
    });

    test('Tokenizer should return just an identifier token', () => {
        expect(Tokenizer.tokenizate('a')[0].type === TokenType.identifier).toBe(true);
    });

    test('Tokenizer should return just an eol token', () => {
        expect(Tokenizer.tokenizate('\n')[0].type === TokenType.eol).toBe(true);
    });

    test('Tokenizer should return just an separator token', () => {
        expect(Tokenizer.tokenizate('[')[0].type === TokenType.separator).toBe(true);
    });

    test('Tokenizer should return just an operator token', () => {
        expect(Tokenizer.tokenizate('+')[0].type === TokenType.operator).toBe(true);
    });

    test('Tokenizer should return just an space token', () => {
        expect(Tokenizer.tokenizate('   ')[0].type === TokenType.space).toBe(true);
    });

    test('Tokenizer should return just an string token', () => {
        expect(Tokenizer.tokenizate('"This is a string"')[0].type === TokenType.string).toBe(true);
    });
});


describe('Token Positions', () => {
    const tokens = Tokenizer.tokenizate(` sabdsad qdw  dqw\n\r     5   `);

    test('The position of the number should be 2:7', () => {
        expect(tokens[8].pos.y).toBe(2);
        expect(tokens[8].pos.x).toBe(8);
    });

    test('The position of the first identifier should be 1:2', () => {
        expect(tokens[1].pos.y).toBe(1);
        expect(tokens[1].pos.x).toBe(2);
    });

    test('The position of the second space should be 1:9', () => {
        expect(tokens[2].pos.y).toBe(1);
        expect(tokens[2].pos.x).toBe(9);
    });

});