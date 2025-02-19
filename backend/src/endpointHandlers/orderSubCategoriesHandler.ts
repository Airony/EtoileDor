import { PayloadHandler } from "payload/config";
import { isAdmin } from "../accessControls";

const orderCategoriesHandler: PayloadHandler = async (req, res) => {
    if (!isAdmin({ req })) {
        res.status(403).send("Unauthorized");
        return;
    }

    const subCategoriesIds = req.body.subCategoriesIds;
    try {
        subCategoriesIds.forEach(async (subCatId: string, index: number) => {
            const result = await req.payload.update({
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
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to update sub-category order");
        return;
    }

    res.status(200).send("Updated sub-category order");
};

export default orderCategoriesHandler;
