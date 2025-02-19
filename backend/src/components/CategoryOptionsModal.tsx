import React, { useState } from "react";
import { Modal, useModal } from "@faceless-ui/modal";
import { Button } from "payload/components/elements";
import { TextInput } from "payload/components/forms";
import DeleteModal from "./DeleteModal";
import { toast } from "react-toastify";
import { LoadingOverlay } from "payload/dist/admin/components/elements/Loading";
import { CategoriesQueryData, useMenuQuery } from "../views/fetches";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CategoryOptionsModalProps {
    id: string;
    slug: string;
}
function CategoryOptionsModal({ id, slug }: CategoryOptionsModalProps) {
    const { data } = useMenuQuery();
    const { categories } = data;
    const { name } = categories.categoriesMap.get(id);
    const [inputtedName, setInputtedName] = useState<string>(name);
    const [loading, setLoading] = useState<boolean>(false);
    const { closeModal, openModal } = useModal();

    function close() {
        if (loading) {
            return;
        }
        closeModal(slug);
    }

    function handleCancelPress() {
        if (loading) {
            return;
        }
        close();
        setInputtedName(name);
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

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/categories/${id}`, {
                credentials: "include",
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: "categories" });
            queryClient.setQueryData(
                ["categories"],
                (oldData: CategoriesQueryData): CategoriesQueryData => {
                    const newOrderedIds = oldData.orderedIds.filter(
                        (categoryId) => categoryId !== id,
                    );
                    return {
                        ...oldData,
                        orderedIds: newOrderedIds,
                    };
                },
            );
        },

        onSuccess: () => {
            toast.success("Category deleted successfully.", {
                position: "bottom-center",
            });

            // Remove from the map
            queryClient.setQueryData(
                ["categories"],
                (oldData: CategoriesQueryData): CategoriesQueryData => {
                    const newCategoriesMap = new Map(oldData.categoriesMap);
                    newCategoriesMap.delete(id);
                    return {
                        ...oldData,
                        categoriesMap: newCategoriesMap,
                    };
                },
            );
        },
        onError: async (err) => {
            toast.error("Failed to delete category.", {
                position: "bottom-center",
            });
            console.error(err);
            await queryClient.invalidateQueries({ queryKey: "categories" });
        },
    });

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
            // dispatch({
            //     type: categoryActionKind.RENAME_CATEGORY,
            //     id,
            //     newName: inputtedName,
            // });
            setInputtedName(inputtedName);
            setLoading(false);
            close();
        } catch (error) {
            toast.error("Failed to update category name.");
            setLoading(false);
        }
    }

    const deleteModalSlug = `delete-modal-${id}`;

    function handleDeletePress() {
        close();
        openModal(deleteModalSlug);
    }

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

            <div className="options-modal__actions">
                <Button
                    buttonStyle="transparent"
                    className="btn-error"
                    onClick={handleDeletePress}
                    disabled={deleteMutation.isPending}
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
                onDeletion={() => deleteMutation.mutate()}
                warning="All related sub categories and menu items will be deleted."
            />
        </Modal>
    );
}

export default CategoryOptionsModal;
