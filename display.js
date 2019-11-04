"use strict"

class Display {

  constructor(htmlElem, talker, capture=true) {
    this.htmlElem = htmlElem

    this.talker   = talker
    this.talker.listeners.push(this)

    this.capture = capture
  }

  varUpdate(talker) {
    if (talker == this.talker) {
      if (talker.value != undefined)
        this.htmlElem.textContent = talker.value.toString()
      else if (!this.capture)
        this.htmlElem.textContent = 'undefined'
    }
    else
      throw new Error('Received update from unregistered talker.')
  }

  startAnimation() {}
  endAnimation() {}

}