import { PayloadHandler } from "payload/config";
import { isAdmin } from "../accessControls";

interface Data {
    categories: {
        id: string;
        index: number;
    }[];
    subCategories: {
        id: string;
        index: number;
        parentId: string;
    }[];
}

const reorderCategoriesHandler: PayloadHandler = async (req, res) => {
    if (!isAdmin({ req })) {
        res.status(401).end("You are not authorized to perform this action.");
        return;
    }

    if (!req.body) {
        return res.status(400).end("No data provided");
    }
    // Use a transaction in the future
    const { categories, subCategories } = req.body as Data;
    try {
        for (const category of categories) {
            await req.payload.update({
                collection: "categories",
                id: category.id,
                data: {
                    index: category.index,
                },
            });
        }

        for (const subCategory of subCategories) {
            await req.payload.update({
                collection: "sub_categories",
                id: subCategory.id,
                data: {
                    index: subCategory.index,
                    category: {
                        relationTo: "categories",
                        value: subCategory.parentId,
                    },
                },
            });
        }

        res.status(200).end();
    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
};

export default reorderCategoriesHandler;
