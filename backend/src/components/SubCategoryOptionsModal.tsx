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
            close();

            return { id: nanoid() };
        },
        onSuccess: (_, __, context) => {
            if (
                checkForFutureMutation(queryClient, [mutationKey], context.id)
            ) {
                return;
            }
            toast.success("Sub-category renamed successfully.", {
                position: "bottom-center",
            });
        },
        onError: async (err, _, context) => {
            if (
                checkForFutureMutation(queryClient, [mutationKey], context.id)
            ) {
                return;
            }
            toast.error("Failed to rename sub-ategory.", {
                position: "bottom-center",
            });
            console.error(err);
            await queryClient.invalidateQueries({
                queryKey: ["subCategories"],
            });
        },
        mutationKey: [mutationKey],
    });

    async function handleSavePress() {
        if (inputtedName !== name) {
            renameMutation.mutate(inputtedName);
        }

        close();
    }

    // async function updateSubCategory({
    //     newName,
    //     newParentId,
    // }: {
    //     newName?: string;
    //     newParentId?: string;
    // }) {
    //     setLoading(true);
    //     try {
    //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //         const body: any = {};
    //         if (name) body.name = newName;
    //         if (newParentId) {
    //             body.index =
    //                 categories.categoriesMap.get(
    //                     newParentId,
    //                 ).subCategories.length;
    //             body.category = {
    //                 relationTo: "categories",
    //                 value: newParentId,
    //             };
    //         }

    //         const response = await fetch(`/api/sub_categories/${id}`, {
    //             credentials: "include",
    //             method: "PATCH",
    //             body: JSON.stringify(body),
    //             headers: { "Content-Type": "application/json" },
    //         });

    //         if (!response.ok) {
    //             throw new Error(await response.text());
    //         }

    //         // if (newName) {
    //         //     dispatch({
    //         //         type: categoryActionKind.RENAME_SUB_CATEGORY,
    //         //         id,
    //         //         newName: newName,
    //         //     });
    //         //     setInputtedName(newName);
    //         // }

    //         // if (newParentId) {
    //         //     dispatch({
    //         //         type: categoryActionKind.CHANGE_SUB_CATEGORY_PARENT,
    //         //         currentParentId: parentId,
    //         //         newParentId: newParentId,
    //         //         subCategoryId: id,
    //         //     });
    //         //     setInputtedParentId(newParentId);
    //         // }

    //         setLoading(false);
    //         close();
    //     } catch (error) {
    //         console.error(error);
    //         toast.error("Failed to update sub-category.");
    //         setLoading(false);
    //     }
    // }

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
            toast.success("Sub-category deleted successfully.", {
                position: "bottom-center",
            });

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
            toast.error("Failed to delete sub-category.", {
                position: "bottom-center",
            });
            console.error(err);
            await queryClient.invalidateQueries({
                queryKey: ["subCategories"],
            });
            await queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });

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
            <div className="options-modal__inputs">
                <TextInput
                    path="name"
                    name="name"
                    label="Name"
                    value={inputtedName}
                    onChange={(e) => setInputtedName(e.target.value)}
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
                deletedName="sub category"
                onDeletion={() => deleteMutation.mutate()}
                warning="All related menu items will be deleted."
            />
        </Modal>
    );
}

export default SubCategoryOptionsModal;
