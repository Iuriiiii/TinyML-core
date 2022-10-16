# TinyML Core

TinyML Core is a little, faster and lightweight module that will help you to parse the source code of TinyML.

❌ Please don't use until we delete this message, this lib is under construction 🚫

## Concept

The structure pattern is similar to HTML, you will get tags, content, params and comments.

<table>
<tr>
<th>HTML</th>
<th>TinyML</th>
</tr>
<tr>
<td>

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>The page title</title>
    </head>
</html>
<body>
    <hr/>
    <div class="container">
        <h1>My first title</h1>
        <p>
            Lorem ipsum dolor sit<br>
            amet, consectetur
        <p>
    </div>
</body>
```

</td>
<td>

```
[This is just a comment]
html(lang="en") {
    head {
        title {The page title}
    }
    body {
        hr;
        div(class="container") {
            h1 {My first title}
            p {
                Lorem ipsum dolor sit\n
                amet, consectetur
            }
        }
    }
}
```

</td>
</tr>
</table>

## Functions

### From `Core`

#### parse

❕ This method will help you to parse synchronically a TinyML-syntax source.

##### Return

✅ An array with the data

❌ Throw an error.

##### Params:

🔹 source: string - The source code to parse.

##### Example:

```js
import { Core } from 'tinyml-core';

try {
    var parsed = Core.parse(`
    thisIsATag(param1) {
        This is a raw content
        tag{This is raw content too}
        [This is a commentary]
    } Raw content again
`);
} catch (e) {
    console.error(e);
}
```

## Data description

`Core.parse` returns an array of the following kind of elements if succedes:

* <b>Core.Element</b>
* <b>Core.Raw</b>
* <b>Core.Comment</b>
* <b>Core.Code</b>

### Global methods & members

The following members & methods will be inherited by `Core.Raw`, `Core.Element`, `Core.Comment` and `Core.Code`

🔹 <b>tokens: Token[]</b> - All tokens catched for the instance.

🔹 <b>isRaw(): boolean</b> - Checks if the instance is a `Core.Raw` instance.

🔹 <b>isElement(): boolean</b> - Checks if the instance is a `Core.Element` instance.

🔹 <b>isComment(): boolean</b> - Checks if the instance is a `Core.Comment` instance.

🔹 <b>isCode(): boolean</b> - Checks if the instance is a `Core.Code` instance.

🔹 <b>toString(): string</b> - A string representation of all tokens contained in the instance.

### The `Token` data type

This data type contains information about an element of the source code. It has the following members:

🔹 <b>text: string</b> - The string of the token.

🔹 <b>pos: TokenPosition /* {x: number, y: number} */</b> - The location of the token in the source code.

🔹 <b>text: TokenType</b> - The token type.


### Core.Element

This data type defines an element. It is composed by the following members.

🔹 <b>tag: Token</b> - The token that contain the tag name and location. The type ever will be `TokenType.identifier`.

🔹 <b>params: Token[]</b> - All tokens that compounds the parameters.

🔹 <b>children: (Core.Element | Core.Raw | Core.Comment | Core.Code)[] | undefined</b> - The content inside of. An array of TinyML elements or undefined.

### Core.Raw

This data type different to `Core.Element` element, generally the content of this last one.

> Does not contain new methods or members by itself.

### Core.Comment

This data type defines the content between `[` and `]` characters.

> Does not contain new methods or members by itself.