import { PayloadHandler } from "payload/config";
import { isAdmin } from "../accessControls";

const orderCategoriesHandler: PayloadHandler = async (req, res) => {
    if (!isAdmin({ req })) {
        res.status(403).send("Unauthorized");
        return;
    }

    const categoryIds = req.body.categoryIds;
    try {
        categoryIds.forEach(async (categoryId: string, index: number) => {
            const result = await req.payload.update({
                collection: "categories",
                id: categoryId,
                data: {
                    index: index,
                },
            });
            if (!result) {
                throw new Error();
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to update category order");
        return;
    }

    res.status(200).send("Updated category order");
};

export default orderCategoriesHandler;
