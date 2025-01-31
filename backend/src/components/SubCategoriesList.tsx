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
    CategoryData,
    useCategoriesDispatch,
} from "../contexts/CategoriesContext";

interface SubCategoriesListProps {
    sensors: SensorDescriptor<SensorOptions>[];
    parentId: string;
    subCategories: CategoryData[];
}

function SubCategoriesList({
    sensors,
    parentId,
    subCategories,
}: SubCategoriesListProps) {
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
                items={subCategories}
                strategy={verticalListSortingStrategy}
            >
                {subCategories.map((cat) => (
                    <SubCategorySortableItem
                        key={cat.id}
                        id={cat.id}
                        name={cat.name}
                        parentId={parentId}
                    />
                ))}
            </SortableContext>
        </DndContext>
    );
}

export default SubCategoriesList;
