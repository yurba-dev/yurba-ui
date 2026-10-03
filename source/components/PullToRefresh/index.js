// Pull down from the very top to refresh, as on a phone's own lists. It listens passively, so scrolling never waits
// for it, and only moves its own little round indicator, never the page. The indicator comes out from under the bar
// at the top of the page: a frame starting at the bar's bottom edge cuts off whatever of it is still above, so it
// looks the same whatever the bar's own stacking is. A pull counts only when the page and every
// list the finger is in are at their top: a chat, a menu, a sheet, a field or a sideways swipe never starts one.
const START = 8
const READY = 72
const MAX = 120
// The finger travels further than the indicator: a pull feels held back, as the system's does
const RESIST = 0.5
const BACK = 200

const BLOCKERS = [
    "input", "textarea", "select", "[contenteditable]:not([contenteditable=\"false\"])", "canvas", "video", "iframe",
    "[data-y-pull=\"off\"]",
    ".y-win__wrapper", ".y-sheet", ".y-dropdown__menu", ".y-context-menu", ".y-tooltip",
].join(", ")

const ICON = `<svg class="y-pull__icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"/></svg>`

let options = null
let indicator = null
let touch = null
let busy = false
let frame = 0
let top = 0

// At the touch only positions are read, which costs next to nothing: the page and every list the finger is in at
// their top. An element that can't scroll is always at 0, so no style is needed for that.
function atTop(target) {
    if (busy || !(target instanceof Element)) return false
    const page = document.scrollingElement ?? document.documentElement
    if (page.scrollTop > 0) return false
    for (let el = target; el && el != page && el != document.body; el = el.parentElement) {
        if (el.scrollTop > 0) return false
    }
    return true
}

// Once the finger is clearly pulling down: nothing on the way keeps the gesture to itself
function allowed(target) {
    if (target.closest(BLOCKERS) || (options.ignore && target.closest(options.ignore))) return false
    if (document.documentElement.classList.contains("y-touch-hold")) return false
    if (options.when && !options.when()) return false
    if (String(getSelection?.() ?? "")) return false
    // Something laid over the page, such as a viewer or a player, is not the page
    for (let el = target; el && el != document.body; el = el.parentElement) {
        if (getComputedStyle(el).position == "fixed") return false
    }
    return true
}

function offset() {
    const value = typeof options.offset == "function" ? options.offset() : options.offset
    return Math.max(0, Number(value) || 0)
}

function make() {
    if (indicator?.isConnected) return indicator
    indicator = document.createElement("div")
    indicator.className = "y-pull"
    indicator.setAttribute("aria-hidden", "true")
    indicator.innerHTML = `<div class="y-pull__badge">${ICON}</div>`
    document.body.appendChild(indicator)
    return indicator
}

// Up to READY the arrow turns and fills in; past it the indicator only creeps on, and turns the accent colour
function paint(distance, settle = false) {
    const el = make()
    const badge = el.firstElementChild
    const shown = Math.min(MAX, distance)
    const progress = Math.min(1, shown / READY)
    el.classList.toggle("y-pull--back", settle)
    el.classList.toggle("y-pull--ready", shown >= READY)
    el.style.top = top + "px"
    badge.style.transform = `translate3d(-50%, ${shown - 48}px, 0)`
    badge.style.opacity = String(Math.min(1, progress * 1.4))
    badge.firstElementChild.style.transform = `rotate(${progress * 270}deg)`
}

function hide() {
    if (!indicator) return
    paint(0, true)
    indicator.classList.remove("y-pull--busy")
    setTimeout(() => { if (!touch && !busy) indicator?.remove() }, BACK)
}

async function refresh() {
    busy = true
    paint(READY, true)
    indicator.classList.add("y-pull--busy")
    try {
        await options.onRefresh?.()
    } catch {}
    busy = false
    hide()
}

function onStart(e) {
    if (e.touches.length != 1 || !atTop(e.target)) {
        touch = null
        return
    }
    const point = e.touches[0]
    touch = { x: point.clientX, y: point.clientY, target: e.target, pulling: false }
}

function onMove(e) {
    if (!touch) return
    if (e.touches.length != 1) return onCancel()
    const point = e.touches[0]
    const dx = point.clientX - touch.x
    const dy = point.clientY - touch.y
    if (!touch.pulling) {
        if (Math.abs(dx) < START && Math.abs(dy) < START) return
        // Sideways or upwards it is someone else's gesture
        if (dy <= 0 || Math.abs(dx) > dy || !allowed(touch.target)) {
            touch = null
            return
        }
        touch.pulling = true
        touch.y = point.clientY - START
        top = offset()
    }
    // Back up past where it began: the page scrolls again and the pull is off
    const distance = (point.clientY - touch.y) * RESIST
    if (distance <= 0) {
        touch = null
        hide()
        return
    }
    touch.distance = distance
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => paint(distance))
}

function onEnd() {
    const pulled = touch?.pulling ? touch.distance ?? 0 : 0
    touch = null
    cancelAnimationFrame(frame)
    if (!pulled) return
    if (pulled >= READY) refresh()
    else hide()
}

function onCancel() {
    touch = null
    cancelAnimationFrame(frame)
    hide()
}

export class PullToRefresh {
    // onRefresh may return a promise: the indicator spins until it settles. offset is where it comes from under,
    // in px or as a function, such as the bottom of a fixed header; ignore and when keep it away from more places.
    static enable({ onRefresh = () => location.reload(), offset = 0, ignore = "", when = null } = {}) {
        if (options) PullToRefresh.disable()
        options = { onRefresh, offset, ignore, when }
        // No stretch or glow at the top while a pull is ours to show
        document.documentElement.classList.add("y-pull-enabled")
        document.addEventListener("touchstart", onStart, { passive: true })
        document.addEventListener("touchmove", onMove, { passive: true })
        document.addEventListener("touchend", onEnd, { passive: true })
        document.addEventListener("touchcancel", onCancel, { passive: true })
    }

    static disable() {
        if (!options) return
        options = null
        touch = null
        document.documentElement.classList.remove("y-pull-enabled")
        document.removeEventListener("touchstart", onStart)
        document.removeEventListener("touchmove", onMove)
        document.removeEventListener("touchend", onEnd)
        document.removeEventListener("touchcancel", onCancel)
        indicator?.remove()
        indicator = null
    }

    static get enabled() {
        return !!options
    }
}
