import React from "react";
import { AdminViewComponent } from "payload/config";
import { DefaultTemplate } from "payload/components/templates";
import { Redirect } from "react-router-dom";
import { useEffect, useReducer } from "react";
import { Gutter, Button } from "payload/components/elements";
import { LoadingOverlayToggle } from "payload/dist/admin/components/elements/Loading";
import { Category, SubCategory } from "../payload-types";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
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

enum deployActionKind {
    LOADING = "LOADING",
    ERROR = "ERROR",
    FETCHED = "FETCHED",
    COLLAPSED = "COLLAPSED",
    MOVE_CATEGORY = "MOVE_CATEGORY",
    MOVE_SUB_CATEGORY = "MOVE_SUB_CATEGORY",
    SAVED = "SAVED",
}

function Reducer(state: State, action: deployAction): State {
    const { type } = action;
    switch (type) {
        case deployActionKind.LOADING:
            return { ...state, loading: true, error: "" };
        case deployActionKind.ERROR:
            return { ...state, loading: false, error: action.error };
        case deployActionKind.FETCHED:
            // This is gonna be long
            const { categories, subCategories } = action;

            // Put each subcategory into its parent category
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

            return {
                error: "",
                loading: false,
                categories: extractedCategories,
            };
        case deployActionKind.SAVED:
            return {
                ...state,
                loading: false,
                error: "",
            };
        case deployActionKind.COLLAPSED:
            return {
                ...state,
                categories: state.categories.map((cat) => {
                    if (cat.id === action.id) {
                        return {
                            ...cat,
                            collapsed: !cat.collapsed,
                        };
                    }
                    return cat;
                }),
            };

        case deployActionKind.MOVE_CATEGORY:
            return {
                ...state,
                categories: arrayMove(
                    state.categories,
                    state.categories.findIndex(
                        (cat) => cat.id === action.activeId,
                    ),
                    state.categories.findIndex(
                        (cat) => cat.id === action.overId,
                    ),
                ),
            };
        case deployActionKind.MOVE_SUB_CATEGORY:
            return {
                ...state,
                categories: state.categories.map((cat) => {
                    if (cat.id === action.parentId) {
                        return {
                            ...cat,
                            SubCategories: arrayMove(
                                cat.SubCategories,
                                cat.SubCategories.findIndex(
                                    (subCat) => subCat.id === action.activeId,
                                ),
                                cat.SubCategories.findIndex(
                                    (subCat) => subCat.id === action.overId,
                                ),
                            ),
                        };
                    }
                    return cat;
                }),
            };

        default:
            break;
    }
}

type deployAction =
    | {
          type: deployActionKind.ERROR;
          error: string;
      }
    | {
          type: deployActionKind.LOADING | deployActionKind.SAVED;
      }
    | {
          type: deployActionKind.FETCHED;
          categories: Category[];
          subCategories: SubCategory[];
      }
    | {
          type: deployActionKind.COLLAPSED;
          id: string;
      }
    | {
          type: deployActionKind.MOVE_CATEGORY;
          activeId: string;
          overId: string;
      }
    | {
          type: deployActionKind.MOVE_SUB_CATEGORY;
          parentId: string;
          activeId: string;
          overId: string;
      };

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

    const [state, dispatch] = useReducer(Reducer, initialState);
    const sensors = useSensors(useSensor(PointerSensor));

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

            dispatch({
                type: deployActionKind.FETCHED,
                categories,
                subCategories,
            });
        };

        try {
            fetchCategories();
        } catch (error) {
            dispatch({
                type: deployActionKind.ERROR,
                error: "Failed to fetch categories. Please refresh the page",
            });
        }

        return () => {};
    }, []);

    async function onSave() {
        dispatch({ type: deployActionKind.LOADING });

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
            dispatch({
                type: deployActionKind.ERROR,
                error: "",
            });
            toast.error("Failed to update order.", {
                position: "bottom-center",
            });
        } else {
            dispatch({ type: deployActionKind.SAVED });
            toast.success("Order updated successfully.", {
                position: "bottom-center",
            });
        }
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
                        onDragEnd={(e) => {
                            dispatch({
                                type: deployActionKind.MOVE_CATEGORY,
                                activeId: e.active.id.toString(),
                                overId: e.over.id.toString(),
                            });
                        }}
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
                                        dispatch({
                                            type: deployActionKind.MOVE_SUB_CATEGORY,
                                            parentId: cat.id,
                                            activeId:
                                                event.active.id.toString(),
                                            overId: event.over.id.toString(),
                                        });
                                    }}
                                    collapsed={cat.collapsed}
                                    onCollapseToggle={() => {
                                        dispatch({
                                            type: deployActionKind.COLLAPSED,
                                            id: cat.id,
                                        });
                                    }}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    {state.error && <p>{state.error}</p>}
                    <Button onClick={onSave} disabled={state.loading}>
                        Save
                    </Button>
                    <ToastContainer />
                </Gutter>
            </DefaultTemplate>
        </>
    );
};

export default categoryOrderView;
