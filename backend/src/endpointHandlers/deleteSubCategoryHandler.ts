import { PayloadHandler } from "payload/config";
import { isAdmin } from "../accessControls";

const deleteSubCategoryHandler: PayloadHandler = async (req, res) => {
    if (!isAdmin({ req })) {
        res.status(401).end("You are not authorized to perform this action.");
        return;
    }
    const id = req?.params?.id;
    const parentId = req?.body?.parentId;

    if (!id || typeof id !== "string") {
        res.status(400).end("No category ID provided");
        return;
    }
    if (!parentId || typeof parentId !== "string") {
        res.status(400).end("No parent ID provided");
        return;
    }

    try {
        const parentCategory = await req.payload.findByID({
            collection: "categories",
            id: parentId,
            depth: 0,
        });

        if (!parentCategory) {
            res.status(404).end("Category not found");
            return;
        }

        const updatedParent = await req.payload.update({
            collection: "categories",
            id: parentId,
            data: {
                sub_categories: parentCategory.sub_categories.filter(
                    (subCatId) => subCatId !== id,
                ),
            },
        });

        if (!updatedParent) {
            throw new Error("Failed to update parent category");
        }

        const subCategory = await req.payload.findByID({
            collection: "sub_categories",
            id: id,
            depth: 0,
        });
        if (!subCategory) {
            res.status(404).end("Sub-category not found");
            return;
        }

        const menuItemsIds = (subCategory.menu_items as string[]) || [];

        // Delete all menu items
        // Should use a transaction here
        const menuItemsDelete = await req.payload.delete({
            collection: "menu_items",
            where: {
                id: {
                    in: menuItemsIds,
                },
            },
        });
        if (menuItemsDelete.errors.length > 0) {
            console.error(menuItemsDelete.errors);
            throw new Error("Failed to delete menu items");
        }

        // Delete the category
        const subCategoryDelete = await req.payload.delete({
            collection: "sub_categories",
            id: id,
        });

        if (!subCategoryDelete) {
            throw new Error("Failed to delete sub-category");
        }

        res.status(200).end();
    } catch (error) {
        console.error(error);
        res.status(500).end("Failed to delete sub-category");
    }
};

export default deleteSubCategoryHandler;
