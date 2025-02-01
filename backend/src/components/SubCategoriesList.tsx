import React from "react";
import MenuItemList from "./MenuItemList";
import { useCategories } from "../contexts/CategoriesContext";

interface SubCategoriesListProps {
    parentIndex: number;
}
function SubCategoriesList({ parentIndex }: SubCategoriesListProps) {
    const { categories } = useCategories();
    const { SubCategories } = categories[parentIndex];

    return (
        <div>
            {SubCategories.map((subCat) => (
                <>
                    <h3 key={subCat.id}>{subCat.name}</h3>
                    <MenuItemList key={subCat.id} list={subCat.menuItems} />
                </>
            ))}
        </div>
    );
}

export default SubCategoriesList;
