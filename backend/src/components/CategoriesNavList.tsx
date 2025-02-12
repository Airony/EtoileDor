import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
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
import {
    CategoriesContext,
    CategoriesDispatchContext,
    categoryActionKind,
} from "../contexts/CategoriesContext";
import { Button } from "payload/components/elements";
import CategoryInput from "./CategoryInput";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { debouncePromise } from "../utils/debouncePromise";

function CategoriesNavList() {
    const { data } = useContext(CategoriesContext);
    const dispatch = useContext(CategoriesDispatchContext);
    const sensors = useSensors(useSensor(PointerSensor));
    const [inputting, setInputting] = useState<boolean>(false);

    const debouncedOrderUpdate = useCallback(
        debouncePromise(async (newOrder: string[]) => {
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
        }, 10000),
        [],
    );

    // TODO : Function not debouncing, just delayed
    const orderMutation = useMutation({
        mutationFn: debouncedOrderUpdate,
        onMutate: async (newOrder: string[]) => {
            const previousOrder = data;
            dispatch({
                type: categoryActionKind.UPDATE_CATEGORIES,
                categoryIds: newOrder,
            });

            return { previousOrder };
        },
        onSuccess: () => {
            toast.success("Category order updated successfully", {
                position: "bottom-center",
            });
        },
        onError: (err, __, context) => {
            console.error(err);
            toast.error("Failed to update category order", {
                position: "bottom-center",
            });
            dispatch({
                type: categoryActionKind.UPDATE_CATEGORIES,
                categoryIds: context.previousOrder,
            });
        },
        scope: {
            id: `categories-scope`,
        },
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
                    index: data.length,
                }),
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }

            return response.json();
        },

        onSuccess: async (responseData) => {
            dispatch({
                type: categoryActionKind.ADD_CATEGORY,
                id: responseData.doc.id,
                name: responseData.doc.name,
                index: responseData.doc.index,
            });

            toast.success("Category created successfully", {
                position: "bottom-center",
            });
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
        scope: {
            id: `categories-scope`,
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
        const oldIndex = data.indexOf(e.active.id as string);
        const newIndex = data.indexOf(e.over.id as string);
        const newOrder = arrayMove(data, oldIndex, newIndex);
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
                        items={data}
                        strategy={verticalListSortingStrategy}
                        disabled={addMutation.isPending}
                    >
                        {data.map((catId) => (
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
