import { useState } from "react";
import { toast } from "react-toastify";
import { useMenuQuery } from "../views/fetches";

interface SaveMenuItemProps {
    parentId: string;
    parentType: "categories" | "sub_categories";
}

interface SaveMenuItemState {
    loading: boolean;
    inputting: boolean;
}

export function useInputMenuItem({ parentId, parentType }: SaveMenuItemProps) {
    const { data } = useMenuQuery();
    const { categories, subCategories } = data;
    const [state, setState] = useState<SaveMenuItemState>({
        loading: false,
        inputting: false,
    });

    async function handleSave(name: string, price: number) {
        setState({ ...state, loading: true });

        const index =
            parentType === "categories"
                ? categories.categoriesMap.get(parentId).menuItems.length
                : subCategories.get(parentId).menuItems.length;

        try {
            const response = await fetch("/api/menu_items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    price,
                    Category: {
                        relationTo: parentType,
                        value: parentId,
                    },
                    index: index,
                }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const responseData = await response.json();
            if (!responseData.doc?.id) {
                throw new Error();
            }

            // dispatch({
            //     type: categoryActionKind.ADD_MENU_ITEM,
            //     id: responseData.doc.id,
            //     parentId: parentId,
            //     parentType: parentType,
            //     index,
            //     name: name,
            //     price: price,
            // });

            setState({ ...state, inputting: false, loading: false });
        } catch (error) {
            console.error(error);
            toast.error("Failed to add menu item");
            setState({ ...state, loading: false });
        }
    }

    function handleAddBtnPress() {
        if (state.loading) {
            return;
        }

        setState({
            ...state,
            inputting: true,
        });
    }

    function handleCancel() {
        if (state.loading) {
            return;
        }
        setState({ ...state, inputting: false });
    }

    return {
        state,
        handleSave,
        handleAddBtnPress,
        handleCancel,
    };
}
