import { createContext, useContext } from "react";
import { Category, MenuItem, SubCategory } from "../payload-types";
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
    RENAME_CATEGORY = "RENAME_CATEGORY",
    ADD_SUB_CATEGORY = "ADD_SUB_CATEGORY",
    ADD_CATEGORY = "ADD_CATEGORY",
    MOVE_MENU_ITEM = "MOVE_MENU_ITEM",
    DELETE_CATEGORY = "DELETE_CATEGORY",
}

export type MenuItemData = {
    name: string;
    id: string;
    iniitalIndex: number;
    price: number;
    parentType: "category" | "sub_category";
    parentId: string;
};
export type CategoryData = {
    name: string;
    id: string;
    initialIndex: number;
    menuItems: MenuItemData[];
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
            const { categories, subCategories, menuItems } = action;

            // Put each subcategory into its parent category
            const extractedCategories: MyCategory[] = categories
                .sort((a, b) => a.index - b.index)
                .map((category) => ({
                    name: category.name,
                    id: category.id,
                    initialIndex: category.index,
                    SubCategories: [],
                    menuItems: [],
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
                        menuItems: [],
                    });
                }
            });

            menuItems.forEach((item) => {
                if (item.Category.relationTo === "categories") {
                    extractedCategories
                        .find((cat) => cat.id === item.Category.value)
                        .menuItems.push({
                            name: item.name,
                            id: item.id,
                            iniitalIndex: item.index,
                            price: item.price,
                            parentType: "category",
                            parentId:
                                (item.Category.value as Category).id ||
                                (item.Category.value as string),
                        });
                } else {
                    for (const cat of extractedCategories) {
                        const subCat = cat.SubCategories.find(
                            (cat) => cat.id === item.Category.value,
                        );
                        if (subCat) {
                            subCat.menuItems.push({
                                name: item.name,
                                id: item.id,
                                iniitalIndex: item.index,
                                price: item.price,
                                parentType: "sub_category",
                                parentId: subCat.id,
                            });
                            break;
                        }
                    }
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

        case categoryActionKind.RENAME_SUB_CATEGORY: {
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
        }

        case categoryActionKind.RENAME_CATEGORY: {
            const { id, newName } = action;
            return {
                ...state,
                categories: state.categories.map((cat) => {
                    if (cat.id === id) {
                        return {
                            ...cat,
                            name: newName,
                        };
                    }
                    return cat;
                }),
            };
        }

        case categoryActionKind.ADD_SUB_CATEGORY: {
            const { parentId } = action;
            return {
                ...state,
                categories: state.categories.map((cat) => {
                    if (cat.id === parentId) {
                        return {
                            ...cat,
                            SubCategories: [
                                ...cat.SubCategories,
                                {
                                    name: "",
                                    id: Math.random().toString(), // TODO: Figure out something for the id
                                    initialIndex: cat.SubCategories.length,
                                    menuItems: [],
                                },
                            ],
                        };
                    }
                    return cat;
                }),
            };
        }

        case categoryActionKind.ADD_CATEGORY: {
            return {
                ...state,
                categories: [
                    ...state.categories,
                    {
                        name: "",
                        id: Math.random().toString(), // TODO: Figure out something for the id
                        initialIndex: state.categories.length,
                        SubCategories: [],
                        menuItems: [],
                    },
                ],
            };
        }

        case categoryActionKind.MOVE_MENU_ITEM: {
            const { activeId, overId, parentId, parentType } = action;
            if (parentType === "category") {
                return {
                    ...state,
                    categories: state.categories.map((cat) => {
                        if (cat.id === parentId) {
                            return {
                                ...cat,
                                menuItems: arrayMove(
                                    cat.menuItems,
                                    cat.menuItems.findIndex(
                                        (item) => item.id === activeId,
                                    ),
                                    cat.menuItems.findIndex(
                                        (item) => item.id === overId,
                                    ),
                                ),
                            };
                        }
                        return cat;
                    }),
                };
            } else {
                // Find the subcategory
                return {
                    ...state,
                    categories: state.categories.map((cat) => {
                        const subCat = cat.SubCategories.find(
                            (sb) => sb.id === parentId,
                        );
                        if (subCat) {
                            return {
                                ...cat,
                                SubCategories: cat.SubCategories.map((sb) => {
                                    if (sb.id === parentId) {
                                        return {
                                            ...sb,
                                            menuItems: arrayMove(
                                                sb.menuItems,
                                                sb.menuItems.findIndex(
                                                    (item) =>
                                                        item.id === activeId,
                                                ),
                                                sb.menuItems.findIndex(
                                                    (item) =>
                                                        item.id === overId,
                                                ),
                                            ),
                                        };
                                    }
                                    return sb;
                                }),
                            };
                        }
                        return cat;
                    }),
                };
            }
        }
        case categoryActionKind.DELETE_CATEGORY: {
            const { id } = action;
            return {
                ...state,
                categories: state.categories.filter((cat) => cat.id !== id),
            };
        }
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
          menuItems: MenuItem[];
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
      }
    | {
          type: categoryActionKind.RENAME_CATEGORY;
          id: string;
          newName: string;
      }
    | {
          type: categoryActionKind.ADD_SUB_CATEGORY;
          parentId: string;
      }
    | {
          type: categoryActionKind.ADD_CATEGORY;
      }
    | {
          type: categoryActionKind.MOVE_MENU_ITEM;
          activeId: string;
          overId: string;
          parentType: "category" | "sub_category";
          parentId: string;
      }
    | {
          type: categoryActionKind.DELETE_CATEGORY;
          id: string;
      };

export function useCategories() {
    return useContext(CategoriesContext);
}

export function useCategoriesDispatch() {
    return useContext(CategoriesDispatchContext);
}
