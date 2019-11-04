"use strict"

class Interval {

  constructor(name, from=0, to=1, steps=100, timeInterval=20, midpoint=false) {
    this.name  = name
    this.from  = from
    this.to    = to

    this.steps    = steps
    this.stepSize = (to - from) / steps

    this.timeInterval = timeInterval

    this.isAnimating = false

    this.midpoint = midpoint

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

    this.startAnimation()

    this.tick = 0
    this.set(this.midpoint ? this.from - this.stepSize / 2 : this.from)

    let newValue
    this.animationID = window.setInterval( () => {
      ++this.tick
      newValue = this.value += this.stepSize

      if (newValue >= this.to) { // End animation
        if (!this.midpoint) this.set(this.to)

        window.clearInterval(this.animationID)
        this.endAnimation()
        this.set()

        if (loop) this.animate(true)
      } else
        this.set(newValue)
    }, this.timeInterval)
  }

  startAnimation() {
    this.isAnimating = true
    for (const listener of this.listeners)
      listener.startAnimation()
  }

  endAnimation() {
    this.isAnimating = false
    this.tick = undefined
    for (const listener of this.listeners)
      listener.endAnimation()
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