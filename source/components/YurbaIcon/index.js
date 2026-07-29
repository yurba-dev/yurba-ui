import { BaseComponent } from "../../helpers/lib.js"

export class YurbaIconComponent extends BaseComponent {
    constructor(name) {
        super()
        this.el = document.createElement("span")
        this.el.className = `yrb yrb-${name}`
        this.placement = "body"
    }
}
