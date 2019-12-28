import MenuService from "../service/MenuService"
import AssetService from "../service/AssetService"

MenuService.register("assets.item", [
	{
		name: "actions",
		type: "category",
		children: [
			{
				name: "Delete",
				icon: "fa-trash",
				func() {
					AssetService.remove(store.data.state.contextmenu.data)
				}
			}
		]
	}
])