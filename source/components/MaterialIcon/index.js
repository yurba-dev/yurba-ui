import { BaseComponent } from "../../helpers/lib.js"

export class MaterialIconComponent extends BaseComponent {
    constructor(name) {
        super()
        this.el = document.createElement("span")
        this.el.classList.add("material-symbols-rounded")
        // The icon is its name drawn as a ligature: a page translator must leave the word alone
        this.el.translate = false
        this.el.textContent = name
        this.placement = "body"
    }
}
