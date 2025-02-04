import {
    categoryActionKind,
    useCategoriesDispatch,
    type MenuItemData,
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
    list: MenuItemData[];
}
function MenuItemList({ list }: MenuItemListProps) {
    const sensors = useSensors(useSensor(PointerSensor));
    const dispatch = useCategoriesDispatch();
    const parentId = list[0]?.parentId;
    const parentType = list[0]?.parentType;

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
                        parentType,
                    });
                }}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
                <SortableContext
                    items={list}
                    strategy={verticalListSortingStrategy}
                >
                    {list.map((item) => (
                        <MenuItem key={item.id} item={item} />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
}

export default MenuItemList;
