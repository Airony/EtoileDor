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
import { toast } from "react-toastify";

interface CategoryOptionsModalProps {
    id: string;
    slug: string;
}
function CategoryOptionsModal({ id, slug }: CategoryOptionsModalProps) {
    const { categories } = useCategories();
    const dispatch = useCategoriesDispatch();
    const { name } = categories.get(id);
    const [inputtedName, setInputtedName] = useState<string>(name);
    const [loading, setLoading] = useState<boolean>(false);
    const { closeModal, openModal } = useModal();

    function close() {
        if (loading) {
            return;
        }
        setInputtedName(name);
        setLoading(false);
        closeModal(slug);
    }
    function handleCancelPress() {
        if (loading) {
            return;
        }
        close();
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSavePress();
        } else if (e.key === "Escape") {
            e.preventDefault();
            handleCancelPress();
        }
    }

    async function handleSavePress() {
        if (!inputtedName) {
            return;
        }
        setLoading(true);

        try {
            const response = await fetch(`/api/categories/${id}`, {
                credentials: "include",
                method: "PATCH",
                body: JSON.stringify({ name: inputtedName }),
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
                throw new Error();
            }
            dispatch({
                type: categoryActionKind.RENAME_CATEGORY,
                id,
                newName: inputtedName,
            });
            close();
        } catch (error) {
            toast.error("Failed to update category name.");
            setLoading(false);
        }
    }

    function handleDelete() {
        dispatch({ type: categoryActionKind.DELETE_CATEGORY, id });
        close();
    }
    const deleteModalSlug = `delete-modal-${id}`;

    return (
        <Modal
            slug={slug}
            className="options-modal"
            closeOnBlur={false}
            focusTrapOptions={{ initialFocus: false }}
            onKeyDown={handleKeyDown}
        >
            {loading && <div className="options-modal__loading-overlay"></div>}
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

            <div className="options-modal__actions">
                <Button
                    buttonStyle="transparent"
                    className="btn-error"
                    onClick={() => {
                        close();
                        openModal(deleteModalSlug);
                    }}
                    disabled={loading}
                >
                    Delete
                </Button>
                <div className="options-modal__save-cancel-container">
                    <Button
                        disabled={loading}
                        buttonStyle="secondary"
                        onClick={handleCancelPress}
                    >
                        Cancel
                    </Button>
                    <Button disabled={loading} onClick={handleSavePress}>
                        Save
                    </Button>
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
