"use strict"

class Plot {

  constructor(canvas, listen, func, contour, originX, originY, scaleX, scaleY) {
    this.canvas = canvas
    this.ctx    = canvas.getContext('2d', { alpha: false })
    this.width  = canvas.width
    this.height = canvas.height

    this.ox     = originX == undefined ? this.width  / 2 : originX
    this.oy     = originY == undefined ? this.height / 2 : originY

    this.sx     = scaleX  == undefined ? this.width  / 5 : scaleX
    this.sy     = scaleY  == undefined ? this.sx         : scaleY

    if (listen) listen.listeners.push(this)
    this.listen    = listen // Plot from which this one obtains the value of z
    this.listeners = []     // List of elements that listen to the value of z in this one

    if (typeof func == 'string') this.func = math.compile(func)
    else this.func = func

    this.contour = contour

    this.canvas.addEventListener('mousemove', e => this.mousemoveHandler(e) )
    this.canvas.addEventListener('mousedown', e => this.mousedownHandler(e) )
    this.canvas.addEventListener(    'wheel', e => this.wheelHandler    (e) )

    this.draw()
  }

  draw() {
    this.drawGrid()
    if (this.contour) this.contour.draw(this)
    if (this.z) this.drawZ()
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

  drawVector({x, y}) {
    this.ctx.strokeStyle = '#ff0000'
    this.ctx.lineCap = 'round'
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.moveTo(this.ox, this.oy)
    this.ctx.lineTo(x, y)
    this.ctx.stroke()

    this.ctx.fillStyle = '#ff0000'
    this.ctx.beginPath()
    this.ctx.arc(x, y, 4, 0, 2 * Math.PI)
    this.ctx.fill()
  }

  locateNumber({re, im}) {
    return { x: this.ox + re * this.sx, y: this.oy - im * this.sy }
  }

  getNumber({x, y}) {
    return math.complex((x - this.ox) / this.sx, (this.oy - y) / this.sy)
  }

  updateZ(z) {
    this.z = z
    for (const listener of this.listeners)
      listener.passZ(z, this)

    this.draw()
  }

  passZ(z, talker) {
    if (talker != this.listen) return

    if (!this.func)
      this.updateZ(z)
    else {
      const w = this.func.evaluate({z: z})
      this.updateZ(w)
    }
  }

  drawZ() {
    if (!this.z) return
    const pos = this.locateNumber(this.z)
    this.drawVector(pos)
  }

  resetView() {
    this.ox = this.width  / 2
    this.oy = this.height / 2
    this.sx = this.width  / 5
    this.sy = this.sx

    this.draw()
  }

  mousemoveHandler(event) {
    const { offsetX: x, offsetY: y } = event

    switch (event.buttons) {
      case 0:
        // no button
        break
      case 1:
        // left button
        if (this.listen) break
        this.updateZ(this.getNumber({x, y}))
        this.draw()
        break
      case 2:
          // right button
          break
      case 4:
        // middle button
        this.ox = x - this.mouseOffsetX
        this.oy = y - this.mouseOffsetY
        this.draw()
        break
    }
  }

  mousedownHandler(event) {
    switch (event.button) {
      case 0:
        // left button
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

  wheelHandler(event) {
    const { offsetX: x, offsetY: y, deltaY: dy } = event
    let mouseZ = this.getNumber({x, y})

    // Update scale
    this.sx += dy * -0.15
    this.sy += dy * -0.15

    // Restrict scale
    this.sx = Math.max(10, Math.min(this.sx, 300))
    this.sy = Math.max(10, Math.min(this.sy, 300))

    // Relocate origin so that point under mouse stays constant
    let { x: newX, y: newY } = this.locateNumber(mouseZ)
    this.ox += x - newX
    this.oy += y - newY
    this.draw()
  }

  updateListen(newListen) {
    if (this.listen && this.listen != newListen) // Remove from previous listen's listeners list
      this.listen.listeners.filter( obj => obj != this )
    this.listen = newListen
  }

}