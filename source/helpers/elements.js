export const UIElements = []

export class UIControl {
    static removeAllElements() {
        while (UIElements.length > 0) {
            UIElements[UIElements.length - 1].remove()
        }
    }
}
