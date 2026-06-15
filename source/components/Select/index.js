import { BaseComponent } from "../../helpers/lib.js"

export class SelectComponent extends BaseComponent {
    constructor(options = [], properties = {}) {
        super()
        this._options = options
        this._multiple = properties.multiple ?? false
        this._placeholder = properties.placeholder ?? "Select..."
        this._changeHandlers = []
        this.placement = "body"

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

        this._menu = document.createElement("div")
        this._menu.className = "y-select__menu y-win__hidden"

        this._syncTrigger()
        this._renderMenu()

        el.appendChild(this._trigger)
        el.appendChild(this._menu)

        this._trigger.addEventListener("click", (e) => {
            e.stopPropagation()
            const closing = !this._menu.classList.contains("y-win__hidden")
            this._menu.classList.add("y-win__hidden")
            if (!closing) {
                this._reposition()
                this._menu.classList.remove("y-win__hidden")
            }
        })

        document.addEventListener("click", () => this._menu.classList.add("y-win__hidden"))

        this.el = el
        return el
    }

    _reposition() {
        const menu = this._menu
        menu.style.top = ""
        menu.style.bottom = ""
        menu.style.left = ""
        menu.style.right = ""

        const pad = 8
        const tRect = this._trigger.getBoundingClientRect()
        const mRect = menu.getBoundingClientRect()

        if (tRect.left + mRect.width > window.innerWidth - pad) {
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

    _syncTrigger() {
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
                    this._menu.classList.add("y-win__hidden")
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
        this._renderMenu()
        return this
    }

    onChange(cb) {
        this._changeHandlers.push(cb)
        return this
    }
}
