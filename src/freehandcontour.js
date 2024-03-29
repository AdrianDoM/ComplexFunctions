"use strict"

class FreehandContour {

  constructor(freehandVar, timeStep=20, {color="green"} = {}) {
    this.freehandVar = freehandVar
    this.freehandVar.addListener(this)

    this.z  = new Variable(freehandVar.name)
    this.dz = new DeltaVar('d' + freehandVar.name)

    this.timeStep = timeStep / 2
    this.stamp = undefined
    this.updatedMidpointLast = false
    
    this.path = []
    this.midpoints = []
  
    this.storedPath      = undefined
    this.storedMidpoints = undefined

    this.isAnimating = false
    this.tick        = undefined
    this.animationID = undefined
    
    this.listeners = []

    this.color = color
  }

  varUpdate(talker) {
    if (talker != this.freehandVar)
      throw new Error('Received update from unregistered talker.')

    if (!talker.mouseControlled) return

    const time = Date.now()
    if (this.stamp == undefined) {
      this.stamp = time
      this.addToPath(this.freehandVar.value)
    }
    else if (time - this.stamp >= this.timeStep) {
      this.stamp = time
      if (!this.updatedMidpointLast)
        this.addToMidpoints(this.freehandVar.value)
      else
        this.addToPath(this.freehandVar.value)
    }
  }

  draw(plot) {
    if (this.path.length == 0) return

    plot.ctx.lineWidth = 3
    plot.ctx.strokeStyle = this.color

    let {x, y} = plot.locateNumber(this.path[0])

    plot.ctx.beginPath()
    plot.ctx.moveTo(x, y)

    const stop = this.isAnimating ? this.tick + 1 : this.path.length
    for (let i = 1; i < this.path.length; ++i) {
      ;({x, y} = plot.locateNumber(this.path[i]))
      plot.ctx.lineTo(x, y)
    }

    plot.ctx.stroke()
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

  addToPath(z) {
    this.path.push(z)
    this.updatedMidpointLast = false

    if (this.isAnimating)
      this.dz.tick = this.tick
    this.dz.update(z)
    for (const elem of this.listeners)
      elem.varUpdate(this)
  }

  addToMidpoints(z) {
    this.midpoints.push(z)
    this.updatedMidpointLast = true

    if (this.isAnimating)
      this.z.tick = this.tick
    this.z.set(z)
  }

  resetPath() {
    this.path = []
    this.midpoints = []
    for (const elem of this.listeners)
      elem.varUpdate(this)
  }

  animate(loop) {
    if (this.path.length < 2) return

    // Stop previous animation if there was one
    if (this.isAnimating) {
      this.path      = this.storedPath
      this.midpoints = this.storedMidpoints
      window.clearInterval(this.animationID)
    }

    this.storedPath      = this.path
    this.storedMidpoints = this.midpoints

    this.resetPath()
    this.startAnimation()

    this.tick = 0
    this.addToPath(this.storedPath[0])

    this.animationID = window.setInterval( () => {
      ++this.tick

      if (this.tick >= this.storedPath.length) { // End animation
        window.clearInterval(this.animationID)
        this.endAnimation()

        if (loop) this.animate(true)
      } else {
        this.freehandVar.set(this.storedMidpoints[this.tick - 1])
        this.addToPath(this.storedPath[this.tick])
        this.addToMidpoints(this.storedMidpoints[this.tick - 1])
      }
    }, this.timeStep * 2)
  }

  startAnimation() {
    this.freehandVar.mouseControlled = false
    this.isAnimating = true
    this.z.startAnimation()
    this.dz.startAnimation()
    for (const listener of this.listeners)
      listener.startAnimation()
  }

  endAnimation() {
    this.freehandVar.mouseControlled = true
    this.isAnimating = false
    this.tick = undefined
    this.z.endAnimation()
    this.dz.endAnimation()
    for (const listener of this.listeners)
      listener.endAnimation()
  }

}