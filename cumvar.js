"use strict"

class CumVar {

  constructor(name, talker, color='deeppink', capture=true) {
    this.name = name

    this.talker = talker
    this.talker.addListener(this)

    this.color = color
    this.capture = capture

    this.isAnimating = false

    this.listeners = []
  }

  varUpdate(talker) {
    if (talker != this.talker)
      throw new Error('Received update from unregistered talker.')

    if (this.isAnimating) {
      if (this.tick != talker.tick)
        this.tick = talker.tick
      else
        return
    }

    this.update(talker.value)  
  }

  update(value) {
    if (value != undefined) {
      if (this.value != undefined)
        this.set(math.add(this.value, value))
      else
        this.set(value)
    }
    else
      this.set()
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

  set(value) {
    const prevValue = this.value

    this.value = value
    for (const elem of this.listeners)
      elem.varUpdate(this)

    if (this.capture && this.value == undefined)
      this.value = prevValue
  }

  startAnimation() {
    if (!this.isAnimating) {
      this.value = undefined
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