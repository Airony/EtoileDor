import APIError from "payload/dist/errors/APIError";
import { CollectionBeforeDeleteHook } from "payload/types";

const onDeleteSubCategory: CollectionBeforeDeleteHook = async ({
    req, // full express request
    id, // id of document to delete
}) => {
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
            "Cannot delete this sub category as it is in use by menu items",
            400,
            undefined,
            true,
        );
    }
};

export default onDeleteSubCategory;
