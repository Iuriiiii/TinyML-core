# TinyML Core

TinyML Core is a little, faster and lightweight module that will help you to parse the source code of TinyML.

## TinyML

TinyML is a little markup language concept created to make the web design easier, faster and lightweight.

The syntax concept of TinyML is the same as HTML, omitting the large amount of unnecessary characters of this last one.
Commonly you will have a tag, optionally parameters (attributes) and also optionally, content.

## TinyML Examples

The best way to learn somethig as easy as TinyML is trough examples and comparisons.

> **_NOTE:_** The following examples assume you are using the default HTML lang engine as translation.

The default syntax of a tag on TinyML is the following:

> tag<b>[</b>(<b>[</b>...<b>]</b>)<b>]</b>{<b>[</b>...<b>]</b>}

Supposing what you want to write a self-close tag without content, you can do:

> meta();

or

> meta(){}

a tag is considerate as one just if it's followed by a bracket `{`.

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
html5(lang="en"){
    head{
        title{The page title}
    }
    body{
        div(class="container"){
            h1{My first title}
            p{
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

Optionally, the attributes can be setted by the `:` instead of `=` and splitted by commas.

<table>
<tr>
<th>HTML</th>
<th>TinyML</th>
</tr>
<tr>
<td>

```html
<div class="container" id="master"></div>
```

</td>
<td>

```
div(class:"container",id="master"){}
```

</td>
</tr>
</table>

For some cases, you could do the following:

<table>
<tr>
<th>HTML</th>
<th>TinyML</th>
</tr>
<tr>
<td>

```html
<p>This is an e<strong>ccentri</strong>
c text that u are able to read</p>
```

</td>
<td>

```
p{This is an e;strong{ccentri}c
text that u are able to read}
```

</td>
</tr>
</table>

Being the `;` character a critical separator to put TinyML tags within text phrases.