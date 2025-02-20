import { PayloadHandler } from "payload/config";
import { isAdmin } from "../accessControls";

const deleteMenuItemHandler: PayloadHandler = async (req, res) => {
    if (!isAdmin({ req })) {
        res.status(401).end("You are not authorized to perform this action.");
        return;
    }
    const id = req?.params?.id;
    const parentId = req?.body?.parentId;
    const parentType: "categories" | "sub_categories" = req.body.parentType;

    if (!id || typeof id !== "string") {
        res.status(400).end("No category ID provided");
        return;
    }

    if (!parentId || typeof parentId !== "string") {
        res.status(400).end("No parent ID provided");
        return;
    }

    if (!parentType || typeof parentType !== "string") {
        res.status(400).end("No parent type provided");
        return;
    }

    try {
        const parentCategory = await req.payload.findByID({
            collection: parentType,
            id: parentId,
            depth: 0,
        });

        if (!parentCategory) {
            res.status(404).end("Parent not found");
            return;
        }

        const updatedParent = await req.payload.update({
            collection: parentType,
            id: parentId,
            data: {
                menu_items: parentCategory.menu_items.filter(
                    (menuItemId) => menuItemId !== id,
                ),
            },
        });

        if (!updatedParent) {
            throw new Error("Failed to update parent");
        }

        // Delete the category
        const menuItem = await req.payload.delete({
            collection: "menu_items",
            id: id,
        });

        if (!menuItem) {
            throw new Error("Failed to delete menu item");
        }

        res.status(200).end();
    } catch (error) {
        console.error(error);
        res.status(500).end("Failed to delete menu item");
    }
};

export default deleteMenuItemHandler;
