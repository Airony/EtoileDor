import React from "react";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    DndContext,
    DragEndEvent,
    SensorDescriptor,
    SensorOptions,
    closestCenter,
} from "@dnd-kit/core";
import SubCategorySortableItem from "./SubCategorySortableItem";
import {
    restrictToVerticalAxis,
    restrictToParentElement,
} from "@dnd-kit/modifiers";
import { CategoriesQueryData, useMenuQuery } from "../views/fetches";
import { debouncePromise } from "../utils/debouncePromise";
import {
    CancelledError,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { toast } from "react-toastify";
import checkForFutureMutation from "../utils/checkForFutureMutation";
import mapSet from "../utils/mapSet";

interface SubCategoriesListProps {
    sensors: SensorDescriptor<SensorOptions>[];
    parentId: string;
}

const debouncedOrderUpdate = debouncePromise(
    async (newOrder: string[]) => {
        const response = await fetch("/api/sub_categories/order", {
            credentials: "include",
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                subCategoriesIds: newOrder,
            }),
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }
    },
    2500,
    new CancelledError(),
);

function SubCategoriesNavList({ sensors, parentId }: SubCategoriesListProps) {
    const { data } = useMenuQuery();
    const { categories } = data;
    const { subCategories } = categories.categoriesMap.get(parentId);

    const queryClient = useQueryClient();

    const orderMutation = useMutation({
        mutationFn: debouncedOrderUpdate,
        onMutate: async (newOrder: string[]) => {
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
                                subCategories: newOrder,
                            };
                        },
                    );

                    return {
                        ...oldData,
                        categoriesMap: newCategoriesMap,
                    };
                },
            );
            return { id: nanoid() };
        },
        onSuccess: (_, __, context) => {
            if (
                checkForFutureMutation(
                    queryClient,
                    ["update_subcat_order"],
                    context.id,
                )
            ) {
                return;
            }
            toast.success("Category order updated successfully");
        },
        onError: (err, _, context) => {
            if (err instanceof CancelledError) {
                return;
            }
            if (
                checkForFutureMutation(
                    queryClient,
                    ["update_subcat_order"],
                    context.id,
                )
            ) {
                return;
            }

            toast.error("Failed to update sub-category order");
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
        mutationKey: ["update_subcat_order"],
    });

    function handleReorder(e: DragEndEvent) {
        if (!e.over) {
            return;
        }
        const oldIndex = subCategories.indexOf(e.active.id as string);
        const newIndex = subCategories.indexOf(e.over.id as string);
        const newOrder = arrayMove(subCategories, oldIndex, newIndex);
        orderMutation.mutate(newOrder);
    }
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleReorder}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
            <SortableContext
                items={subCategories}
                strategy={verticalListSortingStrategy}
            >
                {subCategories.map((id) => (
                    <SubCategorySortableItem
                        key={id}
                        id={id}
                        parentId={parentId}
                    />
                ))}
            </SortableContext>
        </DndContext>
    );
}

export default SubCategoriesNavList;
