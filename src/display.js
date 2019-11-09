"use strict"

class Display {

  constructor(htmlElem, talker, katex=true, capture=true) {
    this.htmlElem = htmlElem

    this.talker   = talker
    this.talker.addListener(this)

    this.katex = katex
    this.capture = capture
  }

  varUpdate(talker) {
    if (talker == this.talker) {
      if (talker.value != undefined) {
        if (this.katex && window.katex != undefined)
          katex.render(`${talker.name} = ${math.format(talker.value, 3)}`, this.htmlElem)
        else if (!this.katex)
          this.htmlElem.textContent = talker.value.toString()
      }
      else if (!this.capture)
        this.htmlElem.textContent = 'undefined'
    }
    else
      throw new Error('Received update from unregistered talker.')
  }

  startAnimation() {}
  endAnimation() {}

}