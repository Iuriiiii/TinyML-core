import { Tokenizer, TokenType } from '../common';

describe('Return Types', () => {
    test('Tokenizer should return an array', () => {
        expect(Tokenizer.tokenizate('')).toBeInstanceOf(Array);
    });

    test('The array should contain objects', () => {
        expect(Tokenizer.tokenizate('')[0]).toBeInstanceOf(Object);
    });
});

describe('Token Tests', () => {
    const tokens = Tokenizer.tokenizate('{"hola mundo"} How are you');

    test('1st token should be a separator', () => {
        expect(tokens[0].type).toBe(TokenType.SEPARATOR);
    });

    test('2nd token should be a string', () => {
        expect(tokens[1].type).toBe(TokenType.STRING);
    });
    
    test('3rd token should be a string', () => {
        expect(tokens[2].type).toBe(TokenType.SEPARATOR);
    });

    
    test('4th token should be a space', () => {
        expect(tokens[3].type).toBe(TokenType.SPACE);
    });
    
    test('5th token should be a identifier', () => {
        expect(tokens[4].type).toBe(TokenType.IDENTIFIER);
    });
});


describe('Token Types', () => {
    test('Tokenizer should return just an eof token', () => {
        expect(Tokenizer.tokenizate('')[0].type === TokenType.EOF).toBe(true);
    });

    test('Tokenizer should return just an number token', () => {
        expect(Tokenizer.tokenizate('1')[0].type === TokenType.NUMBER).toBe(true);
    });

    test('Tokenizer should return just an identifier token', () => {
        expect(Tokenizer.tokenizate('a')[0].type === TokenType.IDENTIFIER).toBe(true);
    });

    test('Tokenizer should return just an eol token', () => {
        expect(Tokenizer.tokenizate('\n')[0].type === TokenType.EOL).toBe(true);
    });

    test('Tokenizer should return just an separator token', () => {
        expect(Tokenizer.tokenizate('[')[0].type === TokenType.SEPARATOR).toBe(true);
    });

    test('Tokenizer should return just an operator token', () => {
        expect(Tokenizer.tokenizate('+')[0].type === TokenType.OPERATOR).toBe(true);
    });

    test('Tokenizer should return just an space token', () => {
        expect(Tokenizer.tokenizate('   ')[0].type === TokenType.SPACE).toBe(true);
    });

    test('Tokenizer should return just an string token', () => {
        expect(Tokenizer.tokenizate('"This is a string"')[0].type === TokenType.STRING).toBe(true);
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