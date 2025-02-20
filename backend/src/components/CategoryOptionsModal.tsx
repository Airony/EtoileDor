import React, { useState } from "react";
import { Modal, useModal } from "@faceless-ui/modal";
import { Button } from "payload/components/elements";
import { TextInput } from "payload/components/forms";
import DeleteModal from "./DeleteModal";
import { toast } from "react-toastify";
import { CategoriesQueryData, useMenuQuery } from "../views/fetches";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import mapSet from "../utils/mapSet";
import checkForFutureMutation from "../utils/checkForFutureMutation";
import { nanoid } from "nanoid";

interface CategoryOptionsModalProps {
    id: string;
    slug: string;
}
function CategoryOptionsModal({ id, slug }: CategoryOptionsModalProps) {
    const { data } = useMenuQuery();
    const { categories } = data;
    const { name } = categories.categoriesMap.get(id);
    const [inputtedName, setInputtedName] = useState<string>(name);
    const { closeModal, openModal } = useModal();

    function close() {
        closeModal(slug);
    }

    function handleCancelPress() {
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
            await queryClient.cancelQueries({ queryKey: ["categories"] });
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
            await queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });

    const mutationKey = `rename-category-${id}`;
    const renameMutation = useMutation({
        mutationFn: async (newName: string) => {
            const response = await fetch(`/api/categories/${id}`, {
                credentials: "include",
                method: "PATCH",
                body: JSON.stringify({ name: newName }),
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
        },

        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["categories"] });
            queryClient.setQueryData(
                ["categories"],
                (oldData: CategoriesQueryData): CategoriesQueryData => {
                    const newMap = mapSet(
                        oldData.categoriesMap,
                        id,
                        (category) => {
                            return {
                                ...category,
                                name: inputtedName,
                            };
                        },
                    );
                    return {
                        ...oldData,
                        categoriesMap: newMap,
                    };
                },
            );
            close();

            return { id: nanoid() };
        },
        onSuccess: (_, __, context) => {
            if (
                checkForFutureMutation(queryClient, [mutationKey], context.id)
            ) {
                return;
            }
            toast.success("Category renamed successfully.", {
                position: "bottom-center",
            });
        },
        onError: async (err, _, context) => {
            if (
                checkForFutureMutation(queryClient, [mutationKey], context.id)
            ) {
                return;
            }
            toast.error("Failed to rename category.", {
                position: "bottom-center",
            });
            console.error(err);
            await queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
        mutationKey: [mutationKey],
    });

    function handleSavePress() {
        if (inputtedName === name) {
            close();
            return;
        }

        renameMutation.mutate(inputtedName);
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
            <h2>Edit Category</h2>
            <TextInput
                path="name"
                name="name"
                label="Name"
                value={inputtedName}
                onChange={(e) => setInputtedName(e.target.value)}
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
                    <Button buttonStyle="secondary" onClick={handleCancelPress}>
                        Cancel
                    </Button>
                    <Button onClick={handleSavePress}>Save</Button>
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
