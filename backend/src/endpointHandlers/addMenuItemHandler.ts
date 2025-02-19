import { PayloadHandler } from "payload/config";
import { isAdmin } from "../accessControls";
import { Category, MenuItem, SubCategory } from "../payload-types";

const addMenuItemHandler: PayloadHandler = async (req, res) => {
    if (!isAdmin({ req })) {
        res.status(403).send("Unauthorized");
        return;
    }

    try {
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
        if (menuItems) {
            index =
                Math.max(...menuItems.map((menuItem) => menuItem.index)) + 1;
        }

        // Should use a transaction here
        const menuItemResult = await req.payload.create({
            collection: "menu_items",
            data: {
                name,
                price,
                index,
            },
        });

        if (!menuItemResult) {
            return res.status(500).send("Failed to create menu item");
        }

        const menuItemId = menuItemResult.id;
        const updatedParent = await req.payload.update({
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
            return res.status(500).send("Failed to create menu item");
        }

        return res.status(200).json({ id: menuItemId, index, name, price });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Failed to create menu item");
    }
};

export default addMenuItemHandler;
