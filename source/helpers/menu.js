// Opening clicks are stopped, so other menus close here
const openMenus = new Set()

export function menuOpened(entry, from) {
    openMenus.forEach((menu) => { if (menu != entry && !menu.holds(from)) menu.close() })
    openMenus.add(entry)
}

export function menuClosed(entry) {
    openMenus.delete(entry)
}

export function fitMenu(menu) {
    const pad = 8
    menu.classList.remove("is-scrollable")
    menu.style.maxHeight = ""
    if (menu.offsetHeight > window.innerHeight - pad * 2) menu.classList.add("is-scrollable")
}

function refitMenu(item) {
    const pad = 8
    const menu = item.closest(".y-context-menu, .y-dropdown__menu:not(.y-dropdown__submenu)")
    if (!menu) return
    const rect = menu.getBoundingClientRect()
    if (rect.bottom <= window.innerHeight - pad) return
    menu.classList.add("is-scrollable")
    menu.style.maxHeight = Math.max(window.innerHeight - pad - rect.top, 0) + "px"
}

export function anchorFixed(trigger, menu, align = "left") {
    const pad = 8
    const gap = 4
    fitMenu(menu)
    const tRect = trigger.getBoundingClientRect()
    const mw = menu.offsetWidth
    const mh = menu.offsetHeight

    let left = align == "right" ? tRect.right - mw : tRect.left
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
    submenu.classList.remove("y-dropdown__submenu--inline")
    submenu.style.top = ""
    submenu.style.bottom = ""
    submenu.style.left = ""
    submenu.style.right = ""

    const pad = 8
    const tRect = trigger.getBoundingClientRect()
    const mRect = submenu.getBoundingClientRect()

    // A scrolling menu would clip a submenu floating beside it
    const inline = !!trigger.closest(".y-dropdown__menu.is-scrollable, .y-context-menu.is-scrollable") || (tRect.right + mRect.width > window.innerWidth - pad && tRect.left - mRect.width < pad)
    submenu.classList.toggle("y-dropdown__submenu--inline", inline)
    if (inline) return

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

// One object for Dropdown and ContextMenu: both expose it as their static icons
export const menuIcons = { arrow: "›", check: '<span class="material-symbols-rounded">check</span>' }

// The check is its own flex item, so a single-element icon takes the class itself
function checkMark(html) {
    const box = document.createElement("span")
    box.innerHTML = String(html).trim()
    const mark = box.childNodes.length == 1 && box.firstChild instanceof Element ? box.firstChild : box
    mark.classList.add("y-dropdown__item-check")
    return mark.outerHTML
}

export function itemRow(item, parent = false, icons = menuIcons) {
    const btn = document.createElement("button")
    btn.className = "y-dropdown__item" + (parent ? " y-dropdown__item--has-children" : "") + (item.active ? " is-active" : "")
    btn.type = "button"
    if (item.className) btn.classList.add(...item.className.split(" ").filter(Boolean))
    const end = parent ? `<span class="y-dropdown__item-arrow">${icons.arrow}</span>` : item.active ? checkMark(icons.check) : ""
    btn.innerHTML = `${item.icon ? '<span class="y-dropdown__item-icon">' + item.icon + "</span>" : ""}<span class="y-dropdown__item-label">${item.label}</span>${end}`
    return btn
}

export function releaseSubmenus(menu) {
    menu.querySelectorAll(".y-dropdown__submenu").forEach((submenu) => {
        submenu.classList.add("is-hidden")
        if (!submenu.yCleanup) return
        submenu.yCleanup()
        submenu.yCleanup = null
        submenu.replaceChildren()
    })
}

export function tidyItems(items) {
    return items.filter((item, i) => !item.separator || (i > 0 && i < items.length - 1 && !items[i - 1].separator && !items.slice(i + 1).every((next) => next.separator)))
}

export function buildMenuItems(items, container, onCloseAll, icons = menuIcons) {
    tidyItems(items).forEach(item => {
        if (item.separator) {
            const sep = document.createElement("div")
            sep.className = "y-dropdown__separator"
            container.appendChild(sep)
            return
        }

        const filled = typeof item.children == "function"
        const hasChildren = filled || (Array.isArray(item.children) && item.children.length > 0)
        const hasSubmenu = item.submenu != null
        const isParent = hasChildren || hasSubmenu

        const btn = itemRow(isParent ? { ...item, active: false } : item, isParent, icons)

        if (item.onClick && !isParent) {
            btn.addEventListener("click", (e) => {
                e.stopPropagation()
                if (!item.keepOpen) onCloseAll()
                item.onClick(e)
            })
        }

        if (isParent) {
            const wrapper = document.createElement("div")
            wrapper.className = "y-dropdown__item-wrapper"

            const submenu = document.createElement("div")
            submenu.className = "y-dropdown__menu y-dropdown__submenu is-hidden"
            if (filled) {
                submenu.yFill = () => {
                    if (submenu.yCleanup) return
                    submenu.yCleanup = item.children((list) => {
                        submenu.replaceChildren()
                        buildMenuItems(list, submenu, onCloseAll, icons)
                    }) ?? (() => {})
                }
            } else if (hasChildren) {
                buildMenuItems(item.children, submenu, onCloseAll, icons)
            } else if (item.submenu instanceof HTMLElement) {
                submenu.appendChild(item.submenu)
            } else {
                submenu.innerHTML = String(item.submenu)
            }

            let hideTimer = null
            function showSub() {
                clearTimeout(hideTimer)
                submenu.yFill?.()
                repositionSubmenu(btn, submenu)
                submenu.classList.remove("is-hidden")
                if (submenu.classList.contains("y-dropdown__submenu--inline")) refitMenu(btn)
            }
            function hideSub() {
                clearTimeout(hideTimer)
                hideTimer = setTimeout(() => submenu.classList.add("is-hidden"), 80)
            }
            function keepSub() {
                clearTimeout(hideTimer)
            }

            // Emulated touch hover would open and close it at once
            function byMouse(fn) {
                return (e) => { if (e.pointerType == "mouse") fn() }
            }
            btn.addEventListener("pointerenter", byMouse(showSub))
            btn.addEventListener("pointerleave", byMouse(hideSub))
            submenu.addEventListener("pointerenter", byMouse(keepSub))
            submenu.addEventListener("pointerleave", byMouse(hideSub))
            btn.addEventListener("click", (e) => {
                e.stopPropagation()
                if (e.pointerType == "mouse") return showSub()
                if (submenu.classList.contains("is-hidden")) {
                    container.querySelectorAll(":scope > .y-dropdown__item-wrapper > .y-dropdown__submenu").forEach(s => s != submenu && s.classList.add("is-hidden"))
                    showSub()
                } else {
                    clearTimeout(hideTimer)
                    submenu.classList.add("is-hidden")
                }
            })

            wrapper.appendChild(btn)
            wrapper.appendChild(submenu)
            container.appendChild(wrapper)
        } else {
            container.appendChild(btn)
        }
    })
}
