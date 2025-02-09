import {
    categoryActionKind,
    useCategoriesDispatch,
} from "../contexts/CategoriesContext";
import React from "react";
import MenuItem from "./MenuItem";
import {
    closestCenter,
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    restrictToVerticalAxis,
    restrictToParentElement,
} from "@dnd-kit/modifiers";

interface MenuItemListProps {
    list: string[];
    parentId: string;
}
function MenuItemList({ list, parentId }: MenuItemListProps) {
    const sensors = useSensors(useSensor(PointerSensor));
    const dispatch = useCategoriesDispatch();

    if (list.length === 0) {
        return <></>;
    }

    return (
        <div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => {
                    dispatch({
                        type: categoryActionKind.MOVE_MENU_ITEM,
                        activeId: event.active.id.toString(),
                        overId: event.over.id.toString(),
                        parentId,
                    });
                }}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
                <SortableContext
                    items={list}
                    strategy={verticalListSortingStrategy}
                >
                    {list.map((id) => (
                        <MenuItem key={id} id={id} />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
}

export default MenuItemList;
