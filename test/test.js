const assert = require('assert');
const { compile, translate } = require('../index.js');

describe('Return Object', () =>
{
    describe('Return I', () =>
    {
        it('The object should has a \'success\' member with the current status in true', () =>
        {
            assert.ok(compile('html{}').success);
        });
    });

    describe('Return II', () =>
    {
        it('The object should has a \'success\' member with the current status in false', () =>
        {
            assert.equal(compile('{}').success, false);
        });
    });

    describe('Return III', () =>
    {
        it('\'success\' in false should return a \'description\'', () =>
        {
            assert.ok(compile('{}').description);
        });
    });

    describe('Return VI', () =>
    {
        it('\'success\' in false should return a \'description\'', () =>
        {
            assert.ok(compile('{}').description);
        });
    });

});

describe('Tags', () =>
{
    describe('Tag I', () =>
    {
        it('Tag should be equals to \'html\'', () =>
        {
            assert.equal(compile('html{}').content[0].tag, 'html');
        });
    });

    describe('Tag II', () =>
    {
        it('Tag should be equals to \'div\'', () =>
        {
            assert.equal(compile('html{div{Hola Mundo}}').content[0].childs[0].tag, 'div');
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
            assert.equal(compile('html{div{Hola Mundo}}').content[0].childs[0].childs[0], 'Hola Mundo');
        });
    });
});

describe('Properties', () =>
{
    describe('Properties I', () =>
    {
        it('Property \'%tag%\' should be equals to \'h1\'', () =>
        {
            assert.equal(compile('html{%tag%{Hola Mundo}}', {tag: 'h1'}).content[0].childs[0].tag, 'h1');
        });
    });

    describe('Properties II', () =>
    {
        it('Property \'%tag%\' should be equals parsed correctly as a tag', () =>
        {
            assert.equal(compile('html{%tag%{Hola Mundo}}', {tag: 'h1'}).content[0].childs[0].childs[0], 'Hola Mundo');
        });
    });
});

describe('Translate', () =>
{
    describe('Translate I', () =>
    {
        it('The method \'translate\' should return a correct string', () =>
        {
            assert.equal(translate('html{%tag%{Hola Mundo}}', {tag: 'h1'}).content, '<html><h1>Hola Mundo</h1></html>');
        });
    });

    describe('Translate II', () =>
    {
        it('The method \'translate\' with lang \'vb\' should return a \'success\' false', () =>
        {
            assert.equal(translate('html{%tag%{Hola Mundo}}', 'vb').success, false);
        });
    });
});