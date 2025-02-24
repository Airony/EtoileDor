import { PayloadHandler } from "payload/config";
import { isAdmin } from "../accessControls";
import { Category, MenuItem, SubCategory } from "../payload-types";

const addMenuItemHandler: PayloadHandler = async (req, res) => {
    if (!isAdmin({ req })) {
        res.status(403).send("Unauthorized");
        return;
    }

    const name: string = req.body.name;
    const price: number = req.body.price;
    const parentId: string = req.body.parentId;
    const parentType: "categories" | "sub_categories" = req.body.parentType;

    const parent: Category | SubCategory = await req.payload.findByID({
        collection: parentType,
        id: parentId,
        depth: 1,
    });

    if (!parent) {
        return res.status(404).send("Parent category not found");
    }
    let index = 0;
    const menuItems = (parent.menu_items as MenuItem[]) || [];
    if (menuItems && menuItems.length > 0) {
        index = Math.max(...menuItems.map((menuItem) => menuItem.index)) + 1;
    }

    // Should use a transaction here
    req.transactionID = await req.payload.db.beginTransaction();
    try {
        const menuItemResult = await req.payload.create({
            req,
            collection: "menu_items",
            data: {
                name,
                price,
                index,
            },
        });

        if (!menuItemResult) {
            throw new Error("Failed to create menu item");
        }

        const menuItemId = menuItemResult.id;
        const updatedParent = await req.payload.update({
            req,
            collection: parentType,
            id: parentId,
            data: {
                menu_items: [
                    ...menuItems.map((menuItem) => menuItem.id),
                    menuItemId,
                ],
            },
        });

        if (!updatedParent) {
            throw new Error("Failed to update parent item");
        }

        if (req.transactionID) {
            await req.payload.db.commitTransaction(req.transactionID);
        }

        return res.status(200).json({ id: menuItemId, index, name, price });
    } catch (error) {
        console.error(error);
        if (req.transactionID) {
            await req.payload.db.rollbackTransaction(req.transactionID);
        }
        return res.status(500).send("Failed to create menu item");
    }
};

export default addMenuItemHandler;
