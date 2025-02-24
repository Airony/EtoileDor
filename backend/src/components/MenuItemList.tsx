import React, { createContext } from "react";
import MenuItem from "./MenuItem";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    restrictToVerticalAxis,
    restrictToParentElement,
} from "@dnd-kit/modifiers";
import { debouncePromise } from "../utils/debouncePromise";
import {
    CancelledError,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import checkForFutureMutation from "../utils/checkForFutureMutation";
import mapSet from "../utils/mapSet";
import { nanoid } from "nanoid";
import { CategoriesQueryData, SubCategoriesQueryData } from "../views/fetches";

interface MenuItemListProps {
    list: string[];
    parentId: string;
    parentType: context["parentType"];
}

const debouncedOrderUpdate = debouncePromise(
    async (newOrder: string[]) => {
        const response = await fetch("/api/menu_items/order", {
            credentials: "include",
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                menuItemsIds: newOrder,
            }),
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }
    },
    2500,
    new CancelledError(),
);
function MenuItemList({ list, parentId, parentType }: MenuItemListProps) {
    const sensors = useSensors(useSensor(PointerSensor));

    const queryClient = useQueryClient();
    const mutationKey = [`update_menu_item_order_${parentId}`];

    const orderMutation = useMutation({
        mutationFn: debouncedOrderUpdate,
        onMutate: async (newOrder: string[]) => {
            if (parentType === "categories") {
                await queryClient.cancelQueries({ queryKey: ["categories"] });
                queryClient.setQueryData(
                    ["categories"],
                    (oldData: CategoriesQueryData) => {
                        const newCategoriesMap = mapSet(
                            oldData.categoriesMap,
                            parentId,
                            (category) => {
                                return {
                                    ...category,
                                    menuItems: newOrder,
                                };
                            },
                        );
                        return {
                            ...oldData,
                            categoriesMap: newCategoriesMap,
                        };
                    },
                );
            } else {
                await queryClient.cancelQueries({
                    queryKey: ["subCategories"],
                });
                queryClient.setQueryData(
                    ["subCategories"],
                    (oldData: SubCategoriesQueryData) => {
                        const newSubCategoriesMap = mapSet(
                            oldData,
                            parentId,
                            (category) => {
                                return {
                                    ...category,
                                    subCategories: newOrder,
                                };
                            },
                        );

                        return newSubCategoriesMap;
                    },
                );
            }
            return { id: nanoid() };
        },
        onSuccess: (_, __, context) => {
            if (checkForFutureMutation(queryClient, mutationKey, context.id)) {
                return;
            }
            toast.success("Category order updated successfully");
        },
        onError: (err, _, context) => {
            if (err instanceof CancelledError) {
                return;
            }
            if (checkForFutureMutation(queryClient, mutationKey, context.id)) {
                return;
            }

            toast.error("Failed to update menu items order");
            const queryKey =
                parentType === "categories" ? "categories" : "subCategories";
            queryClient.invalidateQueries({ queryKey: [queryKey] });
        },
        mutationKey: mutationKey,
    });

    function handleReorder(e: DragEndEvent) {
        if (!e.over) {
            return;
        }
        const oldIndex = list.indexOf(e.active.id as string);
        const newIndex = list.indexOf(e.over.id as string);
        const newOrder = arrayMove(list, oldIndex, newIndex);
        orderMutation.mutate(newOrder);
    }

    if (list.length === 0) {
        return <></>;
    }

    return (
        <div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleReorder}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
                <SortableContext
                    items={list}
                    strategy={verticalListSortingStrategy}
                >
                    <MenuItemListContext.Provider
                        value={{ parentType: parentType }}
                    >
                        {list.map((id) => (
                            <MenuItem key={id} id={id} parentId={parentId} />
                        ))}
                    </MenuItemListContext.Provider>
                </SortableContext>
            </DndContext>
        </div>
    );
}

interface context {
    parentType: "categories" | "subCategories";
}

export const MenuItemListContext = createContext<context>({
    parentType: "categories",
});
export default MenuItemList;
