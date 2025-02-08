import React, { useState } from "react";
import { Modal, useModal } from "@faceless-ui/modal";
import {
    categoryActionKind,
    useCategories,
    useCategoriesDispatch,
} from "../contexts/CategoriesContext";
import { Button } from "payload/components/elements";
import { TextInput } from "payload/components/forms";
import DeleteModal from "./DeleteModal";

interface CategoryOptionsModalProps {
    id: string;
    slug: string;
}
function CategoryOptionsModal({ id, slug }: CategoryOptionsModalProps) {
    const { categories } = useCategories();
    const dispatch = useCategoriesDispatch();
    const { name } = categories.get(id);
    const [inputtedName, setInputtedName] = useState<string>(name);
    const { closeModal, openModal } = useModal();

    function close() {
        closeModal(slug);
    }
    function handleCancelPress() {
        setInputtedName(name);
        close();
    }

    function handleSavePress() {
        if (!inputtedName) {
            return;
        }
        dispatch({
            type: categoryActionKind.RENAME_CATEGORY,
            id,
            newName: inputtedName,
        });
    }

    function handleDelete() {
        dispatch({ type: categoryActionKind.DELETE_CATEGORY, id });
        close();
    }
    const deleteModalSlug = `delete-modal-${id}`;

    return (
        <Modal
            slug={slug}
            className="category-options-modal"
            closeOnBlur={false}
            focusTrapOptions={{ initialFocus: false }}
        >
            <h2>Edit Category</h2>
            <TextInput
                path="name"
                name="name"
                label="Name"
                value={inputtedName}
                onChange={(e) => setInputtedName(e.target.value)}
                validate={(value) => {
                    return value;
                }}
            ></TextInput>

            <div className="category-options-modal__actions">
                <Button
                    buttonStyle="transparent"
                    className="btn-error"
                    onClick={() => {
                        close();
                        openModal(deleteModalSlug);
                    }}
                >
                    Delete
                </Button>
                <div className="category-options-modal__save-cancel-container">
                    <Button buttonStyle="secondary" onClick={handleCancelPress}>
                        Cancel
                    </Button>
                    <Button onClick={handleSavePress}>Save</Button>
                </div>
            </div>
            <DeleteModal
                slug={deleteModalSlug}
                deletedName="category"
                onDeletion={handleDelete}
                warning="All related sub categories and menu items will be deleted."
            />
        </Modal>
    );
}

export default CategoryOptionsModal;
