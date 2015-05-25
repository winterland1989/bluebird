---
id: what-about-generators
title: What About Generators?
---

You might know about a little trick you can do with generators where asynchronous code can be made look like synchronous:

```js
function run(fn) {
    var generator = fn();
    (function loop(result) {
        if (!result.done) {
            result.value(function() {
                loop(generator.next());
            });
        }
    })(generator.next());
}

function sleep(ms) {
    return function(cb) {
        setTimeout(cb, ms);
    };
}

run(function* () {
   yield sleep(1000);
   console.log("1 second passed");
   yield sleep(1000);
   console.log("1 second passed");
   yield sleep(1000);
   console.log("1 second passed");
});
```

*\(You can play with this example at: http://jsfiddle.net/ewg9p6gg/\)*

When the function "is sleeping", it isn't blocking the process (though it's blocking itself of course). You might suppose that this is enough to solve all the asynchronous problems, as if you were having your cake and eating it too and now you can forget about callbacks and promises. That is just toy example fallacy at work.

What are some differences between real world code and toy examples?

 - The need for concurrency
 - The need to reuse existing and well known utilities
 - Error handling
 - Resource management

## Need for concurrency



