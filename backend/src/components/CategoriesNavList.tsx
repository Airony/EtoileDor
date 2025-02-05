import React, { useContext } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    restrictToParentElement,
    restrictToVerticalAxis,
} from "@dnd-kit/modifiers";

import CategorySortableItem from "./CategorySortableItem";
import {
    CategoriesContext,
    CategoriesDispatchContext,
    categoryActionKind,
} from "../contexts/CategoriesContext";

function CategoriesNavList() {
    const { data, loading } = useContext(CategoriesContext);
    const dispatch = useContext(CategoriesDispatchContext);
    const sensors = useSensors(useSensor(PointerSensor));
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => {
                if (!e.over) {
                    return;
                }
                dispatch({
                    type: categoryActionKind.MOVE_CATEGORY,
                    activeId: e.active.id.toString(),
                    overId: e.over.id.toString(),
                });
            }}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
            <SortableContext
                items={data}
                strategy={verticalListSortingStrategy}
                disabled={loading}
            >
                {data.map((catId) => (
                    <CategorySortableItem
                        key={catId}
                        id={catId}
                        sensors={sensors}
                    />
                ))}
            </SortableContext>
        </DndContext>
    );
}

export default CategoriesNavList;
