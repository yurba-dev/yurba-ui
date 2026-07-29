import { BaseComponent } from "../../helpers/lib.js"

export class ImageComponent extends BaseComponent {
    constructor(url) {
        super()
        this.el = document.createElement("img")
        this.el.classList.add("y-win__image")
        this.el.src = url
        this.placement = "body"
    }
}
