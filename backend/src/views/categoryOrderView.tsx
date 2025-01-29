import { AdminViewComponent } from "payload/config";
import { DefaultTemplate } from "payload/components/templates";
import { Redirect } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Gutter, Button } from "payload/components/elements";
import { LoadingOverlayToggle } from "payload/dist/admin/components/elements/Loading";
import { Category } from "../payload-types";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast, ToastContainer } from "react-toastify";

export type MyCategory = {
    name: string;
    id: string;
    initialIndex: number;
};

type State = {
    loading: boolean;
    error: string;
    categories: MyCategory[];
};

const initialState: State = {
    loading: true,
    error: "",
    categories: [],
};

const categoryOrderView: AdminViewComponent = ({ user }) => {
    if (user) {
        if (user.role !== "admin") {
            return (
                <DefaultTemplate>
                    Only admins can view this page
                </DefaultTemplate>
            );
        }
    } else {
        return <Redirect to="/admin/login" />;
    }

    const [state, setState] = useState<State>(initialState);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active.id !== over.id) {
            setState((state) => {
                const oldIndex = state.categories.findIndex(
                    (cat) => cat.id === active.id,
                );
                const newIndex = state.categories.findIndex(
                    (cat) => cat.id === over.id,
                );
                return {
                    loading: false,
                    error: "",
                    categories: arrayMove(state.categories, oldIndex, newIndex),
                };
            });
        }
    }
    useEffect(() => {
        const fetchCategories = async () => {
            const response = await fetch("/api/categories?limit=0", {
                credentials: "include",
            });
            if (response.status !== 200) {
                throw new Error("Failed to fetch categories");
            }
            const json = await response.json();
            const categories = json.docs as Category[];
            const extractedCategories = categories
                .sort((a, b) => a.index - b.index)
                .map((category) => ({
                    name: category.name,
                    id: category.id,
                    initialIndex: category.index,
                }));

            setState({
                loading: false,
                error: "",
                categories: extractedCategories,
            });
        };

        try {
            fetchCategories();
        } catch (error) {
            console.error(error);
            setState({
                loading: false,
                error: "Failed to fetch categories. Please refresh the page",
                categories: [],
            });
        }

        return () => {};
    }, []);

    async function onSave() {
        setState((state) => ({
            ...state,
            loading: true,
        }));

        // Custom endpoint
        const response = await fetch("/api/categories/reorder", {
            credentials: "include",
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(
                state.categories.map((cat, index) => {
                    return { id: cat.id, index };
                }),
            ),
        });

        if (response.status !== 200) {
            setState((state) => ({
                ...state,
                loading: false,
                error: "",
            }));
            toast.error("Failed to update order.", {
                position: "bottom-center",
            });
        } else {
            setState((state) => ({
                ...state,
                loading: false,
            }));
            toast.success("Order updated successfully.", {
                position: "bottom-center",
            });
        }
    }

    return (
        <>
            <LoadingOverlayToggle
                name="what"
                show={state.loading}
                type="withoutNav"
            />
            <DefaultTemplate>
                <Gutter>
                    <h1>Category Order</h1>
                    <p>Drag and drop to reorder categories</p>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={state.categories}
                            strategy={verticalListSortingStrategy}
                            disabled={state.loading}
                        >
                            {state.categories.map((cat) => (
                                <SortableItem
                                    key={cat.id}
                                    id={cat.id}
                                    name={cat.name}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                    {state.error && <p>{state.error}</p>}
                    <Button onClick={onSave}>Save</Button>
                    <ToastContainer />
                </Gutter>
            </DefaultTemplate>
        </>
    );
};

interface SortableItemProps {
    key: string;
    id: string;
    name: string;
}
function SortableItem(props: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="category-order__category"
        >
            <div className="category-order__draggable-icon">
                <div className="category-order__draggable-icon__line"></div>
                <div className="category-order__draggable-icon__line"></div>
                <div className="category-order__draggable-icon__line"></div>
            </div>
            {props.name}
        </div>
    );
}

export default categoryOrderView;
