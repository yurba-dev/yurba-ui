import { BaseComponent, error } from "../../helpers/lib.js"
import { buildMenuItems, anchorFixed } from "../../helpers/menu.js"

export class DropdownComponent extends BaseComponent {
    constructor(items = [], properties = {}) {
        super()
        this._items = items
        this._content = properties.content ?? null
        if (!properties.trigger) error("Dropdown requires a trigger — pass trigger: '<html>' in options")
        this._triggerContent = properties.trigger
        this._onOpen = properties.onOpen ?? null
        this._onClose = properties.onClose ?? null
        this._align = properties.align ?? 'left'
        this._triggerClass = properties.triggerClass ?? null
        // When true, the menu is mounted into the DOM (hidden) immediately on
        // render() instead of lazily on first open, and is never removed on
        // close. Useful when the menu content must exist in the DOM up-front
        // (e.g. an audio player queried via document.querySelector).
        this._keepMounted = properties.keepMounted ?? false
        this.placement = "body"
        this._menuMounted = false
        this._menu = null
    }

    render() {
        const el = document.createElement("div")
        el.className = "y-dropdown"

        const trigger = document.createElement("button")
        trigger.className = "y-dropdown__trigger"
        if (this._triggerClass) trigger.classList.add(...this._triggerClass.split(" ").filter(Boolean))
        trigger.type = "button"
        trigger.innerHTML = this._triggerContent

        const isOpen = () => this._menu && !this._menu.classList.contains("y-win__hidden")

        const closeRoot = () => {
            if (!this._menu) return
            this._menu.classList.add("y-win__hidden")
            this._menu.querySelectorAll(".y-dropdown__submenu").forEach(s => s.classList.add("y-win__hidden"))
            this._menu.dispatchEvent(new CustomEvent("yurba-dropdown:close", { bubbles: true }))
            if (this._onClose) this._onClose(this._menu)

            if (this._keepMounted) return

            setTimeout(() => {
                if (this._menu && this._menu.classList.contains("y-win__hidden") && this._menu.parentNode) {
                    this._menu.remove()
                    this._menuMounted = false
                }
            }, 300)
        }

        const initMenu = () => {
            if (this._menuMounted) return

            this._menu = document.createElement("div")
            this._menu.className = "y-dropdown__menu y-win__hidden"

            if (this._content !== null) {
                if (this._content instanceof HTMLElement) {
                    this._menu.appendChild(this._content)
                } else if (typeof this._content === "string") {
                    this._menu.innerHTML = this._content
                }
            } else {
                buildMenuItems(this._items, this._menu, closeRoot)
            }

            document.body.appendChild(this._menu)

            document.addEventListener("click", (e) => {
                if (!el.contains(e.target) && !this._menu.contains(e.target)) closeRoot()
            })

            window.addEventListener("scroll", (e) => {
                if (!isOpen()) return
                if (e.target instanceof Node && this._menu.contains(e.target)) return
                closeRoot()
            }, true)

            this._menuMounted = true
        }

        const open = () => {
            initMenu()
            anchorFixed(trigger, this._menu, this._align)
            this._menu.classList.remove("y-win__hidden")
            this._menu.dispatchEvent(new CustomEvent("yurba-dropdown:open", { bubbles: true }))
            if (this._onOpen) this._onOpen(this._menu)
        }

        trigger.addEventListener("click", (e) => {
            e.stopPropagation()
            if (isOpen()) closeRoot()
            else open()
        })

        el.appendChild(trigger)

        // Eagerly mount the (hidden) menu so its content lives in the DOM
        // immediately, before the dropdown is ever opened.
        if (this._keepMounted) initMenu()

        this.el = el
        this.menu = this._menu
        return el
    }
}
