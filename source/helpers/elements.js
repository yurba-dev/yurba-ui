export const UIElements = []

export class UIControl {
    static removeAllElements() {
        while (UIElements.length > 0) {
            const e = UIElements.pop()
            e.modal.remove()
        }
    }
}
