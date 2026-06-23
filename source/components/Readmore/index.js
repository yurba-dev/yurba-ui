export class Readmore {
    constructor(target, options = {}) {
        this._el = typeof target === 'string' ? document.querySelector(target) : target
        this._collapsedHeight = options.collapsedHeight ?? 200
        this._heightMargin = options.heightMargin ?? 16
        this._moreText = options.moreText ?? 'Read more'
        this._lessText = options.lessText ?? 'Read less'
        this._expanded = false
        this._toggle = null

        this._init()
    }

    _init() {
        if (!this._el) return

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
        if (!this._el) return
        this._el.style.maxHeight = this._el.scrollHeight + 'px'
        this._toggle.textContent = this._lessText
        this._expanded = true
    }

    collapse() {
        if (!this._el) return
        this._el.style.maxHeight = this._collapsedHeight + 'px'
        this._toggle.textContent = this._moreText
        this._expanded = false
    }
}
