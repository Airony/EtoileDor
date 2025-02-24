import { PayloadHandler } from "payload/config";
import { isAdmin } from "../accessControls";

const orderCategoriesHandler: PayloadHandler = async (req, res) => {
    if (!isAdmin({ req })) {
        res.status(403).send("Unauthorized");
        return;
    }

    const subCategoriesIds = req.body.subCategoriesIds;
    if (!subCategoriesIds) {
        return res.status(400).send("No sub-categories IDs provided");
    }
    req.transactionID = await req.payload.db.beginTransaction();
    try {
        subCategoriesIds.forEach(async (subCatId: string, index: number) => {
            const result = await req.payload.update({
                req,
                collection: "sub_categories",
                id: subCatId,
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
        return res.status(200).send("Updated sub-category order");
    } catch (error) {
        if (req.transactionID) {
            await req.payload.db.rollbackTransaction(req.transactionID);
        }
        console.error(error);
        res.status(500).send("Failed to update sub-category order");
        return;
    }
};

export default orderCategoriesHandler;
