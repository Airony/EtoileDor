import APIError from "payload/dist/errors/APIError";
import { CollectionBeforeDeleteHook } from "payload/types";

const onDeleteCategory: CollectionBeforeDeleteHook = async ({
    req, // full express request
    id, // id of document to delete
}) => {
    const subCategories = await req.payload.find({
        collection: "sub_categories",
        where: {
            "category.value": {
                equals: id,
            },
        },
    });

    if (subCategories.totalDocs > 0) {
        throw new APIError(
            "Cannot delete this category as it is in use by sub categories",
            400,
            undefined,
            true,
        );
    }

    const items = await req.payload.find({
        collection: "menu_items",
        where: {
            "Category.value": {
                equals: id,
            },
        },
    });

    if (items.totalDocs > 0) {
        throw new APIError(
            "Cannot delete this category as it is in use by menu items",
            400,
            undefined,
            true,
        );
    }
};

export default onDeleteCategory;
