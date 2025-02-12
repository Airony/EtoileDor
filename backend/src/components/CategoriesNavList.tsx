import React, { useContext, useEffect, useRef, useState } from "react";
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
import { useDebouncedCallback } from "../reactHooks/useDebounceCallback";

interface State {
    loading: boolean;
    inputting: boolean;
}

function CategoriesNavList() {
    const { data } = useContext(CategoriesContext);
    const dispatch = useContext(CategoriesDispatchContext);
    const sensors = useSensors(useSensor(PointerSensor));
    const [state, setState] = useState<State>({
        loading: false,
        inputting: false,
    });

    const [updateOrder, flushUpdateOrder] = useDebouncedCallback(
        async (newOrder: string[]) => {
            try {
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
                await new Promise((resolve) => setTimeout(resolve, 5000));
                if (!response.ok) {
                    throw new Error(await response.text());
                }
                toast.success("Category order updated successfully", {
                    position: "bottom-center",
                });
                // Dispatch
            } catch (error) {
                console.error(error);
                toast.error("Failed to update category order", {
                    position: "bottom-center",
                });
                setOrder(data);
            }
        },
        1000,
    );

    const [order, setOrder] = useState<string[]>(data);

    useEffect(() => {
        setOrder(data);
    }, [data]);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (state.inputting) {
            inputRef.current?.focus();
        }
        return () => {};
    }, [state.inputting]);

    function handleAddBtnPress() {
        if (state.loading) {
            return;
        }

        if (state.inputting) {
            inputRef.current?.focus();
            return;
        }
        setState({ loading: false, inputting: true });
    }

    function handleCancel() {
        setState({ loading: false, inputting: false });
    }

    async function handleSaveCategory(name: string) {
        flushUpdateOrder();
        setState({ loading: true, inputting: true });
        try {
            const index = data.length;
            const response = await fetch("/api/categories", {
                credentials: "include",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    index: index,
                }),
            });

            if (response.status !== 201) {
                console.error(await response.text());
                throw new Error();
            }
            const responseData = await response.json();
            if (!responseData.doc?.id) {
                throw new Error();
            }

            dispatch({
                type: categoryActionKind.ADD_CATEGORY,
                id: responseData.doc.id,
                name: name,
                index: index,
            });
            toast.success("Category created successfully", {
                position: "bottom-center",
            });
            setState({ loading: false, inputting: false });
        } catch (error) {
            toast.error("Failed to create category", {
                position: "bottom-center",
            });
            setState({ loading: false, inputting: false });
        }
    }

    function handleReorder(e: DragEndEvent) {
        if (!e.over) {
            return;
        }
        const oldIndex = order.indexOf(e.active.id as string);
        const newIndex = order.indexOf(e.over.id as string);
        const newOrder = arrayMove(order, oldIndex, newIndex);
        setOrder(newOrder);
        updateOrder(newOrder);
    }

    return (
        <div className="category-nav">
            <Button
                icon="plus"
                size="medium"
                aria-label="Add Category"
                buttonStyle="secondary"
                onClick={handleAddBtnPress}
                disabled={state.loading}
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
                        items={order}
                        strategy={verticalListSortingStrategy}
                        disabled={state.loading}
                    >
                        {order.map((catId) => (
                            <CategorySortableItem
                                key={catId}
                                id={catId}
                                sensors={sensors}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            {state.inputting && (
                <CategoryInput
                    onCancel={handleCancel}
                    onSave={handleSaveCategory}
                    inputRef={inputRef}
                    loading={state.loading}
                />
            )}
        </div>
    );
}

export default CategoriesNavList;
