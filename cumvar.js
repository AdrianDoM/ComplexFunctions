"use strict"

class CumVar {

  constructor(name, talker, color='blue') {
    this.name = name

    this.talker = talker
    this.talker.addListener(this)

    this.color = color

    this.listeners = []
  }

  varUpdate(talker) {
    if (talker == this.talker)
      this.update(talker.value)
    else
      throw new Error('Received update from unregistered talker.')
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