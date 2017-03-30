
function forEach(v, callback, thisArg)
{
  if (v === null)
    throw new TypeError(' v is null or not defined');

  if (typeof callback !== "function")
    throw new TypeError(callback + ' is not a function');

  for (var k in v)
    if (v.hasOwnProperty(k))
      callback.call(thisArg, v[k], k, v);
}

function filter(v, callback, thisArg)
{
  if (v === null)
    throw new TypeError(' v is null or not defined');

  if (typeof callback !== "function")
    throw new TypeError(callback + ' is not a function');

  var r = [];

  for (var k in v)
    if (v.hasOwnProperty(k) &&
      callback.call(thisArg, v[k], k, v))
        r.push(v[k]);

  return r;
}

function map(v, callback, thisArg)
{
  if (v === null)
    throw new TypeError(' v is null or not defined');

  if (typeof callback !== "function")
    throw new TypeError(callback + ' is not a function');

  var r = [];

  for (var k in v)
    if (v.hasOwnProperty(k))
      r.push(callback.call(thisArg, v[k], k, v));

  return r;
}

function assign()
{
    var args = Array.prototype.slice.call(arguments);
    var v = args.shift();
    if (v == null)
        throw new TypeError(
            'Cannot convert undefined or null to object');

    var to = Object(v);

    for (var index = 0; index < args.length; index++) {
        var nextSource = args[index];

        if (nextSource != null)
            for (var nextKey in nextSource)
                if (Object.prototype.hasOwnProperty
                    .call(nextSource, nextKey))
                    to[nextKey] = nextSource[nextKey];
    }
    return to;
}

function noop() {}

var doFreeze = typeof(__NODE_ENV__) == "undefined" ||
    __NODE_ENV__ != "production";

if (doFreeze) {
  console.log("SimpleImmutable running in debug (freeze) mode");
}

var freeze = doFreeze ? Object.freeze : noop;

var deepFreeze = !doFreeze ? noop : function (v)
{
  freeze(v);
  if (v && typeof(v) == "object")
    forEach(v, function(v, k) {
      deepFreeze(v);
    });
  return v;
};

function clone(v)
{
  if (v === undefined) return;
  switch (v.constructor)
  {
    case Array:   return v.slice();
    case Object:  return assign({}, v);
    case Number:
    case String:
    case Boolean: return v;
    default:
      console.log("Value:", v);
      throw new Error("Non-primitive values are not allowed in " +
                      "simple immutable");
  }
};

function validateByCtor(thisVal, ctor, operation, typeName)
{
  if (typeof(thisVal.v) != "undefined" &&
    thisVal.v.constructor == ctor) return;

  throw new Error(operation + " can only be done on " + typeName);
}

function prepare(v, shallow)
{
  return v instanceof SimpleImmutable
    ? v.v
    : (shallow ? freeze(v) : deepFreeze(v));
}

function parsePath(path) {
  if (!path) return [];
  if (typeof path == "string")   return path.split(".");
  if (path.constructor == Array) return clone(path);
  return [path];
}

export default function SimpleImmutable(initial, shallow)
{
  if (initial && initial.constructor == SimpleImmutable) return intial;
  if (!(this instanceof SimpleImmutable))
    return new SimpleImmutable(initial);
  this.v = prepare(initial, shallow);
}

function scopedGet(scope, value) {
  if (!scope || !scope.length) return value;
  return scopedGet(scope, value[scope.shift()]);
}

SimpleImmutable.prototype.get = function (path)
{
  return scopedGet(parsePath(path), this.v);
};

SimpleImmutable.prototype.subtree = function (path)
{
  if (!path.length) return this;
  return SimpleImmutable(
    scopedGet(clone(path), this.v),
    true);
};

// Boolean methods

SimpleImmutable.prototype._toggle = function ()
{
  validateByCtor(this, Boolean, "toggle",
    "plain Boolean (tip: use !! to get the boolean value " +
    "of some other value)");
  return SimpleImmutable(!this.v, true);
};

// Array methods

SimpleImmutable.prototype.size = function ()
{
    validateByCtor(this, Array, "size", "plain Arrays");
    return this.v.length;
};

SimpleImmutable.prototype.slice = function (start, end)
{
  validateByCtor(this, Array, "slice", "plain Arrays");
  if (!this.v.length) return this;
  if (start == 0 && end == this.v.length) return this;
  return SimpleImmutable(this.v.slice(start, end), true);
};

SimpleImmutable.prototype.dropLast = function ()
{
  return this.slice(0, this.v.length - 1);
};

SimpleImmutable.prototype.dropFirst = function ()
{
  return this.slice(1, this.v.length);
};

SimpleImmutable.prototype.concat = function (v)
{
  validateByCtor(this, Array, "Concatenation", "plain Arrays");
  return SimpleImmutable(this.v.concat(prepare(v)), true);
};

SimpleImmutable.prototype.push = function (v)
{ return this.concat([v]); };

SimpleImmutable.prototype.unshift = function (v)
{ return SimpleImmutable([v], true).concat(this.v); };

SimpleImmutable.prototype.forEach = function (fn)
{ this.v.forEach(fn); };

SimpleImmutable.prototype.filter = function (fn)
{ return SimpleImmutable(filter(this.v, fn), true); };

SimpleImmutable.prototype.map = function (fn)
{ return SimpleImmutable(this.v.map(fn)); };

function updateFrozenAt(path, tree, value)
{
  if (!path.length)
  {
    return prepare(value);
  }
  else {
    var newTree = clone(tree);
    var key = path.shift();
    newTree[key] = updateFrozenAt(path, tree[key], value);
    return freeze(newTree);
  }
}

SimpleImmutable.prototype.set = function (ks, v)
{
  if (!this.v) this.v = {};
  return SimpleImmutable(updateFrozenAt(
    parsePath(ks), this.v, v), true);
};

SimpleImmutable.prototype._del = function (k)
{
  validateByCtor(this, Object, "Delete", "plain Objects");

  var newValue = clone(this.v);
  delete newValue[k];
  return SimpleImmutable(newValue, true);
};

SimpleImmutable.prototype.merge = function ()
{
  var v = clone(this.v) || {};

  for (var i in arguments)
  {
    var resolved = arguments[i].constructor == SimpleImmutable
        ? arguments[i].get()
        : arguments[i];

    for (var k in resolved)
      if (arguments[i].hasOwnProperty(k)) v[k] = arguments[i][k];
  }

  return SimpleImmutable(v, true);
};

SimpleImmutable.prototype.at = function(path, fn)
{
  path = parsePath(path);

  var modified = fn(
    SimpleImmutable( // need to clone path because it is re-used!
      scopedGet(clone(path), this.v),
      true));

  return this.set(path, modified);
};

SimpleImmutable.prototype.del = function (path)
{
  path = parsePath(path);
  var last = path.pop();
  return this.at(path, function(v) { return v._del(last); });
};

SimpleImmutable.prototype.toggle = function (path)
{ return this.at(path, function(v) { return v._toggle(); }); };

SimpleImmutable.prototype.mergeAt = function (path, data)
{ return this.at(path, function(v) { return v.merge(data); }); };

SimpleImmutable.prototype.concatAt = function (path, data)
{ return this.at(path, function(v) { return v.concat(data); }); };

SimpleImmutable.prototype.pushAt = function (path, data)
{ return this.at(path, function(v) { return v.push(data); }); };

SimpleImmutable.prototype.unshiftAt = function (path, data)
{ return this.at(path, function(v) { return v.unshift(data); }); };

function deepEquals()
{
}

var equals = SimpleImmutable.equals = function (a, b)
{
  if (a.constructor == SimpleImmutable) a = a.get();
  if (b.constructor == SimpleImmutable) b = b.get();

  if (a === b) return true;

  if (a.constructor == Array && b.constructor == Array)
  {
    if (a.length != b.length) return false;
    for (var i = 0; i<a.length; i++)
      if (!equals(a[i], b[i])) return false;
    return true;
  }

  if (a.constructor == Object && b.constructor == Object)
  {
    var k, aKeys = 0, bKeys = 0;
    for (k in a) if (a.hasOwnProperty(k)) aKeys++;
    for (k in b) if (b.hasOwnProperty(k)) bKeys++;
    if (aKeys.length != bKeys.length) return false;

    for (k in a)
      if (a.hasOwnProperty(k))
        if (!equals(a[k], b[k])) return false;
    return true;
  }

  return false;
};
