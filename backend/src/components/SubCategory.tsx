import React, { useEffect } from "react";
import MenuItemList from "./MenuItemList";
import { Button } from "payload/components/elements";
import { useCategories } from "../contexts/CategoriesContext";
import MenuItemInput from "./MenuItemInput";
import { useInputMenuItem } from "../reactHooks/useInputMenuItem";

interface SubCategoryProps {
    id: string;
    parentId: string;
}

function SubCategory({ id }: SubCategoryProps) {
    const { subCategories } = useCategories();
    const { name, menuItemsIds } = subCategories.get(id);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const { state, handleSave, handleAddBtnPress, handleCancel } =
        useInputMenuItem({ parentId: id, parentType: "sub_categories" });

    useEffect(() => {
        if (state.inputting) {
            inputRef.current?.focus();
        }
        return () => {};
    }, [state.inputting]);

    return (
        <div className="sub-category">
            <div className="sub-category__heading">
                <h3>{name}</h3>
                <Button
                    icon="plus"
                    size="small"
                    aria-label={`Add menu item to sub category ${name}`}
                    buttonStyle="secondary"
                    onClick={handleAddBtnPress}
                >
                    Add Item
                </Button>
            </div>
            <div className="sub-category__menu-items">
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
        </div>
    );
}

export default SubCategory;
