import { BaseComponent } from "../../helpers/lib.js"

export class TextComponent extends BaseComponent {
    constructor(text) {
        super()
        this.el = document.createElement("p")
        this.el.classList.add("y-win__text")
        this.el.innerHTML = text
        this.placement = "body"
    }
}
