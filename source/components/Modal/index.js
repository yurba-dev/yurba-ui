import { error, warn, BaseComponent } from "../../helpers/lib.js"
import { modals } from "../../helpers/globals.js"
import { UIElements } from "../../helpers/elements.js"

export class Modal {
    constructor(properties = {}) {
        const size = "size" in properties ? properties.size : "default"
        this.size = size
        this._properties = properties
        this._mounted = false
        this._outsideClickEnabled = properties.closeOnOutsideClick ?? true
        this._onClose = properties.onClose ?? null

        this._renderQueue = []
        this._setupHooks = []

        if (Array.isArray(properties.components)) {
            properties.components.forEach(c => this._renderQueue.push({ component: c.content, placement: c.area }))
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

        UIElements.push(this)
        this.#bindYModalAttributes()
    }

    #initModal() {
        if (this._mounted) return

        this.modal = document.createElement("div")
        this.modal.classList.add("y-win__wrapper", "y-win__hidden", this.size)
        this.modal.innerHTML = `
            <div class="y-win">
                <div class="y-win__header">
                    <div class="y-win__header-body"></div>
                    <div class="y-win__header-actions">
                        <div class="y-win__controls"></div>
                        <button class="y-win__close" id="close" aria-label="Close">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="y-win__body"></div>
                <div class="y-win__footer-wrapper">
                    <div class="y-win__footer"></div>
                </div>
            </div>
        `

        if ("parent" in this._properties) {
            if (this._properties.parent instanceof HTMLElement) {
                this._properties.parent.appendChild(this.modal)
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
        this.modalClose = this.modal.querySelector("#close")

        this.modalClose.addEventListener("click", () => { this.hide(); this.#fireClose() })
        this._mounted = true

        this._setupHooks.forEach(fn => fn(this.modal))
        this._renderQueue.forEach(({ component, placement }) => this.#mount(component, placement))
    }

    renderComponent(component, customPlacement) {
        this._renderQueue.push({ component, placement: customPlacement })

        if (this._mounted) {
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

        const el = component.render()
        placements[component.placement].appendChild(el)
        return el
    }

    _addSetupHook(fn) {
        this._setupHooks.push(fn)
        if (this._mounted) fn(this.modal)
    }

    bind(name) {
        modals[name] = this
        this.name = name
    }

    show() {
        this.#initModal()
        this.#bindUpdates()
        this.showed = true

        const modal = this.modal
        void modal.offsetWidth
        requestAnimationFrame(() => {
            if (this.showed && modal) modal.classList.remove("y-win__hidden")
        })

        if (this.type === 'modal') {
            document.body.style.overflow = 'hidden'
        }

        if (this._outsideClickEnabled) {
            setTimeout(() => {
                this._outsideClickHandler = (e) => {
                    if (e.target === this.modal || !this.modal.contains(e.target)) { this.hide(); this.#fireClose() }
                }
                document.addEventListener('click', this._outsideClickHandler)
            }, 0)
        }
    }

    hide() {
        if (!this._mounted) return

        this.#bindUpdates()
        this.showed = false
        this.modal.classList.add("y-win__hidden")

        if (this.type === 'modal') {
            const anyModalOpen = UIElements.some(e => e !== this && e.showed && e.type === 'modal')
            if (!anyModalOpen) document.body.style.overflow = ''
        }

        if (this._outsideClickHandler) {
            document.removeEventListener('click', this._outsideClickHandler)
            this._outsideClickHandler = null
        }

        setTimeout(() => {
            if (this._mounted && this.modal && this.modal.classList.contains("y-win__hidden")) {
                this.modal.remove()
                this.modal = null
                this._mounted = false
            }
        }, 300)
    }

    remove() {
        const idx = UIElements.indexOf(this)
        if (idx !== -1) {
            UIElements.splice(idx, 1)
            if (this._mounted && this.modal) {
                this.modal.remove()
            }
        }
    }

    hideOnTimeout(time = 0, properties = {}) {
        this._hideDelay = time
        this._hideTimeout = null

        const startTimer = () => {
            this._hideTimeout = setTimeout(() => this.hide(), this._hideDelay)
        }
        const clearTimer = () => {
            if (this._hideTimeout) {
                clearTimeout(this._hideTimeout)
                this._hideTimeout = null
            }
        }

        startTimer()

        if (properties.notHideWhenHovered) {
            this.modal.addEventListener("mouseover", () => clearTimer())
            this.modal.addEventListener("mouseout", (e) => {
                if (!this.modal.contains(e.relatedTarget)) startTimer()
            })
        }
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

    setPosition(pos) {
        this.#initModal()
        const positions = {
            right: "y-win__pos-right",
            center: "y-win__pos-center",
            left: "y-win__pos-left",
            bottom: "y-win__pos-bottom",
            top: "y-win__pos-top"
        }
        pos.split("-").map(p => p.trim()).forEach(p => {
            if (p in positions) this.modal.classList.add(positions[p])
        })
    }

    isPopup() { return this.type === "popup" }
    isToast() { return this.type === "toast" }
    isShowed() { return this.showed }

    #fireClose() {
        if (this._onClose) this._onClose()
    }

    #bindUpdates() {
        if (this.modalHeader.childNodes.length === 0) {
            this.modalHeader.classList.add("y-win__header-empty")
        } else {
            this.modalHeader.classList.remove("y-win__header-empty")
        }
    }

    #bindYModalAttributes() {
        document.querySelectorAll("[y-win]").forEach(e => {
            const ID = e.getAttribute("y-win")
            e.addEventListener("click", () => {
                if (ID in modals) {
                    modals[ID].show()
                } else {
                    warn(`The "${ID}" modal window was not found. It has either been deleted or has not yet been created. Ignoring...`)
                }
            })
        })
    }
}
