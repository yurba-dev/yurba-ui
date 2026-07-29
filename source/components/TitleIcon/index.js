import { BaseComponent } from "../../helpers/lib.js"

export class TitleIconComponent extends BaseComponent {
    constructor(object = {}) {
        super()
        const icon = object.icon ?? ""
        const type = object.type ?? "default"
        this.el = document.createElement("span")
        this.el.classList.add("y-win__title-icon", type)
        this.el.innerHTML = icon
        this.placement = "header"
    }
}
