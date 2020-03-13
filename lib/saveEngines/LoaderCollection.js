const Collection = require('spark-starter').Collection

class LoaderCollection extends Collection {
  load (data) {
    return data.map(elem => {
      const loader = this.loaders.find(l => l.match(elem))
      if (loader) {
        loader.load(elem)
      }
    })
  }
}

module.exports = LoaderCollection
