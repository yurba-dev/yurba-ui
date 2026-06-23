import { BaseComponent } from "../../helpers/lib.js"
import { anchorFixed } from "../../helpers/menu.js"

export class SelectComponent extends BaseComponent {
    constructor(options = [], properties = {}) {
        super()
        this._options = options
        this._multiple = properties.multiple ?? false
        this._placeholder = properties.placeholder ?? "Select..."
        this._changeHandlers = []
        this.placement = "body"
        this._menuMounted = false
        this._menu = null
        this._trigger = null

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

        this._syncTrigger()

        const initMenu = () => {
            if (this._menuMounted) return

            this._menu = document.createElement("div")
            this._menu.className = "y-select__menu y-win__hidden"

            this._renderMenu()

            document.addEventListener("click", (e) => {
                if (!el.contains(e.target) && !this._menu.contains(e.target)) {
                    this._close()
                }
            })

            window.addEventListener("scroll", () => this._close(), true)

            document.body.appendChild(this._menu)
            this._menuMounted = true
        }

        this._trigger.addEventListener("click", (e) => {
            e.stopPropagation()
            initMenu()
            const closing = !this._menu.classList.contains("y-win__hidden")
            this._close()
            if (!closing) {
                anchorFixed(this._trigger, this._menu, "left")
                this._menu.classList.remove("y-win__hidden")
            }
        })

        el.appendChild(this._trigger)

        this.el = el
        return el
    }

    _close() {
        if (!this._menu) return
        this._menu.classList.add("y-win__hidden")
    }

    _syncTrigger() {
        if (!this._trigger) return
        const arrow = `<span class="y-select__arrow"><svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`

        if (this._multiple) {
            const selected = this._options.filter(o => this._values.includes(o.value))
            let inner
            if (selected.length === 0) {
                inner = `<span class="y-select__placeholder">${this._placeholder}</span>`
            } else if (selected.length <= 2) {
                inner = selected.map(o =>
                    `${o.icon ? '<span class="y-select__item-icon">' + o.icon + "</span>" : ""}<span>${o.label}</span>`
                ).join('<span class="y-select__multi-sep">,</span>')
            } else {
                inner = `<span>${selected.length} selected</span>`
            }
            this._trigger.innerHTML = `<span class="y-select__label">${inner}</span>${arrow}`
            return
        }

        const opt = this._options.find(o => o.value === this._value)
        const label = opt
            ? `${opt.icon ? '<span class="y-select__item-icon">' + opt.icon + "</span>" : ""}<span>${opt.label}</span>`
            : `<span class="y-select__placeholder">${this._placeholder}</span>`
        this._trigger.innerHTML = `<span class="y-select__label">${label}</span>${arrow}`
    }

    _renderMenu() {
        if (!this._menu) return
        this._menu.innerHTML = ""
        this._options.forEach(opt => {
            const isActive = this._multiple
                ? this._values.includes(opt.value)
                : opt.value === this._value

            const item = document.createElement("button")
            item.className = "y-select__item" + (isActive ? " y-select__item--active" : "")
            item.type = "button"

            if (this._multiple) {
                item.innerHTML = `<span class="y-select__check"></span>${opt.icon ? '<span class="y-select__item-icon">' + opt.icon + "</span>" : ""}<span>${opt.label}</span>`
            } else {
                item.innerHTML = `${opt.icon ? '<span class="y-select__item-icon">' + opt.icon + "</span>" : ""}<span>${opt.label}</span>`
            }

            item.addEventListener("click", (e) => {
                e.stopPropagation()
                if (this._multiple) {
                    const idx = this._values.indexOf(opt.value)
                    if (idx === -1) this._values.push(opt.value)
                    else this._values.splice(idx, 1)
                    this._syncTrigger()
                    this._renderMenu()
                    this._changeHandlers.forEach(cb => cb([...this._values], this._options.filter(o => this._values.includes(o.value))))
                } else {
                    this._value = opt.value
                    this._syncTrigger()
                    this._renderMenu()
                    this._close()
                    this._changeHandlers.forEach(cb => cb(opt.value, opt))
                }
            })

            this._menu.appendChild(item)
        })
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

    onChange(cb) {
        this._changeHandlers.push(cb)
        return this
    }
}
