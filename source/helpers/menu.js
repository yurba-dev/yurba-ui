export function anchorFixed(trigger, menu, align = "left") {
    const pad = 8
    const gap = 4
    const tRect = trigger.getBoundingClientRect()
    const mw = menu.offsetWidth
    const mh = menu.offsetHeight

    let left = align === "right" ? tRect.right - mw : tRect.left
    if (left + mw > window.innerWidth - pad) left = window.innerWidth - mw - pad
    if (left < pad) left = pad

    let top = tRect.bottom + gap
    if (top + mh > window.innerHeight - pad) {
        const above = tRect.top - gap - mh
        top = above >= pad ? above : Math.max(pad, window.innerHeight - mh - pad)
    }

    menu.style.left = left + "px"
    menu.style.top = top + "px"
}

export function repositionSubmenu(trigger, submenu) {
    submenu.style.top = ""
    submenu.style.bottom = ""
    submenu.style.left = ""
    submenu.style.right = ""

    const pad = 8
    const tRect = trigger.getBoundingClientRect()
    const mRect = submenu.getBoundingClientRect()

    if (tRect.right + mRect.width > window.innerWidth - pad) {
        submenu.style.left = "auto"
        submenu.style.right = "100%"
    } else {
        submenu.style.left = "100%"
        submenu.style.right = "auto"
    }

    if (tRect.top + mRect.height > window.innerHeight - pad) {
        submenu.style.top = "auto"
        submenu.style.bottom = "0"
    } else {
        submenu.style.top = "0"
        submenu.style.bottom = "auto"
    }
}

export function buildMenuItems(items, container, onCloseAll) {
    items.forEach(item => {
        if (item.separator) {
            const sep = document.createElement("div")
            sep.className = "y-dropdown__separator"
            container.appendChild(sep)
            return
        }

        const hasChildren = Array.isArray(item.children) && item.children.length > 0
        const hasSubmenu = item.submenu != null
        const isParent = hasChildren || hasSubmenu

        const btn = document.createElement("button")
        btn.className = "y-dropdown__item" + (isParent ? " y-dropdown__item--has-children" : "")
        btn.type = "button"
        if (item.className) btn.classList.add(...item.className.split(" ").filter(Boolean))
        btn.innerHTML = `${item.icon ? '<span class="y-dropdown__item-icon">' + item.icon + "</span>" : ""}<span class="y-dropdown__item-label">${item.label}</span>${isParent ? '<span class="y-dropdown__item-arrow">›</span>' : ""}`

        if (item.onClick) {
            btn.addEventListener("click", (e) => {
                e.stopPropagation()
                onCloseAll()
                item.onClick(e)
            })
        }

        if (isParent) {
            const wrapper = document.createElement("div")
            wrapper.className = "y-dropdown__item-wrapper"

            const submenu = document.createElement("div")
            submenu.className = "y-dropdown__menu y-dropdown__submenu y-win__hidden"
            if (hasChildren) {
                buildMenuItems(item.children, submenu, onCloseAll)
            } else if (item.submenu instanceof HTMLElement) {
                submenu.appendChild(item.submenu)
            } else {
                submenu.innerHTML = String(item.submenu)
            }

            let hideTimer = null
            const showSub = () => {
                clearTimeout(hideTimer)
                repositionSubmenu(btn, submenu)
                submenu.classList.remove("y-win__hidden")
            }
            const hideSub = () => {
                hideTimer = setTimeout(() => submenu.classList.add("y-win__hidden"), 80)
            }

            btn.addEventListener("mouseenter", showSub)
            btn.addEventListener("mouseleave", hideSub)
            submenu.addEventListener("mouseenter", () => clearTimeout(hideTimer))
            submenu.addEventListener("mouseleave", hideSub)

            wrapper.appendChild(btn)
            wrapper.appendChild(submenu)
            container.appendChild(wrapper)
        } else {
            container.appendChild(btn)
        }
    })
}
