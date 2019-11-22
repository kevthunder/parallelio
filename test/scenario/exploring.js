const expect = require('chai').expect
const Game = require('../../lib/Game')
const StarMapGenerator = require('../../lib/StarMapGenerator')
const Ship = require('../../lib/Ship')
const TravelAction = require('../../lib/actions/TravelAction')
const EncounterManager = require('../../lib/EncounterManager')

class ExploringScenario extends Game {
  start () {
    super.start()
    this.map = (new StarMapGenerator()).generate()
    this.add(this.map)
    this.ship = new Ship()
    this.ship.location = this.map.locations.get(1)
    this.currentPlayer.globalActionProviders.add(this.ship)
    this.encounterManager = new EncounterManager({
      subject: this.ship,
      baseProbability: 0
    })
    this.add(this.encounterManager)
  }
}

describe('Exploring scenario', function () {
  it('start with a Ship at a random star', function () {
    const game = new ExploringScenario()
    game.start()
    expect(game.ship).to.exist
    expect(game.ship.location).to.exist
    expect(game.ship.location.name).to.exist
  })
  it('allow to travel to a nearby star', function () {
    const game = new ExploringScenario()
    game.start()
    expect(game.ship.location.links.length).to.be.above(0)
    const travelActions = game.ship.actionProvider.actions.filter((a) => a instanceof TravelAction)
    expect(travelActions.length).to.be.above(0)
    const target = game.ship.location.links.get(0).otherStar(game.ship.location)
    const travelAction = travelActions.get(0).withTarget(target)
    expect(travelAction.isReady()).to.be.true
    travelAction.execute()
    expect(game.ship.travel).to.exist
    travelAction.travel.pathTimeout.prc = 100
    expect(game.ship.location).to.equal(target)
  })
  it('can trigger encounters while travelling between starts', function () {
    const game = new ExploringScenario()
    game.start()
    game.encounterManager.baseProbability = 1
    const target = game.ship.location.links.get(0).otherStar(game.ship.location)
    const travelAction = game.ship.actionProvider.actions.find((a) => a instanceof TravelAction).withTarget(target)
    travelAction.execute()
    travelAction.travel.pathTimeout.prc = 100
    expect(game.ship.encounter).to.exist
    expect(game.ship.encounter.approach.valid).to.be.true
  })
})
