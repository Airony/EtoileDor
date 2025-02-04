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
                <div key={subCat.id}>
                    <h3>{subCat.name}</h3>
                    <MenuItemList list={subCat.menuItems} />
                </div>
            ))}
        </div>
    );
}

export default SubCategoriesList;
