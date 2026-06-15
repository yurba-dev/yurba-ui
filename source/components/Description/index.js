import { BaseComponent } from "../../helpers/lib.js"

export class DescriptionComponent extends BaseComponent {
    constructor(text) {
        super()
        this.el = document.createElement("div")
        this.el.classList.add("y-win__desc")
        this.el.innerHTML = text
        this.placement = "header"
    }
}
