import { BaseComponent } from "../../helpers/lib.js"
import { buildMenuItems } from "../../helpers/menu.js"

export class ContextMenuComponent extends BaseComponent {
    constructor(items = [], properties = {}) {
        super()
        this._items = items
        this._onOpen = properties.onOpen ?? null
        this._onClose = properties.onClose ?? null
        this._menu = null
        this._target = null
        this.placement = "body"
    }

    bind(target) {
        let targets
        if (typeof target === "string") {
            targets = [...document.querySelectorAll(target)]
        } else if (target instanceof NodeList || Array.isArray(target)) {
            targets = [...target]
        } else {
            targets = [target]
        }

        targets.forEach(t => {
            t.addEventListener("contextmenu", (e) => {
                e.preventDefault()
                this.open(e.clientX, e.clientY, t)
            })
        })
        return this
    }

    open(x, y, target = null) {
        this.close()

        const menu = document.createElement("div")
        menu.className = "y-context-menu y-win__hidden"
        buildMenuItems(this._items, menu, () => this.close())

        document.body.appendChild(menu)
        this._menu = menu
        this._target = target

        this._position(menu, x, y)
        requestAnimationFrame(() => menu.classList.remove("y-win__hidden"))

        this._onOutside = (e) => {
            if (!menu.contains(e.target)) this.close()
        }
        this._onKey = (e) => {
            if (e.key === "Escape") this.close()
        }
        this._onScroll = () => this.close()

        setTimeout(() => {
            document.addEventListener("click", this._onOutside)
            document.addEventListener("contextmenu", this._onOutside)
            document.addEventListener("keydown", this._onKey)
            window.addEventListener("scroll", this._onScroll, true)
        }, 0)

        if (this._onOpen) this._onOpen(menu, target)
        return menu
    }

    close() {
        if (!this._menu) return

        document.removeEventListener("click", this._onOutside)
        document.removeEventListener("contextmenu", this._onOutside)
        document.removeEventListener("keydown", this._onKey)
        window.removeEventListener("scroll", this._onScroll, true)

        const menu = this._menu
        const target = this._target
        this._menu = null
        this._target = null

        menu.classList.add("y-win__hidden")
        setTimeout(() => {
            if (menu.parentNode) menu.remove()
            if (this._onClose) this._onClose(target)
        }, 300)
    }

    _position(menu, x, y) {
        const pad = 8
        const mw = menu.offsetWidth
        const mh = menu.offsetHeight

        let left = x
        let top = y

        if (left + mw > window.innerWidth - pad) left = x - mw
        if (left < pad) left = pad

        if (top + mh > window.innerHeight - pad) top = y - mh
        if (top < pad) top = pad

        menu.style.left = left + "px"
        menu.style.top = top + "px"
    }

    isOpen() {
        return this._menu !== null
    }
}
