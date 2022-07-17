import assert from 'assert';
import TinyMLCore from '../index.js';
import randomString from "randomstring";

describe('Return Object', () =>
{
    describe('Return I', () =>
    {
        it('The object should has a \'success\' member with the current status in true', () =>
        {
            assert.ok(TinyMLCore.compile('html{}').success);
        });
    });

    describe('Return II', () =>
    {
        it('The object should has a \'success\' member with the current status in false', () =>
        {
            assert.equal(TinyMLCore.compile('{}').success, false);
        });
    });

    describe('Return III', () =>
    {
        it('\'success\' in false should return a \'description\'', () =>
        {
            assert.ok(TinyMLCore.compile('{}').description);
        });
    });

    describe('Return VI', () =>
    {
        it('\'success\' in false should return a \'description\'', () =>
        {
            assert.ok(TinyMLCore.compile('{}').description);
        });
    });

    describe('Return VII', () =>
    {
        it('Async shoud be correct, returning a tag', async () =>
        {
            assert.ok((await TinyMLCore.compileAsync('html{}'))[0].tag);
        });
    });

    describe('Return VIII', () =>
    {
        it('Async shoud be incorrect, returning a description', async () =>
        {
            assert.ok((await TinyMLCore.compileAsync('{}').catch(d => d)));
        });
    });

    describe('Return IX', () =>
    {
        it('Async shoud be incorrect, returning a description about unclosed bracket', async () =>
        {
            // console.log((await TinyMLCore.compileAsync('html{').catch(d => d)));
            assert.ok((await TinyMLCore.compileAsync('html{').catch(d => d)));
        });
    });

});

describe('Tags', () =>
{
    describe('Tag I', () =>
    {
        it('Tag should be equals to \'html\'', () =>
        {
            assert.equal(TinyMLCore.compile('html{}').content[0].tag, 'html');
        });
    });

    describe('Tag II', () =>
    {
        it('Tag should be equals to \'div\'', () =>
        {
            assert.equal(TinyMLCore.compile('html{div{Hola Mundo}}').content[0].childs[0].tag, 'div');
        });
    });

    describe('Tag III', () =>
    {
        it('The tag \'meta\' should be parsed correctly', () =>
        {
            assert.equal(TinyMLCore.compile('html{meta();div{Hola Mundo}}').content[0].childs[0].tag, 'meta');
        });
    });

    describe('Tag VI', () =>
    {
        it('The tag after \'meta\' should be parsed correctly', () =>
        {
            assert.equal(TinyMLCore.compile('html{meta();div{Hola Mundo}}').content[0].childs[1].tag, 'div');
        });
    });

    describe('Tag V', () =>
    {
        it('The attributes of tag \'meta\' should be parsed correctly', () =>
        {
            assert.equal(TinyMLCore.compile('html{meta(attr="hola mundo");div{Hola Mundo}}').content[0].childs[0].params, 'attr="hola mundo"');
        });
    });

    describe('Tag VI', () =>
    {
        it('The tag \'strong\' next to \'p\' content must be parsed correctly', () =>
        {
            assert.equal(TinyMLCore.compile('p{Hola, esto de;strong{be}ría ser un buen texto}').content[0].childs[1].tag, 'strong');
        });
    });

    describe('Tag VII', () =>
    {
        it('The \'strong\' tag content next to \'p\' content must be parsed correctly', () =>
        {
            assert.equal(TinyMLCore.compile('p{Hola, esto de;strong{be}ría ser un buen texto}').content[0].childs[1].childs[0], 'be');
        });
    });
});

describe('Comments', () =>
{
    describe('Comment I', () =>
    {
        it('Infinite comment error', () =>
        {
            assert.equal(TinyMLCore.compile('[html{div{Hola Mundo}}').success, false);
        });
    });
});

describe('Content', () =>
{
    describe('Content I', () =>
    {
        it('it should be equals to \'Hola Mundo\'', () =>
        {
            assert.equal(TinyMLCore.compile('html{div{Hola Mundo}}').content[0].childs[0].childs[0], 'Hola Mundo');
        });
    });
});

describe('Properties', () =>
{
    describe('Properties I', () =>
    {
        it('Property \'@tag@\' should be equals to \'h1\'', () =>
        {
            assert.equal(TinyMLCore.compile('html{@tag@{Hola Mundo}}', {tag: 'h1'}).content[0].childs[0].tag, 'h1');
        });
    });

    describe('Properties II', () =>
    {
        it('Property \'@tag@\' should be equals parsed correctly as a tag', () =>
        {
            assert.equal(TinyMLCore.compile('html{@tag@{Hola Mundo}}', {tag: 'h1'}).content[0].childs[0].childs[0], 'Hola Mundo');
        });
    });

    describe('Properties III', () =>
    {
        it('Property \'@tag@\' should be \'h1\' with function argument', () =>
        {
            assert.equal(TinyMLCore.compile('html{@tag@{Hola Mundo}}', () => {tag: 'h1'}).content[0].childs[0].childs[0], 'Hola Mundo');
        });
    });

    describe('Properties VI', () =>
    {
        let rstring;

        it('Property \'@lOl@\' should be equals to the \'lOl\' function return member', () =>
        {
            rstring = randomString.generate();
            assert.equal(TinyMLCore.compile('@lOl@{}', () => ({lOl: rstring})).content[0].tag, rstring);
        });

        it('Property \'@we@\' should be equals to the \'we\' function return member', () =>
        {
            rstring = randomString.generate(10);
            assert.equal(TinyMLCore.compile('@we@{}', () => ({we: rstring})).content[0].tag, rstring);
        });
    });

    describe('Properties V', () =>
    {

        it('The \'member\' param of the property callback should be \'Hi\'', () =>
        {
            assert.equal(TinyMLCore.compile('@Hi@{}', (member) => ({[member]: member})).content[0].tag, 'Hi');
        });
    });
});