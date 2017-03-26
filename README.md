
# SimpleImmutable

**Lightweight freeze-based immutable data structures in JavaScript**

---

SimpleImmutable is a *tiny* immutable state container, similar to [Immutable](https://facebook.github.io/immutable-js/) by that blue "f" company, although much smaller. It leverages existing JavaScript operations as much as possible, providing the basic operations needed to read, update and iterate data. As an added benefit, and unlike ImmutableJS, SimpleImmutable objects can be converted to frozen JavaScript instantly, in constant time, because that's how they're stored internally.

This works well with reactive frontend architectures that pass the entire state to the root view, because it lets the views deal with plain, frozen js objects, while still offering fast deep comparisons and, of course, immutability. Equality checks should be linear-ish with the number of mutative operations having been performed between the two immutables being compared for most real world scenarios; or in other words: very cheap.

It is written in plain old JavaScript that will work almost anywhere, doesn't have any dependencies, and is contained in a single file.

Relatives: [globus](https://github.com/jbe/globus) | [immux](https://github.com/jbe/immux) | [kjappas](https://github.com/jbe/kjappas)

*This project is in development, and may contain some bugs. It doesn't have any tests yet.*

## Installation

`npm install --save simple-immutable`

## Code sample

```javascript
import SimpleImmutable from "simple-immutable";

const original = SimpleImmutable({a: 1, b: [1, 2, 3]});

const modified = original
  .set("a", 0)
  .set("c", false)
  .pushAt("b", 4);

modified.get(); // => {a: 0, b: [1, 2, 3, 4], c: false}

```

## API

##### SimpleImmutable(value)

Create a new SimpleImmutable. Allowed values are numbers, strings, booleans, arrays, objects, and any nesting of those. Passing a value that is already a `SimpleImmutable` will simply return that value.

#### get([path])

Return the frozen plain value at `path`. Path is an array of field names or a single field name. Field names can be strings indexing objects or integers indexing arrays. Invalid paths will either return `undefined` or throw errors, in the same way that `undefined.foo` would.

#### subtree(path)

Same as `get`, except that it returns another `SimpleImmutable` rather than a plain value.

#### size()

Return the length of the array. Only valid on arrays.

#### slice(start, end)

Return a new SimpleImmutable slice of the original array. Only valid on arrays. SimpleImmutable equivalent of `[].slice`.

#### dropLast()

Same as `immutable.slice(0, immutable.size() - 1)`.

#### dropFirst()

Same as `immutable.slice(1, immutable.size())`.

#### concat(value)

Concatenate values to end of array. Only valid on arrays. SimpleImmutable equivalent of `[].concat`.

#### push(value)

Append a value to the end of the array. Only valid on arrays. SimpleImmutable equivalent of `[].push`.

#### unshift(value)

Add an element to the beginning of the array. Only valid on arrays. SimpleImmutable equivalent of `[].unshift`.

#### forEach(func)

Call `func` on each key/value pair in the array or object, passing `value, key, objectValue`. SimpleImmutable equivalent of JavaScript `.forEach`.

#### filter(func)

Call `func` on each value in the array, returning a new `SimpleImmutable` array consisting of all elements for which func returned true, preserving their order. Only valid on arrays. SimpleImmutable equivalent of `[].filter`.

#### map(func)

Call `func` on each value in the array, returning a new array consisting of the returned values. Only valid on arrays. SimpleImmutable equivalent of `[].map`.

#### set(path, value)

Set `path` to `value` in the data structure. Path is an array of indices or a single index, where strings index obejct fields and numbers index arrays. Invalid paths may cause errors by trying to look up fields on something that is `undefined`. Value can be either a `SimpleImmutable` or a plain value (the result is the same).

#### merge(args...)

Copies over all the key-value pairs from the passed arguments. Accepts both regular objects and `SimpleImmutable` objects.

#### at(path, func)

Use func to change the `SimpleImmutable` at `path`, returning an updated `SimpleImmutable` of the level from which `at` was called. Func will receive a `SimpleImmutable`, and can return either another `SimpleImmutable`, or data that will be convrted into one.

#### del([path])

Return a `SimpleImmutable` with the the key/value pair at `path` removed.

#### toggle([path])

Return a `SimpleImmutable` with its boolean value inverted. Only valid on booleans. In JavaScript, `!!` (double not) can be used to coerce any value into a boolean.

#### mergeAt(path, data)

Same as merge, but supports merging into a specified sub-path.

#### concatAt(path)

Same as concat, but supports concatenating at a specified sub-path.

#### pushAt(path)

Same as push, but supports pushing to a specified sub-path.

#### unshiftAt(path)

Same as unshift, but supports unshifting to a specified sub-path.

#### SimpleImmutable.equals

SimpleImmutable is designed to be used in functional-reactive frontend architectures where only reducers get to access the mutation api. The views themselves will only work on the data structures returned by `get`.

Since both views and reducers might want to check for equality, the `equals` function works on both immutables and on the returned plain data. It can be used like this: `SimpleImmutable.equals(a, b)`.

The comparison is fast, because it only needs to compare branches that have been touched by mutative operations.

## Tips

- The path parameter always accepts either an array of indices or a single index. In other words, `"fieldName"` is equivalent to `["fieldName"]`.
