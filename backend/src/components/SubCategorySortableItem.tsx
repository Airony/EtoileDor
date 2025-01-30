import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";
import DragHandle from "./DragHandle";

interface SubCategorySortableItemProps {
    id: string;
    name: string;
}

function SubCategorySortableItem(props: SubCategorySortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: props.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            className="category-order__sub-category"
        >
            <DragHandle listeners={listeners} attributes={attributes} />
            {props.name}
        </div>
    );
}

export default SubCategorySortableItem;
