import React, { useState } from "react";
import { Modal, useModal } from "@faceless-ui/modal";
import {
    categoryActionKind,
    useCategories,
    useCategoriesDispatch,
} from "../contexts/CategoriesContext";
import { Button } from "payload/components/elements";
import { SelectInput, TextInput } from "payload/components/forms";
import DeleteModal from "./DeleteModal";
import { toast } from "react-toastify";
import { LoadingOverlay } from "payload/dist/admin/components/elements/Loading";

interface SubCategoryOptionsModalProps {
    id: string;
    parentId: string;
    slug: string;
}
function SubCategoryOptionsModal({
    id,
    slug,
    parentId,
}: SubCategoryOptionsModalProps) {
    const { data, categories, subCategories } = useCategories();
    const dispatch = useCategoriesDispatch();
    const { name } = subCategories.get(id);
    const [inputtedName, setInputtedName] = useState<string>(name);
    const [inputtedParentId, setInputtedParentId] = useState<string>(parentId);
    const [loading, setLoading] = useState<boolean>(false);
    const { closeModal, openModal } = useModal();

    function close() {
        if (loading) {
            return;
        }
        setLoading(false);
        closeModal(slug);
    }
    function handleCancelPress() {
        if (loading) {
            return;
        }
        setInputtedName(name);
        setInputtedParentId(parentId);
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
        if (loading) {
            return;
        }

        if (inputtedName === name && inputtedParentId === parentId) {
            close();
            return;
        }

        if (inputtedName === name) {
            await updateSubCategory({ newParentId: inputtedParentId });
        } else if (inputtedParentId === parentId) {
            await updateSubCategory({ newName: inputtedName });
        } else {
            await updateSubCategory({
                newName: inputtedName,
                newParentId: inputtedParentId,
            });
        }
    }

    async function updateSubCategory({
        newName,
        newParentId,
    }: {
        newName?: string;
        newParentId?: string;
    }) {
        setLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const body: any = {};
            if (name) body.name = newName;
            if (newParentId) {
                body.index =
                    categories.get(newParentId).SubCategoriesIds.length;
                body.category = {
                    relationTo: "categories",
                    value: newParentId,
                };
            }

            const response = await fetch(`/api/sub_categories/${id}`, {
                credentials: "include",
                method: "PATCH",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            if (newName) {
                dispatch({
                    type: categoryActionKind.RENAME_SUB_CATEGORY,
                    id,
                    newName: newName,
                });
                setInputtedName(newName);
            }

            if (newParentId) {
                dispatch({
                    type: categoryActionKind.CHANGE_SUB_CATEGORY_PARENT,
                    currentParentId: parentId,
                    newParentId: newParentId,
                    subCategoryId: id,
                });
                setInputtedParentId(newParentId);
            }

            close();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update sub-category.");
            setLoading(false);
        }
    }

    function handleDelete() {
        // TODO: Implement handleDelete function

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
            <LoadingOverlay show={loading} animationDuration="0" />
            <h2>Edit Category</h2>
            <div className="options-modal__inputs">
                <TextInput
                    path="name"
                    name="name"
                    label="Name"
                    value={inputtedName}
                    onChange={(e) => {
                        if (loading) return;
                        setInputtedName(e.target.value);
                    }}
                ></TextInput>

                <SelectInput
                    path="parent"
                    name="parent"
                    label="Parent"
                    value={inputtedParentId}
                    options={data.map((catId) => ({
                        label: categories.get(catId).name,
                        value: catId,
                    }))}
                    onChange={(val) => setInputtedParentId(val.value as string)}
                />
            </div>

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
                deletedName="sub category"
                onDeletion={handleDelete}
                warning="All related menu items will be deleted."
            />
        </Modal>
    );
}

export default SubCategoryOptionsModal;
