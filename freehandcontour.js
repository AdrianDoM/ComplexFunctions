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

    this.color = color
  }

  varUpdate(talker) {
    if (talker != this.freehandVar)
      throw new Error('Received update from unregistered talker.')

    const time = Date.now()
    if (this.stamp == undefined) {
      this.stamp = time
      this.dz.update(this.freehandVar.value)
    }
    else if (time - this.stamp >= this.timeStep) {
      this.stamp = time
      if (!this.updatedMidpointLast) {
        this.z.set(this.freehandVar.value)
        this.updatedMidpointLast = true
      }
      else {
        this.dz.update(this.freehandVar.value)
        this.updatedMidpointLast = false
      }
    }
  }

}