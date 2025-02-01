import { createContext, useContext } from "react";
import { Category, SubCategory } from "../payload-types";
import { arrayMove } from "@dnd-kit/sortable";
import { Dispatch } from "react";

export const CategoriesContext = createContext<CategoriesState>(null);
export const CategoriesDispatchContext =
    createContext<Dispatch<categoryAction>>(null);

export enum categoryActionKind {
    LOADING = "LOADING",
    ERROR = "ERROR",
    FETCHED = "FETCHED",
    MOVE_CATEGORY = "MOVE_CATEGORY",
    MOVE_SUB_CATEGORY = "MOVE_SUB_CATEGORY",
    SAVED = "SAVED",
    CHANGE_SUB_CATEGORY_PARENT = "CHANGE_SUB_CATEGORY_PARENT",
    RENAME_SUB_CATEGORY = "RENAME_SUB_CATEGORY",
}

export type CategoryData = {
    name: string;
    id: string;
    initialIndex: number;
};

export type MyCategory = CategoryData & {
    SubCategories: CategoryData[];
};

export type CategoriesState = {
    loading: boolean;
    error: string;
    categories: MyCategory[];
};

export function CategoriesReducer(
    state: CategoriesState,
    action: categoryAction,
): CategoriesState {
    const { type } = action;
    switch (type) {
        case categoryActionKind.LOADING:
            return { ...state, loading: true, error: "" };
        case categoryActionKind.ERROR:
            return { ...state, loading: false, error: action.error };
        case categoryActionKind.FETCHED:
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
        case categoryActionKind.SAVED:
            return {
                ...state,
                loading: false,
                error: "",
            };
        case categoryActionKind.MOVE_CATEGORY:
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
        case categoryActionKind.MOVE_SUB_CATEGORY:
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
        case categoryActionKind.CHANGE_SUB_CATEGORY_PARENT:
            const { currentParentId, newParentId, subCategoryId } = action;
            const subCategory = state.categories
                .find((cat) => cat.id === currentParentId)
                .SubCategories.find((subCat) => subCat.id === subCategoryId);

            if (!subCategory) {
                return state;
            }
            if (currentParentId === newParentId) {
                return state;
            }
            return {
                ...state,
                categories: state.categories.map((cat) => {
                    if (cat.id === currentParentId) {
                        return {
                            ...cat,
                            SubCategories: cat.SubCategories.filter(
                                (subCat) => subCat.id !== subCategoryId,
                            ),
                        };
                    }
                    if (cat.id === newParentId) {
                        return {
                            ...cat,
                            SubCategories: [...cat.SubCategories, subCategory],
                        };
                    }
                    return cat;
                }),
            };

        case categoryActionKind.RENAME_SUB_CATEGORY:
            const { parentId, id, newName } = action;
            return {
                ...state,
                categories: state.categories.map((cat) => {
                    if (cat.id === parentId) {
                        return {
                            ...cat,
                            SubCategories: cat.SubCategories.map((subCat) => {
                                if (subCat.id === id) {
                                    return {
                                        ...subCat,
                                        name: newName,
                                    };
                                }
                                return subCat;
                            }),
                        };
                    }
                    return cat;
                }),
            };
        default:
            break;
    }
}

type categoryAction =
    | {
          type: categoryActionKind.ERROR;
          error: string;
      }
    | {
          type: categoryActionKind.LOADING | categoryActionKind.SAVED;
      }
    | {
          type: categoryActionKind.FETCHED;
          categories: Category[];
          subCategories: SubCategory[];
      }
    | {
          type: categoryActionKind.MOVE_CATEGORY;
          activeId: string;
          overId: string;
      }
    | {
          type: categoryActionKind.MOVE_SUB_CATEGORY;
          parentId: string;
          activeId: string;
          overId: string;
      }
    | {
          type: categoryActionKind.CHANGE_SUB_CATEGORY_PARENT;
          currentParentId: string;
          newParentId: string;
          subCategoryId: string;
      }
    | {
          type: categoryActionKind.RENAME_SUB_CATEGORY;
          id: string;
          parentId: string;
          newName: string;
      };

export function useCategories() {
    return useContext(CategoriesContext);
}

export function useCategoriesDispatch() {
    return useContext(CategoriesDispatchContext);
}
