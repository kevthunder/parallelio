const Tile = require('parallelio-tiles').Tile
const Tiled = require('parallelio-tiles').Tiled
const TiledActionProvider = require('../../lib/actions/TiledActionProvider')
const Action = require('../../lib/actions/Action')
const expect = require('chai').expect

describe('TiledActionProvider', function () {
  it('provide actions to it\'s onwer\'s tile', function () {
    const tile = new Tile()
    const owner = new Tiled({
      tile: tile
    })
    const tiledProvider = new TiledActionProvider({
      owner: owner,
      actions: [
        new Action()
      ]
    })
    expect(tiledProvider.originTile).to.equal(tile)
    expect(tile.actionProvider).to.exist
    expect(tile.actionProvider.actions.toArray()).to.deep.equal(tiledProvider.actions.toArray())
  })
  it('update actions when tile update', function () {
    const tile1 = new Tile()
    const tile2 = new Tile()
    const owner = new Tiled({
      tile: tile1
    })
    const tiledProvider = new TiledActionProvider({
      owner: owner,
      actions: [
        new Action()
      ]
    })
    expect(tiledProvider.originTile).to.equal(tile1)
    expect(tile1.actionProvider).to.exist
    expect(tile2.actionProvider).to.not.exist
    expect(tile1.actionProvider.actions.toArray()).to.deep.equal(tiledProvider.actions.toArray())
    owner.tile = null
    expect(tiledProvider.originTile).to.equal(null)
    expect(tiledProvider.actionTiles.length).to.equal(0)
    owner.tile = tile2
    expect(tiledProvider.originTile).to.equal(tile2)
    expect(tile1.actionProvider.actions.length).to.equal(0)
    expect(tile2.actionProvider).to.exist
    expect(tile2.actionProvider.actions.toArray()).to.deep.equal(tiledProvider.actions.toArray())
    owner.tile = tile1
    expect(tiledProvider.originTile).to.equal(tile1)
    expect(tile2.actionProvider.actions.length).to.equal(0)
    expect(tile1.actionProvider.actions.toArray()).to.deep.equal(tiledProvider.actions.toArray())
  })
})
