import { PayloadHandler } from "payload/config";
import { MenuItem, SubCategory } from "../payload-types";

const getCategoriesHandler: PayloadHandler = async (req, res) => {
    const categories = await req.payload.find({
        collection: "categories",
        depth: 2,
        limit: 0,
    });
    const data = categories.docs;

    data.forEach((cat) => {
        if (cat.menu_items) {
            cat.menu_items = (cat.menu_items as MenuItem[])
                .sort((a, b) => a.index - b.index)
                .map((item) => item.id);
        }
        if (cat.sub_categories) {
            cat.sub_categories = (cat.sub_categories as SubCategory[]).sort(
                (a, b) => a.index - b.index,
            );
            cat.sub_categories.forEach((subCat: SubCategory) => {
                if (subCat.menu_items) {
                    subCat.menu_items = (subCat.menu_items as MenuItem[])
                        .sort((a, b) => a.index - b.index)
                        .map((item) => item.id);
                }
            });

            cat.sub_categories = cat.sub_categories.map(
                (subCat: SubCategory) => subCat.id,
            );
        }
    });

    res.status(200).json(data);
};

export default getCategoriesHandler;
