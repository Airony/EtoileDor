import type { MenuItemData } from "../contexts/CategoriesContext";
import React from "react";
import MenuItem from "./MenuItem";

interface MenuItemListProps {
    list: MenuItemData[];
}
function MenuItemList({ list }: MenuItemListProps) {
    return (
        <div>
            {list.map((item) => (
                <MenuItem key={item.id} {...item} />
            ))}
        </div>
    );
}

export default MenuItemList;
