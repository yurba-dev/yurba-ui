import { error, warn, BaseComponent } from "../../helpers/lib.js"
import { modals } from "../../helpers/globals.js"
import { UIElements } from "../../helpers/elements.js"

let yWinBound = false
function bindYWinOpeners() {
    if (yWinBound) return
    yWinBound = true
    document.addEventListener("click", (event) => {
        const element = event.target instanceof Element ? event.target.closest("[y-win]") : null
        if (!element) return
        const id = element.getAttribute("y-win")
        if (id in modals) {
            modals[id].show()
        } else {
            warn(`The "${id}" modal window was not found. It has either been deleted or has not yet been created. Ignoring...`)
        }
    })
}

export class Modal {
    static labels = { close: "Close" }
    static icons = { close: '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' }

    constructor(properties = {}) {
        const size = "size" in properties ? properties.size : "default"
        this.size = size
        this.compact = properties.compact ?? false
        this.sheet = properties.sheet ?? this.compact
        this.properties = properties
        this.mounted = false
        this.modeless = properties.modeless ?? false
        this.outsideClickEnabled = !this.modeless && (properties.closeOnOutsideClick ?? true)
        this.onClose = properties.onClose ?? null

        this.renderQueue = []
        this.setupHooks = []

        if (Array.isArray(properties.components)) {
            properties.components.forEach(component => this.renderQueue.push({ component: component.content, placement: component.area }))
        }

        this.modal = null
        this.modalHeader = null
        this.modalControls = null
        this.modalBody = null
        this.modalFooter = null
        this.modalFooterBody = null
        this.modalClose = null

        this.type = "modal"
        this.showed = false
        this.removeTimer = null
        this.positionClasses = []

        bindYWinOpeners()
    }

    #initModal() {
        if (this.mounted) return

        this.modal = document.createElement("div")
        this.modal.classList.add("y-win__wrapper", "is-hidden", this.size, ...this.positionClasses)
        if (this.compact) this.modal.classList.add("compact")
        if (this.sheet) this.modal.classList.add("sheet")
        if (this.modeless) this.modal.classList.add("modeless")
        const icons = { ...Modal.icons, ...this.properties.icons }
        this.modal.innerHTML = `
            <div class="y-win" role="dialog" aria-modal="true" tabindex="-1">
                ${this.sheet ? '<div class="y-win__handle" aria-hidden="true"></div>' : ""}
                <div class="y-win__header">
                    <div class="y-win__header-body"></div>
                    <div class="y-win__header-actions">
                        <div class="y-win__controls"></div>
                        <button type="button" class="y-win__close" aria-label="${Modal.labels.close}">
                            ${icons.close}
                        </button>
                    </div>
                </div>
                <div class="y-win__body"></div>
                <div class="y-win__footer-wrapper">
                    <div class="y-win__footer"></div>
                </div>
            </div>
        `

        if ("parent" in this.properties) {
            if (this.properties.parent instanceof HTMLElement) {
                this.properties.parent.appendChild(this.modal)
            } else {
                error("properties.parent must be an HTML element")
            }
        } else {
            document.body.appendChild(this.modal)
        }

        this.modalHeader = this.modal.querySelector(".y-win__header-body")
        this.modalControls = this.modal.querySelector(".y-win__controls")
        this.modalBody = this.modal.querySelector(".y-win__body")
        this.modalFooter = this.modal.querySelector(".y-win__footer-wrapper")
        this.modalFooterBody = this.modal.querySelector(".y-win__footer")
        this.modalClose = this.modal.querySelector(".y-win__close")

        this.modalClose.addEventListener("click", () => this.#dismiss())
        if (this.sheet) this.#bindSheetDrag()
        this.mounted = true

        this.setupHooks.forEach(hook => hook(this.modal))
        this.renderQueue.forEach(({ component, placement }) => this.#mount(component, placement))
    }

    // Android Chrome overlays the keyboard without resizing
    #fitViewport(on) {
        const viewport = window.visualViewport
        if (!viewport) return
        if (!on) {
            if (this.viewportHandler) {
                viewport.removeEventListener("resize", this.viewportHandler)
                viewport.removeEventListener("scroll", this.viewportHandler)
                this.viewportHandler = null
            }
            return
        }
        if (this.viewportHandler) return
        this.viewportHandler = () => {
            if (!this.modal) return
            const phone = window.matchMedia("(max-width: 768px)").matches
            this.modal.style.height = phone ? viewport.height + "px" : ""
            this.modal.style.top = phone ? viewport.offsetTop + "px" : ""
        }
        viewport.addEventListener("resize", this.viewportHandler)
        viewport.addEventListener("scroll", this.viewportHandler)
        this.viewportHandler()
    }

    #bindSheetDrag() {
        const modal = this
        const win = this.modal.querySelector(".y-win")
        let startY = null
        let delta = 0
        function start(event) {
            if (!window.matchMedia("(max-width: 768px)").matches) return
            startY = event.touches[0].clientY
            delta = 0
            win.style.transition = "none"
        }
        function move(event) {
            if (startY == null) return
            delta = Math.max(0, event.touches[0].clientY - startY)
            win.style.translate = `0 ${delta}px`
        }
        function end() {
            if (startY == null) return
            startY = null
            win.style.transition = ""
            win.style.translate = ""
            if (delta > 80) modal.#dismiss()
        }
        this.modal.querySelectorAll(".y-win__handle, .y-win__header").forEach(grip => grip.addEventListener("touchstart", start, { passive: true }))
        win.addEventListener("touchmove", move, { passive: true })
        win.addEventListener("touchend", end)
        win.addEventListener("touchcancel", end)
    }

    renderComponent(component, customPlacement) {
        this.renderQueue.push({ component, placement: customPlacement })

        if (this.mounted) {
            return this.#mount(component, customPlacement)
        }

        if (component instanceof HTMLElement) return component
        if (!(component instanceof BaseComponent)) {
            error("The component must inherit from BaseComponent or be an HTMLElement", "component")
        }
        if (customPlacement) component.placement = customPlacement
        return component.render()
    }

    #mount(component, customPlacement) {
        const placements = {
            body: this.modalBody,
            header: this.modalHeader,
            footer: this.modalFooterBody,
            controls: this.modalControls
        }

        if (component instanceof HTMLElement) {
            const target = placements[customPlacement ?? 'body']
            target.appendChild(component)
            return component
        }

        if (!(component instanceof BaseComponent)) {
            error("The component must inherit from BaseComponent or be an HTMLElement", "component")
        }

        if (customPlacement) component.placement = customPlacement

        const element = component.render()
        placements[component.placement].appendChild(element)
        return element
    }

    addSetupHook(hook) {
        this.setupHooks.push(hook)
        if (this.mounted) hook(this.modal)
    }

    bind(name) {
        modals[name] = this
        this.name = name
    }

    show() {
        const wasShowed = this.showed
        clearTimeout(this.removeTimer)
        this.removeTimer = null
        // Listed only while shown, so closed modals can be GC'd
        if (!UIElements.includes(this)) UIElements.push(this)
        this.#unbindHandlers()
        this.#initModal()
        this.#bindUpdates()
        this.showed = true
        // The last [data-layer] in the body is on top
        if (this.type == 'modal') this.modal.setAttribute('data-layer', '')

        const modal = this.modal
        void modal.offsetWidth
        requestAnimationFrame(() => {
            if (this.showed && modal) modal.classList.remove("is-hidden")
        })

        if (this.type == 'modal' && !this.modeless) {
            document.body.style.overflow = 'hidden'
        }
        if (this.sheet) this.#fitViewport(true)

        if (this.outsideClickEnabled) {
            setTimeout(() => {
                if (!this.showed || this.outsideClickHandler) return
                this.outsideClickHandler = (event) => {
                    if (!this.modal) return
                    // A picker on top may be hidden by this same click
                    const inAnotherModal = UIElements.some(el =>
                        el != this && el.modal && el.modal.contains(event.target))
                    if (inAnotherModal || this.#inLaterLayer(event.target)) return
                    if (event.target == this.modal || !this.modal.contains(event.target)) this.#dismiss()
                }
                document.addEventListener('click', this.outsideClickHandler)
            }, 0)
        }

        if (this.type == 'modal') {
            if (!wasShowed) this._prevFocus = document.activeElement
            this.keyHandler = (event) => {
                if (event.defaultPrevented) return
                if (!this.#isTopLayer()) return
                if (event.key == "Escape") {
                    event.preventDefault()
                    this.#dismiss()
                } else if (event.key == "Tab") {
                    this.#trapFocus(event)
                }
            }
            document.addEventListener('keydown', this.keyHandler)
            setTimeout(() => this.#focusFirst(), 50)
        }
    }

    #isTopLayer() {
        const layers = document.querySelectorAll('body > [data-layer]')
        return layers[layers.length - 1] == this.modal
    }

    #inLaterLayer(target) {
        const top = target instanceof Node && [...document.body.children].find(child => child.contains(target))
        return !!top && top != this.modal && !!(this.modal.compareDocumentPosition(top) & Node.DOCUMENT_POSITION_FOLLOWING)
    }

    #unbindHandlers() {
        if (this.outsideClickHandler) {
            document.removeEventListener('click', this.outsideClickHandler)
            this.outsideClickHandler = null
        }
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler)
            this.keyHandler = null
        }
    }

    #focusables() {
        if (!this.modal) return []
        const sel = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        return Array.from(this.modal.querySelectorAll(sel)).filter(el => el.offsetParent != null)
    }

    #focusFirst() {
        if (!this.showed || !this.modal || this.modal.contains(document.activeElement)) return
        const autofocus = this.modal.querySelector('[autofocus]')
        const win = this.modal.querySelector('.y-win')
        // Only a field asked for gets the focus. A first button would light up and show its tooltip when the focus
        // came from a field, and a first field would bring up a phone's keyboard; the dialog itself still takes
        // Escape and Tab
        ;(autofocus ?? win ?? this.modal).focus()
    }

    #trapFocus(event) {
        const list = this.#focusables()
        if (list.length == 0) return
        const first = list[0], last = list[list.length - 1]
        const active = document.activeElement
        // Focus on the dialog itself or outside it would Tab out of the modal
        const loose = !this.modal.contains(active) || active.classList.contains("y-win")
        if (event.shiftKey && (loose || active == first)) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && (loose || active == last)) { event.preventDefault(); first.focus() }
    }

    hide() {
        if (!this.mounted) return

        this.#bindUpdates()
        this.showed = false
        this.modal.classList.add("is-hidden")
        this.modal.removeAttribute('data-layer')

        if (this.type == 'modal') {
            const anyModalOpen = UIElements.some(element => element != this && element.showed && element.type == 'modal' && !element.modeless)
            if (!anyModalOpen) document.body.style.overflow = ''
        }

        this.#unbindHandlers()
        if (this.sheet) this.#fitViewport(false)

        if (this._prevFocus && typeof this._prevFocus.focus == 'function') {
            const prev = this._prevFocus
            this._prevFocus = null
            setTimeout(() => { if (document.body.contains(prev)) prev.focus() }, 0)
        }

        clearTimeout(this.removeTimer)
        this.removeTimer = setTimeout(() => {
            this.removeTimer = null
            if (this.showed || !this.mounted || !this.modal) return
            this.modal.remove()
            this.modal = null
            this.mounted = false
            this.#unlist()
        }, 300)
    }

    remove() {
        clearTimeout(this.removeTimer)
        this.removeTimer = null
        this.#clearHideTimer()
        this.#unbindHandlers()
        if (this.sheet) this.#fitViewport(false)
        if (this.mounted && this.modal) this.modal.remove()
        const wasShowed = this.showed
        this.showed = false
        if (wasShowed && this.type == 'modal') {
            const anyModalOpen = UIElements.some(element => element != this && element.showed && element.type == 'modal' && !element.modeless)
            if (!anyModalOpen) document.body.style.overflow = ''
        }
        this.modal = null
        this.mounted = false
        this.#unlist()
    }

    #unlist() {
        const index = UIElements.indexOf(this)
        if (index != -1) UIElements.splice(index, 1)
    }

    hideOnTimeout(time = 0, properties = {}) {
        this.hideDelay = time
        this.#startHideTimer()

        if (!properties.notHideWhenHovered || !this.modal || this.hoverBoundModal == this.modal) return
        const modal = this.modal
        this.hoverBoundModal = modal
        modal.addEventListener("mouseover", () => this.#clearHideTimer())
        modal.addEventListener("mouseout", (event) => {
            if (!modal.contains(event.relatedTarget)) this.#startHideTimer()
        })
    }

    #startHideTimer() {
        this.#clearHideTimer()
        this.hideTimeout = setTimeout(() => this.hide(), this.hideDelay)
    }

    #clearHideTimer() {
        clearTimeout(this.hideTimeout)
        this.hideTimeout = null
    }

    setSize(size) {
        this.#initModal()
        const sizes = ["full", "giant", "large", "medium", "default", "small", "nano"]
        if (sizes.includes(size)) {
            this.modal.classList.remove(this.size)
            this.size = size
            this.modal.classList.add(size)
        } else {
            error(`Resize error: Can't find size "${size}" in list of the allowed sizes: ${sizes.join(", ")}`)
        }
    }

    setPosition(position) {
        this.#initModal()
        const positions = {
            right: "y-win__pos-right",
            center: "y-win__pos-center",
            left: "y-win__pos-left",
            bottom: "y-win__pos-bottom",
            top: "y-win__pos-top"
        }
        position.split("-").map(part => part.trim()).forEach(part => {
            if (!(part in positions)) return
            this.modal.classList.add(positions[part])
            if (!this.positionClasses.includes(positions[part])) this.positionClasses.push(positions[part])
        })
    }

    isPopup() { return this.type == "popup" }
    isToast() { return this.type == "toast" }
    isShowed() { return this.showed }

    #fireClose() {
        if (this.onClose) this.onClose()
    }

    #dismiss() {
        this.hide()
        this.#fireClose()
    }

    #bindUpdates() {
        if (this.modalHeader.childNodes.length == 0) {
            this.modalHeader.classList.add("y-win__header-empty")
        } else {
            this.modalHeader.classList.remove("y-win__header-empty")
        }
    }

}
