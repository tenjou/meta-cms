import FileSystemLocal from "./FileSystemLocal"
import FileSystemWeb from "./FileSystemWeb"
import Utils from "../Utils"

export default Utils.isElectron() ? FileSystemLocal : FileSystemWeb