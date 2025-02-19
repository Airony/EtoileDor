import { PayloadHandler } from "payload/config";
import { isAdmin } from "../accessControls";
import { MenuItem, SubCategory } from "../payload-types";

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
            depth: 1,
        });
        if (!category) {
            res.status(404).end("Category not found");
            return;
        }

        const subCategories = category.sub_categories as SubCategory[];
        const menuItems = category.menu_items as MenuItem[];

        const menuItemsIds: string[] = [];
        const subCategoriesIds: string[] = [];

        subCategories.forEach((subCategory) => {
            subCategoriesIds.push(subCategory.id);
            menuItemsIds.push(...(subCategory.menu_items as string[]));
        });

        menuItemsIds.push(...menuItems.map((menuItem) => menuItem.id));

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
