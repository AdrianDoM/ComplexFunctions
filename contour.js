"use strict"

class Contour {

  constructor(name, func, param, {color='green'} = {}) {
    this.name  = name
    this.func  = math.parse(func)

    this.param = param
    this.param.addListener(this)

    this.derivative = math.derivative(this.func, this.param.name)

    this.func       = this.func.compile()
    this.derivative = this.derivative.compile()
    
    this.color = color

    this.isAnimating = false
    
    this.listeners = []
  }

  draw(plot) {
    plot.ctx.lineWidth = 3
    plot.ctx.strokeStyle = this.color

    let {x, y} = plot.locateNumber(this.eval(this.param.from))

    plot.ctx.beginPath()
    plot.ctx.moveTo(x, y)

    let t, z,
    stop = this.param.isAnimating ? this.param.value : this.param.to
    for (t = this.param.from + this.param.stepSize; t <= stop; t += this.param.stepSize) {
      z = this.eval(t)
      ;({x, y} = plot.locateNumber(z))
      plot.ctx.lineTo(x, y)
    }

    plot.ctx.stroke()
  }

  eval(value=this.param.value) {
    if (this.func == undefined)
      return value
    
    const ctx = { [this.param.name]: value }
    return this.func.evaluate(ctx)
  }

  varUpdate(talker) {
    if (talker != this.param)
      throw new Error('Received update from unregistered talker.')

    if (this.isAnimating) {
      if (this.tick != talker.tick)
        this.tick = talker.tick
      else
        return
    }

    if (this.func == undefined || talker.value == undefined)
      this.set(talker.value)
    else
      this.set(this.eval())
  }

  startAnimation() {
    if (!this.isAnimating) {
      this.isAnimating = true
      for (const listener of this.listeners)
        listener.startAnimation()
    }
  }

  endAnimation() {
    if (this.isAnimating) {
      this.isAnimating = false
      this.tick = undefined
      for (const listener of this.listeners)
        listener.endAnimation()
    }
  }

  set(value) {
    this.value = value
    for (const elem of this.listeners)
      elem.varUpdate(this)
  }

  addListener(listener) {
    if (!this.listeners.includes(listener))
      this.listeners.push(listener)
  }

  removeListener(listener) {
    const i = this.listeners.indexOf(listener)
    if (i < 0) throw new Error('Listener not found.')
    else this.listeners.splice(i, 1)
  }

}