import { BaseComponent } from "../../helpers/lib.js"

export class TitleComponent extends BaseComponent {
    constructor(title) {
        super()
        this.el = document.createElement("div")
        this.el.classList.add("y-win__title")
        this.el.innerHTML = title
        this.placement = "header"
    }
}
