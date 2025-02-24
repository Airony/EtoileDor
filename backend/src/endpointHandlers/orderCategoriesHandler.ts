import { PayloadHandler } from "payload/config";
import { isAdmin } from "../accessControls";

const orderCategoriesHandler: PayloadHandler = async (req, res) => {
    if (!isAdmin({ req })) {
        res.status(403).send("Unauthorized");
        return;
    }

    const categoryIds = req.body.categoryIds;
    req.transactionID = await req.payload.db.beginTransaction();
    try {
        categoryIds.forEach(async (categoryId: string, index: number) => {
            const result = await req.payload.update({
                req,
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

        if (req.transactionID) {
            await req.payload.db.commitTransaction(req.transactionID);
        }
        return res.status(200).send("Updated category order");
    } catch (error) {
        if (req.transactionID) {
            await req.payload.db.rollbackTransaction(req.transactionID);
        }
        console.error(error);
        res.status(500).send("Failed to update category order");
        return;
    }
};

export default orderCategoriesHandler;
