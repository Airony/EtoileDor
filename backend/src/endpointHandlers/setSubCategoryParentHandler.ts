import { PayloadHandler } from "payload/config";
import { isAdmin } from "../accessControls";
import { SubCategory } from "../payload-types";

const setSubCategoryParentHandler: PayloadHandler = async (req, res) => {
    if (!isAdmin({ req })) {
        return res.status(401).send("Unauthorized");
    }

    const id = req?.params?.id;
    const newParentId = req?.body?.newParentId;
    if (!id || typeof id !== "string") {
        return res.status(404).send("Missing id");
    }
    if (!newParentId || typeof newParentId !== "string") {
        return res.status(404).send("Missing newParentId");
    }

    try {
        // Use a transaction here
        const oldParent = (
            await req.payload.find({
                collection: "categories",
                depth: 0,
                where: {
                    sub_categories: {
                        contains: id,
                    },
                },
            })
        ).docs[0];

        if (!oldParent) {
            return res.status(404).send("Old parent not found");
        }
        // Remove it from the old parent
        const updatedParent = await req.payload.update({
            collection: "categories",
            id: oldParent.id,
            data: {
                sub_categories: oldParent.sub_categories.filter(
                    (item) => item !== id,
                ),
            },
        });

        if (!updatedParent) {
            throw new Error("Failed to update parent");
        }

        const newParent = await req.payload.find({
            collection: "categories",
            depth: 1,
            where: {
                id: {
                    equals: newParentId,
                },
            },
        });

        if (!newParent) {
            return res.status(404).send("New parent not found");
        }

        // Update sub category index
        const subCategories =
            (newParent.docs[0].sub_categories as SubCategory[]) || [];
        let index = 0;
        if (subCategories && subCategories.length > 0) {
            index =
                Math.max(...subCategories.map((subCat) => subCat.index)) + 1;
        }

        const updatedSubCategory = await req.payload.update({
            collection: "sub_categories",
            id,
            data: {
                index,
            },
        });

        if (!updatedSubCategory) {
            throw new Error("Failed to update sub category");
        }

        const updatedNewParent = await req.payload.update({
            collection: "categories",
            id: newParentId,
            data: {
                sub_categories: [...subCategories.map((sub) => sub.id), id],
            },
        });

        if (!updatedNewParent) {
            throw new Error("Failed to update new parent");
        }

        return res.status(200).end();
    } catch (err) {
        console.error(err);
        console.error(err.stack);
        return res.status(500).send("Failed to update parent");
    }
};

export default setSubCategoryParentHandler;
