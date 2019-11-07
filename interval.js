"use strict"

class Interval {

  constructor(name, from=0, to=1, {steps=100, timeInterval=20, midpoint=false} = {}) {
    this.name  = name
    this.from  = from
    this.to    = to
    this.value = undefined

    this.steps    = steps
    this.stepSize = (to - from) / steps

    this.timeInterval = timeInterval

    this.isAnimating = false

    if (midpoint)
      this.midpoint = new Variable(this.name)

    this.listeners = []
  }

  set(value) {
    this.value = value
    for (const elem of this.listeners)
      elem.varUpdate(this)
  }

  setMidpoint(value) {
    if (this.midpoint) {
      if (this.isAnimating)
        this.midpoint.tick = this.tick
      this.midpoint.set(value)
    }
  }

  animate(loop) {
    // Stop previous animation if there was one
    if (this.isAnimating)
      window.clearInterval(this.animationID)

    this.startAnimation()

    this.tick = 0
    this.set(this.from)

    let newValue
    this.animationID = window.setInterval( () => {
      ++this.tick
      newValue = this.value += this.stepSize

      if (newValue >= this.to) { // End animation
        this.set(this.to)
        this.setMidpoint(this.to - this.stepSize / 2)

        window.clearInterval(this.animationID)
        this.endAnimation()
        this.set()

        if (loop) this.animate(true)
      } else {
        this.set(newValue)
        this.setMidpoint(newValue - this.stepSize / 2)
      }
    }, this.timeInterval)
  }

  startAnimation() {
    this.isAnimating = true
    for (const listener of this.listeners)
      listener.startAnimation()
    if (this.midpoint) this.midpoint.startAnimation()
  }

  endAnimation() {
    this.isAnimating = false
    this.tick = undefined
    for (const listener of this.listeners)
      listener.endAnimation()
    if (this.midpoint) this.midpoint.endAnimation()
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