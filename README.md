
# SimpleImmutable

**Lightweight freeze-based immutable data structures in JavaScript**

---

SimpleImmutable is a *tiny* immutable state container, similar to [Immutable](https://facebook.github.io/immutable-js/) by that blue "f" company, although much smaller. It leverages existing JavaScript operations as much as possible, providing the basic operations needed to read, update and iterate data. As an added benefit, and unlike ImmutableJS, SimpleImmutable objects can be converted to frozen JavaScript instantly, in constant time, because that's how they're already stored internally.

## Installation

`npm install --save simple-immutable`

## Code sample

```javascript
import SimpleImmutable from "simple-immutable";

// TODO

```

## API

##### SimpleImmutable(value)
#### get(path)
#### subtree(path)
#### slice(start, end)
#### dropLast()
#### dropFirst()
#### cat(value)
#### push(value)
#### unshift(value)
#### forEach(fn)
#### filter(fn)
#### map(fn)
#### updateFrozenAt ???
#### set(path, v)
#### merge(args...)
#### at(path, func)
#### del(path)
#### toggle(path)
#### mergeAt(path)
#### catAt(path)
#### pushAt(path)
#### unshiftAt(path)
