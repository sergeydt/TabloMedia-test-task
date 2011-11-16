(function() {
  var Coord, Coord2, CoordAbs2, CoordAbsX, CoordAbsY, CoordRel2, CoordRelX, CoordRelY, CoordX, CoordY, Dimensions, DrawObject, DrawObjectBox, FPS, Scene, addEvent, animationTime, borderRadius, borderSpace, colors, dimensions, document, getBigBoxes, getSmallBoxes, initCanvas, initTestTask, lineWidth, strokeStyle, window;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  colors = ['#E71212', '#509B13', '#16498E'];
  strokeStyle = '#FFF';
  borderSpace = 50;
  borderRadius = 5;
  lineWidth = 8;
  animationTime = 2500;
  FPS = 60;
  Dimensions = (function() {
    function Dimensions() {}
    Dimensions.prototype.calc = function() {
      var height, width;
      width = height = 0;
      if (window.innerWidth) {
        width = window.innerWidth;
        height = window.innerHeight;
      } else if (document.body && document.body.clientWidth) {
        width = document.body.clientWidth;
        height = document.body.clientHeight;
      }
      if (document.documentElement && document.documentElement.clientWidth) {
        width = document.documentElement.clientWidth;
        height = document.documentElement.clientHeight;
      }
      return this.dim = {
        width: width,
        height: height
      };
    };
    Dimensions.prototype.get = function() {
      return this.dim;
    };
    Dimensions.prototype.update = function(callback) {
      this.calc();
      return typeof callback === "function" ? callback(this.dim) : void 0;
    };
    return Dimensions;
  })();
  Coord = (function() {
    Coord.prototype.dim = null;
    Coord.prototype.ABS = 'abs';
    Coord.prototype.REL = 'rel';
    function Coord(c, type) {
      this.c = c;
      this.type = type != null ? type : this.ABS;
      if (this.constructor === Coord) {
        throw 'Coord is abstract class, use CoordX or CoordY';
      }
      if (this.c == null) {
        throw 'Coord: constructor - no value';
      }
      if (this.type === this.ABS) {
        this.c = Math.round(this.c);
      }
    }
    Coord.prototype.copy = function() {
      return new this.constructor(this.c, this.type);
    };
    Coord.prototype.add = function(v) {
      this.c += v;
      return this;
    };
    Coord.prototype.isAbs = function() {
      return this.type === this.ABS;
    };
    Coord.prototype.isRel = function() {
      return this.type === this.REL;
    };
    Coord.prototype.isX = function() {
      return this instanceof CoordX;
    };
    Coord.prototype.isY = function() {
      return this instanceof CoordY;
    };
    Coord.prototype.get = function() {
      return this.c;
    };
    Coord.prototype.toRel = function() {
      if (this.isRel()) {
        return this;
      }
      if (this.dim == null) {
        throw 'Coord: toRel - no dimension';
      }
      if (this.isX()) {
        return new CoordRelX(this.c / this.dim.width);
      }
      if (this.isY()) {
        return new CoordRelY(this.c / this.dim.height);
      }
      throw 'Coord: toRel - constructor need to be an CoordX or CoordY!';
    };
    Coord.prototype.toAbs = function() {
      if (this.isAbs()) {
        return this;
      }
      if (this.dim == null) {
        throw 'Coord: toRel - no dimension';
      }
      if (this.isX()) {
        return new CoordAbsX(Math.round(this.c * this.dim.width));
      }
      if (this.isY()) {
        return new CoordAbsY(Math.round(this.c * this.dim.height));
      }
      throw 'Coord: toAbs - constructor need to be an CoordX or CoordY!';
    };
    Coord.prototype.getRel = function() {
      return this.toRel().get();
    };
    Coord.prototype.getAbs = function() {
      return this.toAbs().get();
    };
    return Coord;
  })();
  CoordX = (function() {
    __extends(CoordX, Coord);
    function CoordX() {
      CoordX.__super__.constructor.apply(this, arguments);
    }
    return CoordX;
  })();
  CoordY = (function() {
    __extends(CoordY, Coord);
    function CoordY() {
      CoordY.__super__.constructor.apply(this, arguments);
    }
    return CoordY;
  })();
  CoordAbsX = (function() {
    __extends(CoordAbsX, CoordX);
    function CoordAbsX(c) {
      this.c = c;
      CoordAbsX.__super__.constructor.call(this, this.c, this.type = this.ABS);
    }
    return CoordAbsX;
  })();
  CoordAbsY = (function() {
    __extends(CoordAbsY, CoordY);
    function CoordAbsY(c) {
      this.c = c;
      CoordAbsY.__super__.constructor.call(this, this.c, this.type = this.ABS);
    }
    return CoordAbsY;
  })();
  CoordRelX = (function() {
    __extends(CoordRelX, CoordX);
    function CoordRelX(c) {
      this.c = c;
      CoordRelX.__super__.constructor.call(this, this.c, this.type = this.REL);
    }
    return CoordRelX;
  })();
  CoordRelY = (function() {
    __extends(CoordRelY, CoordY);
    function CoordRelY(c) {
      this.c = c;
      CoordRelY.__super__.constructor.call(this, this.c, this.type = this.REL);
    }
    return CoordRelY;
  })();
  Coord2 = (function() {
    __extends(Coord2, Coord);
    function Coord2(c, type) {
      this.c = c;
      this.type = type != null ? type : this.ABS;
      if (!(this.c instanceof Array && this.c.length === 2)) {
        throw 'Coord2: @c need to be an 2 dimension array';
      }
      if (!(this.c[0] instanceof CoordX)) {
        this.c[0] = new CoordX(this.c[0], this.type);
      }
      if (!(this.c[1] instanceof CoordY)) {
        this.c[1] = new CoordY(this.c[1], this.type);
      }
    }
    Coord2.prototype.get = function() {
      return this.c;
    };
    Coord2.prototype.isRel = function() {
      return this.c[0] instanceof CoordRelX && this.c[0] instanceof CoordRelY;
    };
    Coord2.prototype.isAbs = function() {
      return this.c[0] instanceof CoordAbsX && this.c[0] instanceof CoordAbsY;
    };
    Coord2.prototype.toRel = function() {
      var relX, relY;
      if (this.isRel()) {
        return this;
      }
      relX = new CoordRelX(this.c[0].getRel());
      relY = new CoordRelY(this.c[1].getRel());
      return new CoordRel2([relX, relY]);
    };
    Coord2.prototype.toAbs = function() {
      var absX, absY;
      if (this.isAbs()) {
        return this;
      }
      absX = new CoordAbsX(this.c[0].getAbs());
      absY = new CoordAbsY(this.c[1].getAbs());
      return new CoordAbs2([absX, absY], this.ABS);
    };
    return Coord2;
  })();
  CoordAbs2 = (function() {
    __extends(CoordAbs2, Coord2);
    function CoordAbs2(c) {
      this.c = c;
      CoordAbs2.__super__.constructor.call(this, this.c, this.type = this.ABS);
    }
    return CoordAbs2;
  })();
  CoordRel2 = (function() {
    __extends(CoordRel2, Coord2);
    function CoordRel2(c) {
      this.c = c;
      CoordRel2.__super__.constructor.call(this, this.c, this.type = this.REL);
    }
    return CoordRel2;
  })();
  Scene = (function() {
    function Scene(_arg) {
      var drawObjects;
      this.canvas = _arg.canvas, this.FPS = _arg.FPS, drawObjects = _arg.drawObjects;
      this.ctx = this.canvas.getContext('2d');
      this.drawObjects = drawObjects || [];
    }
    Scene.prototype.render = function() {
      var self;
      self = this;
      this.redraw = false;
      this.loopCycle = function() {
        var e, _i, _len, _ref;
        self.redraw = false;
        _ref = self.drawObjects;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          e = _ref[_i];
          if (e.anim) {
            self.redraw = true;
            self.animate(e);
          }
        }
        if (self.redraw) {
          return self.draw();
        }
      };
      this.resize();
      return setInterval(this.loopCycle, Math.round(1000 / this.FPS));
    };
    Scene.prototype.addDrawObject = function(e) {
      return this.drawObjects.push(e);
    };
    Scene.prototype.resize = function() {
      var dim;
      dim = dimensions.get();
      this.canvas.width = dim.width - 5;
      this.canvas.height = dim.height - 5;
      return this.draw();
    };
    Scene.prototype.draw = function() {
      var e, _i, _len, _ref, _results;
      this.clear();
      _ref = this.drawObjects;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        _results.push(e.draw(this.ctx));
      }
      return _results;
    };
    Scene.prototype.clear = function() {
      this.ctx.fillStyle = '#000';
      return this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };
    Scene.prototype.click = function(point) {
      var e, _i, _len, _ref, _results;
      if (!this.redraw) {
        _ref = this.drawObjects;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          e = _ref[_i];
          _results.push((typeof e.hasPoint === "function" ? e.hasPoint(point) : void 0) ? typeof e.click === "function" ? e.click(point) : void 0 : void 0);
        }
        return _results;
      }
    };
    Scene.prototype.animate = function(e) {
      var akey, aparam, aparamVal, param, paramVal, _base, _ref, _results;
      e.stepCount || (e.stepCount = e.interval * this.FPS / 1000);
      e.stepInd || (e.stepInd = 0);
      e.stepInd += 1;
      if (e.stepInd > e.stepCount) {
        return e.animateEnd();
      }
      _ref = e.animParams;
      _results = [];
      for (akey in _ref) {
        if (!__hasProp.call(_ref, akey)) continue;
        aparam = _ref[akey];
        param = e.params[akey];
        if (!(akey.slice(0, 3) === 'get' && (param != null) && typeof aparam === 'function')) {
          continue;
        }
        paramVal = param().getRel();
        aparamVal = aparam().getRel();
        e.ds[akey] = (aparamVal - paramVal) / (e.stepCount - e.stepInd + 1);
        (_base = e.move)[akey] || (_base[akey] = 0);
        _results.push(e.move[akey] += e.ds[akey]);
      }
      return _results;
    };
    return Scene;
  })();
  DrawObject = (function() {
    function DrawObject() {
      this.move = {};
      this.animateEnd();
    }
    DrawObject.prototype.makeStyle = function(ctx) {};
    DrawObject.prototype.draw = function(ctx) {};
    DrawObject.prototype.animateEnd = function() {
      this.anim = false;
      this.ds = {};
      this.animParams = {};
      this.stepCount = null;
      this.stepInd = null;
      return typeof this.callback === "function" ? this.callback() : void 0;
    };
    DrawObject.prototype.animateStart = function(interval, params, callback) {
      this.callback = function() {};
      this.interval = parseInt(interval, 10);
      if ((callback != null) && typeof callback === 'function') {
        this.callback = callback;
      }
      if (!(this.interval && (params != null) && typeof params === 'object')) {
        return this.animateEnd();
      }
      this.animParams = params;
      return this.anim = true;
    };
    return DrawObject;
  })();
  DrawObjectBox = (function() {
    __extends(DrawObjectBox, DrawObject);
    function DrawObjectBox(params) {
      var key, self, val, _ref;
      this.params = params;
      DrawObjectBox.__super__.constructor.apply(this, arguments);
      _ref = this.params;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        val = _ref[key];
        if (key.slice(0, 3) === 'get') {
          self = this;
          (function(val, key) {
            return self.params[key] = function() {
              var _ref2;
              return val().toRel().add(((_ref2 = self.move) != null ? _ref2[key] : void 0) || 0);
            };
          })(val, key);
        }
      }
    }
    DrawObjectBox.prototype.makeStyle = function(ctx) {
      ctx.strokeStyle = strokeStyle || '#FFF';
      ctx.fillStyle = this.params.color || fillStyle;
      return ctx.lineWidth = this.params.lineWidth || lineWidth;
    };
    DrawObjectBox.prototype.makeShape = function(ctx) {
      var H, W, dim, fill, h, hidden, paramX, paramY, r, stroke, w, x, y;
      stroke = true;
      fill = true;
      r = this.params.borderRadius || borderRadius;
      w = this.params.getWidth().getAbs();
      h = this.params.getHeight().getAbs();
      paramX = this.params.getX().getAbs();
      paramY = this.params.getY().getAbs();
      x = Math.round(paramX - w / 2);
      y = Math.round(paramY - h / 2);
      dim = dimensions.get();
      W = dim.width;
      H = dim.height;
      hidden = x < -w || x > W || y < -h || y > H;
      if (hidden) {
        return;
      }
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arc(x + w - r, y + r, r, 1.5 * Math.PI, 0.0 * Math.PI, false);
      ctx.lineTo(x + w, y + h - r);
      ctx.arc(x + w - r, y + h - r, r, 0.0 * Math.PI, 0.5 * Math.PI, false);
      ctx.lineTo(x + r, y + h);
      ctx.arc(x + r, y + h - r, r, 0.5 * Math.PI, 1.0 * Math.PI, false);
      ctx.lineTo(x, y + r);
      ctx.arc(x + r, y + r, r, 1.0 * Math.PI, 1.5 * Math.PI, false);
      ctx.closePath();
      if (stroke) {
        ctx.stroke();
      }
      if (fill) {
        return ctx.fill();
      }
    };
    DrawObjectBox.prototype.draw = function(ctx) {
      this.makeStyle(ctx);
      return this.makeShape(ctx);
    };
    DrawObjectBox.prototype.hasPoint = function(point) {
      var byHeight, byWidth, key, px, py, r, val, _ref;
      _ref = point.get(), px = _ref[0], py = _ref[1];
      r = {
        px: px,
        py: py,
        x: this.params.getX(),
        y: this.params.getY(),
        w: this.params.getWidth(),
        h: this.params.getHeight()
      };
      for (key in r) {
        if (!__hasProp.call(r, key)) continue;
        val = r[key];
        r[key] = val.getAbs();
      }
      byWidth = r.px > r.x - r.w / 2 && r.px < r.x + r.w / 2;
      byHeight = r.py > r.y - r.h / 2 && r.py < r.y + r.h / 2;
      return byWidth && byHeight;
    };
    return DrawObjectBox;
  })();
  initCanvas = function(callback) {
    var body, bodyStyle, canvas;
    body = document.body;
    bodyStyle = body.style;
    canvas = document.createElement('canvas');
    bodyStyle.margin = '0px';
    if (!canvas.getContext) {
      body.innerHTML = "Your browser don't support html5 canvas";
      return false;
    }
    body.appendChild(canvas);
    return callback(canvas);
  };
  getSmallBoxes = function() {
    var boxes, getHeight, getWidth, getX, getY, i, move;
    getWidth = function() {
      return new CoordAbsX(((new CoordRelX(1)).getAbs() - 4 * borderSpace) / 3);
    };
    getHeight = getWidth;
    getX = function(i) {
      return function() {
        return new CoordAbsX(borderSpace * (i + 1) + getWidth().getAbs() * (i + 0.5));
      };
    };
    getY = function() {
      return new CoordAbsY((new CoordRelY(1)).getAbs() / 2);
    };
    move = [[1, 0], [0, -1], [-1, 0]];
    boxes = [];
    for (i = 0; i <= 2; i++) {
      boxes.push(new DrawObjectBox({
        id: i,
        color: colors[i],
        move: move[i],
        getWidth: getWidth,
        getHeight: getHeight,
        getX: getX(i),
        getY: getY
      }));
    }
    return boxes;
  };
  getBigBoxes = function() {
    var boxes, getHeight, getWidth, getX, getY, i, move, x, xyArr, y, _ref;
    getWidth = function() {
      return new CoordAbsX((new CoordRelX(1)).getAbs() - 2 * borderSpace);
    };
    getHeight = function() {
      return new CoordAbsY((new CoordRelY(1)).getAbs() - 2 * borderSpace);
    };
    getX = function(x) {
      return function() {
        return (new CoordRelX(x)).toAbs();
      };
    };
    getY = function(y) {
      return function() {
        return (new CoordRelY(y)).toAbs();
      };
    };
    xyArr = [[-0.5, 0.5], [0.5, 1.5], [1.5, 0.5]];
    move = [[-1, 0], [0, 1], [1, 0]];
    boxes = [];
    for (i = 0; i <= 2; i++) {
      _ref = xyArr[i], x = _ref[0], y = _ref[1];
      boxes.push(new DrawObjectBox({
        id: i + 3,
        color: colors[i],
        move: move[i],
        getWidth: getWidth,
        getHeight: getHeight,
        getX: getX(x),
        getY: getY(y)
      }));
    }
    return boxes;
  };
  initTestTask = function(canvas) {
    return dimensions.update(function(dim) {
      var bigBoxes, box, boxes, smallBoxes, _i, _len;
      Coord.prototype.dim = dim;
      smallBoxes = getSmallBoxes();
      bigBoxes = getBigBoxes();
      boxes = [].concat(smallBoxes, bigBoxes);
      this.scene = new Scene({
        canvas: canvas,
        FPS: FPS
      });
      for (_i = 0, _len = boxes.length; _i < _len; _i++) {
        box = boxes[_i];
        this.scene.addDrawObject(box);
        box.click = function() {
          var moveX, moveY, _ref;
          _ref = this.params.move, moveX = _ref[0], moveY = _ref[1];
          return boxes.forEach(function(_box) {
            var toX, toY;
            toX = _box.params.getX().toRel().add(moveX);
            toY = _box.params.getY().toRel().add(moveY);
            return _box.animateStart(animationTime, {
              getX: function() {
                return toX;
              },
              getY: function() {
                return toY;
              }
            });
          });
        };
      }
      return this.scene.render();
    });
  };
  window = this.window;
  document = this.document;
  dimensions = new Dimensions(window);
  if (window.addEventListener != null) {
    addEvent = function(elem, type, handler) {
      return elem.addEventListener(type, handler, false);
    };
  } else {
    addEvent = function(elem, type, handler) {
      if (elem.setInterval && elem !== window && !elem.frameElement) {
        elem = window;
      }
      return elem.attachEvent("on" + type, handler);
    };
  }
  addEvent(window, 'load', function() {
    return initCanvas(function(canvas) {
      return initTestTask(canvas);
    });
  });
  addEvent(window, 'resize', function() {
    return dimensions.update(function(dim) {
      Coord.prototype.dim = dim;
      return this.scene.resize();
    });
  });
  addEvent(window, 'click', function(e) {
    if (e.button === 0) {
      return this.scene.click(new CoordAbs2([e.clientX, e.clientY]));
    }
  });
}).call(this);
