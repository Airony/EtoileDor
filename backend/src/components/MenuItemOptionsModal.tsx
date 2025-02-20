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
    loading: boolean;
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
        loading: false,
        inputtedName: name,
        inputtedParentId: parentId,
        inputtedPrice: price?.toString() || "Error",
    });

    const editMutation = useEditMenuItem(id);

    const { closeModal, openModal } = useModal();

    function close() {
        if (state.loading) {
            return;
        }
        closeModal(slug);
    }
    function handleCancelPress() {
        if (state.loading) {
            return;
        }
        setState({
            loading: false,
            inputtedName: name,
            inputtedParentId: parentId,
            inputtedPrice: price?.toString() || "error",
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
        close();
    }

    // async function updateSubCategory({ newName, newPrice, newParentId }: temp) {
    //     setState((state) => ({ ...state, loading: true }));
    //     try {
    //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //         const body: any = {};
    //         if (name) body.name = newName;
    //         if (newPrice) body.price = newPrice;

    //         if (newParentId) {
    //             let parent: CategoryData | SubCategoryData;
    //             let parentType = "categories";
    //             if (categories.categoriesMap.has(newParentId)) {
    //                 parent = categories.categoriesMap.get(newParentId);
    //             } else {
    //                 parent = subCategories.get(newParentId);
    //                 parentType = "sub_categories";
    //             }

    //             body.index = parent.menuItems.length;
    //             body.Category = {
    //                 relationTo: parentType,
    //                 value: newParentId,
    //             };
    //         }

    //         const response = await fetch(`/api/menu_items/${id}`, {
    //             credentials: "include",
    //             method: "PATCH",
    //             body: JSON.stringify(body),
    //             headers: { "Content-Type": "application/json" },
    //         });

    //         if (!response.ok) {
    //             throw new Error(await response.text());
    //         }

    //         // if (newName || newPrice) {
    //         //     dispatch({
    //         //         type: categoryActionKind.UPDATE_MENU_ITEM,
    //         //         id,
    //         //         name: newName || name,
    //         //         price: newPrice || price,
    //         //     });
    //         // }

    //         // if (newParentId) {
    //         //     dispatch({
    //         //         type: categoryActionKind.CHANGE_MENU_ITEM_PARENT,
    //         //         currentParentId: parentId,
    //         //         newParentId: newParentId,
    //         //         id: id,
    //         //     });
    //         // }

    //         setState((state) => ({
    //             ...state,
    //             inputtedName: newName || name,
    //             inputtedParentId: newParentId || parentId,
    //             inputtedPrice: newPrice?.toString() || price.toString(),
    //         }));

    //         setState((state) => ({ ...state, loading: false }));
    //         close();
    //     } catch (error) {
    //         console.error(error);
    //         toast.error("Failed to update menu item.");
    //         setState((state) => ({ ...state, loading: false }));
    //     }
    // }

    function handleUpdateName(e: React.ChangeEvent<HTMLInputElement>) {
        if (state.loading) {
            return;
        }
        setState((state) => ({ ...state, inputtedName: e.target.value }));
    }

    function handleUpdateParentId(opt: Option) {
        if (state.loading) {
            return;
        }
        setState((state) => ({
            ...state,
            inputtedParentId: opt.value as string,
        }));
    }

    function handleUpdatePrice(e: React.ChangeEvent<HTMLInputElement>) {
        if (state.loading) {
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
            <LoadingOverlay show={state.loading} animationDuration="0" />
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
                        disabled={state.loading}
                        buttonStyle="secondary"
                        onClick={handleCancelPress}
                    >
                        Cancel
                    </Button>
                    <Button disabled={state.loading} onClick={handleSavePress}>
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
