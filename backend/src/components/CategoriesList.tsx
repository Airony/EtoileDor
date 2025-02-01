import React from "react";
import { useCategories } from "../contexts/CategoriesContext";
import MenuItemList from "./MenuItemList";
import SubCategoriesList from "./SubCategoriesList";

function CategoriesList() {
    const { categories } = useCategories();

    return (
        <div>
            {categories.map((category, index) => (
                <>
                    <h2>{category.name}</h2>
                    <MenuItemList key={category.id} list={category.menuItems} />
                    <SubCategoriesList key={category.id} parentIndex={index} />
                </>
            ))}
        </div>
    );
}

export default CategoriesList;
