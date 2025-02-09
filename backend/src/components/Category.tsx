import React, { useEffect } from "react";
import MenuItemList from "./MenuItemList";
import { Button } from "payload/components/elements";
import { useCategories } from "../contexts/CategoriesContext";
import MenuItemInput from "./MenuItemInput";
import SubCategory from "./SubCategory";
import { useInputMenuItem } from "../reactHooks/useInputMenuItem";

interface CategoryProps {
    id: string;
}

function Category({ id }: CategoryProps) {
    const { categories } = useCategories();
    const { name, SubCategoriesIds, menuItemsIds } = categories.get(id);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const { state, handleSave, handleAddBtnPress, handleCancel } =
        useInputMenuItem({ parentId: id, parentType: "categories" });

    useEffect(() => {
        if (state.inputting) {
            inputRef.current?.focus();
        }
        return () => {};
    }, [state.inputting]);

    return (
        <div key={id} className="categories-list__category">
            <div className="categories-list__category-header">
                <h2>{name}</h2>
                <Button
                    icon="plus"
                    size="small"
                    aria-label={`Add menu item to category {category.name}`}
                    buttonStyle="secondary"
                    onClick={handleAddBtnPress}
                >
                    Add Item
                </Button>
            </div>
            <div className="categories-list__category-content">
                <div className="categories-list__items-container">
                    <MenuItemList list={menuItemsIds} parentId={id} />
                    {state.inputting && (
                        <MenuItemInput
                            inputRef={inputRef}
                            loading={state.loading}
                            onCancel={handleCancel}
                            onSave={handleSave}
                        />
                    )}
                </div>
                {SubCategoriesIds.length > 0 && (
                    <div className="categories-list__sub-categories">
                        {SubCategoriesIds.map((subId) => (
                            <SubCategory key={subId} id={subId} parentId={id} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Category;
