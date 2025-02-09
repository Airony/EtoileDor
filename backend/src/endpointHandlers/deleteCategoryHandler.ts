import { PayloadHandler } from "payload/config";
import { isAdmin } from "../accessControls";

const deleteCategoryHandler: PayloadHandler = async (req, res) => {
    if (!isAdmin({ req })) {
        res.status(401).end("You are not authorized to perform this action.");
        return;
    }
    const id = req?.params?.id;

    if (!id || typeof id !== "string") {
        res.status(400).end("No category ID provided");
        return;
    }

    try {
        const category = await req.payload.findByID({
            collection: "categories",
            id: id,
        });
        if (!category) {
            res.status(404).end("Category not found");
            return;
        }

        const subCategories = await req.payload.find({
            collection: "sub_categories",
            limit: 0,
            where: {
                "category.value": {
                    equals: id,
                },
            },
        });
        const subCategoriesIds = subCategories.docs.map(
            (subCategory) => subCategory.id,
        );

        // Find all menu items that have the category as a parent, or a subcategory as a parent
        const menuItems = await req.payload.find({
            collection: "menu_items",
            limit: 0,
            where: {
                "Category.value": {
                    in: [...subCategoriesIds, id],
                },
            },
        });

        // Delete all menu items
        // Should use a transaction here
        const menuItemsIds = menuItems.docs.map((menuItem) => menuItem.id);
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
            res.status(500).end("Failed to delete category");
            return;
        }

        // Delete all subcategories
        const subCategoriesDelete = await req.payload.delete({
            collection: "sub_categories",
            where: {
                id: {
                    in: subCategoriesIds,
                },
            },
        });

        if (subCategoriesDelete.errors.length > 0) {
            console.error(subCategoriesDelete.errors);
            res.status(500).end("Failed to delete category");
            return;
        }

        // Delete the category
        const categoryDelete = await req.payload.delete({
            collection: "categories",
            id: id,
        });

        if (!categoryDelete) {
            res.status(500).end("Failed to delete category");
            return;
        }

        res.status(200).end();
    } catch (error) {
        res.status(500).end("Failed to delete category");
    }
};

export default deleteCategoryHandler;
