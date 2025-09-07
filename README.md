



1) Difference between var, let, and const?
=>
   `var`: function-scoped, hoisted with `undefined`, allows re-declaration; can leak to `window`.
   `let`: block-scoped, temporal dead zone, no re-declaration in same scope.
   `const`: block-scoped, must be initialized, binding is immutable (but object contents can mutate).

2) Difference between map(), forEach(), and filter()?
=>
   `forEach(cb)`: iterates for side-effects; returns `undefined`.
   `map(cb)`: transforms and returns a new array of equal length.
   `filter(cb)`: keeps elements where callback is truthy; length can shrink (or 0).

3) What are arrow functions in ES6?
=>
   Concise function syntax: `const add = (a,b) => a+b`.
   Lexically binds `this`, `arguments`, `super`, and `new.target`.
   Not constructible (no `new`), no prototype, best for callbacks.

4) How does destructuring assignment work in ES6?
=>
   Unpacks values from arrays/objects into variables.
    ```js
    const [x, y=0] = [1];      
    const {name, price: cost} = {name:'Mango', price:500};
    

5) Explain template literals in ES6 vs concatenation.
=>
   Backticks `` `...` `` allow interpolation and multiline strings:
    ```js
    const name = 'Mango';
    const msg = `Buy ${name} today!`;
    ```
   Cleaner than `'Buy ' + name + ' today!'` and supports `${expr}` and tagged templates.
