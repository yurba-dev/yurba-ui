import { BaseComponent } from "../../helpers/lib.js"
import { anchorFixed, menuOpened, menuClosed } from "../../helpers/menu.js"

const htmlEntities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => htmlEntities[c])
}

export class SelectComponent extends BaseComponent {
    // The page sets these in its own language
    static labels = { placeholder: "Select...", selected: (count) => `${count} selected` }
    // An empty check keeps the tick drawn in CSS
    static icons = { arrow: '<svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>', check: "" }

    constructor(options = [], properties = {}) {
        super()
        this._options = options
        this._icons = properties.icons ?? null
        this._multiple = properties.multiple ?? false
        this._placeholder = properties.placeholder ?? SelectComponent.labels.placeholder
        // Pass html: false for labels from data
        this._html = properties.html ?? true
        this._changeHandlers = []
        this.placement = "body"
        this._menuMounted = false
        this._menu = null
        this._trigger = null
        this._entry = { holds: (node) => node instanceof Node && !!this._menu?.contains(node), close: () => this._close() }

        if (this._multiple) {
            this._values = Array.isArray(properties.values) ? [...properties.values] : []
        } else {
            this._value = properties.value ?? (options[0]?.value ?? null)
        }
    }

    render() {
        const el = document.createElement("div")
        el.className = "y-select"

        this._trigger = document.createElement("button")
        this._trigger.className = "y-select__trigger"
        this._trigger.type = "button"
        this._trigger.setAttribute("aria-haspopup", "listbox")
        this._trigger.setAttribute("aria-expanded", "false")

        this._syncTrigger()

        this._trigger.addEventListener("click", (e) => {
            e.stopPropagation()
            this._initMenu()
            const closing = !this._menu.classList.contains("is-hidden")
            this._close()
            if (!closing) this._open()
        })

        el.appendChild(this._trigger)

        this.el = el
        return el
    }

    _initMenu() {
        if (this._menuMounted) return

        this._menu = document.createElement("div")
        this._menu.className = "y-select__menu is-hidden"
        this._menu.setAttribute("role", "listbox")
        if (this._multiple) this._menu.setAttribute("aria-multiselectable", "true")

        this._renderMenu()

        document.body.appendChild(this._menu)
        this._menuMounted = true
    }

    _items() {
        return this._menu ? Array.from(this._menu.querySelectorAll(".y-select__item")) : []
    }

    _open() {
        // Last in body: modals share its z-index
        if (document.body.lastElementChild != this._menu) document.body.appendChild(this._menu)
        // The trigger click is stopped, so other open menus never see it
        menuOpened(this._entry, this._trigger)
        anchorFixed(this._trigger, this._menu, "left")
        this._menu.classList.remove("is-hidden")
        this._trigger.classList.add("is-open")
        this._trigger.setAttribute("aria-expanded", "true")

        this._outsideHandler = (e) => {
            if (!this.el.contains(e.target) && !this._menu.contains(e.target)) this._close()
        }
        this._scrollHandler = (e) => {
            if (e.target instanceof Node && this._menu.contains(e.target)) return
            this._close()
        }
        this._keyHandler = (e) => {
            const list = this._items()
            const idx = list.indexOf(document.activeElement)
            if (e.key == "Escape" || e.key == "Tab") {
                // Stopped, so an outer modal ignores this Escape
                if (e.key == "Escape") { e.preventDefault(); e.stopPropagation() }
                const inside = idx != -1
                this._close()
                if (inside || e.key == "Escape") this._trigger.focus()
                if (inside && e.key == "Tab") e.preventDefault()
                return
            }
            if (list.length == 0) return
            if (e.key == "ArrowDown") { e.preventDefault(); (list[idx + 1] || list[0]).focus() }
            else if (e.key == "ArrowUp") { e.preventDefault(); (list[idx - 1] || list[list.length - 1]).focus() }
            else if (e.key == "Home") { e.preventDefault(); list[0].focus() }
            else if (e.key == "End") { e.preventDefault(); list[list.length - 1].focus() }
        }
        // A resized window moves the trigger away from where the menu was put
        this._resizeHandler = () => this._close()
        document.addEventListener("click", this._outsideHandler)
        window.addEventListener("scroll", this._scrollHandler, true)
        window.addEventListener("resize", this._resizeHandler)
        document.addEventListener("keydown", this._keyHandler, true)

        const list = this._items()
        const active = list.find(i => i.classList.contains("is-active")) || list[0]
        if (active) active.focus({ preventScroll: true })
    }

    _close() {
        if (this._outsideHandler) { document.removeEventListener("click", this._outsideHandler); this._outsideHandler = null }
        if (this._scrollHandler) { window.removeEventListener("scroll", this._scrollHandler, true); this._scrollHandler = null }
        if (this._resizeHandler) { window.removeEventListener("resize", this._resizeHandler); this._resizeHandler = null }
        if (this._keyHandler) { document.removeEventListener("keydown", this._keyHandler, true); this._keyHandler = null }
        menuClosed(this._entry)
        if (!this._menu) return
        this._menu.classList.add("is-hidden")
        this._trigger.classList.remove("is-open")
        this._trigger.setAttribute("aria-expanded", "false")
    }

    _iconSet() {
        return { ...SelectComponent.icons, ...this._icons }
    }

    _label(text) {
        return this._html ? text : escapeHtml(text)
    }

    _syncTrigger() {
        if (!this._trigger) return
        const arrow = `<span class="y-select__arrow">${this._iconSet().arrow}</span>`

        if (this._multiple) {
            const selected = this._options.filter(o => this._values.includes(o.value))
            let inner
            if (selected.length == 0) {
                inner = `<span class="y-select__placeholder">${this._placeholder}</span>`
            } else if (selected.length <= 2) {
                inner = selected.map(o =>
                    `${o.icon ? '<span class="y-select__item-icon">' + o.icon + "</span>" : ""}<span>${this._label(o.label)}</span>`
                ).join('<span class="y-select__multi-sep">,</span>')
            } else {
                inner = `<span>${escapeHtml(SelectComponent.labels.selected(selected.length))}</span>`
            }
            this._trigger.innerHTML = `<span class="y-select__label">${inner}</span>${arrow}`
            return
        }

        const opt = this._options.find(o => o.value == this._value)
        const label = opt
            ? `${opt.icon ? '<span class="y-select__item-icon">' + opt.icon + "</span>" : ""}<span>${this._label(opt.label)}</span>`
            : `<span class="y-select__placeholder">${this._placeholder}</span>`
        this._trigger.innerHTML = `<span class="y-select__label">${label}</span>${arrow}`
    }

    _renderMenu() {
        if (!this._menu) return
        const focused = this._items().indexOf(document.activeElement)
        this._menu.innerHTML = ""
        const icons = this._iconSet()
        this._options.forEach(opt => {
            const isActive = this._multiple
                ? this._values.includes(opt.value)
                : opt.value == this._value

            const item = document.createElement("button")
            item.className = "y-select__item" + (isActive ? " is-active" : "")
            item.type = "button"
            item.setAttribute("role", "option")
            item.setAttribute("aria-selected", isActive ? "true" : "false")

            const icon = opt.icon ? '<span class="y-select__item-icon">' + opt.icon + "</span>" : ""
            if (this._multiple) {
                item.innerHTML = `<span class="y-select__check">${isActive ? icons.check : ""}</span>${icon}<span>${this._label(opt.label)}</span>`
            } else {
                item.innerHTML = `${icon}<span>${this._label(opt.label)}</span>`
            }

            item.addEventListener("click", (e) => {
                e.stopPropagation()
                if (this._multiple) {
                    const idx = this._values.indexOf(opt.value)
                    if (idx == -1) this._values.push(opt.value)
                    else this._values.splice(idx, 1)
                    this._syncTrigger()
                    this._renderMenu()
                    const selected = this._options.filter(o => this._values.includes(o.value))
                    this._changeHandlers.forEach(cb => cb([...this._values], selected))
                    this._emitChange({ values: [...this._values], options: selected })
                } else {
                    const hadFocus = this._menu.contains(document.activeElement)
                    this._value = opt.value
                    this._syncTrigger()
                    this._renderMenu()
                    this._close()
                    if (hadFocus) this._trigger.focus({ preventScroll: true })
                    this._changeHandlers.forEach(cb => cb(opt.value, opt))
                    this._emitChange({ value: opt.value, option: opt })
                }
            })

            this._menu.appendChild(item)
        })
        if (focused != -1) this._items()[focused]?.focus({ preventScroll: true })
    }

    getValue() {
        return this._multiple ? [...this._values] : this._value
    }

    setValue(value) {
        if (this._multiple) {
            this._values = Array.isArray(value) ? [...value] : [value]
        } else {
            this._value = value
        }
        this._syncTrigger()
        if (this._menuMounted) this._renderMenu()
        return this
    }

    // Options that change after rendering; the value stays if it is still among them
    setOptions(options, value = this._value) {
        this._options = options
        if (!this._multiple) this._value = options.some(o => o.value == value) ? value : (options[0]?.value ?? null)
        this._syncTrigger()
        if (this._menuMounted) this._renderMenu()
        return this
    }

    // Takes over a native <select> the page already reads and fills: it stays in place, hidden, as the value the
    // page sees and the "change" it listens to, and this one shows and picks it. Options the page rewrites and
    // values it sets itself are followed.
    static from(select, properties = {}) {
        if (!select) return null
        if (select._yurbaSelect) return select._yurbaSelect
        const read = () => Array.from(select.options).map(o => ({ value: o.value, label: o.textContent }))
        const native = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")
        const nativeIndex = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "selectedIndex")
        const ui = new SelectComponent(read(), { html: false, value: select.value, ...properties })
        const el = ui.render()
        el.classList.add("y-select--wide")
        const host = select.closest(".y-input") ?? select
        host.style.display = "none"
        host.after(el)
        select._yurbaSelect = ui

        ui.onChange((value) => {
            native.set.call(select, value)
            select.dispatchEvent(new Event("input", { bubbles: true }))
            select.dispatchEvent(new Event("change", { bubbles: true }))
        })
        new MutationObserver(() => ui.setOptions(read(), native.get.call(select)))
            .observe(select, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["selected", "value", "label"] })
        Object.defineProperty(select, "value", {
            configurable: true,
            get() { return native.get.call(this) },
            set(value) {
                native.set.call(this, value)
                ui.setValue(native.get.call(this))
            },
        })
        Object.defineProperty(select, "selectedIndex", {
            configurable: true,
            get() { return nativeIndex.get.call(this) },
            set(index) {
                nativeIndex.set.call(this, index)
                ui.setValue(native.get.call(this))
            },
        })
        return ui
    }

    _emitChange(detail) {
        if (!this.el) return
        this.el.dispatchEvent(new CustomEvent("yurba-select:change", { detail, bubbles: true }))
    }

    onChange(cb) {
        this._changeHandlers.push(cb)
        return this
    }

    destroy() {
        this._close()
        if (this._menu) this._menu.remove()
        if (this.el) this.el.remove()
        this._menu = null
        this._menuMounted = false
    }
}
