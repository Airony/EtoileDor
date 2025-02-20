import { PayloadHandler } from "payload/config";
import { MenuItem } from "../payload-types";

const getSubCategoriesHandler: PayloadHandler = async (req, res) => {
    const subCategories = await req.payload.find({
        collection: "sub_categories",
        depth: 1,
        limit: 0,
    });
    const data = subCategories.docs;

    data.forEach((cat) => {
        if (cat.menu_items) {
            cat.menu_items = (cat.menu_items as MenuItem[])
                .sort((a, b) => a.index - b.index)
                .map((item) => item.id);
        }
    });

    res.status(200).json(data);
};

export default getSubCategoriesHandler;
