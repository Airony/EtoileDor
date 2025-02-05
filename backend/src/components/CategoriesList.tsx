import React from "react";
import { useCategories } from "../contexts/CategoriesContext";
import MenuItemList from "./MenuItemList";
import SubCategoriesList from "./SubCategoriesList";

function CategoriesList() {
    const { data, categories } = useCategories();

    return (
        <div>
            {data.map((id) => {
                const category = categories.get(id);
                return (
                    <div key={id}>
                        <h2>{category.name}</h2>
                        <MenuItemList
                            list={category.menuItemsIds}
                            parentId={id}
                        />
                        <SubCategoriesList parentId={id} />
                    </div>
                );
            })}
        </div>
    );
}

export default CategoriesList;
