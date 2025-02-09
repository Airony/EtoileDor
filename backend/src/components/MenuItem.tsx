import { useSortable } from "@dnd-kit/sortable";
import React from "react";
import DragHandle from "./DragHandle";
import { CSS } from "@dnd-kit/utilities";
import { useCategories } from "../contexts/CategoriesContext";
import { Button } from "payload/components/elements";
import MoreIcon from "payload/dist/admin/components/icons/More";

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
            <div className="menu-item__left-items">
                <DragHandle listeners={listeners} attributes={attributes} />
                <p className="menu-item__name">{name}</p>
            </div>
            <div className="menu-item__right-items">
                <p className="menu-item__price">{price}</p>
                <Button
                    className="menu-item__edit-button"
                    icon="edit"
                    size="small"
                    buttonStyle="icon-label"
                />
                <Button
                    className="menu-item__more-button"
                    icon={<MoreIcon />}
                    size="small"
                    buttonStyle="icon-label"
                />
            </div>
        </div>
    );
}

export default MenuItem;
