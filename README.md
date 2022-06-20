# TinyML Core

TinyML Core is a little, faster and lightweight module that will help you to parse the source code of TinyML.

## TinyML

TinyML is a little markup language concept created to make the web design easier, faster and lightweight.

The syntax concept of TinyML is the same as HTML, excempt the large amount of unnecessary characters of this last one.
Commonly you will have a tag, optionally parameters (attributes) and also optionally, content.

## TinyML Examples

The best way to learn somethig as easy as TinyML is trough examples and comparisons.

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

        <!-- Declared Vars To Go Here -->
        
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- Metadata -->
        <meta name="description" content="">
        <meta name="author" content="">

        <link rel="icon" href="mysource_files/favicon.ico">

        <!-- Page Name and Site Name -->
        <title>Page Name - Squiz Matrix HTML Example</title>

        <!-- CSS -->
        <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet">
        <link href="mysource_files/style.css" rel="stylesheet">

    </head>

    <body>

        <div class="container">

        <header class="header clearfix" style="background-color: #ffffff">

            <!-- Main Menu -->
            <nav>
            <ul class="nav nav-pills pull-right">
                <li class="active"><a href="#">Home</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
            </ul>
            </nav>

            <!-- Site Name -->
            <h1 class="h3 text-muted">Site Name</h1>

            <!-- Breadcrumbs -->
            <ol class="breadcrumb">
            <li><a href="#">Home</a></li>
            <li><a href="#">Level 1</a></li>
            <li class="active">Level 2</li>
            </ol>

        </header>

        <div class="page-heading">

            <!-- Page Heading -->
            <h1>Page Heading</h1>

        </div>

        <div class="row">

            <div class="col-sm-3">

            <!-- Sub Navigation -->
            <ul class="nav nav-pills nav-stacked">
                <li><a href="#">Level 2</a></li>
                <li class="active"><a href="#">Level 2</a>
                <ul>
                    <li><a href="#">Level 3</a></li>
                    <li><a href="#">Level 3</a></li>
                    <li><a href="#">Level 3</a></li>
                </ul>
                </li>
                <li><a href="#">Level 2</a></li>
            </ul>

            </div>

            <div class="col-sm-6">

            <div class="page-contents">

                <!-- Design Body -->
                <h2>Sub Heading</h2>
                <p>Donec id elit non mi porta gravida at eget metus. Maecenas faucibus mollis interdum.</p>
                <h4>Sub Heading</h4>
                <p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum.</p>
                <h4>Sub Heading</h4>
                <p>Maecenas sed diam eget risus varius blandit sit amet non magna.</p>

            </div>

            </div>

            <div class="col-sm-3">

            <!-- Login Section -->
            <h2>Login</h2>

            <!-- Search Section -->
            <h2>Search</h2>

            <!-- Nested Right Column Content -->

            </div>

        </div>

        <footer class="footer">
            <p class="pull-right">
            <!-- Last Updated Design Area-->
            Last Updated: Wednesday, January 6, 2016
            </p>
            <p>&copy; 2016 Company, Inc.</p>
        </footer>

        </div> <!-- /container -->

    </body>
    </html>

```

</td>
<td>

```
    html5{
    head{

        [ Declared Vars To Go Here ]

        meta(charset="utf-8"){}
        meta(http-equiv="X-UA-Compatible" content="IE=edge"){}
        meta(name="viewport" content="width=device-width, initial-scale=1"){}

        [ Metadata ]
        meta(name="description" content=""){}
        meta(name="author" content=""){}

        link(rel="icon" href="mysource_files/favicon.ico"){}

        [ Page Name and Site Name]
        title{Page Name - Squiz Matrix HTML Example}

        [ CSS ]
        link(href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet"){}
        link(href="mysource_files/style.css" rel="stylesheet"){}

    }

    body{

        div(class="container"){

            header(class="header clearfix" style="background-color: #ffffff"){

                [ Main Menu ]
                nav{
                    ul(class="nav nav-pills pull-right"){
                        li(class="active"){a(href="#"){Home}}
                        li{a(href="#"){About}}
                        li{a(href="#"){Contact}}
                    }
                }

                [ Site Name ]
                h1(class="h3 text-muted"){Site Name}

                [ Breadcrumbs ]
                ol(class="breadcrumb"){
                    li{a(href="#"){Home}}
                    li{a(href="#"){Level 1}}
                    li(class="active"){Level 2}
                }

            }

            div(class="page-heading"){

                [ Page Heading ]
                h1{Page Heading}

            }

            div(class="row"){

                div(class="col-sm-3"){

                    [ Sub Navigation ]
                    ul(class="nav nav-pills nav-stacked"){
                        li{a(href="#"){Level 2}}
                        li(class="active"){a(href="#"){Level 2}
                            ul{
                                li{a(href="#"){Level 3}}
                                li{a(href="#"){Level 3}}
                                li{a(href="#"){Level 3}}
                            }
                        }
                        li{a(href="#"){Level 2}}
                    }

                }

                div(class="col-sm-6"){

                    div(class="page-contents"){

                        [ Design Body ]
                        h2{Sub Heading}
                        p{Donec id elit non mi porta gravida at eget metus. Maecenas faucibus mollis interdum.}
                        h4{Sub Heading}
                        p{Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum.}
                        h4{Sub Heading}
                        p{Maecenas sed diam eget risus varius blandit sit amet non magna.}

                    }

                }

                div(class="col-sm-3"){

                    [ Login Section ]
                    h2{Login}

                    [ Search Section ]
                    h2{Search}

                    [ Nested Right Column Content ]

                }

            }

            footer(class="footer"){
                p(class="pull-right"){
                    [ Last Updated Design Area ]
                    Last Updated: Wednesday, January 6, 2016
                }
                p{&copy; 2016 Company, Inc.}
            }

        }

    }
}

```

</td>
</tr>
</table>