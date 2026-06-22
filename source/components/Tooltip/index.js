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
        this._mounted = false

        this._init()
    }

    _init() {
        this.target.addEventListener("mouseenter", () => this._scheduleShow())
        this.target.addEventListener("mouseleave", () => this._scheduleHide())
    }

    _createTooltip() {
        if (this._mounted) return

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

        tooltip.addEventListener("mouseenter", () => this._clearHide())
        tooltip.addEventListener("mouseleave", () => this._scheduleHide())

        this.tooltip = tooltip
        this._mounted = true
    }

    _scheduleShow() {
        this._clearHide()
        this.showTimeout = setTimeout(() => this.show(), this.props.delay)
    }

    _scheduleHide() {
        this._clearShow()
        this.hideTimeout = setTimeout(() => this.hide(), this.props.delay)
    }

    _clearShow() {
        if (this.showTimeout) {
            clearTimeout(this.showTimeout)
            this.showTimeout = null
        }
    }

    _clearHide() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout)
            this.hideTimeout = null
        }
    }

    show() {
        this._createTooltip()
        const offset = this.props.offset

        const rect = this.target.getBoundingClientRect()
        const tRect = this.tooltip.getBoundingClientRect()

        let pos = this.props.pos

        if (pos === "top" && rect.top < tRect.height + offset) pos = "bottom"
        if (pos === "bottom" && rect.bottom + tRect.height + offset > window.innerHeight) pos = "top"
        if (pos === "left" && rect.left < tRect.width + offset) pos = "right"
        if (pos === "right" && rect.right + tRect.width + offset > window.innerWidth) pos = "left"

        let top = 0
        let left = 0

        switch (pos) {
            case "top":
                top = rect.top - tRect.height - offset
                left = rect.left + rect.width / 2 - tRect.width / 2
                break
            case "bottom":
                top = rect.bottom + offset
                left = rect.left + rect.width / 2 - tRect.width / 2
                break
            case "left":
                top = rect.top + rect.height / 2 - tRect.height / 2
                left = rect.left - tRect.width - offset
                break
            case "right":
                top = rect.top + rect.height / 2 - tRect.height / 2
                left = rect.right + offset
                break
        }

        const pad = 8
        if (left < pad) left = pad
        if (left + tRect.width > window.innerWidth - pad) left = window.innerWidth - tRect.width - pad
        if (top < pad) top = pad
        if (top + tRect.height > window.innerHeight - pad) top = window.innerHeight - tRect.height - pad

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
                this._mounted = false
            }
        }, 300)
    }
}
