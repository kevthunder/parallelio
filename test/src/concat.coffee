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
  it 'contains Timing', ->
    assert.isFunction Parallelio.Timing
  it 'contains TargetAction', ->
    assert.isFunction Parallelio.actions.TargetAction
  it 'contains Tile', ->
    assert.isFunction Parallelio.tiles.Tile
    assert.isFunction Parallelio.tiles.Tiled
    assert.isFunction Parallelio.tiles.Direction
  it 'contains Wire', ->
    assert.isFunction Parallelio.wiring.Wire
    assert.isFunction Parallelio.wiring.Connected
  it 'contains strings', ->
    assert.isObject Parallelio.strings
    assert.isArray Parallelio.strings.greekAlphabet