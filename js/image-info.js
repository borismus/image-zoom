var IMAGE_ROOT = 'images/';

function ImageInfo(sel, zoomView, opts) {
  this.zoomView = zoomView;
  opts = opts || {};

  // Set some default parameters.
  this.base = opts.base || 'plane';
  this.dpr = opts.dpr || 1;
  this.quality = opts.quality || 50;
  this.format = opts.format || 'jpg';

  // Get at the controls for the DOM.
  sel += ' ';
  this.dprEl = document.querySelector(sel + '.dpr');
  this.sizeEl = document.querySelector(sel + '.size');
  this.qualityEl = document.querySelector(sel + '.quality');
  this.formatEl = document.querySelector(sel + '.format');

  this.rangeInputEl = document.querySelector(sel + 'input');
  this.formatInputEl = document.querySelector(sel + 'select');

  // Handle the range changing.
  this.rangeInputEl.addEventListener('change', function(e) {
    this.quality = e.target.value;
    // Get the file corresponding to the input value.
    this.updateImage();
  }.bind(this));

  this.formatInputEl.addEventListener('change', function(e) {
    this.format = e.target.value;
    this.updateImage();
  }.bind(this));

  this.updateImage();
  this.loadManifest();
}

ImageInfo.prototype.updateImage = function() {
  var path = this.getPath();
  this.zoomView.loadImage(path);

  this.sizeEl.innerHTML = this.metadata ? this.metadata[path] : '?';
  this.qualityEl.innerHTML = this.quality;
  this.formatEl.innerHTML = this.format;
  this.dprEl.innerHTML = this.dpr;
}

ImageInfo.prototype.getPath = function() {
  var filename = this.dpr + 'x-' + this.quality + '.' +  this.format;
  return IMAGE_ROOT + this.base + '/' + filename;
};

ImageInfo.prototype.loadManifest = function() {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', function(e) {
    this.metadata = JSON.parse(xhr.responseText);
    // Set the size.
    this.sizeEl.innerHTML = this.metadata[this.getPath()];
  }.bind(this));
  xhr.open('GET', IMAGE_ROOT + this.base + '/manifest.json', true);
  xhr.send();
}

ImageInfo.prototype.setBaseImage = function(base) {
  this.base = base;
  this.updateImage();
  this.loadManifest();
}
