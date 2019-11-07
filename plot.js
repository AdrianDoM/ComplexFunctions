"use strict"

class Plot {

  constructor(canvas, talkers=[], mouseVar, originX, originY, scaleX, scaleY) {
    this.canvas = canvas
    this.ctx    = canvas.getContext('2d', { alpha: false })
    this.width  = canvas.width
    this.height = canvas.height

    this.ox     = originX == undefined ? this.width  / 2 : originX
    this.oy     = originY == undefined ? this.height / 2 : originY

    this.sx     = scaleX  == undefined ? this.width  / 5 : scaleX
    this.sy     = scaleY  == undefined ? this.sx         : scaleY

    this.value    = null
    this.mouseVar = mouseVar
    if (this.mouseVar) {
      this.mouseVar.mouseControlled = true
      talkers.push(this.mouseVar)
    }

    this.talkers = talkers
    for (const talker of this.talkers)
      talker.addListener(this)

    this.isAnimating = false

    this.mouseOffsetX = undefined
    this.mouseOffsetY = undefined
    this.shiftPressed = false
    this.leftPressed  = false

    this.canvas.addEventListener( 'mousemove', e => this.mousemoveHandler (e) )
    this.canvas.addEventListener( 'mousedown', e => this.mousedownHandler (e) )
    this.canvas.addEventListener(   'mouseup', e => this.mouseupHandler   (e) )
    this.canvas.addEventListener('touchstart', e => this.touchstartHandler(e) )
    this.canvas.addEventListener( 'touchmove', e => this.touchmoveHandler (e) )
    this.canvas.addEventListener(     'wheel', e => this.wheelHandler     (e) )

    this.draw()
  }

  draw() {
    this.drawGrid()
    for (const talker of this.talkers)
      talker.draw(this)
  }

  drawGrid() {
    // Draw background
    this.ctx.fillStyle = '#f0f0f0'
    this.ctx.fillRect(0, 0, this.width, this.height)
    // Draw grid
    this.ctx.strokeStyle = '#666666'
    this.ctx.lineWidth = 2
    // Vertical lines to right of origin
    for (let x = this.ox + this.sx; x <= this.width; x += this.sx) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.height)
      this.ctx.stroke()
    }
    // Vertical lines to left of origin
    for (let x = this.ox - this.sx; x >= 0; x -= this.sx) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.height)
      this.ctx.stroke()
    }
    // Horizontal lines below origin
    for (let y = this.oy + this.sy; y <= this.height; y += this.sy) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.width, y)
      this.ctx.stroke()
    }
    // Horizontal lines above origin
    for (let y = this.oy - this.sy; y >= 0; y -= this.sy) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.width, y)
      this.ctx.stroke()
    }
    // Axis styling
    this.ctx.strokeStyle = '#050580'
    this.ctx.lineWidth = 4
    // Draw x axis
    this.ctx.beginPath()
    this.ctx.moveTo(this.ox, 0)
    this.ctx.lineTo(this.ox, this.height)
    this.ctx.stroke()
    // Draw y axis
    this.ctx.beginPath()
    this.ctx.moveTo(0, this.oy)
    this.ctx.lineTo(this.width, this.oy)
    this.ctx.stroke()
    // Draw origin
    this.ctx.fillStyle = '#0808B0'
    this.ctx.beginPath()
    this.ctx.arc(this.ox, this.oy, 4, 0, 2 * Math.PI)
    this.ctx.fill()
  }

  locateNumber({re, im}) {
    return { x: this.ox + re * this.sx, y: this.oy - im * this.sy }
  }

  getNumber({x, y}) {
    return math.complex((x - this.ox) / this.sx, (this.oy - y) / this.sy)
  }

  resetView() {
    this.ox = this.width  / 2
    this.oy = this.height / 2
    this.sx = this.width  / 5
    this.sy = this.sx

    this.draw()
  }

  mousemoveHandler(event) {
    event.preventDefault()
    if (event.buttons == 4 || (event.buttons == 1 && this.shiftPressed) ) {
      // middle button OR shift + left button
      if (this.mouseOffsetX != undefined) {
        this.ox = event.offsetX - this.mouseOffsetX
        this.oy = event.offsetY - this.mouseOffsetY
        this.draw()
      }
    }
    else if (event.buttons == 1 && this.leftPressed &&
             this.mouseVar && this.mouseVar.mouseControlled) {
      // left button
      const newValue = this.getNumber({x: event.offsetX, y: event.offsetY})
      this.mouseVar.set(newValue)
    }
  }

  mousedownHandler(event) {
    event.preventDefault()  
    if (event.button == 1 || (event.button == 0 && event.shiftKey) ) {
      // middle button OR shift + left button
      this.mouseOffsetX = event.offsetX - this.ox
      this.mouseOffsetY = event.offsetY - this.oy
      this.canvas.style.cursor = "move"
      if (event.shiftKey)
        this.shiftPressed = true
    }
    else if (event.button == 0 && this.mouseVar && this.mouseVar.mouseControlled) {
      // left button
      const newValue = this.getNumber({x: event.offsetX, y: event.offsetY})
      this.mouseVar.set(newValue)
      this.leftPressed = true
    }
  }

  mouseupHandler(event) {
    event.preventDefault()
    if (event.button == 1 || (event.button == 0 && this.shiftPressed) ) {
      // middle button OR shift + left button
      this.mouseOffsetX = undefined
      this.mouseOffsetY = undefined
      this.canvas.style.cursor = "auto"
      this.shiftPressed = false
    }
    else if (event.button == 0) {
      // left button
      this.leftPressed = false
    }
  }

  wheelHandler(event) {
    event.preventDefault()

    const { offsetX: x, offsetY: y, deltaY: dy } = event
    let mouseZ = this.getNumber({x, y})

    // Update scale
    this.sx += dy * -0.15
    this.sy += dy * -0.15

    // Restrict scale
    this.validateScale()

    // Relocate origin so that point under mouse stays constant
    let { x: newX, y: newY } = this.locateNumber(mouseZ)
    this.ox += x - newX
    this.oy += y - newY
    this.draw()
  }

  touchstartHandler(event) {
    if (event.touches.length >= 2) {
      const zs = this.getTouchNumbers(event)
      if (zs != undefined) {
        const diff = math.subtract(zs.z2, zs.z1)
        
        this.touchDist = math.abs(diff)
        this.touchMid  = math.chain(diff).divide(2).add(zs.z1).done()
      }
    }
  }

  touchmoveHandler(event) {
    event.preventDefault()

    if (event.touches.length == 1 && this.mouseVar && this.mouseVar.mouseControlled) {
      const touch = event.changedTouches.item(0),
      rect = this.canvas.getBoundingClientRect(),
      x = touch.clientX - rect.left,
      y = touch.clientY - rect.top,
      newValue = this.getNumber({x: x, y: y})
      this.mouseVar.set(newValue)
    }

    else if (event.touches.length >= 2) {
      const zs = this.getTouchNumbers(event)
      if (zs != undefined) {
        const
        diff = math.subtract(zs.z2, zs.z1),
        newDist = math.abs(diff),
        deltaS = newDist / this.touchDist

        this.sx *= deltaS
        this.sy *= deltaS

        this.validateScale()

        const
        newMid = math.chain(diff).divide(2).add(zs.z1).done(),
        delta0 = math.subtract(newMid, this.touchMid),
        deltaO = this.locateNumber(delta0)
        
        this.ox = deltaO.x
        this.oy = deltaO.y

        this.draw()
      }
    }
  }

  validateScale() {
    this.sx = Math.max(10, Math.min(this.sx, 600))
    this.sy = Math.max(10, Math.min(this.sy, 600))
  }

  getTouchNumbers(event) {
    const
    rect = this.canvas.getBoundingClientRect(),
    t1 = event.touches.item(0),
    t2 = event.touches.item(1)

    const 
    x1 = t1.clientX - rect.left,
    y1 = t1.clientY - rect.top,
    x2 = t2.clientX - rect.left,
    y2 = t2.clientY - rect.top

    const
    x1In = 0 <= x1 && x1 <= this.width,
    y1In = 0 <= y1 && y1 <= this.height,
    x2In = 0 <= x2 && x2 <= this.width,
    y2In = 0 <= y2 && y2 <= this.height

    if (x1In && y1In && x2In && y2In) {
      const
      z1 = this.getNumber({ x: x1, y: y1 }),
      z2 = this.getNumber({ x: x2, y: y2 })
      
      return {z1, z2}
    }

    return undefined
  }

  addTalker(talker) {
    if (!this.talkers.includes(talker))
      this.talkers.push(talker)
    talker.addListener(this)
  }

  removeTalker(talker) {
    const i = this.talkers.indexOf(talker)
    if (i < 0) throw new Error('Talker not found.')
    else {
      this.talkers.splice(i, 1)
      talker.removeListener(this)
    }
  }

  varUpdate(talker) {
    if (!this.talkers.includes(talker))
      throw new Error('Received update from unregistered talker.')

    if (this.isAnimating) {
      const animatedTalkers = this.talkers.filter( t => t.isAnimating )
      const talkerTicks = animatedTalkers.map( t => t.tick )

      if (talkerTicks.some( tick => tick != talkerTicks[0] ) ||
          this.tick == talkerTicks[0])
        // If all talkers are not at the same tick
        // Or we are already at the given tick
        // Don't update
        return
      else
        // If they are all the same, update state and tick
        this.tick = talkerTicks[0]
    }
    
    this.draw()
  }

  startAnimation() {
    this.isAnimating = true
  }

  endAnimation() {
    this.isAnimating = false
    this.tick = undefined
  }

}