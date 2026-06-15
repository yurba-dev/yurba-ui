import { componentProperties } from "./properties.js"

export class BaseComponent {
    constructor() {
        this.el = null
        this.id = null
        this.placement = "body"
        this.useOwnComponentCSS = true
        this.subscribedProperties = {}
    }

    setProperty(name, value) {
        const props = componentProperties(this.el)
        if (value === undefined) {
            props[name]()
        } else {
            props[name][value]()
        }
        this.subscribedProperties[name] = value
    }

    addClass(...classes) {
        this.el.classList.add(...classes)
    }
    removeClass(...classes) {
        this.el.classList.remove(...classes)
    }
    replaceClass(className, newClassName) {
        this.el.classList.remove(className)
        this.el.classList.add(newClassName)
    }

    get about() {
        return {
            name: this.constructor.name,
            el: this.el,
            placement: this.placement,
            properties: this.subscribedProperties
        }
    }

    addEvent(name, cb) {
        this.el.addEventListener(name, cb)
    }

    render() {
        let id = generateUniqueID()
        if (this.id != null) {
            id = `${this.id}_${generateUniqueID(this.id)}`
        }
        this.el.id = id
        return this.el
    }
}

export function error(text, type) {
    const prefix = type === "component" ? "Component error" : "Error"
    throw new Error(`[YURBA UI] ${prefix}: ${text}`)
}
export function warn(text) {
    console.warn(`[YURBA UI] ${text}`)
}
export function generateUniqueID(content) {
    if (content) {
        return btoa(content).replaceAll("=", "")
    }
    return btoa(Math.floor(Math.random() * 9999) + 1).replaceAll("=", "")
}
export const hasDuplicates = (arr) => new Set(arr).size !== arr.length
