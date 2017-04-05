var Element, ref;

Element = ((ref = this.Spark) != null ? ref.Element : void 0) || require('spark-starter');

if (typeof this.exports === 'undefined') {
  this.exports = Element;
} else {
  if (typeof this.Spark === 'undefined') {
    this.Parallelio = {};
  }
  this.Parallelio.Element = Element;
}
