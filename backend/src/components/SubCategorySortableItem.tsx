import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useState } from "react";
import DragHandle from "./DragHandle";
import { Modal, useModal } from "@faceless-ui/modal";
import { Button } from "payload/components/elements";
import MoreIcon from "payload/dist/admin/components/icons/More";
import {
    categoryActionKind,
    useCategories,
    useCategoriesDispatch,
} from "../contexts/CategoriesContext";
import { SelectInput } from "payload/components/forms";
import EditableText from "./EditableText";

interface SubCategorySortableItemProps {
    id: string;
    name: string;
    parentId: string;
    defaultIsEditing?: boolean;
}

function SubCategorySortableItem({
    id,
    name,
    parentId,
    defaultIsEditing = false,
}: SubCategorySortableItemProps) {
    const [isEditing, setIsEditing] = useState(defaultIsEditing);
    const shouldEdit = isEditing || !name;
    const [newName, setNewName] = useState(name);

    const { categories } = useCategories();
    const dispatch = useCategoriesDispatch();

    const { openModal, closeModal } = useModal();
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: id });
    const [parentCategoryInput, setParentCategoryInput] =
        useState<string>(parentId);

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    function handleModalSave() {
        dispatch({
            type: categoryActionKind.CHANGE_SUB_CATEGORY_PARENT,
            currentParentId: parentId,
            newParentId: parentCategoryInput,
            subCategoryId: id,
        });
        closeModal(modalId);
    }

    function handleModalCancel() {
        setParentCategoryInput(parentId);
        closeModal(modalId);
    }

    function handleSaveName() {
        if (!newName) {
            return;
        }
        setIsEditing(false);
        dispatch({
            type: categoryActionKind.RENAME_SUB_CATEGORY,
            parentId: parentId,
            id: id,
            newName: newName,
        });
    }

    function handleCancelEdit() {
        setIsEditing(false);
        setNewName(name);
    }

    const modalId = "sub-cat-" + id + "-modal";
    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className="category-order__sub-category"
            >
                <DragHandle listeners={listeners} attributes={attributes} />

                <EditableText
                    path="sub-category-name"
                    name="name"
                    isEditing={shouldEdit}
                    editedValue={newName}
                    value={name}
                    onChange={(val) => setNewName(val)}
                    handleStartEdit={() => setIsEditing(true)}
                    handleSaveEdit={handleSaveName}
                    handleCancelEdit={handleCancelEdit}
                />
                <div className="category-order__control-group">
                    <Button
                        icon={<MoreIcon />}
                        buttonStyle="icon-label"
                        onClick={() => openModal(modalId)}
                        className="category-order__sub-category__more"
                    />
                </div>
            </div>
            <Modal slug={modalId} closeOnBlur={false}>
                <div className="category-order__modal">
                    <h2>Sub Category Options</h2>
                    <h3>{name}</h3>
                    <SelectInput
                        path="parent-category"
                        name="parent-category"
                        label="Parent Category"
                        options={categories.map((cat) => {
                            return { label: cat.name, value: cat.id };
                        })}
                        validate={null}
                        onChange={(val) => {
                            setParentCategoryInput(val.value as string);
                        }}
                        value={parentCategoryInput}
                    ></SelectInput>
                    <div className="category-order__modal__controls">
                        <Button
                            buttonStyle="primary"
                            type="button"
                            onClick={handleModalSave}
                        >
                            Save
                        </Button>
                        <Button
                            buttonStyle="secondary"
                            type="button"
                            onClick={handleModalCancel}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default SubCategorySortableItem;
