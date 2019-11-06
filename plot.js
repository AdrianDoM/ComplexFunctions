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
    if (this.mouseVar)
      talkers.push(this.mouseVar)

    this.talkers = talkers
    for (const talker of this.talkers)
      talker.addListener(this)

    this.isAnimating = false

    this.canvas.addEventListener('mousemove', e => this.mousemoveHandler(e) )
    this.canvas.addEventListener('mousedown', e => this.mousedownHandler(e) )
    this.canvas.addEventListener(  'mouseup', e => this.mouseupHandler  (e) )
    this.canvas.addEventListener('touchmove', e => this.touchmoveHandler(e) )
    this.canvas.addEventListener(    'wheel', e => this.wheelHandler    (e) )

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
    switch (event.buttons) {
      case 0:
        // no button
        break
      case 1:
        // left button
        if (this.mouseVar) {
          const newValue = this.getNumber({x: event.offsetX, y: event.offsetY})
          this.mouseVar.set(newValue)
        }
        break
      case 2:
        // right button
        break
      case 4:
        // middle button
        if (this.mouseOffsetX != undefined) {
          this.ox = event.offsetX - this.mouseOffsetX
          this.oy = event.offsetY - this.mouseOffsetY
          this.draw()
        }
        break
    }
  }

  mousedownHandler(event) {
    switch (event.button) {
      case 0:
        // left button
        if (this.mouseVar) {
          const newValue = this.getNumber({x: event.offsetX, y: event.offsetY})
          this.mouseVar.set(newValue)
        }
        break
      case 1:
        // middle button
        this.mouseOffsetX = event.offsetX - this.ox
        this.mouseOffsetY = event.offsetY - this.oy
        break
      case 2:
        // right button
        break
    }
  }

  mouseupHandler(event) {
    switch (event.button) {
      case 0:
        // left button
        break
      case 1:
        // middle button
        this.mouseOffsetX = undefined
        this.mouseOffsetY = undefined
        break
      case 2:
        // right button
        break
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
    this.sx = Math.max(10, Math.min(this.sx, 500))
    this.sy = Math.max(10, Math.min(this.sy, 500))

    // Relocate origin so that point under mouse stays constant
    let { x: newX, y: newY } = this.locateNumber(mouseZ)
    this.ox += x - newX
    this.oy += y - newY
    this.draw()
  }

  touchmoveHandler(event) {
    if (this.mouseVar) {
      event.preventDefault()
      const touch = event.changedTouches.item(0),
      rect = this.canvas.getBoundingClientRect(),
      x = touch.pageX - rect.left,
      y = touch.pageY - rect.top,
      newValue = this.getNumber({x: x, y: y})
      this.mouseVar.set(newValue)
    }
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