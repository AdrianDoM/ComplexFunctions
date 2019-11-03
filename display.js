"use strict"

class Display {

  constructor(htmlElem, listen) {
    this.htmlElem = htmlElem
    this.listen   = listen
    this.listen.listeners.push(this)
  }

  passZ(z, talker) {
    if (talker == this.listen)
      this.htmlElem.textContent = z.toString()
  }

}