const assert = require('assert');
const { compile } = require('../index.js');

describe('Tags', () =>
{
    describe('Tag I', () =>
    {
        it('Tag should be equals to \'html\'', () =>
        {
            assert.equal(compile('html{}')[0].tag, 'html');
        });
    });

    describe('Tag II', () =>
    {
        it('Tag should be equals to \'div\'', () =>
        {
            assert.equal(compile('html{div{Hola Mundo}}')[0].childs[0].tag, 'div');
        });
    });

});

describe('Comments', () =>
{
    describe('Comment I', () =>
    {
        it('Infinite comment error', () =>
        {
            assert.equal(compile('[html{div{Hola Mundo}}').success, false);
        });
    });
});

describe('Content', () =>
{
    describe('Content I', () =>
    {
        it('it should be equals to \'Hola Mundo\'', () =>
        {
            assert.equal(compile('html{div{Hola Mundo}}')[0].childs[0].childs[0], 'Hola Mundo');
        });
    });
});

describe('Properties', () =>
{
    describe('Properties I', () =>
    {
        it('Property \'%tag%\' should be equals to \'h1\'', () =>
        {
            assert.equal(compile('html{%tag%{Hola Mundo}}', {tag: 'h1'})[0].childs[0].tag, 'h1');
        });
    });

    describe('Properties II', () =>
    {
        it('Property \'%tag%\' should be equals parsed correctly as a tag', () =>
        {
            assert.equal(compile('html{%tag%{Hola Mundo}}', {tag: 'h1'})[0].childs[0].childs[0], 'Hola Mundo');
        });
    });
});