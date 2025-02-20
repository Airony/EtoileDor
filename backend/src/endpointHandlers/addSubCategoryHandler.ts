import { PayloadHandler } from "payload/config";
import { isAdmin } from "../accessControls";
import { SubCategory } from "../payload-types";

const addSubCategoryHandler: PayloadHandler = async (req, res) => {
    if (!isAdmin({ req })) {
        res.status(401).end("You are not authorized to perform this action.");
        return;
    }
    try {
        console.log(req.body);
        const name = req?.body?.name;
        const categoryId = req?.body?.categoryId;
        if (!name || typeof name !== "string") {
            res.status(400).end("No sub category name provided");
            return;
        }

        if (!categoryId || typeof categoryId !== "string") {
            res.status(400).end("No category ID provided");
            return;
        }
        const category = await req.payload.findByID({
            collection: "categories",
            id: categoryId,
            depth: 1,
        });

        if (!category) {
            res.status(404).end("Category not found");
            return;
        }
        const subCategories = (category.sub_categories as SubCategory[]) || [];
        let index = 0;
        if (subCategories && subCategories.length > 0) {
            index =
                Math.max(
                    ...subCategories.map((subCategory) => subCategory.index),
                ) + 1;
        }

        const subCatResult = await req.payload.create({
            collection: "sub_categories",
            data: {
                name: name,
                index: index,
                menu_items: [],
            },
        });
        if (!subCatResult) {
            res.status(500).end("Failed to create sub-category");
            return;
        }
        const id = subCatResult.id;
        const updateResult = await req.payload.update({
            collection: "categories",
            id: categoryId,
            data: {
                sub_categories: [
                    ...subCategories.map((subCat) => subCat.id),
                    id,
                ],
            },
        });
        if (!updateResult) {
            res.status(500).end("Failed to create sub-category");
            return;
        }

        res.status(201).json({ id, index, name });
    } catch (error) {
        console.error(error);
        res.status(500).end("Failed to create sub-category");
    }
};

export default addSubCategoryHandler;
