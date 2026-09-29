import { BaseComponent } from "../../helpers/lib.js"

let tooltipId = 0

export class Tooltip {
    constructor(target, properties = {}) {
        this.target = target

        this.props = {
            pos: properties.pos || "top",
            title: properties.title || "",
            content: properties.content || "",
            icon: properties.icon || null,
            className: properties.className || null,
            delay: properties.delay ?? 150,
            offset: properties.offset ?? 5,
            when: properties.when || null,
            trigger: properties.trigger || "hover"
        }

        this.tooltip = null
        this.showTimeout = null
        this.hideTimeout = null
        this.removeTimeout = null
        this.mounted = false
        this.visible = false
        this.id = `y-tooltip-${++tooltipId}`

        this.init()
    }

    init() {
        // Outside a scrolled tooltip of its own, scrolling moves the target away from it
        this._onScroll = (e) => { if (!this.tooltip?.contains(e.target)) this.hide() }
        // A removed target never gets pointerleave
        this._onPointer = () => { if (!this.target.isConnected) this.hide() }
        // The target moves with the layout; one that stays open follows it
        this._onResize = () => { if (this.visible && this.tooltip) this.#place() }
        if (this.props.trigger == "click") {
            this._onClick = () => { if (this.visible) this.hide(); else this.show() }
            this._onOutside = (e) => { if (!this.target.contains(e.target) && !this.tooltip?.contains(e.target)) this.hide() }
            this._onKey = (e) => { if (e.key == "Escape") this.hide() }
            this.target.addEventListener("click", this._onClick)
            return
        }
        // A tap would only flash it
        this._onEnter = (e) => { if (e.pointerType != "touch") this.scheduleShow() }
        this._onFocus = () => { if (this.target.matches(":focus-visible, :has(:focus-visible)")) this.scheduleShow() }
        this._onHide = () => this.scheduleHide()
        this.target.addEventListener("pointerenter", this._onEnter)
        this.target.addEventListener("pointerleave", this._onHide)
        this.target.addEventListener("focusin", this._onFocus)
        this.target.addEventListener("focusout", this._onHide)
    }

    #listen(on) {
        const method = on ? "addEventListener" : "removeEventListener"
        window[method]("scroll", this._onScroll, true)
        window[method]("resize", this._onResize)
        document[method]("pointerover", this._onPointer)
        if (this.props.trigger == "click") {
            document[method]("pointerdown", this._onOutside, true)
            document[method]("keydown", this._onKey)
        }
    }

    createTooltip() {
        if (this.mounted) return

        const tooltip = document.createElement("div")
        tooltip.classList.add("y-tooltip", "is-hidden")
        tooltip.id = this.id
        tooltip.setAttribute("role", "tooltip")
        if (!this.props.title) tooltip.classList.add("y-tooltip--plain")
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

        const content = typeof this.props.content == "function" ? this.props.content() : this.props.content
        tooltip.innerHTML = `
            ${header}
            <div class="y-tooltip__content">${content}</div>
        `

        document.body.appendChild(tooltip)

        tooltip.addEventListener("mouseenter", () => this.clearHide())
        tooltip.addEventListener("mouseleave", () => this.scheduleHide())

        this.tooltip = tooltip
        this.mounted = true
        if (!this.target.hasAttribute("aria-describedby")) this.target.setAttribute("aria-describedby", this.id)
    }

    scheduleShow() {
        if (this.props.when && !this.props.when()) return
        this.clearHide()
        this.clearShow()
        this.showTimeout = setTimeout(() => this.show(), this.props.delay)
    }

    scheduleHide() {
        this.clearShow()
        this.clearHide()
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
        if (!this.target.isConnected) return this.hide()
        clearTimeout(this.removeTimeout)
        this.createTooltip()
        this.#listen(true)
        this.visible = true
        this.#place()

        void this.tooltip.offsetWidth
        requestAnimationFrame(() => {
            // A hide() in the same frame wins
            if (this.tooltip && this.visible) this.tooltip.classList.remove("is-hidden")
        })
    }

    // New title, icon or content for a tooltip that may be open right now
    update(properties = {}) {
        for (const key of ["title", "icon", "content"]) {
            if (properties[key] != undefined) this.props[key] = properties[key]
        }
        if (!this.tooltip) return
        const content = typeof this.props.content == "function" ? this.props.content() : this.props.content
        this.tooltip.querySelector(".y-tooltip__content").innerHTML = content
        const title = this.tooltip.querySelector(".y-tooltip__title")
        if (title) title.innerHTML = this.props.title
        const icon = this.tooltip.querySelector(".y-tooltip__icon")
        if (icon && this.props.icon) icon.innerHTML = this.props.icon
        if (this.visible) this.#place()
    }

    #place() {
        const offset = this.props.offset

        const rect = this.target.getBoundingClientRect()
        const tooltipRect = this.tooltip.getBoundingClientRect()

        let pos = this.props.pos

        if (pos == "top" && rect.top < tooltipRect.height + offset) pos = "bottom"
        if (pos == "bottom" && rect.bottom + tooltipRect.height + offset > window.innerHeight) pos = "top"
        if (pos == "left" && rect.left < tooltipRect.width + offset) pos = "right"
        if (pos == "right" && rect.right + tooltipRect.width + offset > window.innerWidth) pos = "left"

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
    }

    hide() {
        this.clearShow()
        this.visible = false
        if (!this.tooltip) return
        this.#listen(false)
        this.tooltip.classList.add("is-hidden")
        clearTimeout(this.removeTimeout)
        this.removeTimeout = setTimeout(() => this.#unmount(), 300)
    }

    #unmount() {
        if (!this.tooltip || !this.tooltip.classList.contains("is-hidden")) return
        this.tooltip.remove()
        this.tooltip = null
        this.mounted = false
        if (this.target.getAttribute("aria-describedby") == this.id) this.target.removeAttribute("aria-describedby")
    }

    destroy() {
        this.clearShow()
        this.clearHide()
        clearTimeout(this.removeTimeout)
        this.#listen(false)
        this.target.removeEventListener("click", this._onClick)
        this.target.removeEventListener("pointerenter", this._onEnter)
        this.target.removeEventListener("pointerleave", this._onHide)
        this.target.removeEventListener("focusin", this._onFocus)
        this.target.removeEventListener("focusout", this._onHide)
        if (this.tooltip) this.tooltip.classList.add("is-hidden")
        this.#unmount()
    }
}
