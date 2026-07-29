import { BaseComponent } from "../../helpers/lib.js"

export class MaterialIconComponent extends BaseComponent {
    constructor(name) {
        super()
        this.el = document.createElement("span")
        this.el.classList.add("material-symbols-rounded")
        this.el.textContent = name
        this.placement = "body"
    }
}
