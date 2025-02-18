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
import { useMenuQuery } from "../views/fetches";

interface SubCategoriesListProps {
    sensors: SensorDescriptor<SensorOptions>[];
    parentId: string;
}

function SubCategoriesNavList({ sensors, parentId }: SubCategoriesListProps) {
    const { data } = useMenuQuery();
    const { categories } = data;
    const { subCategories } = categories.categoriesMap.get(parentId);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            // onDragEnd={(event) => {
            //     dispatch({
            //         type: categoryActionKind.MOVE_SUB_CATEGORY,
            //         parentId: parentId,
            //         activeId: event.active.id.toString(),
            //         overId: event.over.id.toString(),
            //     });
            // }}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
            <SortableContext
                items={subCategories}
                strategy={verticalListSortingStrategy}
            >
                {subCategories.map((id) => (
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
