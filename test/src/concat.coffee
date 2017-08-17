assert = require('chai').assert

Parallelio = require('../dist/parallelio.min.js')


describe 'concatened file check', ->
  it 'contains Element', ->
    assert.isFunction Parallelio.Element
  it 'contains Star', ->
    assert.isFunction Parallelio.Star
  it 'contains PathFinder', ->
    assert.isFunction Parallelio.PathFinder
  it 'contains strings', ->
    assert.isObject Parallelio.strings
    assert.isArray Parallelio.strings.greekAlphabet