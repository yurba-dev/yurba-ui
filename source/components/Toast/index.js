import { Modal } from "../Modal/index.js"
import { TitleComponent } from "../Title/index.js"
import { TitleIconComponent } from "../TitleIcon/index.js"
import { Group } from "../Group/index.js"

function toastStack() {
    let stack = document.querySelector("body > .y-win__toasts")
    if (!stack) {
        stack = document.createElement("div")
        stack.className = "y-win__toasts"
    }
    if (document.body.lastElementChild != stack) document.body.appendChild(stack)
    return stack
}

export class Toast extends Modal {
    constructor(properties = {}) {
        // A page click must not drop a loading toast
        super({ ...properties, closeOnOutsideClick: properties.closeOnOutsideClick ?? false })
        this.type = "toast"
        this.timeout = properties.timeout ?? 2000
        this.stacked = !("parent" in properties)

        this.addSetupHook(modal => {
            modal.setAttribute("type", "toast")
            modal.style.setProperty('--y-win-body-padding', '5px 10px 15px 15px')
            modal.style.setProperty('--y-win-header-padding', '10px')
        })

        const title = new TitleComponent(properties.title ?? "Untitled")

        if (properties.icon) {
            const icon = new TitleIconComponent({ icon: properties.icon, type: properties.iconType })
            const titleGroup = new Group(icon, title)
            titleGroup.setProperty("title-with-icon")
            this.renderComponent(titleGroup, "header")
        } else {
            this.renderComponent(title, "header")
        }
    }

    show() {
        if (this.stacked) this.properties.parent = toastStack()
        super.show()
        this.hideOnTimeout(this.timeout, { notHideWhenHovered: true })
    }
}
