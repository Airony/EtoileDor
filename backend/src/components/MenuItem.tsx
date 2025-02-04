import { useSortable } from "@dnd-kit/sortable";
import React from "react";
import DragHandle from "./DragHandle";
import { CSS } from "@dnd-kit/utilities";
import { MenuItemData } from "../contexts/CategoriesContext";

interface MenuItemProps {
    item: MenuItemData;
}
function MenuItem({ item }: MenuItemProps) {
    const { name, price, id } = item;
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <div className="menu-item" ref={setNodeRef} style={style}>
            <DragHandle listeners={listeners} attributes={attributes} />
            <p>{name}</p>
            <p>{price}</p>
        </div>
    );
}

export default MenuItem;
