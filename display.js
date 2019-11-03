"use strict"

class Display {

  constructor(htmlElem, talker) {
    this.htmlElem = htmlElem
    this.talker   = talker
    this.talker.listeners.push(this)
  }

  varUpdate(talker) {
    if (talker == this.talker)
      this.htmlElem.textContent = talker.value == undefined ? '-' : talker.value.toString()
    else
      throw new Error('Received update from unregistered talker.')
  }

}