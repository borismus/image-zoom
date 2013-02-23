var ZOOM_OUT = [0, 0, 1, 1]

/**
 * Image zooming view that lets you zoom.
 */
function ImageZoomer(sel, src) {
  // Create the rendering contexts.
  this.canvas = document.querySelector(sel);
  this.ctx = this.canvas.getContext('2d');
  // Keep track of selection.
  this.selectionStart = null;
  this.selectionEnd = null;
  // Bind mouse events on the canvas.
  this.canvas.addEventListener('mousedown', this._onmousedown.bind(this));
  this.canvas.addEventListener('mousemove', this._onmousemove.bind(this));
  this.canvas.addEventListener('mouseup', this._onmouseup.bind(this));
  // Keep track of the active bounding box.
  this.bb = ZOOM_OUT;

  this.image = new Image();

  this.loadImage(src);
  this.image.onload = this.render.bind(this);
}

ImageZoomer.prototype.render = function() {
  var ratio = window.devicePixelRatio / this.ctx.webkitBackingStorePixelRatio;
  this.canvas.width = this.image.width * ratio;
  this.canvas.height = this.image.height * ratio;
  this.ctx.scale(ratio, ratio);
  this.ctx.drawImage(this.image,
      this.image.width * this.bb[0],
      this.image.height * this.bb[1],
      this.image.width * this.bb[2],
      this.image.height * this.bb[3],
      0, 0, this.canvas.width/ratio, this.canvas.height/ratio);
};

ImageZoomer.prototype.renderSelection = function() {
  var bb = this._getSelectionBoundingBox();
  this.ctx.strokeWidth = 3;
  this.ctx.strokeRect(
      this.image.width * bb[0],
      this.image.height * bb[1],
      this.image.width * bb[2],
      this.image.height * bb[3]);
};

/**
 * Changes the zoom level of a canvas in bounding box sized as a percentage of
 * each dimension (in floats): [0.1, 0.1, 0.2, 0.2].
 */
ImageZoomer.prototype.zoom = function(bb) {
  this.doZoom(bb);
  if (this.callback) {
    this.callback(bb);
  }
};

ImageZoomer.prototype.doZoom = function(bb) {
  this.isZoomed = (bb != ZOOM_OUT);
  // Set the cursor on the canvas.
  this.canvas.style.cursor = (this.isZoomed ? '-webkit-zoom-out' : '-webkit-zoom-in');
  this.bb = bb;
  this.render();
}

ImageZoomer.prototype.loadImage = function(src) {
  this.image.src = src;
};

ImageZoomer.prototype.onZoomChanged = function(callback) {
  this.callback = callback;
};

ImageZoomer.prototype._getSelectionBoundingBox = function(opts) {
  opts = opts || {};
  var isSameAspect = !!opts.isSameAspect;
  var x = Math.min(this.selectionStart[0], this.selectionEnd[0]);
  var y = Math.min(this.selectionStart[1], this.selectionEnd[1]);
  var w = Math.abs(this.selectionStart[0] - this.selectionEnd[0]);
  var h = Math.abs(this.selectionStart[1] - this.selectionEnd[1]);

  if (isSameAspect && w != 0 && h != 0) {
    var ratio = this.image.height/this.image.width;
    // Only allow zoom in the same aspect ratio.
    if (w * ratio > h) {
      w = h / ratio;
    } else {
      h = w * ratio;
    }
  }
  // Convert to percentage-based units.
  x /= this.canvas.clientWidth;
  w /= this.canvas.clientWidth;
  y /= this.canvas.clientHeight;
  h /= this.canvas.clientHeight;
  return [x, y, w, h];
};

ImageZoomer.prototype._onmousedown = function(e) {
  this.selectionStart = [e.offsetX, e.offsetY];
  this.isMouseDown = true;
};
ImageZoomer.prototype._onmousemove = function(e) {
  if (this.isMouseDown) {
    this.selectionEnd = [e.offsetX, e.offsetY];

    // Render the selection.
    this.render();
    this.renderSelection();
  }
};
ImageZoomer.prototype._onmouseup = function(e) {
  this.isMouseDown = false;
  this.selectionEnd = [e.offsetX, e.offsetY];

  // Compute the bounding box as a result of the selection.
  var bb = this._getSelectionBoundingBox({isSameAspect: true});
  if (!this.isZoomed && bb[2] != 0 && bb[3] != 0) {
    this.zoom(bb);
  } else {
    this.zoom(ZOOM_OUT);
  }
};
