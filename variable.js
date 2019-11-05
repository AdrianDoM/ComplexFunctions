"use strict"

class Variable {

  constructor(name, func, params=[], color="red", capture=true) {
    this.name  = name

    if (typeof func == 'string')
      this.func = math.compile(func)
    else if (typeof func == 'object')
      this.func = func
      
    if (func == undefined && params.length > 1)
      throw new Error('Several paramenters but no function provided.')
    
    this.talkers = params
    for (const talker of this.talkers)
      talker.addListener(this)
    
    this.color   = color
    this.capture = capture
    
    this.isAnimating = false

    this.listeners = []
  }

  draw(plot) {
    if (this.value == undefined) return
    const {x, y} = plot.locateNumber(this.value)

    plot.ctx.strokeStyle = this.color
    plot.ctx.lineCap = 'round'
    plot.ctx.lineWidth = 4

    plot.ctx.beginPath()
    plot.ctx.moveTo(plot.ox, plot.oy)
    plot.ctx.lineTo(x, y)
    plot.ctx.stroke()

    plot.ctx.fillStyle = this.color
    plot.ctx.beginPath()
    plot.ctx.arc(x, y, 4, 0, 2 * Math.PI)
    plot.ctx.fill()
  }

  getContext() {
    const ctx = {}
    for (const param of this.talkers)
      ctx[param.name] = param.value
    return ctx
  }

  set(value) {
    if (value != undefined || !this.capture) {
      this.value = value
      for (const elem of this.listeners)
        elem.varUpdate(this)
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
        // If they are all the same and we are at a new tick
        // Update value and tick
        this.tick = talkerTicks[0]
    }

    if (this.func == undefined)
      this.set(talker.value)
    else if (this.talkers.find( t => t.value == undefined ))
      this.set()
    else
      this.set(this.func.evaluate(this.getContext()))
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