import { useSortable } from "@dnd-kit/sortable";
import React from "react";
import DragHandle from "./DragHandle";
import { CSS } from "@dnd-kit/utilities";
import { useCategories } from "../contexts/CategoriesContext";

interface MenuItemProps {
    id: string;
}
function MenuItem({ id }: MenuItemProps) {
    const { menuItems } = useCategories();
    const { name, price } = menuItems.get(id);
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
