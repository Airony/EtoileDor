import React from "react";
import { useCategories } from "../contexts/CategoriesContext";
import MenuItemList from "./MenuItemList";
import SubCategoriesList from "./SubCategoriesList";
import { Button } from "payload/components/elements";

function CategoriesList() {
    const { data, categories } = useCategories();

    return (
        <div className="categories-list">
            {data.map((id) => {
                const category = categories.get(id);
                return (
                    <div key={id} className="categories-list__category">
                        <div className="categories-list__category-header">
                            <h2>{category.name}</h2>
                            <Button
                                icon="plus"
                                size="small"
                                aria-label={`Add menu item to category {category.name}`}
                                buttonStyle="secondary"
                            >
                                Add Item
                            </Button>
                        </div>
                        <div className="categories-list__category-content">
                            <MenuItemList
                                list={category.menuItemsIds}
                                parentId={id}
                            />
                            <SubCategoriesList parentId={id} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default CategoriesList;
