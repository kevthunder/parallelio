assert = require('chai').assert



describe 'concatened file check', ->
  Parallelio = null 
  before ->
  	Parallelio = require('../dist/parallelio.js')
  it 'contains Element', ->
    assert.isFunction Parallelio.Element
  it 'contains Star', ->
    assert.isFunction Parallelio.Star
  it 'contains PathFinder', ->
    assert.isFunction Parallelio.PathFinder
  it 'contains strings', ->
    assert.isObject Parallelio.strings
    assert.isArray Parallelio.strings.greekAlphabet