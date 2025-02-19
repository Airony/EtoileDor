import React, { useEffect, useRef, useState } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";

import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    restrictToParentElement,
    restrictToVerticalAxis,
} from "@dnd-kit/modifiers";

import CategorySortableItem from "./CategorySortableItem";
import { Button } from "payload/components/elements";
import CategoryInput from "./CategoryInput";
import { toast } from "react-toastify";
import {
    CancelledError,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { debouncePromise } from "../utils/debouncePromise";
import { CategoriesQueryData, useMenuQuery } from "../views/fetches";
import { nanoid } from "nanoid";
import checkForFutureMutation from "../utils/checkForFutureMutation";

const debouncedOrderUpdate = debouncePromise(
    async (newOrder: string[]) => {
        const response = await fetch("/api/categories/order", {
            credentials: "include",
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                categoryIds: newOrder,
            }),
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }
    },
    2500,
    new CancelledError(),
);

function CategoriesNavList() {
    const { data } = useMenuQuery();
    const { categories } = data;
    const sensors = useSensors(useSensor(PointerSensor));
    const [inputting, setInputting] = useState<boolean>(false);
    const queryClient = useQueryClient();

    const orderMutation = useMutation({
        mutationFn: debouncedOrderUpdate,
        onMutate: async (newOrder: string[]) => {
            await queryClient.cancelQueries({ queryKey: "categories" });
            queryClient.setQueryData(
                ["categories"],
                (oldData: CategoriesQueryData) => {
                    return {
                        ...oldData,
                        orderedIds: newOrder,
                    };
                },
            );
            return { id: nanoid() };
        },
        onSuccess: (_, __, context) => {
            if (
                checkForFutureMutation(
                    queryClient,
                    ["update_order"],
                    context.id,
                )
            ) {
                return;
            }
            toast.success("Category order updated successfully", {
                position: "bottom-center",
            });
        },
        onError: (err, _, context) => {
            if (err instanceof CancelledError) {
                return;
            }
            if (
                checkForFutureMutation(
                    queryClient,
                    ["update_order"],
                    context.id,
                )
            ) {
                return;
            }

            toast.error("Failed to update category order", {
                position: "bottom-center",
            });
            queryClient.invalidateQueries({ queryKey: "categories" });
        },
        mutationKey: ["update_order"],
    });

    const addMutation = useMutation({
        mutationFn: async (name: string) => {
            const response = await fetch("/api/categories", {
                credentials: "include",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    index: categories.orderedIds.length, // TODO :Use largest index
                }),
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }

            return response.json();
        },

        onSuccess: async () => {
            toast.success("Category created successfully", {
                position: "bottom-center",
            });
            await queryClient.invalidateQueries({ queryKey: "categories" });
        },
        onError: (err) => {
            console.error(err);
            toast.error("Failed to create category", {
                position: "bottom-center",
            });
        },
        onSettled: () => {
            setInputting(false);
        },
    });

    function handleSavePress(name: string) {
        addMutation.mutate(name);
    }

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputting) {
            inputRef.current?.focus();
        }
        return () => {};
    }, [inputting]);

    function handleAddBtnPress() {
        if (addMutation.isPending) {
            return;
        }

        if (inputting) {
            inputRef.current?.focus();
            return;
        }
        setInputting(true);
    }

    function handleCancel() {
        setInputting(false);
    }

    function handleReorder(e: DragEndEvent) {
        if (!e.over) {
            return;
        }
        const oldIndex = categories.orderedIds.indexOf(e.active.id as string);
        const newIndex = categories.orderedIds.indexOf(e.over.id as string);
        const newOrder = arrayMove(categories.orderedIds, oldIndex, newIndex);
        orderMutation.mutate(newOrder);
    }

    return (
        <div className="category-nav">
            <Button
                icon="plus"
                size="medium"
                aria-label="Add Category"
                buttonStyle="secondary"
                onClick={handleAddBtnPress}
                disabled={addMutation.isPending}
            >
                Add Category
            </Button>

            <div className="category-nav__list">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleReorder}
                    modifiers={[
                        restrictToVerticalAxis,
                        restrictToParentElement,
                    ]}
                >
                    <SortableContext
                        items={categories.orderedIds}
                        strategy={verticalListSortingStrategy}
                        disabled={addMutation.isPending}
                    >
                        {categories.orderedIds.map((catId) => (
                            <CategorySortableItem
                                key={catId}
                                id={catId}
                                sensors={sensors}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            {inputting && (
                <CategoryInput
                    onCancel={handleCancel}
                    onSave={handleSavePress}
                    inputRef={inputRef}
                    loading={addMutation.isPending}
                />
            )}
        </div>
    );
}

export default CategoriesNavList;
