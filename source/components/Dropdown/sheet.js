import { itemRow, tidyItems, menuIcons } from "../../helpers/menu.js"

function bars(trigger, anchor) {
    const win = trigger?.closest(".y-win")
    const header = anchor ?? win?.querySelector(".y-win__header")
    const edge = header?.offsetHeight ? header : win
    if (edge) {
        return { top: Math.max(0, Math.floor(edge.getBoundingClientRect()[header?.offsetHeight ? "bottom" : "top"]) - 1), bottom: 0 }
    }
    const probe = document.createElement("div")
    probe.style.cssText = "position: fixed; visibility: hidden; top: var(--y-win-sheet-top, 0px); bottom: var(--y-win-sheet-bottom, 0px)"
    document.body.appendChild(probe)
    const style = getComputedStyle(probe)
    const result = { top: parseFloat(style.top) || 0, bottom: parseFloat(style.bottom) || 0 }
    probe.remove()
    return result
}

export function openSheet(items, { trigger = null, at = null, anchor = null, onClose = null, icons = menuIcons } = {}) {
    const layer = document.createElement("div")
    const panel = document.createElement("div")
    panel.className = "y-sheet__panel"
    panel.setAttribute("role", "menu")
    const cleanups = []
    let open = true

    const box = trigger?.getBoundingClientRect()
    const seen = window.visualViewport?.height ?? window.innerHeight
    const middle = at ?? (box ? box.top + box.height / 2 : 0)
    const top = middle < seen / 2
    const edges = bars(trigger, anchor)
    if (!top && !anchor && trigger?.closest(".y-win")) edges.top = 0
    layer.className = "y-sheet " + (top ? "y-sheet--top" : "y-sheet--bottom")
    layer.style.top = edges.top + "px"
    layer.style.bottom = edges.bottom + "px"
    if (!top && edges.bottom == 0) panel.classList.add("y-sheet__panel--edge")

    function close() {
        if (!open) return
        open = false
        document.removeEventListener("keydown", onKey, true)
        cleanups.splice(0).forEach((fn) => fn())
        layer.classList.remove("y-sheet--open")
        setTimeout(() => layer.remove(), 250)
        if (onClose) onClose(panel)
    }

    function onKey(e) {
        if (e.key != "Escape") return
        e.preventDefault()
        e.stopPropagation()
        close()
    }

    function build(list, container) {
        tidyItems(list).forEach((item) => {
            if (item.separator) {
                const sep = document.createElement("div")
                sep.className = "y-dropdown__separator"
                container.appendChild(sep)
                return
            }
            const nested = item.children != null && (typeof item.children == "function" || item.children.length > 0)
            if (nested || item.submenu != null) return group(item, container)
            const row = itemRow(item, false, icons)
            row.addEventListener("click", (e) => {
                e.stopPropagation()
                if (!item.keepOpen) close()
                if (item.onClick) item.onClick(e)
            })
            container.appendChild(row)
        })
    }

    function group(item, container) {
        const head = itemRow({ ...item, active: false }, true, icons)
        const body = document.createElement("div")
        body.className = "y-sheet__group"
        let cleanup = null

        function set(list) {
            body.replaceChildren()
            build(list, body)
        }

        function collapse() {
            head.classList.remove("y-dropdown__item--open")
            cleanup?.()
            cleanup = null
            body.replaceChildren()
        }

        function expand() {
            head.classList.add("y-dropdown__item--open")
            if (item.submenu instanceof HTMLElement) return body.appendChild(item.submenu)
            if (item.submenu != null) {
                body.innerHTML = String(item.submenu)
                return
            }
            if (typeof item.children != "function") return set(item.children)
            const own = item.children(set) ?? (() => {})
            cleanup = own
            cleanups.push(() => own == cleanup && own())
        }

        head.addEventListener("click", (e) => {
            e.stopPropagation()
            head.classList.contains("y-dropdown__item--open") ? collapse() : expand()
        })
        container.append(head, body)
        if (item.expanded) expand()
    }

    function bindSwipe() {
        let startY = null
        let delta = 0
        panel.addEventListener("touchstart", (e) => {
            startY = e.touches[0].clientY
            delta = 0
        }, { passive: true })
        panel.addEventListener("touchmove", (e) => {
            if (startY == null) return
            const y = e.touches[0].clientY
            const toward = top ? startY - y : y - startY
            const edge = top ? panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1 : panel.scrollTop <= 0
            if (!edge || toward < 0) startY = y
            delta = edge ? Math.max(0, toward) : 0
            panel.style.transition = delta ? "none" : ""
            panel.style.transform = delta ? `translateY(${top ? -delta : delta}px)` : ""
        }, { passive: true })
        function end() {
            if (startY == null) return
            startY = null
            panel.style.transition = ""
            panel.style.transform = ""
            if (delta > 80) close()
        }
        panel.addEventListener("touchend", end)
        panel.addEventListener("touchcancel", end)
        panel.addEventListener("click", (e) => {
            if (delta < 8) return
            e.preventDefault()
            e.stopPropagation()
        }, true)
    }

    build(items, panel)
    bindSwipe()
    layer.appendChild(panel)
    layer.addEventListener("click", (e) => { if (e.target == layer) close() })
    document.addEventListener("keydown", onKey, true)

    // Deferred, so the opening tap doesn't close it
    function onOutside(e) {
        if (panel.contains(e.target) || trigger?.contains(e.target)) return
        close()
    }
    setTimeout(() => { if (open) document.addEventListener("click", onOutside, true) }, 0)
    cleanups.push(() => document.removeEventListener("click", onOutside, true))

    const host = trigger?.closest(".y-win__wrapper")
    if (host) {
        const watch = new MutationObserver(() => { if (host.classList.contains("is-hidden") || !host.isConnected) close() })
        watch.observe(host, { attributes: true, attributeFilter: ["class"] })
        cleanups.push(() => watch.disconnect())
    }
    document.body.appendChild(layer)
    setTimeout(() => { if (open) layer.classList.add("y-sheet--open") }, 20)

    return { panel, close, isOpen: () => open }
}
