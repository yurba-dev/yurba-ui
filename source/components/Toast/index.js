import { Modal } from "../Modal/index.js"
import { TitleComponent } from "../Title/index.js"
import { TitleIconComponent } from "../TitleIcon/index.js"
import { Group } from "../Group/index.js"

export class Toast extends Modal {
    constructor(properties = {}) {
        super()
        this.type = "toast"
        this.timeout = properties.timeout ?? 2000

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
        super.show()
        this.hideOnTimeout(this.timeout, { notHideWhenHovered: true })
    }
}
