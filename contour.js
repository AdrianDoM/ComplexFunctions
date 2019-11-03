"use strict"

class Contour {

  constructor(func, param, plots, listeners, from=0, to=1, steps=100) {
    this.func = math.parse(func)
    this.p = param
    this.derivative = math.derivative(this.func, param)

    this.func = this.func.compile()
    this.derivative = this.derivative.compile()

    this.from     = from
    this.to       = to
    this.steps    = steps
    this.stepSize = (to - from) / steps

    this.listeners = listeners == undefined ? [] : listeners

    this.plots = plots
    for (const plot of this.plots) {
      plot.contour = this
      plot.draw()
    }
  }

  draw(plot) {
    plot.ctx.lineWidth = 2
    plot.ctx.strokeStyle = 'green'

    plot.ctx.beginPath()
    let { x, y } = plot.locateNumber(this.func.evaluate({ [this.p]: this.from }))
    plot.ctx.moveTo(x, y)

    let z, stop = this.t == undefined ? this.to : this.t
    for (let t = this.from + this.stepSize; t <= stop; t += this.stepSize) {
      z = this.func.evaluate({ [this.p]: t })
      ;({ x, y } = plot.locateNumber(z))
      plot.ctx.lineTo(x, y)
    }

    plot.ctx.stroke()
  }

  linkToPlot(plot) {
    this.plots.push(plot)
    plot.contour = this
    plot.draw()
  }

  animate() {
    // Stop previous animation if there was one
    if (this.animationID != undefined)
      window.clearInterval(this.animationID)

    this.signalListeners(true)
    this.t = this.from

    this.animationID = window.setInterval( () => {
      this.t += this.stepSize
      
      if (this.t >= this.to) { // End animation
        window.clearInterval(this.animationID)
        this.animationID = undefined
        this.t = undefined
        this.signalListeners(false)
      } else { // Update z 
        this.updateZ(this.func.evaluate({ [this.p]: this.t }))
      }
    }, 20)
  }

  updateZ(z) {
    this.z = z

    if (z == undefined) return

    for (const listener of this.listeners)
      listener.passZ(z, this)
  }

  signalListeners(talking) {
    for (const listener of this.listeners)
      listener.updateListen(talking ? this : undefined)
  }

}