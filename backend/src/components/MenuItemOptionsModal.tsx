import React, { useContext, useState } from "react";
import { Modal, useModal } from "@faceless-ui/modal";
import { Button } from "payload/components/elements";
import { SelectInput, TextInput } from "payload/components/forms";
import DeleteModal from "./DeleteModal";
import { toast } from "react-toastify";
import { LoadingOverlay } from "payload/dist/admin/components/elements/Loading";
import type { Option } from "payload/dist/admin/components/elements/ReactSelect/types";
import {
    CategoriesQueryData,
    MenuItemsQueryData,
    SubCategoriesQueryData,
    useMenuQuery,
} from "../views/fetches";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import mapSet from "../utils/mapSet";
import { MenuItemListContext } from "./MenuItemList";
import useEditMenuItem from "../reactHooks/useEditMenuItem";

interface MenuItemOptionsModalProps {
    id: string;
    parentId: string;
    slug: string;
}

interface State {
    inputtedName: string;
    inputtedParentId: string;
    inputtedPrice: string;
}

function MenuItemOptionsModal({
    id,
    slug,
    parentId,
}: MenuItemOptionsModalProps) {
    const { data } = useMenuQuery();
    const { menuItems, categories, subCategories } = data;
    const { name, price } = menuItems.get(id);
    const { parentType } = useContext(MenuItemListContext);
    const [state, setState] = useState<State>({
        inputtedName: name,
        inputtedParentId: parentId,
        inputtedPrice: price.toString(),
    });

    const editMutation = useEditMenuItem(id);

    const { closeModal, openModal } = useModal();

    const updateParentMutation = useMutation({
        mutationFn: async ({
            newParentId,
            newParentType,
        }: {
            newParentId: string;
            newParentType: string;
        }) => {
            const response = await fetch(`/api/menu_items/set_parent/${id}`, {
                credentials: "include",
                method: "PATCH",
                body: JSON.stringify({ newParentId, newParentType }),
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
        },
        onSuccess: () => {
            toast.success("Menu item parent updated successfully.", {
                position: "bottom-center",
            });
            close();
        },
        onError: (err) => {
            console.error(err);
            toast.error("Failed to update menu item parent.", {
                position: "bottom-center",
            });
        },
        onSettled: (_, __, { newParentType }) => {
            if (
                parentType === "subCategories" ||
                newParentType === "sub_categories"
            ) {
                queryClient.invalidateQueries({ queryKey: ["subCategories"] });
            }

            if (parentType === "categories" || newParentType === "categories") {
                queryClient.invalidateQueries({ queryKey: ["categories"] });
            }
        },
    });

    function handleUpdateName(e: React.ChangeEvent<HTMLInputElement>) {
        if (updateParentMutation.isPending) {
            return;
        }
        setState((state) => ({ ...state, inputtedName: e.target.value }));
    }

    function handleUpdateParentId(opt: Option) {
        if (updateParentMutation.isPending) {
            return;
        }
        setState((state) => ({
            ...state,
            inputtedParentId: opt.value as string,
        }));
    }

    function handleUpdatePrice(e: React.ChangeEvent<HTMLInputElement>) {
        if (updateParentMutation.isPending) {
            return;
        }
        // dont accept non-numeric values
        setState((state) => ({
            ...state,
            inputtedPrice: e.target.value.replace(/\D/g, ""),
        }));
    }

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/menu_items/${id}`, {
                credentials: "include",
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    parentId: parentId,
                    parentType:
                        parentType === "categories"
                            ? "categories"
                            : "sub_categories",
                }),
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
        },
        onMutate: async () => {
            if (parentType === "categories") {
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
                                    menuItems: cat.menuItems.filter(
                                        (itemId) => itemId !== id,
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
            } else {
                await queryClient.cancelQueries({
                    queryKey: ["subCategories"],
                });
                queryClient.setQueryData(
                    ["subCategories"],
                    (
                        oldData: SubCategoriesQueryData,
                    ): SubCategoriesQueryData => {
                        const newMap = mapSet(oldData, parentId, (subCat) => {
                            return {
                                ...subCat,
                                menuItems: subCat.menuItems.filter(
                                    (itemId) => itemId !== id,
                                ),
                            };
                        });
                        return newMap;
                    },
                );
            }
        },

        onSuccess: () => {
            toast.success("Menu item deleted successfully.", {
                position: "bottom-center",
            });

            // Remove from the map
            queryClient.setQueryData(
                ["menuItems"],
                (oldData: MenuItemsQueryData): MenuItemsQueryData => {
                    const newItemsMap = new Map(oldData);
                    newItemsMap.delete(id);
                    return newItemsMap;
                },
            );
        },
        onError: async (err) => {
            toast.error("Failed to delete menu item.", {
                position: "bottom-center",
            });
            console.error(err);
            await queryClient.invalidateQueries({
                queryKey: ["menuItems"],
            });
            await queryClient.invalidateQueries({
                queryKey: [
                    parentType === "categories"
                        ? "categories"
                        : "subCategories",
                ],
            });
        },
    });

    function close() {
        closeModal(slug);
    }
    function handleCancelPress() {
        if (updateParentMutation.isPending) {
            return;
        }
        setState({
            inputtedName: name,
            inputtedParentId: parentId,
            inputtedPrice: price.toString(),
        });
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
        const parsedPrice = parseInt(state.inputtedPrice);
        if (name !== state.inputtedName || price !== parsedPrice) {
            editMutation.mutate({
                name: state.inputtedName,
                price: parsedPrice,
            });
        }

        if (parentId !== state.inputtedParentId) {
            const newParentType = categories.categoriesMap.has(
                state.inputtedParentId,
            )
                ? "categories"
                : "sub_categories";

            updateParentMutation.mutate({
                newParentId: state.inputtedParentId,
                newParentType,
            });
        } else {
            close();
        }
    }

    const deleteModalSlug = `delete-modal-${id}`;

    function handleDeletePress() {
        close();
        openModal(deleteModalSlug);
    }

    // Select option could either be a category or a sub-category
    const selectOptions = Array.from(categories.categoriesMap.entries())
        .map(([catId, cat]) => ({
            label: cat.name,
            value: catId,
        }))
        .concat(
            Array.from(subCategories.entries()).map(([subCatId, subCat]) => ({
                label: subCat.name,
                value: subCatId,
            })),
        );

    return (
        <Modal
            slug={slug}
            className="options-modal"
            closeOnBlur={false}
            focusTrapOptions={{ initialFocus: false }}
            onKeyDown={handleKeyDown}
        >
            <LoadingOverlay
                show={updateParentMutation.isPending}
                animationDuration="0"
            />
            <h2>Edit Category</h2>
            <div className="options-modal__inputs">
                <TextInput
                    path="name"
                    name="name"
                    label="Name"
                    value={state.inputtedName}
                    onChange={handleUpdateName}
                ></TextInput>
                <TextInput
                    path="price"
                    name="price"
                    label="price"
                    value={state.inputtedPrice}
                    onChange={handleUpdatePrice}
                ></TextInput>

                <SelectInput
                    path="parent"
                    name="parent"
                    label="Parent"
                    value={state.inputtedParentId}
                    options={selectOptions}
                    onChange={handleUpdateParentId}
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
                    <Button
                        disabled={updateParentMutation.isPending}
                        buttonStyle="secondary"
                        onClick={handleCancelPress}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={updateParentMutation.isPending}
                        onClick={handleSavePress}
                    >
                        Save
                    </Button>
                </div>
            </div>
            <DeleteModal
                slug={deleteModalSlug}
                deletedName="menu item"
                onDeletion={() => deleteMutation.mutate()}
            />
        </Modal>
    );
}

export default MenuItemOptionsModal;
