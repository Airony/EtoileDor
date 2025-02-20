import React, { useState } from "react";
import { Modal, useModal } from "@faceless-ui/modal";
import { Button } from "payload/components/elements";
import { SelectInput, TextInput } from "payload/components/forms";
import DeleteModal from "./DeleteModal";
import { toast } from "react-toastify";
import {
    CategoriesQueryData,
    SubCategoriesQueryData,
    useMenuQuery,
} from "../views/fetches";
import mapSet from "../utils/mapSet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import checkForFutureMutation from "../utils/checkForFutureMutation";
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
    const { data } = useMenuQuery();
    const { categories, subCategories } = data;
    const { name } = subCategories.get(id);
    const [inputtedName, setInputtedName] = useState<string>(name);
    const [inputtedParentId, setInputtedParentId] = useState<string>(parentId);
    const queryClient = useQueryClient();
    const { closeModal, openModal } = useModal();

    function close() {
        closeModal(slug);
    }
    function handleCancelPress() {
        if (isPending) {
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
    const mutationKey = `rename-sub-category-${id}`;
    const renameMutation = useMutation({
        mutationFn: async (newName: string) => {
            const response = await fetch(`/api/sub_categories/${id}`, {
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
            await queryClient.cancelQueries({ queryKey: ["subCategories"] });
            queryClient.setQueryData(
                ["subCategories"],
                (oldData: SubCategoriesQueryData): SubCategoriesQueryData => {
                    const newMap = mapSet(oldData, id, (subCat) => {
                        return {
                            ...subCat,
                            name: inputtedName,
                        };
                    });
                    return newMap;
                },
            );
            return { id: nanoid() };
        },
        onSuccess: (_, __, context) => {
            if (
                checkForFutureMutation(queryClient, [mutationKey], context.id)
            ) {
                return;
            }
            toast.success("Sub-category renamed successfully.");
        },
        onError: async (err, _, context) => {
            if (
                checkForFutureMutation(queryClient, [mutationKey], context.id)
            ) {
                return;
            }
            toast.error("Failed to rename sub-ategory.");
            console.error(err);
            await queryClient.invalidateQueries({
                queryKey: ["subCategories"],
            });
        },
        mutationKey: [mutationKey],
    });

    const updateParentMutation = useMutation({
        mutationFn: async (newParentId: string) => {
            const response = await fetch(
                `/api/sub_categories/set_parent/${id}`,
                {
                    credentials: "include",
                    method: "PATCH",
                    body: JSON.stringify({ newParentId }),
                    headers: { "Content-Type": "application/json" },
                },
            );
            if (!response.ok) {
                throw new Error(await response.text());
            }
        },
        onSuccess: () => {
            toast.success("Sub-category parent updated successfully.");
            close();
        },
        onError: (err) => {
            console.error(err);
            toast.error("Failed to update sub-category parent.");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/sub_categories/${id}`, {
                credentials: "include",
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ parentId: parentId }),
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
                        parentId,
                        (cat) => {
                            return {
                                ...cat,
                                subCategories: cat.subCategories.filter(
                                    (subCatId) => subCatId !== id,
                                ),
                            };
                        },
                    );
                    return {
                        ...oldData,
                        categoriesMap: newMap,
                    };
                },
            );
        },

        onSuccess: () => {
            toast.success("Sub-category deleted successfully.");

            // Remove from the map
            queryClient.setQueryData(
                ["subCategories"],
                (oldData: SubCategoriesQueryData): SubCategoriesQueryData => {
                    const newCategoriesMap = new Map(oldData);
                    newCategoriesMap.delete(id);
                    return newCategoriesMap;
                },
            );
        },
        onError: async (err) => {
            toast.error("Failed to delete sub-category.");
            console.error(err);
            await queryClient.invalidateQueries({
                queryKey: ["subCategories"],
            });
            await queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });

    const isPending = updateParentMutation.isPending;
    const deleteModalSlug = `delete-modal-${id}`;

    async function handleSavePress() {
        if (isPending) {
            return;
        }
        if (inputtedName !== name) {
            renameMutation.mutate(inputtedName);
        }
        if (inputtedParentId !== parentId) {
            updateParentMutation.mutate(inputtedParentId);
        } else {
            close();
        }
    }

    function handleDeletePress() {
        close();
        openModal(deleteModalSlug);
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!isPending) {
            setInputtedName(e.target.value);
        }
    }
    return (
        <Modal
            slug={slug}
            className="options-modal"
            closeOnBlur={false}
            focusTrapOptions={{ initialFocus: false }}
            onKeyDown={handleKeyDown}
        >
            <LoadingOverlay show={isPending} animationDuration={"0"} />
            <h2>Edit Category</h2>
            <div className="options-modal__inputs">
                <TextInput
                    path="name"
                    name="name"
                    label="Name"
                    value={inputtedName}
                    onChange={handleInputChange}
                ></TextInput>

                <SelectInput
                    path="parent"
                    name="parent"
                    label="Parent"
                    value={inputtedParentId}
                    options={categories.orderedIds.map((catId) => ({
                        label: categories.categoriesMap.get(catId).name,
                        value: catId,
                    }))}
                    onChange={(val) => setInputtedParentId(val.value as string)}
                />
            </div>

            <div className="options-modal__actions">
                <Button
                    buttonStyle="transparent"
                    className="btn-error"
                    onClick={handleDeletePress}
                    disabled={isPending}
                >
                    Delete
                </Button>
                <div className="options-modal__save-cancel-container">
                    <Button
                        buttonStyle="secondary"
                        onClick={handleCancelPress}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSavePress}>Save</Button>
                </div>
            </div>
            <DeleteModal
                slug={deleteModalSlug}
                deletedName="sub category"
                onDeletion={() => deleteMutation.mutate()}
                warning="All related menu items will be deleted."
            />
        </Modal>
    );
}

export default SubCategoryOptionsModal;
