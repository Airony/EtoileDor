import type { CategoryData } from "../views/categoryOrderView";
import React from "react";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragHandle from "./DragHandle";
import {
    SensorDescriptor,
    SensorOptions,
    DragEndEvent,
    DndContext,
    closestCenter,
} from "@dnd-kit/core";
import SubCategorySortableItem from "./SubCategorySortableItem";
import { Button } from "payload/components/elements";
import { Chevron } from "payload/components/icons";
import {
    restrictToVerticalAxis,
    restrictToParentElement,
} from "@dnd-kit/modifiers";

interface CategorySortableItemProps {
    id: string;
    name: string;
    sensors: SensorDescriptor<SensorOptions>[];
    subCategories: CategoryData[];
    handleSubCategoryDragEnd: (event: DragEndEvent) => void;
    collapsed: boolean;
    onCollapseToggle: (event: React.MouseEvent) => void;
}

function CategorySortableItem({
    id,
    name,
    sensors,
    subCategories,
    handleSubCategoryDragEnd,
    collapsed,
    onCollapseToggle,
}: CategorySortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            className="category-order__container"
        >
            <div className="category-order__category">
                <div className="category-order__category__container">
                    <DragHandle listeners={listeners} attributes={attributes} />
                    {name}
                </div>
                {subCategories.length > 0 && (
                    <Button
                        buttonStyle="none"
                        onClick={onCollapseToggle}
                        className="category-order__category__collapse-button"
                    >
                        <Chevron
                            direction={collapsed ? "down" : "up"}
                            size="large"
                        />
                    </Button>
                )}
            </div>
            {!collapsed && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleSubCategoryDragEnd}
                    modifiers={[
                        restrictToVerticalAxis,
                        restrictToParentElement,
                    ]}
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
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}

export default CategorySortableItem;
