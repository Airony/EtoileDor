import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
    CategoriesQueryData,
    MenuItemsQueryData,
    SubCategoriesQueryData,
} from "../views/fetches";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import mapSet from "../utils/mapSet";

interface SaveMenuItemProps {
    parentId: string;
    parentType: "categories" | "sub_categories";
}

export function useInputMenuItem({ parentId, parentType }: SaveMenuItemProps) {
    const [isInputting, setIsInputting] = useState(false);

    const queryClient = useQueryClient();

    const addMenuItem = useCallback(
        async ({ name, price }: { name: string; price: number }) => {
            const response = await fetch("/api/menu_items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    price,
                    parentId,
                    parentType,
                }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            return response.json();
        },
        [parentId, parentType],
    );

    const addMutation = useMutation({
        mutationFn: addMenuItem,
        onMutate: async () => {
            await queryClient.cancelQueries({
                queryKey: [parentType, "menu_items"],
            });
        },
        onSuccess: (data: {
            id: string;
            index: number;
            name: string;
            price: number;
        }) => {
            queryClient.setQueryData(
                ["menuItems"],
                (oldData: MenuItemsQueryData): MenuItemsQueryData => {
                    console.log(oldData);
                    return mapSet(oldData, data.id, () => ({
                        id: data.id,
                        index: data.index,
                        name: data.name,
                        price: data.price,
                    }));
                },
            );

            if (parentType === "categories") {
                queryClient.setQueryData(
                    ["categories"],
                    (oldData: CategoriesQueryData): CategoriesQueryData => {
                        console.log("old", oldData);
                        const newMap = mapSet(
                            oldData.categoriesMap,
                            parentId,
                            (category) => ({
                                ...category,
                                menuItems: [...category.menuItems, data.id],
                            }),
                        );
                        return {
                            ...oldData,
                            categoriesMap: newMap,
                        };
                    },
                );
            } else {
                queryClient.setQueryData(
                    ["subCategories"],
                    (
                        oldData: SubCategoriesQueryData,
                    ): SubCategoriesQueryData => {
                        console.log(oldData);
                        return mapSet(oldData, parentId, (subCategory) => ({
                            ...subCategory,
                            menuItems: [...subCategory.menuItems, data.id],
                        }));
                    },
                );
            }

            toast.success("Menu item added successfully", {
                position: "bottom-center",
            });
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to add menu item", {
                position: "bottom-center",
            });
        },
        onSettled: () => {
            setIsInputting(false);
        },
    });

    function handleSave(name: string, price: number) {
        addMutation.mutate({ name, price });
    }

    function handleAddBtnPress() {
        if (addMutation.isPending) {
            return;
        }
        setIsInputting(true);
    }

    function handleCancel() {
        if (addMutation.isPending) {
            return;
        }
        setIsInputting(false);
    }

    return {
        isInputting,
        isPending: addMutation.isPending,
        handleSave,
        handleAddBtnPress,
        handleCancel,
    };
}
