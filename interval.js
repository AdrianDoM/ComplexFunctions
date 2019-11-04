"use strict"

class Interval {

  constructor(name, from=0, to=1, steps=100, timeInterval=20) {
    this.name  = name
    this.from  = from
    this.to    = to

    this.steps    = steps
    this.stepSize = (to - from) / steps

    this.timeInterval = timeInterval

    this.isAnimating = false

    this.listeners = []
  }

  set(value) {
    this.value = value
    for (const elem of this.listeners)
      elem.varUpdate(this)
  }

  animate(loop) {
    // Stop previous animation if there was one
    if (this.isAnimating)
      window.clearInterval(this.animationID)

    this.isAnimating = true
    this.set(this.from)

    this.animationID = window.setInterval( () => {
      this.set(this.value += this.stepSize)

      if (this.value >= this.to) { // End animation
        window.clearInterval(this.animationID)
        this.isAnimating = false
        this.set()

        if (loop) this.animate(true)
      }
    }, this.timeInterval)
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