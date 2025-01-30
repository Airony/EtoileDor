import React from "react";
import { AdminViewComponent } from "payload/config";
import { DefaultTemplate } from "payload/components/templates";
import { Redirect } from "react-router-dom";
import { useEffect, useState } from "react";
import { Gutter, Button } from "payload/components/elements";
import { LoadingOverlayToggle } from "payload/dist/admin/components/elements/Loading";
import { Category, SubCategory } from "../payload-types";
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
import { toast, ToastContainer } from "react-toastify";
import {
    restrictToParentElement,
    restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import CategorySortableItem from "../components/CategorySortableItem";

export type CategoryData = {
    name: string;
    id: string;
    initialIndex: number;
    collapsed: boolean;
};

type MyCategory = CategoryData & {
    SubCategories: CategoryData[];
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
    const sensors = useSensors(useSensor(PointerSensor));

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
            const categoriesResponse = await fetch("/api/categories?limit=0", {
                credentials: "include",
            });
            if (categoriesResponse.status !== 200) {
                throw new Error("Failed to fetch categories");
            }
            const json = await categoriesResponse.json();

            const subCategoriesResponse = await fetch(
                "/api/sub_categories?limit=0&depth=1",
                {
                    credentials: "include",
                },
            );
            if (subCategoriesResponse.status !== 200) {
                throw new Error("Failed to fetch sub categories");
            }
            const subCategoriesJson = await subCategoriesResponse.json();

            const categories = json.docs as Category[];
            const subCategories = subCategoriesJson.docs as SubCategory[];

            const extractedCategories: MyCategory[] = categories
                .sort((a, b) => a.index - b.index)
                .map((category) => ({
                    name: category.name,
                    id: category.id,
                    initialIndex: category.index,
                    SubCategories: [],
                    collapsed: false,
                }));

            subCategories.forEach((subCategory) => {
                const parentCaregoryId = (
                    subCategory.category.value as Category
                ).id;

                // Insert subcategory into parent category
                const index = extractedCategories.findIndex(
                    (cat) => cat.id === parentCaregoryId,
                );
                if (index >= 0) {
                    extractedCategories[index].SubCategories.push({
                        name: subCategory.name,
                        id: subCategory.id,
                        initialIndex: subCategory.index,
                        collapsed: false,
                    });
                }
            });

            extractedCategories.forEach((cat) => {
                cat.SubCategories.sort(
                    (a, b) => a.initialIndex - b.initialIndex,
                );
            });

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

    function handleSubCategoryDragEnd(id: string, event: DragEndEvent) {
        const { active, over } = event;
        const parentCategory = state.categories.find((cat) => cat.id === id);
        const activeIndex = parentCategory.SubCategories.findIndex(
            (cat) => cat.id === active.id,
        );
        const overIndex = parentCategory.SubCategories.findIndex(
            (cat) => cat.id === over.id,
        );

        return setState((state) => {
            return {
                ...state,
                categories: state.categories.map((cat) => {
                    if (cat.id === id) {
                        return {
                            ...cat,
                            SubCategories: arrayMove(
                                cat.SubCategories,
                                activeIndex,
                                overIndex,
                            ),
                        };
                    }
                    return cat;
                }),
            };
        });
    }

    function handleCategoryCollapseToggle(id: string): void {
        setState((state) => ({
            ...state,
            categories: state.categories.map((cat) => {
                if (cat.id === id) {
                    return {
                        ...cat,
                        collapsed: !cat.collapsed,
                    };
                }
                return cat;
            }),
        }));
    }
    return (
        <>
            <LoadingOverlayToggle
                name="category-order"
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
                        modifiers={[
                            restrictToVerticalAxis,
                            restrictToParentElement,
                        ]}
                    >
                        <SortableContext
                            items={state.categories}
                            strategy={verticalListSortingStrategy}
                            disabled={state.loading}
                        >
                            {state.categories.map((cat) => (
                                <CategorySortableItem
                                    key={cat.id}
                                    id={cat.id}
                                    name={cat.name}
                                    sensors={sensors}
                                    subCategories={cat.SubCategories || []}
                                    handleSubCategoryDragEnd={(event) => {
                                        handleSubCategoryDragEnd(cat.id, event);
                                    }}
                                    collapsed={cat.collapsed}
                                    onCollapseToggle={() => {
                                        handleCategoryCollapseToggle(cat.id);
                                    }}
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

export default categoryOrderView;
