import { BaseComponent, error } from "../../helpers/lib.js"

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
        this.placement = "body"
    }

    render() {
        const el = document.createElement("div")
        el.className = "y-dropdown"

        const trigger = document.createElement("button")
        trigger.className = "y-dropdown__trigger"
        if (this._triggerClass) trigger.classList.add(...this._triggerClass.split(" ").filter(Boolean))
        trigger.type = "button"
        trigger.innerHTML = this._triggerContent

        const menu = document.createElement("div")
        menu.className = "y-dropdown__menu y-win__hidden"

        const closeRoot = () => {
            menu.classList.add("y-win__hidden")
            menu.dispatchEvent(new CustomEvent("yurba-dropdown:close", { bubbles: true }))
            if (this._onClose) this._onClose(menu)
        }

        if (this._content !== null) {
            if (this._content instanceof HTMLElement) {
                menu.appendChild(this._content)
            } else if (typeof this._content === "string") {
                menu.innerHTML = this._content
            }
        } else {
            this._buildItems(this._items, menu, closeRoot)
        }

        const open = () => {
            this._reposition(trigger, menu)
            menu.classList.remove("y-win__hidden")
            menu.dispatchEvent(new CustomEvent("yurba-dropdown:open", { bubbles: true }))
            if (this._onOpen) this._onOpen(menu)
        }

        trigger.addEventListener("click", (e) => {
            e.stopPropagation()
            if (!menu.classList.contains("y-win__hidden")) closeRoot()
            else open()
        })

        document.addEventListener("click", (e) => {
            if (!el.contains(e.target)) closeRoot()
        })

        el.appendChild(trigger)
        el.appendChild(menu)
        this.el = el
        this.menu = menu
        return el
    }

    _buildItems(items, container, onCloseAll) {
        items.forEach(item => {
            if (item.separator) {
                const sep = document.createElement("div")
                sep.className = "y-dropdown__separator"
                container.appendChild(sep)
                return
            }

            const hasChildren = Array.isArray(item.children) && item.children.length > 0

            const btn = document.createElement("button")
            btn.className = "y-dropdown__item" + (hasChildren ? " y-dropdown__item--has-children" : "")
            btn.type = "button"
            if (item.className) btn.classList.add(...item.className.split(" ").filter(Boolean))
            btn.innerHTML = `${item.icon ? '<span class="y-dropdown__item-icon">' + item.icon + "</span>" : ""}<span class="y-dropdown__item-label">${item.label}</span>${hasChildren ? '<span class="y-dropdown__item-arrow">›</span>' : ""}`

            if (hasChildren) {
                const wrapper = document.createElement("div")
                wrapper.className = "y-dropdown__item-wrapper"

                const submenu = document.createElement("div")
                submenu.className = "y-dropdown__menu y-dropdown__submenu y-win__hidden"
                this._buildItems(item.children, submenu, onCloseAll)

                let hideTimer = null
                const showSub = () => {
                    clearTimeout(hideTimer)
                    this._repositionSubmenu(btn, submenu)
                    submenu.classList.remove("y-win__hidden")
                }
                const hideSub = () => {
                    hideTimer = setTimeout(() => submenu.classList.add("y-win__hidden"), 80)
                }

                btn.addEventListener("mouseenter", showSub)
                btn.addEventListener("mouseleave", hideSub)
                submenu.addEventListener("mouseenter", () => clearTimeout(hideTimer))
                submenu.addEventListener("mouseleave", hideSub)

                wrapper.appendChild(btn)
                wrapper.appendChild(submenu)
                container.appendChild(wrapper)
            } else {
                if (item.onClick) {
                    btn.addEventListener("click", (e) => {
                        e.stopPropagation()
                        onCloseAll()
                        item.onClick(e)
                    })
                }
                container.appendChild(btn)
            }
        })
    }

    _reposition(trigger, menu) {
        menu.style.top = ""
        menu.style.bottom = ""
        menu.style.left = ""
        menu.style.right = ""

        const pad = 8
        const tRect = trigger.getBoundingClientRect()
        const mRect = menu.getBoundingClientRect()

        if (this._align === 'right' || tRect.left + mRect.width > window.innerWidth - pad) {
            menu.style.left = "auto"
            menu.style.right = "0"
        } else {
            menu.style.left = "0"
            menu.style.right = "auto"
        }

        if (tRect.bottom + mRect.height + 4 > window.innerHeight - pad) {
            menu.style.top = "auto"
            menu.style.bottom = "calc(100% + 4px)"
        } else {
            menu.style.top = "calc(100% + 4px)"
            menu.style.bottom = "auto"
        }
    }

    _repositionSubmenu(trigger, submenu) {
        submenu.style.top = ""
        submenu.style.bottom = ""
        submenu.style.left = ""
        submenu.style.right = ""

        const pad = 8
        const tRect = trigger.getBoundingClientRect()
        const mRect = submenu.getBoundingClientRect()

        if (tRect.right + mRect.width > window.innerWidth - pad) {
            submenu.style.left = "auto"
            submenu.style.right = "100%"
        } else {
            submenu.style.left = "100%"
            submenu.style.right = "auto"
        }

        if (tRect.top + mRect.height > window.innerHeight - pad) {
            submenu.style.top = "auto"
            submenu.style.bottom = "0"
        } else {
            submenu.style.top = "0"
            submenu.style.bottom = "auto"
        }
    }
}
