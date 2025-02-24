import { PayloadHandler } from "payload/config";
import { isAdmin } from "../accessControls";

const orderCategoriesHandler: PayloadHandler = async (req, res) => {
    if (!isAdmin({ req })) {
        res.status(403).send("Unauthorized");
        return;
    }

    const menuItemsIds = req.body.menuItemsIds;
    req.transactionID = await req.payload.db.beginTransaction();
    try {
        menuItemsIds.forEach(async (menuItemId: string, index: number) => {
            const result = await req.payload.update({
                req,
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
        if (req.transactionID) {
            await req.payload.db.commitTransaction(req.transactionID);
        }
        return res.status(200).send("Updated menu items order");
    } catch (error) {
        if (req.transactionID) {
            await req.payload.db.rollbackTransaction(req.transactionID);
        }
        console.error(error);
        res.status(500).send("Failed to update menu items order");
        return;
    }
};

export default orderCategoriesHandler;
