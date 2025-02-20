import { PayloadHandler } from "payload/config";
import { isAdmin } from "../accessControls";

const orderCategoriesHandler: PayloadHandler = async (req, res) => {
    if (!isAdmin({ req })) {
        res.status(403).send("Unauthorized");
        return;
    }

    const menuItemsIds = req.body.menuItemsIds;
    try {
        menuItemsIds.forEach(async (menuItemId: string, index: number) => {
            const result = await req.payload.update({
                collection: "menu_items",
                id: menuItemId,
                data: {
                    index: index,
                },
            });
            if (!result) {
                throw new Error();
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to update menu items order");
        return;
    }

    res.status(200).send("Updated menu items order");
};

export default orderCategoriesHandler;
