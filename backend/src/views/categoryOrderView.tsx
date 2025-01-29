import { AdminViewComponent } from "payload/config";
import { DefaultTemplate } from "payload/components/templates";
import { Redirect } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Gutter } from "payload/components/elements";
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

type MyCategory = {
    name: string;
    id: string;
};

type State = {
    loading: boolean;
    error: boolean;
    categories: MyCategory[];
};

const initialState: State = {
    loading: true,
    error: false,
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
                    error: false,
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
            setState({
                loading: false,
                error: false,
                categories: categories
                    .sort((a, b) => a.index - b.index)
                    .map((category) => ({
                        name: category.name,
                        id: category.id,
                    })),
            });
        };
        try {
            fetchCategories();
        } catch (error) {
            console.error(error);
            setState({
                loading: false,
                error: true,
                categories: [],
            });
        }

        return () => {};
    }, []);

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
                    <ul>{state.error && <li>Error fetching Categories</li>}</ul>
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
