import React from "react";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
function DragHandle({
    attributes,
    listeners,
}: {
    listeners: SyntheticListenerMap;
    attributes: DraggableAttributes;
}) {
    return (
        <div
            className="category-order__draggable-icon"
            {...attributes}
            {...listeners}
        >
            <div className="category-order__draggable-icon__line"></div>
            <div className="category-order__draggable-icon__line"></div>
            <div className="category-order__draggable-icon__line"></div>
        </div>
    );
}

export default DragHandle;
