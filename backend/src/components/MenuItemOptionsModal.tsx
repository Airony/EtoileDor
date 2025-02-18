import React, { useState } from "react";
import { Modal, useModal } from "@faceless-ui/modal";
import { Button } from "payload/components/elements";
import { SelectInput, TextInput } from "payload/components/forms";
import DeleteModal from "./DeleteModal";
import { toast } from "react-toastify";
import { LoadingOverlay } from "payload/dist/admin/components/elements/Loading";
import type { Option } from "payload/dist/admin/components/elements/ReactSelect/types";
import { CategoryData, SubCategoryData, useMenuQuery } from "../views/fetches";

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
    const [state, setState] = useState<State>({
        loading: false,
        inputtedName: name,
        inputtedParentId: parentId,
        inputtedPrice: price?.toString() || "Error",
    });

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

    interface temp {
        newName?: string;
        newPrice?: number;
        newParentId?: string;
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
        if (state.loading) {
            return;
        }
        const newData: temp = {};

        if (state.inputtedName !== name) {
            newData.newName = state.inputtedName;
        }
        if (state.inputtedParentId !== parentId) {
            newData.newParentId = state.inputtedParentId;
        }
        if (state.inputtedPrice !== price.toString()) {
            newData.newPrice = parseInt(state.inputtedPrice);
        }
        if (Object.keys(newData).length === 0) {
            close();
            return;
        }

        await updateSubCategory(newData);
    }

    async function updateSubCategory({ newName, newPrice, newParentId }: temp) {
        setState((state) => ({ ...state, loading: true }));
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const body: any = {};
            if (name) body.name = newName;
            if (newPrice) body.price = newPrice;

            if (newParentId) {
                let parent: CategoryData | SubCategoryData;
                let parentType = "categories";
                if (categories.categoriesMap.has(newParentId)) {
                    parent = categories.categoriesMap.get(newParentId);
                } else {
                    parent = subCategories.get(newParentId);
                    parentType = "sub_categories";
                }

                body.index = parent.menuItems.length;
                body.Category = {
                    relationTo: parentType,
                    value: newParentId,
                };
            }

            const response = await fetch(`/api/menu_items/${id}`, {
                credentials: "include",
                method: "PATCH",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            // if (newName || newPrice) {
            //     dispatch({
            //         type: categoryActionKind.UPDATE_MENU_ITEM,
            //         id,
            //         name: newName || name,
            //         price: newPrice || price,
            //     });
            // }

            // if (newParentId) {
            //     dispatch({
            //         type: categoryActionKind.CHANGE_MENU_ITEM_PARENT,
            //         currentParentId: parentId,
            //         newParentId: newParentId,
            //         id: id,
            //     });
            // }

            setState((state) => ({
                ...state,
                inputtedName: newName || name,
                inputtedParentId: newParentId || parentId,
                inputtedPrice: newPrice?.toString() || price.toString(),
            }));

            setState((state) => ({ ...state, loading: false }));
            close();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update menu item.");
            setState((state) => ({ ...state, loading: false }));
        }
    }

    async function handleDelete() {
        setState((state) => ({ ...state, loading: true }));
        openModal(slug);
        try {
            const response = await fetch(`/api/menu_Items/${id}`, {
                credentials: "include",
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
            // dispatch({
            //     type: categoryActionKind.DELETE_MENU_ITEM,
            //     id,
            //     parentId,
            // });
            setState((state) => ({ ...state, loading: false }));
            closeModal(slug);
        } catch (error) {
            toast.error("Failed to delete menu item.");
            setState((state) => ({ ...state, loading: false }));
            openModal(slug);
        }
    }

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

    const deleteModalSlug = `delete-modal-${id}`;

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
                    onClick={() => {
                        close();
                        openModal(deleteModalSlug);
                    }}
                    disabled={state.loading}
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
                onDeletion={handleDelete}
            />
        </Modal>
    );
}

export default MenuItemOptionsModal;
