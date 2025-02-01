import { useCategories } from "../contexts/CategoriesContext";
import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragHandle from "./DragHandle";
import { SensorDescriptor, SensorOptions } from "@dnd-kit/core";
import { Button } from "payload/components/elements";
import { Chevron } from "payload/components/icons";
import SubCategoriesList from "./SubCategoriesList";

interface CategorySortableItemProps {
    id: string;
    sensors: SensorDescriptor<SensorOptions>[];
}

function CategorySortableItem({ id, sensors }: CategorySortableItemProps) {
    const { categories } = useCategories();
    const [collapsed, setCollapsed] = useState<boolean>(true);

    const { name, SubCategories } = categories.find((cat) => cat.id === id);

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
                {/* <Button buttonStyle="icon-label" icon="plus" onClick={add} /> */}
                {SubCategories.length > 0 && (
                    <Button
                        buttonStyle="none"
                        onClick={() => {
                            setCollapsed(!collapsed);
                        }}
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
                <SubCategoriesList
                    parentId={id}
                    sensors={sensors}
                    subCategories={SubCategories}
                />
            )}
        </div>
    );
}

export default CategorySortableItem;
