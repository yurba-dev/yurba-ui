import { BaseComponent } from "../../helpers/lib.js"
import { buildMenuItems, fitMenu, menuOpened, menuClosed, menuIcons } from "../../helpers/menu.js"
import { openSheet } from "../Dropdown/sheet.js"

export class ContextMenuComponent extends BaseComponent {
    static icons = menuIcons
    static _open = new Set()

    static closeAll() {
        ContextMenuComponent._open.forEach((menu) => menu.close())
    }

    static TARGET = "y-context-target"
    static _touch = false

    // For a menu made at the moment it opens: open(e) builds and opens it, and a long press works as on bind()
    static attach(target, open) {
        ContextMenuComponent.enableLongPress()
        target.classList.add(ContextMenuComponent.TARGET)
        target.addEventListener("contextmenu", (e) => {
            if (open(e) == false) return
            e.preventDefault()
        })
    }

    // A phone sends no contextmenu for a long press on text (Android starts a selection, iOS never sends one), so
    // on a touch screen the press itself becomes one, inside anything marked with TARGET. Pages with their own
    // contextmenu listener mark their element too
    static enableLongPress() {
        if (ContextMenuComponent._touch) return
        ContextMenuComponent._touch = true
        const HOLD = 450
        const SLOP = 10
        let timer = 0
        let start = null
        let pressedAt = 0
        let fired = false

        function cancel() {
            clearTimeout(timer)
            timer = 0
            start = null
        }

        document.addEventListener("touchstart", (e) => {
            cancel()
            if (e.touches.length != 1) return
            const target = e.target instanceof Element ? e.target.closest("." + ContextMenuComponent.TARGET) : null
            if (!target) return
            const touch = e.touches[0]
            start = { x: touch.clientX, y: touch.clientY, node: e.target }
            timer = setTimeout(() => {
                const at = start
                cancel()
                if (!at?.node.isConnected) return
                pressedAt = Date.now()
                fired = true
                navigator.vibrate?.(10)
                at.node.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: at.x, clientY: at.y }))
            }, HOLD)
        }, { passive: true })
        document.addEventListener("touchmove", (e) => {
            const touch = e.touches[0]
            if (start && touch && Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > SLOP) cancel()
        }, { passive: true })
        document.addEventListener("touchend", (e) => {
            // The finger lifting after the menu opened would be a tap, and a tap outside closes the menu
            if (fired) e.preventDefault()
            fired = false
            cancel()
        })
        document.addEventListener("touchcancel", cancel)
        // Android may send its own contextmenu for the same press; the one made here already opened the menu
        document.addEventListener("contextmenu", (e) => {
            if (e.isTrusted && Date.now() - pressedAt < 1000) {
                e.preventDefault()
                e.stopImmediatePropagation()
            }
        }, true)
    }

    constructor(items = [], properties = {}) {
        super()
        this._items = items
        this._icons = properties.icons ?? null
        this._onOpen = properties.onOpen ?? null
        this._onClose = properties.onClose ?? null
        this._asSheet = properties.sheet ?? true
        this._sheet = null
        this._menu = null
        this._target = null
        this._companions = []
        this._listenTimer = null
        this._closing = null
        this._entry = { holds: (node) => this._inside(node), close: () => this.close() }
        this.placement = "body"
    }

    keepWith(element) {
        if (element && !this._companions.includes(element)) this._companions.push(element)
        return this
    }

    _inside(node) {
        return node instanceof Node && (this._menu?.contains(node) || this._companions.some((c) => c.contains(node)))
    }

    bind(target) {
        let targets
        if (typeof target == "string") {
            targets = [...document.querySelectorAll(target)]
        } else if (target instanceof NodeList || Array.isArray(target)) {
            targets = [...target]
        } else {
            targets = [target]
        }

        ContextMenuComponent.enableLongPress()
        targets.forEach(t => {
            t.classList?.add(ContextMenuComponent.TARGET)
            t.addEventListener("contextmenu", (e) => {
                e.preventDefault()
                this.open(e.clientX, e.clientY, t)
            })
        })
        return this
    }

    open(x, y, target = null) {
        this.close()
        // So the previous onClose can't undo this onOpen
        this._finishClose()
        const from = target ?? document.elementFromPoint(x, y)
        menuOpened(this._entry, from)
        if (this._asSheet && window.matchMedia("(max-width: 768px)").matches) return this._openSheet(y, target, from)

        const menu = document.createElement("div")
        menu.className = "y-context-menu is-hidden"
        buildMenuItems(this._items, menu, () => this.close(), { ...ContextMenuComponent.icons, ...this._icons })

        document.body.appendChild(menu)
        this._menu = menu
        ContextMenuComponent._open.add(this)
        this._target = target
        this._companions = []

        // Before measuring: onOpen may add content
        if (this._onOpen) this._onOpen(menu, target)

        this._position(menu, x, y)
        requestAnimationFrame(() => { if (this._menu == menu) menu.classList.remove("is-hidden") })

        this._onOutside = (e) => {
            if (!this._inside(e.target)) this.close()
        }
        this._onKey = (e) => {
            if (e.key != "Escape") return
            e.preventDefault()
            e.stopPropagation()
            this.close()
        }
        this._onScroll = (e) => {
            if (this._inside(e.target)) return
            this.close()
        }

        this._listenTimer = setTimeout(() => {
            this._listenTimer = null
            document.addEventListener("click", this._onOutside)
            document.addEventListener("contextmenu", this._onOutside)
            document.addEventListener("keydown", this._onKey, true)
            window.addEventListener("scroll", this._onScroll, true)
        }, 0)

        return menu
    }

    _openSheet(y, target, from) {
        ContextMenuComponent._open.add(this)
        this._target = target
        this._companions = []
        const sheet = openSheet(this._items, {
            trigger: from instanceof Element ? from : null,
            at: y,
            icons: { ...ContextMenuComponent.icons, ...this._icons },
            onClose: () => {
                if (this._sheet != sheet) return
                ContextMenuComponent._open.delete(this)
                menuClosed(this._entry)
                this._sheet = null
                this._menu = null
                this._target = null
                if (this._onClose) this._onClose(target)
            },
        })
        this._sheet = sheet
        this._menu = sheet.panel
        if (this._onOpen) this._onOpen(sheet.panel, target)
        return sheet.panel
    }

    close() {
        if (this._sheet) return this._sheet.close()
        if (!this._menu) return

        clearTimeout(this._listenTimer)
        this._listenTimer = null
        document.removeEventListener("click", this._onOutside)
        document.removeEventListener("contextmenu", this._onOutside)
        document.removeEventListener("keydown", this._onKey, true)
        window.removeEventListener("scroll", this._onScroll, true)

        const menu = this._menu
        const target = this._target
        ContextMenuComponent._open.delete(this)
        menuClosed(this._entry)
        this._menu = null
        this._target = null

        menu.classList.add("is-hidden")
        this._closing = { menu, target, timer: setTimeout(() => this._finishClose(), 300) }
    }

    _finishClose() {
        if (!this._closing) return
        const { menu, target, timer } = this._closing
        this._closing = null
        clearTimeout(timer)
        if (menu.parentNode) menu.remove()
        if (this._onClose) this._onClose(target)
    }

    _position(menu, x, y) {
        const pad = 8
        fitMenu(menu)
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
        return this._menu != null
    }
}
