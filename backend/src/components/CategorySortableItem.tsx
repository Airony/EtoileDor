import {
    categoryActionKind,
    useCategories,
    useCategoriesDispatch,
} from "../contexts/CategoriesContext";
import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragHandle from "./DragHandle";
import { SensorDescriptor, SensorOptions } from "@dnd-kit/core";
import { Button } from "payload/components/elements";
import { Chevron } from "payload/components/icons";
import SubCategoriesNavList from "./SubCategoriesNavList";
import EditableText from "./EditableText";
import { useModal } from "@faceless-ui/modal";
import DeleteModal from "./DeleteModal";

interface CategorySortableItemProps {
    id: string;
    sensors: SensorDescriptor<SensorOptions>[];
}

function CategorySortableItem({ id, sensors }: CategorySortableItemProps) {
    const { categories } = useCategories();
    const { name, SubCategories } = categories.find((cat) => cat.id === id);
    const dispatch = useCategoriesDispatch();

    const [collapsed, setCollapsed] = useState<boolean>(true);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [newName, setNewName] = useState<string>(name);

    const shouldEdit = isEditing || !name;
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const modalId = id + "-modal";
    const { openModal } = useModal();

    function handleSaveName() {
        if (!newName) {
            return;
        }
        setIsEditing(false);
        dispatch({
            type: categoryActionKind.RENAME_CATEGORY,
            id: id,
            newName: newName,
        });
    }

    function handleCancelEdit() {
        setIsEditing(false);
        setNewName(name);
    }

    function handleAddSubCategory() {
        dispatch({
            type: categoryActionKind.ADD_SUB_CATEGORY,
            parentId: id,
        });
        setCollapsed(false);
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="category-order__container"
        >
            <div className="category-order__category">
                <div className="category-order__category__container">
                    <DragHandle listeners={listeners} attributes={attributes} />
                    <EditableText
                        path="category_name"
                        name="category_name"
                        editedValue={newName}
                        handleCancelEdit={handleCancelEdit}
                        handleSaveEdit={handleSaveName}
                        isEditing={shouldEdit}
                        value={name}
                        onChange={(val) => setNewName(val)}
                        handleStartEdit={() => setIsEditing(true)}
                    />
                </div>
                <div className="category-order__control-group">
                    <Button
                        buttonStyle="icon-label"
                        icon="plus"
                        size="small"
                        onClick={handleAddSubCategory}
                    />
                    {SubCategories.length > 0 && (
                        <Button
                            icon={
                                <Chevron
                                    direction={collapsed ? "down" : "up"}
                                    size="large"
                                />
                            }
                            buttonStyle="icon-label"
                            size="small"
                            onClick={() => {
                                setCollapsed(!collapsed);
                            }}
                            className="category-order__category__collapse-button"
                        ></Button>
                    )}
                    <Button
                        icon="x"
                        buttonStyle="icon-label"
                        size="small"
                        aria-label="Delete category"
                        onClick={() => {
                            openModal(modalId);
                        }}
                    />
                </div>
            </div>
            {!collapsed && (
                <SubCategoriesNavList
                    parentId={id}
                    sensors={sensors}
                    subCategories={SubCategories}
                />
            )}

            <DeleteModal
                slug={modalId}
                deletedName={"category " + name}
                warning="All related sub categories and menu items will be deleted."
                onDeletion={() => {
                    dispatch({
                        type: categoryActionKind.DELETE_CATEGORY,
                        id: id,
                    });
                }}
            />
        </div>
    );
}

export default CategorySortableItem;
