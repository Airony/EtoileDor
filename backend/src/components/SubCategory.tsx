import React, { useEffect } from "react";
import MenuItemList from "./MenuItemList";
import { Button } from "payload/components/elements";
import MenuItemInput from "./MenuItemInput";
import { useInputMenuItem } from "../reactHooks/useInputMenuItem";
import { useMenuQuery } from "../views/fetches";

interface SubCategoryProps {
    id: string;
    parentId: string;
}

function SubCategory({ id }: SubCategoryProps) {
    const { data } = useMenuQuery();
    const { subCategories } = data;
    const { name, menuItems } = subCategories.get(id);
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
                <MenuItemList list={menuItems} parentId={id} />
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
