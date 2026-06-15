import { error, warn, hasDuplicates, BaseComponent } from "../../helpers/lib.js"

export class Group {
    constructor(...components) {
        return new GroupComponent(...components)
    }
}

class GroupComponent extends BaseComponent {
    constructor(...elements) {
        super()

        this.components = []
        this.el = document.createElement("div")
        this.el.classList.add("y-win__group")
        this.placement = "body"

        if (elements.length > 0) {
            if (hasDuplicates(elements)) {
                warn("One of the groups contains duplicate elements. Duplicates will be ignored...")
            }
            this.components = [...new Set(elements)]
            this.components.forEach((e, index) => {
                if (e instanceof BaseComponent) {
                    this.el.appendChild(e.render())
                } else {
                    error(`Element number ${index} is not a component. A group can only accept components`)
                }
            })
        }
    }

    add(component) {
        if (!(component instanceof BaseComponent)) {
            error("A group can only accept components")
        }
        this.el.appendChild(component.render())
        this.components.push(component)
    }

    addClass(...classNames) {
        if (classNames.length > 0) this.el.classList.add(...classNames)
    }
}
