import { BaseComponent } from "../../helpers/lib.js"

export class VIconButtonComponent extends BaseComponent {
    constructor(options = {}, cb = () => {}) {
        super()
        this.el = document.createElement("button")
        this.el.classList.add("y-win__icon-vbutton")
        this.el.innerHTML = `
            <div class="y-win__icon-vbutton__icon">${options.icon ?? ""}</div>
            ${"name" in options ? `<span class="y-win__icon-vbutton__name">${options.name}</span>` : ""}
        `
        if (!("name" in options)) {
            this.el.classList.add("only-icon")
        }
        this.placement = "body"
        this.el.addEventListener("click", () => cb())
    }
}
