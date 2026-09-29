const instances = new WeakMap()

export class Readmore {
    constructor(target, options = {}) {
        this._el = typeof target == 'string' ? document.querySelector(target) : target
        this._collapsedHeight = options.collapsedHeight ?? 200
        this._heightMargin = options.heightMargin ?? 16
        this._moreText = options.moreText ?? 'Read more'
        this._lessText = options.lessText ?? 'Read less'
        this._expanded = false
        this._toggle = null
        this._expandTimer = null

        this._init()
    }

    _init() {
        if (!this._el) return

        instances.get(this._el)?.destroy()
        instances.set(this._el, this)

        const naturalHeight = this._el.scrollHeight
        if (naturalHeight <= this._collapsedHeight + this._heightMargin) return

        this._el.classList.add('y-readmore')
        this._el.style.maxHeight = this._collapsedHeight + 'px'

        this._toggle = document.createElement('button')
        this._toggle.className = 'y-readmore__toggle'
        this._toggle.type = 'button'
        this._toggle.textContent = this._moreText

        this._toggle.addEventListener('click', () => {
            this._expanded ? this.collapse() : this.expand()
        })

        this._el.after(this._toggle)
    }

    expand() {
        if (!this._el || !this._toggle) return
        this._el.style.maxHeight = this._el.scrollHeight + 'px'
        this._toggle.textContent = this._lessText
        this._expanded = true
        clearTimeout(this._expandTimer)
        this._expandTimer = setTimeout(() => {
            if (this._expanded && this._el) this._el.style.maxHeight = 'none'
        }, 300)
    }

    collapse() {
        if (!this._el || !this._toggle) return
        clearTimeout(this._expandTimer)
        if (this._el.style.maxHeight == 'none') {
            this._el.style.maxHeight = this._el.scrollHeight + 'px'
            void this._el.offsetHeight
        }
        this._el.style.maxHeight = this._collapsedHeight + 'px'
        this._toggle.textContent = this._moreText
        this._expanded = false
    }

    destroy() {
        clearTimeout(this._expandTimer)
        if (this._toggle) this._toggle.remove()
        this._toggle = null
        this._expanded = false
        if (!this._el) return
        this._el.classList.remove('y-readmore')
        this._el.style.maxHeight = ''
        if (instances.get(this._el) == this) instances.delete(this._el)
    }
}
