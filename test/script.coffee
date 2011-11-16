colors        = ['#E71212', '#509B13', '#16498E']
strokeStyle   = '#FFF'
borderSpace   = 50
borderRadius  = 5
lineWidth     = 8
animationTime = 2500
FPS           = 60



class Dimensions

  constructor: ()->

  calc:()->
    width = height = 0
    if window.innerWidth
      width  = window.innerWidth
      height = window.innerHeight
    else if document.body and document.body.clientWidth
      width  = document.body.clientWidth
      height = document.body.clientHeight
    if document.documentElement and document.documentElement.clientWidth
      width  = document.documentElement.clientWidth
      height = document.documentElement.clientHeight
    @dim = {width, height}

  get: ()-> @dim

  update: (callback)->
    @calc()
    callback? @dim



# abstract class
class Coord

  dim : null
  ABS : 'abs'
  REL : 'rel'

  constructor: (@c, @type = @ABS)->
    if @constructor is Coord then throw 'Coord is abstract class, use CoordX or CoordY'
    unless @c? then throw 'Coord: constructor - no value'
    if @type is @ABS then @c = Math.round @c

  copy: ()-> new @constructor @c, @type

  add:(v)->
    @c += v
    @

  isAbs: ()-> @type is @ABS

  isRel: ()-> @type is @REL

  isX: ()-> @ instanceof CoordX

  isY: ()-> @ instanceof CoordY

  get: ()-> @c

  toRel: ()->
    if @isRel() then return @
    unless @dim? then throw 'Coord: toRel - no dimension'
    if @isX() then return new CoordRelX @c / @dim.width
    if @isY() then return new CoordRelY @c / @dim.height
    throw 'Coord: toRel - constructor need to be an CoordX or CoordY!'

  toAbs: ()->
    if @isAbs() then return @
    unless @dim? then throw 'Coord: toRel - no dimension'
    if @isX() then return new CoordAbsX Math.round @c * @dim.width
    if @isY() then return new CoordAbsY Math.round @c * @dim.height
    throw 'Coord: toAbs - constructor need to be an CoordX or CoordY!'

  getRel: ()->  @toRel().get()

  getAbs: ()->  @toAbs().get()



class CoordX extends Coord

class CoordY extends Coord

class CoordAbsX extends CoordX
  constructor: (@c)-> super @c, @type = @ABS

class CoordAbsY extends CoordY
  constructor: (@c)-> super @c, @type = @ABS

class CoordRelX extends CoordX
  constructor: (@c)-> super @c, @type = @REL

class CoordRelY extends CoordY
  constructor: (@c)-> super @c, @type = @REL



class Coord2 extends Coord

  constructor: (@c, @type = @ABS)->
    unless @c instanceof Array and @c.length is 2 then throw 'Coord2: @c need to be an 2 dimension array'
    unless @c[0] instanceof CoordX then @c[0] = new CoordX @c[0], @type
    unless @c[1] instanceof CoordY then @c[1] = new CoordY @c[1], @type

  get: ()-> @c

  isRel: ()-> @c[0] instanceof CoordRelX and @c[0] instanceof CoordRelY

  isAbs: ()-> @c[0] instanceof CoordAbsX and @c[0] instanceof CoordAbsY

  toRel: ()->
    if @isRel() then return @
    relX = new CoordRelX @c[0].getRel()
    relY = new CoordRelY @c[1].getRel()
    new CoordRel2 [relX, relY]

  toAbs: ()->
    if @isAbs() then return @
    absX = new CoordAbsX @c[0].getAbs()
    absY = new CoordAbsY @c[1].getAbs()
    new CoordAbs2 [absX, absY], @ABS



class CoordAbs2 extends Coord2
  constructor: (@c)-> super @c, @type = @ABS

class CoordRel2 extends Coord2
  constructor: (@c)-> super @c, @type = @REL



class Scene

  constructor: ({@canvas, @FPS, drawObjects})->
    @ctx = @canvas.getContext '2d'
    @drawObjects = drawObjects or []

  render: ()->
    self = @
    @redraw = no
    @loopCycle = ()->
      self.redraw = no
      for e in self.drawObjects
        if e.anim
          self.redraw = yes
          self.animate e
      self.draw() if self.redraw
    @resize()
    setInterval @loopCycle, Math.round 1000 / @FPS

  addDrawObject: (e)-> @drawObjects.push e

  resize: ()->
    dim = dimensions.get()
    @canvas.width  = dim.width  - 5 # resize canvas and turn off browser scrollbars
    @canvas.height = dim.height - 5
    @draw()

  draw: ()->
    @clear()
    for e in @drawObjects
      e.draw @ctx

  clear: ()->
    @ctx.fillStyle = '#000';
    @ctx.fillRect 0, 0, @canvas.width, @canvas.height

  click: (point)->
    unless @redraw
      for e in @drawObjects
        if e.hasPoint? point
          e.click? point

  animate: (e)->
    e.stepCount or= e.interval * @FPS / 1000
    e.stepInd   or= 0
    e.stepInd    += 1
    if e.stepInd > e.stepCount
      return e.animateEnd()
    for own akey, aparam of e.animParams
      param = e.params[akey]
      unless akey.slice(0,3) is 'get' and param? and typeof aparam is 'function'
        continue
      paramVal       = param().getRel()
      aparamVal      = aparam().getRel()
      e.ds[akey]     = (aparamVal - paramVal) / (e.stepCount - e.stepInd + 1)
      e.move[akey] or= 0
      e.move[akey]  += e.ds[akey]



class DrawObject

  constructor: ()->
    @move = {}
    @animateEnd()
#    @childs = []

#  addChild: (e)->
#    @childs.push e

  makeStyle: (ctx)->

  draw: (ctx)->

  animateEnd: ()->
    @anim       = no
    @ds         = {}
    @animParams = {}
    @stepCount  = null
    @stepInd    = null
    return @callback?()

  animateStart: (interval, params, callback)->
    @callback   = ()->
    @interval   = parseInt interval, 10
    if callback? and typeof callback is 'function'
      @callback = callback
    unless @interval and params? and typeof params is 'object'
      return @animateEnd()
    @animParams = params
    @anim = yes




class DrawObjectBox extends DrawObject

  # {@id, @color, @borderRadius, @getX, @getY, @getWidth, @getHeight, etc...}
  constructor: (@params)->
    super
    for own key, val of @params
      if key.slice(0, 3) is 'get'
        self = @
        ((val, key)->
          self.params[key] = ()->
            val().toRel().add (self.move?[key] or 0)
        )(val, key)


  makeStyle: (ctx)->
    ctx.strokeStyle = strokeStyle       or '#FFF'
    ctx.fillStyle   = @params.color     or fillStyle
    ctx.lineWidth   = @params.lineWidth or lineWidth

  makeShape: (ctx)->
    stroke = yes
    fill   = yes
    r = @params.borderRadius or borderRadius
    w = @params.getWidth().getAbs()
    h = @params.getHeight().getAbs()
    paramX = @params.getX().getAbs()
    paramY = @params.getY().getAbs()
    x = Math.round  paramX - w  / 2
    y = Math.round  paramY - h  / 2
    dim = dimensions.get()
    W = dim.width
    H = dim.height
    hidden = x < -w or x  > W or y < -h or y > H
    if hidden then return
    ctx.beginPath()
    ctx.moveTo     x + r, y
    ctx.lineTo     x + w - r, y
    ctx.arc        x + w - r, y + r, r, 1.5 * Math.PI, 0.0 * Math.PI, no
    ctx.lineTo     x + w, y + h - r
    ctx.arc        x + w - r, y + h - r, r, 0.0 * Math.PI, 0.5 * Math.PI, no
    ctx.lineTo     x + r, y + h
    ctx.arc        x + r, y + h - r, r, 0.5 * Math.PI, 1.0 * Math.PI, no
    ctx.lineTo     x, y + r
    ctx.arc        x + r, y + r, r, 1.0 * Math.PI, 1.5 * Math.PI, no
    ctx.closePath()
    ctx.stroke() if stroke
    ctx.fill() if fill

  draw: (ctx)->
    @makeStyle ctx
    @makeShape ctx

  hasPoint: (point)->
    [px, py] = point.get()
    r =
      px : px
      py : py
      x  : @params.getX()
      y  : @params.getY()
      w  : @params.getWidth()
      h  : @params.getHeight()
    for own key, val of r
      r[key] = val.getAbs()
    byWidth  = r.px > r.x - r.w / 2 and r.px < r.x + r.w / 2
    byHeight = r.py > r.y - r.h / 2 and r.py < r.y + r.h / 2
    return byWidth and byHeight




initCanvas = (callback)->
  body                 = document.body
  bodyStyle            = body.style
  canvas               = document.createElement 'canvas'
  bodyStyle.margin     = '0px'; # erase default browser body margin
#  bodyStyle.background = '#000'
  unless canvas.getContext
    body.innerHTML = "Your browser don't support html5 canvas"
    return off
  body.appendChild canvas
  callback canvas




getSmallBoxes = ()->
  getWidth  = ()-> new CoordAbsX ( (new CoordRelX 1).getAbs() - 4 * borderSpace ) / 3
  getHeight = getWidth
  getX      = (i)-> ()-> new CoordAbsX borderSpace * (i + 1) + getWidth().getAbs() * (i + 0.5)
  getY      = ()-> new CoordAbsY (new CoordRelY 1).getAbs() / 2
  move  = [[1, 0], [0, -1], [-1, 0]]
  boxes = []
  for i in [0..2]
    boxes.push new DrawObjectBox
      id           : i
      color        : colors[i]
      move         : move[i]
      getWidth     : getWidth
      getHeight    : getHeight
      getX         : getX i
      getY         : getY
  boxes



getBigBoxes = ()->
  getWidth  = ()-> new CoordAbsX (new CoordRelX 1).getAbs() - 2 * borderSpace
  getHeight = ()-> new CoordAbsY (new CoordRelY 1).getAbs() - 2 * borderSpace
  getX      = (x)-> ()-> (new CoordRelX x).toAbs()
  getY      = (y)-> ()-> (new CoordRelY y).toAbs()
  xyArr  = [[-0.5, 0.5], [0.5, 1.5], [1.5, 0.5]]
  move   = [[-1, 0], [0, 1], [1, 0]]
  boxes  = []
  for i in [0..2]
    [x, y] = xyArr[i]
    boxes.push new DrawObjectBox
      id           : i + 3
      color        : colors[i]
      move         : move[i]
      getWidth     : getWidth
      getHeight    : getHeight
      getX         : getX x
      getY         : getY y
  boxes



initTestTask = (canvas)->
  dimensions.update (dim)->
    Coord::dim = dim
    smallBoxes = getSmallBoxes()
    bigBoxes   = getBigBoxes()
    boxes      = [].concat smallBoxes, bigBoxes
    # SCENE
    @scene     = new Scene {canvas, FPS}
    for box in boxes
      @scene.addDrawObject box
      box.click = ()->
        [moveX, moveY] = @params.move
        boxes.forEach (_box) ->
          toX = _box.params.getX().toRel().add moveX
          toY = _box.params.getY().toRel().add moveY
          _box.animateStart animationTime,
            getX : ()-> toX
            getY : ()-> toY
    @scene.render()



# module vars
window     = @window
document   = @document
dimensions = new Dimensions window



if window.addEventListener?
  addEvent = (elem, type, handler)->
    elem.addEventListener type, handler, false
else
  addEvent = (elem, type, handler)->
    if elem.setInterval and elem isnt window and not elem.frameElement
      elem = window
    elem.attachEvent "on" + type, handler


addEvent window, 'load', ()->
  initCanvas (canvas)->
    initTestTask canvas


addEvent window, 'resize', ()->
  dimensions.update (dim)->
    Coord::dim = dim
    @scene.resize()


addEvent window, 'click', (e)->
  if e.button is 0
    @scene.click new CoordAbs2 [e.clientX, e.clientY]
#  if e.button is 1
#    for own k,v of @scene.drawObjects
##      if v.params.id is 4
#        console.log v.params.id, v

