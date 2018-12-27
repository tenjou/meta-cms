import { store } from "wabi"

const openPopup = (title, renderFunc) => {
    store.set("state/popup", {
        title,
        renderFunc
    })
}

const closePopup = () => {
    store.set("state/popup", null)
}

export { openPopup, closePopup }