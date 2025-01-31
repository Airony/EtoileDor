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

interface SubCategorySortableItemProps {
    id: string;
    name: string;
    parentId: string;
}

function SubCategorySortableItem(props: SubCategorySortableItemProps) {
    const { categories } = useCategories();
    const dispatch = useCategoriesDispatch();

    const { openModal, closeModal } = useModal();
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: props.id });
    const [parentCategoryInput, setParentCategoryInput] = useState<string>(
        props.parentId,
    );

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    function handleModalSave() {
        dispatch({
            type: categoryActionKind.CHANGE_SUB_CATEGORY_PARENT,
            currentParentId: props.parentId,
            newParentId: parentCategoryInput,
            subCategoryId: props.id,
        });
        closeModal(modalId);
    }

    function handleModalCancel() {
        setParentCategoryInput(props.parentId);
        closeModal(modalId);
    }

    const modalId = "sub-cat-" + props.name + "-modal";
    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className="category-order__sub-category"
            >
                <DragHandle listeners={listeners} attributes={attributes} />
                {props.name}
                <Button
                    icon={<MoreIcon />}
                    buttonStyle="icon-label"
                    onClick={() => openModal(modalId)}
                    className="category-order__sub-category__more"
                />
            </div>
            <Modal slug={modalId} closeOnBlur={false}>
                <div className="category-order__modal">
                    <h2>Sub Category Options</h2>
                    <h3>{props.name}</h3>
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
