# ComplexFunctions

The other day in my Complex Analysis class someone asked: *"what is the
graphical meaning of a residue?"* Then the lecturer went on about how complex
functions of a complex variable are hard to interpret graphically, since they
are mappings from a 2-dimensional space to another. **That is how this repo was
born.**

I immediately started thinking about how to build an interactive graphing tool
that would help give an intuitive meaning to functions from one complex
variable to another. Then one could differentiate them, and then integrate
them, and then... who knows, maybe even visualise the residue of a function at
a singularity.

> :warning: **The code in this repo is under development. There is a high
> chance that it will substantially change in the near future!**

## The framework
The code in this repo basically consists of two types of JavaScript objects:
**variables** and **graphics**.  Variables have values that can be read by
other variables and graphics. These values are usually a function of other
variables', but they can also be derived from the mouse position or be set
manually.  Variables also have names, which allow you to use them in equations.
Classes that fall under the variable category are:
* `Variable` - [No surprises](https://youtu.be/u5CVsCnxyXg) here. These are the
  bread and butter of this framework: they can be used for mouse input, as
  functions of other variables or they can be managed by other wrappers (which
  we'll meet very soon). They can be drawn on `Plot` objects as position vectors.
* `Interval` - This is a rather special type of variable. It represents an
  interval in the real line, with a beginning and an end. It is mostly used for
  animations, since you can make variables take it as a parameter to their
  function. It can optionally manage a midpoint `Variable`, which can be very
  useful for estimating integrals using the
  [midpoint rule](https://en.wikipedia.org/wiki/Riemann_sum#Midpoint_rule).
* `DeltaVar` - This is used to represent the difference between consecutive
  values of another variable. I am sure you can already imagine what the
  purpose of this one is.
* `CumVar` - This variable is used to represent the sum of the different values
  of another variable. It acts as an accumulator, whence the name. Again, if
  you have ever estimated an integral numerically, you know what this is used
  for.
* `Contour` - This one is very similar to `Variable` in functionality. The
  difference is that is can only depend on one parameter which must be of type
  `Interval`. It is also plotted differently: instead of a position vector it
  draws the path its value follows as its paramater spans its domain.

Enough about variables. Let's talk about **graphics**! They are used to
interact with the DOM in order to show the user the state of its dear
variables. Currently, there are two types of graphics:
* `Plot` - Give it a `<canvas>` element and it will do wonders with it! It
  draws a grid representing the complex plane and, on top of it, it will draw
  any variables that you give to it, that includes objects of types `Variable`,
  `DeltaVar`, `CumVar` and `Contour` mentioned above. `Plot` objects are
  interactive: you can zoom in and out and pan them around using the wheel and
  the middle button (alternatively you can use the left button while pressing
  `SHIFT` for panning) or using two fingers on your touchscreen (!). Each `Plot`
  can be given a `Variable` for it to pass it the position of the mouse when the
  user presses the left mouse button over the plot.  \[This in turn allows for
  the estimation of integrals along arbitrary hand drawn contours. Now, if that's
  not the epitome of interactivity I don't know what is.\]
* `Display` - This simple class can be given a DOM element (such as a `<span>`)
  and the numerical value of a variable of your choice will be printed to it
  each time the variable is updated.

Apart from this, the framework also provides the class `FreehandContour` which
could be regarded as a radioactive hybrid between `Interval` and `Contour` (and
most probably a poor design choice). You can pass it a `Variable` which is
linked to the mouse position of some `Plot` and it will draw (and store) the
contour described by the mouse as it moves. This class doesn't have a value per
se; instead, it manages a `Variable` and a `DeltaVar` (suspiciously named `z`
and `dz`) which can be accessed for further mischief.

Each of these objects updates and is updated by others using the [observer
pattern](https://en.wikipedia.org/wiki/Observer_pattern). Every object has a
list of listeners, to which it notifies when its own value is updated.
Essentially, the variables and graphics used will form a dependency graph,
which should be a [directed acyclic
graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph) (or else you will
have variables updating each other in a cycle *ad stack-overflow-um*). This
creates some synchronisation challenges, since there might be more than one
path to a descendant variable, causing it to update twice for each signal of
the original variable (and this could cause or integral estimation to
manifold).  This is handled in two ways:
* During animations, all objects involved keep track of the current tick. An
  object will only update its state with respect to their parameters once all
  of them have reached the same tick.
* `Variable` objects (which, conveniently, are the only ones that can depend on
  two or more other variables) have an optional field `wait`. If it is set to
  true, the variable will only update its state once it has received
  notifications from all its parameters.

## The article
~~I hope that someday~~ Soon I will write a *not-so-short*
article about complex functions and how to visualise them which demonstrates
the potential and usage of this framework. Until that day comes, you can get a
sneak peak of what it can do by visiting [this
page](https://adriandom.github.io/ComplexFunctions/test.html).

## Dependencies Currently, the only dependency of this project is the
[Math.js](https://mathjs.org/index.html) library.
