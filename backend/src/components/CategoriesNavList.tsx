import React, { useContext, useEffect, useRef, useState } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import {
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

interface State {
    loading: boolean;
    inputting: boolean;
}

function CategoriesNavList() {
    const { data, loading } = useContext(CategoriesContext);
    const dispatch = useContext(CategoriesDispatchContext);
    const sensors = useSensors(useSensor(PointerSensor));
    const [state, setState] = useState<State>({
        loading: false,
        inputting: false,
    });

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

    return (
        <div>
            <Button
                icon="plus"
                size="medium"
                aria-label="Add Category"
                buttonStyle="secondary"
                onClick={handleAddBtnPress}
                disabled={loading}
            >
                Add Category
            </Button>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => {
                    if (!e.over) {
                        return;
                    }
                    dispatch({
                        type: categoryActionKind.MOVE_CATEGORY,
                        activeId: e.active.id.toString(),
                        overId: e.over.id.toString(),
                    });
                }}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
                <SortableContext
                    items={data}
                    strategy={verticalListSortingStrategy}
                    disabled={loading}
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
