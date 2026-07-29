import { globalProperties } from "./globals.js"

export const componentProperties = (el) => ({
    avatar: {
        true: () => el.classList.add("y-win__avatar"),
        false: () => el.classList.remove("y-win__avatar")
    },
    "mini-image": () => el.classList.add("y-win__image", "y-win__mini-image"),
    "title-with-icon": () => el.classList.add("y-win__icon-title__group"),

    ...Object.fromEntries(
        Object.entries(globalProperties).map(([key, fn]) => [
            key,
            (...args) => fn(el, ...args)
        ])
    )
})
