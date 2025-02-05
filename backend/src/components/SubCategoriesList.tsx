import React from "react";
import MenuItemList from "./MenuItemList";
import { useCategories } from "../contexts/CategoriesContext";

interface SubCategoriesListProps {
    parentId: string;
}
function SubCategoriesList({ parentId }: SubCategoriesListProps) {
    const { categories, subCategories } = useCategories();
    const { SubCategoriesIds } = categories.get(parentId);

    return (
        <div>
            {SubCategoriesIds.map((subCatId) => {
                const subCat = subCategories.get(subCatId);
                return (
                    <div key={subCatId}>
                        <h3>{subCat.name}</h3>
                        <MenuItemList list={subCat.menuItemsIds} parentId="" />
                    </div>
                );
            })}
        </div>
    );
}

export default SubCategoriesList;
