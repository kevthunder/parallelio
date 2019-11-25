# How to upgrade

## Deprecating CoffeeScript

Use the compiled file, use eslint, remove source files and build script

### requires should be const

old:
```
var Tile;
Tile = require('../lib/Tile');
```
new:
```
const Tile = require('../lib/Tile');
```
search
```
\n\n? *(\w+ = require\()
```
replace
```
\nconst $1
```

### remove top var

search
```
var (\w+, )*\w+\n(\s*const \w+ = require)
```
replace
```
$2
```

### exporting class
old:
```
module.exports = Tile = (function () {
  class Tile extends Element {
  }
  return Tile
}.call(this))
```
new:
```
class Tile extends Element {
}
module.exports = Tile
```
search
```
(module.exports = \w+) = \(function \(\) \{((.|\n)*)return \w+\n\}.call\(this\)\)
```
replace
```
$2$1
```

### replace void 0

search
```
void 0
```
replace
```
null
```
### remove extra return in tests

search
```
return it\(
```
replace
```
it(
```
search
```
return assert\.
```
replace
```
assert.
```
### remove wrapper

search
```
\(function \(\) \{((.|\n)*)\}\).call\(this\)
```
replace
```
$1
```

### remove assignment if ifs
old:
```
if (a = Math.round(Math.random())) {
}
```
new:
```
const a = Math.round(Math.random())
if (a) {
}
```
search
```
^(\s*)if \(((\w+) = .+)\) \{$
```
replace
```
$1const $2\n$1if($3){
```