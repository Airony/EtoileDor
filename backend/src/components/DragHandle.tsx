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
        <div className="drag-handle" {...attributes} {...listeners}>
            <div className="drag-handle__line"></div>
            <div className="drag-handle__line"></div>
            <div className="drag-handle__line"></div>
        </div>
    );
}

export default DragHandle;
