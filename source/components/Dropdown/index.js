import { BaseComponent, error } from "../../helpers/lib.js"
import { buildMenuItems, anchorFixed, releaseSubmenus, menuOpened, menuClosed, menuIcons } from "../../helpers/menu.js"
import { openSheet } from "./sheet.js"

export class DropdownComponent extends BaseComponent {
    static icons = menuIcons

    constructor(items = [], properties = {}) {
        super()
        this._items = items
        this._icons = properties.icons ?? null
        this._content = properties.content ?? null
        if (!properties.trigger) error("Dropdown requires a trigger: pass trigger: '<html>' in options")
        this._triggerContent = properties.trigger
        this._onOpen = properties.onOpen ?? null
        this._onClose = properties.onClose ?? null
        this._align = properties.align ?? 'left'
        this._matchWidth = properties.matchWidth ?? false
        this._triggerClass = properties.triggerClass ?? null
        this._keepMounted = properties.keepMounted ?? false
        this.placement = "body"
        this._menuMounted = false
        this._menu = null
    }

    render() {
        const dropdown = this
        const external = this._triggerContent instanceof HTMLElement
        const el = external ? this._triggerContent : document.createElement("div")
        if (!external) el.className = "y-dropdown"

        const trigger = external ? el : document.createElement("button")
        if (!external) {
            trigger.className = "y-dropdown__trigger"
            trigger.type = "button"
            trigger.innerHTML = this._triggerContent
        }
        if (this._triggerClass) trigger.classList.add(...this._triggerClass.split(" ").filter(Boolean))
        trigger.setAttribute("aria-haspopup", "true")
        trigger.setAttribute("aria-expanded", "false")

        function menuItems() {
            return typeof dropdown._items == "function" ? dropdown._items() : dropdown._items
        }

        function isOpen() {
            return dropdown._menu && !dropdown._menu.classList.contains("is-hidden")
        }

        function unbindGlobal() {
            if (dropdown._keyHandler) { document.removeEventListener("keydown", dropdown._keyHandler, true); dropdown._keyHandler = null }
            if (dropdown._outsideHandler) { document.removeEventListener("click", dropdown._outsideHandler); dropdown._outsideHandler = null }
            if (dropdown._scrollHandler) { window.removeEventListener("scroll", dropdown._scrollHandler, true); dropdown._scrollHandler = null }
        }

        function closeRoot() {
            if (!isOpen()) return
            menuClosed(dropdown._opened)
            unbindGlobal()
            trigger.setAttribute("aria-expanded", "false")
            const menu = dropdown._menu
            menu.classList.add("is-hidden")
            releaseSubmenus(menu)
            menu.dispatchEvent(new CustomEvent("yurba-dropdown:close", { bubbles: true }))
            if (dropdown._onClose) dropdown._onClose(menu)

            if (dropdown._keepMounted) return

            setTimeout(() => {
                if (dropdown._menu == menu && menu.classList.contains("is-hidden")) {
                    menu.remove()
                    dropdown._menu = null
                    dropdown._menuMounted = false
                }
            }, 300)
        }

        function initMenu() {
            if (dropdown._menuMounted) return

            const menu = document.createElement("div")
            menu.className = "y-dropdown__menu is-hidden"
            menu.setAttribute("tabindex", "-1")
            dropdown._menu = menu

            if (dropdown._content != null) {
                if (dropdown._content instanceof HTMLElement) {
                    menu.appendChild(dropdown._content)
                } else if (typeof dropdown._content == "string") {
                    menu.innerHTML = dropdown._content
                }
            } else {
                buildMenuItems(menuItems(), menu, closeRoot, { ...DropdownComponent.icons, ...dropdown._icons })
            }

            document.body.appendChild(menu)
            dropdown._menuMounted = true
        }

        function visibleItems() {
            return Array.from(dropdown._menu.querySelectorAll(".y-dropdown__item")).filter(i => i.offsetParent != null)
        }

        function open() {
            initMenu()
            const menu = dropdown._menu
            dropdown._opened = { holds: (node) => node instanceof Node && !!dropdown._menu?.contains(node), close: closeRoot }
            menuOpened(dropdown._opened, trigger)
            unbindGlobal()
            dropdown._outsideHandler = (e) => {
                if (!el.contains(e.target) && !menu.contains(e.target)) closeRoot()
            }
            dropdown._scrollHandler = (e) => {
                if (e.target instanceof Node && menu.contains(e.target)) return
                closeRoot()
            }
            document.addEventListener("click", dropdown._outsideHandler)
            window.addEventListener("scroll", dropdown._scrollHandler, true)
            // Last in body: modals share its z-index
            if (document.body.lastElementChild != menu) document.body.appendChild(menu)
            if (dropdown._matchWidth) menu.style.minWidth = trigger.offsetWidth + "px"
            anchorFixed(trigger, menu, dropdown._align)
            menu.classList.remove("is-hidden")
            trigger.setAttribute("aria-expanded", "true")
            menu.dispatchEvent(new CustomEvent("yurba-dropdown:open", { bubbles: true }))
            if (dropdown._onOpen) dropdown._onOpen(menu)

            dropdown._keyHandler = (e) => {
                if (e.key == "Escape") { e.preventDefault(); e.stopPropagation(); closeRoot(); trigger.focus(); return }
                // The menu sits at the end of the body, so Tab would leave the page
                if (e.key == "Tab" && dropdown._content == null && menu.contains(document.activeElement)) { e.preventDefault(); closeRoot(); trigger.focus(); return }
                const list = visibleItems()
                if (list.length == 0) return
                const idx = list.indexOf(document.activeElement)
                if (e.key == "ArrowDown") { e.preventDefault(); (list[idx + 1] || list[0]).focus() }
                else if (e.key == "ArrowUp") { e.preventDefault(); (list[idx - 1] || list[list.length - 1]).focus() }
                else if (e.key == "Home") { e.preventDefault(); list[0].focus() }
                else if (e.key == "End") { e.preventDefault(); list[list.length - 1].focus() }
            }
            // Capture phase, so an outer modal ignores this Escape
            document.addEventListener("keydown", dropdown._keyHandler, true)
            setTimeout(() => {
                if (!isOpen()) return
                const list = visibleItems()
                ;(list[0] || menu).focus()
            }, 0)
        }

        function asSheet() {
            return dropdown._content == null && window.matchMedia("(max-width: 768px)").matches
        }

        function toggleSheet() {
            if (dropdown._sheet?.isOpen()) return dropdown._sheet.close()
            trigger.setAttribute("aria-expanded", "true")
            const entry = { holds: (node) => node instanceof Node && !!dropdown._sheet?.panel.contains(node), close: () => dropdown._sheet?.close() }
            menuOpened(entry, trigger)
            dropdown._sheet = openSheet(menuItems(), {
                trigger,
                icons: { ...DropdownComponent.icons, ...dropdown._icons },
                onClose: (panel) => {
                    menuClosed(entry)
                    trigger.setAttribute("aria-expanded", "false")
                    if (dropdown._onClose) dropdown._onClose(panel)
                },
            })
            if (dropdown._onOpen) dropdown._onOpen(dropdown._sheet.panel)
        }

        function onTriggerClick(e) {
            e.stopPropagation()
            if (asSheet()) return toggleSheet()
            if (isOpen()) closeRoot()
            else open()
        }

        if (this._triggerClick) this._triggerEl.removeEventListener("click", this._triggerClick)
        trigger.addEventListener("click", onTriggerClick)
        this._triggerEl = trigger
        this._triggerClick = onTriggerClick

        if (!external) el.appendChild(trigger)

        if (this._keepMounted) initMenu()

        this._unbindGlobal = unbindGlobal
        this.close = function close() {
            closeRoot()
            if (dropdown._sheet?.isOpen()) dropdown._sheet.close()
        }
        this.el = el
        this.menu = this._menu
        return el
    }

    destroy() {
        if (this._unbindGlobal) this._unbindGlobal()
        if (this._opened) menuClosed(this._opened)
        if (this._menu) this._menu.remove()
        if (this._sheet?.isOpen()) this._sheet.close()
        // An external trigger outlives the dropdown
        if (this._triggerClick) {
            this._triggerEl.removeEventListener("click", this._triggerClick)
            this._triggerEl.setAttribute("aria-expanded", "false")
            this._triggerClick = null
        }
        if (this.el && !(this._triggerContent instanceof HTMLElement)) this.el.remove()
        this._menu = null
        this._menuMounted = false
    }
}
