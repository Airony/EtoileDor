import React from "react";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    DndContext,
    SensorDescriptor,
    SensorOptions,
    closestCenter,
} from "@dnd-kit/core";
import SubCategorySortableItem from "./SubCategorySortableItem";
import {
    restrictToVerticalAxis,
    restrictToParentElement,
} from "@dnd-kit/modifiers";
import {
    categoryActionKind,
    useCategories,
    useCategoriesDispatch,
} from "../contexts/CategoriesContext";

interface SubCategoriesListProps {
    sensors: SensorDescriptor<SensorOptions>[];
    parentId: string;
}

function SubCategoriesNavList({ sensors, parentId }: SubCategoriesListProps) {
    const { categories } = useCategories();
    const { SubCategoriesIds } = categories.get(parentId);

    const dispatch = useCategoriesDispatch();
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
                dispatch({
                    type: categoryActionKind.MOVE_SUB_CATEGORY,
                    parentId: parentId,
                    activeId: event.active.id.toString(),
                    overId: event.over.id.toString(),
                });
            }}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
            <SortableContext
                items={SubCategoriesIds}
                strategy={verticalListSortingStrategy}
            >
                {SubCategoriesIds.map((id) => (
                    <SubCategorySortableItem
                        key={id}
                        id={id}
                        parentId={parentId}
                    />
                ))}
            </SortableContext>
        </DndContext>
    );
}

export default SubCategoriesNavList;
