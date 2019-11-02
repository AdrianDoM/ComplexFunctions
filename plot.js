"use strict"

const zSpan = document.getElementById('z')

class Plot {

  constructor(canvas, listen, func, originX, originY, scaleX, scaleY) {
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
    this.listeners = []     // List of plots that listen to the value of z in this one

    if (typeof func == 'string') {
      this.func = math.compile(func)
    }
    else 
      this.func = func

    this.canvas.addEventListener('mousemove', event => {
      const { offsetX: x, offsetY: y } = event

      switch (event.buttons) {
        case 0:
          // no button
          break
        case 1:
          // left button
          if (this.listen) break
          this.drawGrid()
          this.drawVector(x, y)
          this.updateZ(this.getNumber({x, y}))
          zSpan.textContent = `${this.z.a} + ${this.z.b}i`
          break
        case 2:
            // right button
            break
        case 4:
          // middle button
          this.ox = x - this.mouseOffsetX
          this.oy = y - this.mouseOffsetY
          this.drawGrid()
          this.drawZ()
          break
      }
    })

    this.canvas.addEventListener('mousedown', event => {
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
    })

    this.drawGrid()
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
    this.ctx.arc(this.ox, this.oy, 5, 0, 2 * Math.PI)
    this.ctx.fill()
  }

  drawVector(x, y) {
    this.ctx.strokeStyle = '#ff0000'
    this.ctx.lineCap = 'round'
    this.ctx.lineWidth = 4
    this.ctx.beginPath()
    this.ctx.moveTo(this.ox, this.oy)
    this.ctx.lineTo(x, y)
    this.ctx.stroke()
  }

  locateNumber({a, b}) {
    return { x: this.ox + a * this.sx, y: this.oy - b * this.sy }
  }

  getNumber({x, y}) {
    return { a: (x - this.ox) / this.sx, b: (this.oy - y) / this.sy }
  }

  updateZ(z) {
    this.z = z
    if (!this.listen) zSpan.textContent = `${z.a} + ${z.b}i`
    for (const listener of this.listeners)
      listener.passZ(z)

    this.drawGrid()
    this.drawZ()
  }

  passZ(z) {
    if (!this.func) {
      this.updateZ(z)
      return
    }
    
    const complexZ = math.complex(z.a, z.b)
    const complexW = this.func.evaluate({ z: complexZ })
    const w = { a: complexW.re, b: complexW.im }
    this.updateZ(w)
  }

  drawZ() {
    if (!this.z) return
    const {x, y} = this.locateNumber(this.z)
    this.drawVector(x, y)
  }

  resetView() {
    this.ox = this.width  / 2
    this.oy = this.height / 2
    this.sx = this.width  / 5
    this.sy = this.sx

    this.drawGrid()
    this.drawZ()
  }

}

const domainCanv = document.getElementById('domain')
const domainPlot = new Plot(domainCanv)
const imageCanv = document.getElementById('image')
const imagePlot = new Plot(imageCanv, domainPlot, '1/z')
