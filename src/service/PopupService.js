import { store } from "wabi"

const openPopup = (title, component, props) => {
    store.set("state/popup", {
        title,
        component,
        props
    })
}

const closePopup = () => {
    store.set("state/popup", null)
}

export { openPopup, closePopup }