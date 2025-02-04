import React from "react";
import { useCategories } from "../contexts/CategoriesContext";
import MenuItemList from "./MenuItemList";
import SubCategoriesList from "./SubCategoriesList";

function CategoriesList() {
    const { categories } = useCategories();

    return (
        <div>
            {categories.map((category, index) => (
                <div key={category.id}>
                    <h2>{category.name}</h2>
                    <MenuItemList list={category.menuItems} />
                    <SubCategoriesList parentIndex={index} />
                </div>
            ))}
        </div>
    );
}

export default CategoriesList;
