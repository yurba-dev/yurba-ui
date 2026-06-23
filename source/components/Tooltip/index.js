import { BaseComponent } from "../../helpers/lib.js"

export class Tooltip {
    constructor(target, properties = {}) {
        this.target = target

        this.props = {
            pos: properties.pos || "top",
            title: properties.title || "",
            content: properties.content || "",
            icon: properties.icon || null,
            className: properties.className || null,
            delay: properties.delay || 150,
            offset: properties.offset || 5
        }

        this.tooltip = null
        this.showTimeout = null
        this.hideTimeout = null
        this.mounted = false

        this.init()
    }

    init() {
        this.target.addEventListener("mouseenter", () => this.scheduleShow())
        this.target.addEventListener("mouseleave", () => this.scheduleHide())
        window.addEventListener("scroll", () => this.hide(), true)
    }

    createTooltip() {
        if (this.mounted) return

        const tooltip = document.createElement("div")
        tooltip.classList.add("y-tooltip", "y-win__hidden")
        if (this.props.className) tooltip.classList.add(...this.props.className.split(" ").filter(Boolean))

        let header = ""

        if (this.props.title) {
            if (this.props.icon instanceof BaseComponent) {
                this.props.icon = this.props.icon.el.outerHTML
            }

            header = `
                <div class="y-tooltip__header">
                    ${this.props.icon ? `<span class="y-tooltip__icon">${this.props.icon}</span>` : ""}
                    <span class="y-tooltip__title">${this.props.title}</span>
                </div>
            `
        }

        tooltip.innerHTML = `
            ${header}
            <div class="y-tooltip__content">${this.props.content}</div>
        `

        document.body.appendChild(tooltip)

        tooltip.addEventListener("mouseenter", () => this.clearHide())
        tooltip.addEventListener("mouseleave", () => this.scheduleHide())

        this.tooltip = tooltip
        this.mounted = true
    }

    scheduleShow() {
        this.clearHide()
        this.showTimeout = setTimeout(() => this.show(), this.props.delay)
    }

    scheduleHide() {
        this.clearShow()
        this.hideTimeout = setTimeout(() => this.hide(), this.props.delay)
    }

    clearShow() {
        if (this.showTimeout) {
            clearTimeout(this.showTimeout)
            this.showTimeout = null
        }
    }

    clearHide() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout)
            this.hideTimeout = null
        }
    }

    show() {
        this.createTooltip()
        const offset = this.props.offset

        const rect = this.target.getBoundingClientRect()
        const tooltipRect = this.tooltip.getBoundingClientRect()

        let pos = this.props.pos

        if (pos === "top" && rect.top < tooltipRect.height + offset) pos = "bottom"
        if (pos === "bottom" && rect.bottom + tooltipRect.height + offset > window.innerHeight) pos = "top"
        if (pos === "left" && rect.left < tooltipRect.width + offset) pos = "right"
        if (pos === "right" && rect.right + tooltipRect.width + offset > window.innerWidth) pos = "left"

        let top = 0
        let left = 0

        switch (pos) {
            case "top":
                top = rect.top - tooltipRect.height - offset
                left = rect.left + rect.width / 2 - tooltipRect.width / 2
                break
            case "bottom":
                top = rect.bottom + offset
                left = rect.left + rect.width / 2 - tooltipRect.width / 2
                break
            case "left":
                top = rect.top + rect.height / 2 - tooltipRect.height / 2
                left = rect.left - tooltipRect.width - offset
                break
            case "right":
                top = rect.top + rect.height / 2 - tooltipRect.height / 2
                left = rect.right + offset
                break
        }

        const pad = 8
        if (left < pad) left = pad
        if (left + tooltipRect.width > window.innerWidth - pad) left = window.innerWidth - tooltipRect.width - pad
        if (top < pad) top = pad
        if (top + tooltipRect.height > window.innerHeight - pad) top = window.innerHeight - tooltipRect.height - pad

        this.tooltip.style.top = `${top + window.scrollY}px`
        this.tooltip.style.left = `${left + window.scrollX}px`

        void this.tooltip.offsetWidth
        requestAnimationFrame(() => {
            if (this.tooltip) this.tooltip.classList.remove("y-win__hidden")
        })
    }

    hide() {
        if (!this.tooltip) return
        this.tooltip.classList.add("y-win__hidden")
        setTimeout(() => {
            if (this.tooltip && this.tooltip.classList.contains("y-win__hidden")) {
                this.tooltip.remove()
                this.mounted = false
            }
        }, 300)
    }
}
