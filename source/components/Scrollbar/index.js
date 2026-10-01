const instances = new WeakMap()
const attached = new Set()
const autoSelectors = new Set(["[data-y-scrollbar]"])
let observer = null

// Under 8px of overflow is rounding at fractional zoom
const MIN_OVERFLOW = 8
const MIN_THUMB = 32
const INSET = 3
// Outlasts the .3s fade-out
const FADE = 400

function autoSelector() {
    return [...autoSelectors].join(", ")
}

function scan(node) {
    if (node.nodeType != 1) return
    const selector = autoSelector()
    if (node.matches(selector)) Scrollbar.attach(node)
    node.querySelectorAll(selector).forEach((el) => Scrollbar.attach(el))
}

// A scroller that comes back keeps its data-y-scrollbar and gets a new thumb from scan()
function dropDetached() {
    attached.forEach((scroller) => {
        if (!scroller.isConnected) instances.get(scroller)?.destroy()
    })
}

function observe() {
    if (observer) return
    if (!document.body) {
        document.addEventListener("DOMContentLoaded", function ready() {
            observe()
            scan(document.body)
        }, { once: true })
        return
    }
    observer = new MutationObserver((mutations) => {
        let removed = false
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach(scan)
            if (mutation.removedNodes.length) removed = true
        })
        if (removed) dropDetached()
    })
    observer.observe(document.body, { childList: true, subtree: true })
}

export class Scrollbar {
    // Sticky headers inside a scroller: the track starts below them
    static sticky = "[data-y-scrollbar-sticky]"
    static zIndex = 1000

    static attach(scroller) {
        if (!scroller || scroller.nodeType != 1) return null
        if (!scroller.hasAttribute("data-y-scrollbar")) scroller.setAttribute("data-y-scrollbar", "")
        observe()
        // A detached scroller is attached by the observer once it is in the page
        if (!scroller.isConnected) return null
        return instances.get(scroller) || new Scrollbar(scroller)
    }

    static detach(scroller) {
        if (!scroller) return
        instances.get(scroller)?.destroy()
        scroller.removeAttribute("data-y-scrollbar")
    }

    static get(scroller) {
        return instances.get(scroller) || null
    }

    // Attaches to every match, now and later
    static auto(selector = "") {
        selector.split(",").map((part) => part.trim()).filter(Boolean).forEach((part) => autoSelectors.add(part))
        observe()
        if (document.body) scan(document.body)
    }

    constructor(scroller) {
        this.scroller = scroller
        this.thumb = document.createElement("div")
        this.thumb.className = "y-scrollbar"
        this.thumb.hidden = true
        document.body.appendChild(this.thumb)
        this.listeners = new AbortController()
        this.frame = 0
        this.hideTimer = null
        this.hovering = false
        this.dragging = false
        this.overlayTop = 0
        this.fadingUntil = 0

        this.follow = this.follow.bind(this)
        this.show = this.show.bind(this)
        instances.set(scroller, this)
        attached.add(scroller)
        this.bind()
    }

    bind() {
        const { scroller, thumb } = this
        const { signal } = this.listeners
        const self = this
        scroller.addEventListener("scroll", this.show, { signal })
        scroller.addEventListener("mouseenter", this.show, { signal })

        thumb.addEventListener("mouseenter", function enter() {
            self.hovering = true
            self.show()
        })
        thumb.addEventListener("mouseleave", function leave() {
            self.hovering = false
            if (!self.isCovered()) return self.show()
            clearTimeout(self.hideTimer)
            thumb.classList.remove("is-visible")
            self.fadingUntil = performance.now() + FADE
            self.schedule()
        })
        thumb.addEventListener("pointerdown", function down(e) {
            e.preventDefault()
            self.dragging = true
            thumb.classList.add("is-dragging")
            thumb.setPointerCapture(e.pointerId)
            const startY = e.clientY
            const startTop = scroller.scrollTop

            function move(event) {
                const { scrollHeight, clientHeight } = scroller
                const ratio = (scrollHeight - clientHeight) / Math.max(1, self.track().height - thumb.offsetHeight)
                scroller.scrollTop = startTop + (event.clientY - startY) * ratio
            }
            function up() {
                self.dragging = false
                thumb.classList.remove("is-dragging")
                thumb.removeEventListener("pointermove", move)
                thumb.removeEventListener("pointerup", up)
                thumb.removeEventListener("pointercancel", up)
                self.show()
            }
            thumb.addEventListener("pointermove", move)
            thumb.addEventListener("pointerup", up)
            thumb.addEventListener("pointercancel", up)
        })
    }

    destroy() {
        this.listeners.abort()
        clearTimeout(this.hideTimer)
        cancelAnimationFrame(this.frame)
        this.thumb.remove()
        instances.delete(this.scroller)
        attached.delete(this.scroller)
    }

    // The scroller moved to another layer, e.g. into a full-screen mode
    refresh() {
        this.measureSurroundings()
        if (this.thumb.classList.contains("is-visible")) this.schedule()
    }

    // Overlays pinned over the top of the scroller, and the layer it sits in
    measureSurroundings() {
        const { scroller } = this
        const rect = scroller.getBoundingClientRect()
        const x = rect.right - 24
        this.overlayTop = 0
        let y = rect.top + 1
        while (y < rect.top + rect.height / 2) {
            const hit = document.elementFromPoint(x, y)
            if (!hit || scroller.contains(hit)) break
            const bottom = hit.getBoundingClientRect().bottom
            if (bottom <= y) break
            this.overlayTop = bottom - rect.top
            y = bottom + 1
        }

        let layer = 0
        for (let node = scroller; node && node != document.body; node = node.parentElement) {
            const zIndex = parseInt(getComputedStyle(node).zIndex)
            if (zIndex > layer) layer = zIndex
        }
        this.thumb.style.zIndex = Math.max(Scrollbar.zIndex, layer + 1)
    }

    track() {
        const { scroller } = this
        const header = Scrollbar.sticky ? scroller.querySelector(Scrollbar.sticky) : null
        const style = header ? getComputedStyle(header) : null
        const sticky = style?.position == "sticky" ? (parseFloat(style.top) || 0) + header.offsetHeight : 0
        const offset = Math.max(sticky, this.overlayTop)
        return { top: offset + INSET, height: scroller.clientHeight - offset - INSET * 2 }
    }

    update() {
        const { scroller, thumb } = this
        if (!scroller.isConnected) {
            thumb.hidden = true
            return
        }
        const { scrollHeight, clientHeight, scrollTop } = scroller
        const { top: trackTop, height: trackHeight } = this.track()
        const shown = scroller.checkVisibility?.({ visibilityProperty: true, opacityProperty: true }) ?? true
        if (clientHeight == 0 || !shown || scroller.closest(".is-hidden") || scrollHeight - clientHeight < MIN_OVERFLOW || trackHeight < MIN_THUMB) {
            thumb.hidden = true
            return
        }
        const rect = scroller.getBoundingClientRect()
        // Anything laid over the scroller hides its thumb, a viewer or a modal opened on top of a still list too
        if (!this.dragging && (rect.right <= 0 || rect.left >= innerWidth || this.isCovered())) {
            thumb.hidden = true
            return
        }
        const height = Math.min(trackHeight, Math.max(MIN_THUMB, trackHeight * clientHeight / scrollHeight))
        // column-reverse: scrollTop is 0 at the bottom, negative above
        const max = scrollHeight - clientHeight
        const progress = getComputedStyle(scroller).flexDirection == "column-reverse" ? 1 + scrollTop / max : scrollTop / max
        const top = rect.top + trackTop + (trackHeight - height) * Math.min(1, Math.max(0, progress))
        thumb.hidden = false
        thumb.style.height = `${height}px`
        thumb.style.left = `${rect.right}px`
        thumb.style.transform = `translate(calc(-100% - ${INSET}px), ${top}px)`
    }

    // Polled per frame: layout changes fire no event
    follow() {
        const { thumb } = this
        this.update()
        const onScreen = thumb.classList.contains("is-visible") || performance.now() < this.fadingUntil
        if (thumb.hidden || !onScreen) {
            this.frame = 0
            if (thumb.hidden) {
                this.hovering = false
                thumb.classList.remove("is-visible")
            }
            return
        }
        this.frame = requestAnimationFrame(this.follow)
    }

    schedule() {
        if (!this.frame) this.frame = requestAnimationFrame(this.follow)
    }

    // Opening a modal can fire scroll behind it (scroll anchoring)
    isCovered() {
        const { scroller } = this
        const rect = scroller.getBoundingClientRect()
        const hit = document.elementFromPoint(rect.right - 24, rect.top + rect.height / 2)
        return !!hit && !scroller.contains(hit)
    }

    show() {
        const { thumb } = this
        if (!this.hovering && !this.dragging && this.isCovered()) return
        if (!thumb.classList.contains("is-visible")) this.measureSurroundings()
        this.schedule()
        thumb.classList.add("is-visible")
        clearTimeout(this.hideTimer)
        this.hideTimer = setTimeout(() => {
            if (!this.scroller.isConnected) thumb.hidden = true
            if (this.hovering || this.dragging) return
            thumb.classList.remove("is-visible")
            this.fadingUntil = performance.now() + FADE
        }, 1000)
    }
}
