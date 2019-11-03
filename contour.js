"use strict"

class Contour {

  constructor(name, func, param, from=0, to=1, steps=100, timeInterval=20, color='green') {
    this.name  = name
    this.func  = math.parse(func)
    this.param = new Variable(param)

    this.derivative = math.derivative(this.func, param)

    this.func       = this.func.compile()
    this.derivative = this.derivative.compile()
    
    this.from         = from
    this.to           = to
    this.steps        = steps
    this.stepSize     = (to - from) / steps
    this.timeInterval = timeInterval
    
    this.color = color
    
    this.dVar = new Variable('d' + this.name, this.color, this.derivative, [this.param])
    
    this.listeners = []
  }

  draw(plot) {
    plot.ctx.lineWidth = 2
    plot.ctx.strokeStyle = this.color

    let {x, y} = plot.locateNumber(this.func.evaluate(this.getContext(this.from)))

    plot.ctx.beginPath()
    plot.ctx.moveTo(x, y)

    let t, z,
    stop = this.animationID == undefined ? this.to : this.param.value
    for (t = this.from + this.stepSize; t <= stop; t += this.stepSize) {
      z = this.func.evaluate(this.getContext(t))
      ;({x, y} = plot.locateNumber(z))
      plot.ctx.lineTo(x, y)
    }

    plot.ctx.stroke()

    if (this.animationID != undefined) { // Plot derivative
      const {x: dx, y: dy} = plot.locateNumber(math.add(z, this.dVar.value))

      plot.ctx.lineWidth = 2
      plot.ctx.strokeStyle = this.color
      plot.ctx.beginPath()
      plot.ctx.moveTo(x, y)
      plot.ctx.lineTo(dx, dy)
      plot.ctx.stroke()
    }
  }

  getContext(value=this.param.value) {
    return { [this.param.name]: value }
  }

  animate() {
    // Stop previous animation if there was one
    if (this.animationID != undefined)
      window.clearInterval(this.animationID)

    this.param.set(this.from)

    this.animationID = window.setInterval( () => {
      this.param.set(this.param.value + this.stepSize)
      
      if (this.param.value >= this.to) { // End animation
        window.clearInterval(this.animationID)
        this.animationID = undefined
        this.param.set()
        this.set()
      } else { // Update z 
        this.set(this.func.evaluate(this.getContext()))
      }
    }, this.timeInterval)
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