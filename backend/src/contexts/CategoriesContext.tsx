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
    DELETE_SUB_CATEGORY = "DELETE_SUB_CATEGORY",
}

export type MenuItemData = {
    name: string;
    price: number;
    initialIndex: number;
};
export type CategoryData = {
    name: string;
    menuItemsIds: string[];
    initialIndex: number;
};

export type MyCategory = CategoryData & {
    SubCategoriesIds: string[];
};

export type CategoriesState = {
    loading: boolean;
    error: string;
    data: string[];
    categories: Map<string, MyCategory>;
    subCategories: Map<string, CategoryData>;
    menuItems: Map<string, MenuItemData>;
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
            const elements = [];

            // Put each subcategory into its parent category
            const extractedCategories: Map<string, MyCategory> = new Map(
                categories.map((cat) => {
                    elements.push(cat.id);
                    return [
                        cat.id,
                        {
                            name: cat.name,
                            menuItemsIds: [],
                            SubCategoriesIds: [],
                            initialIndex: cat.index,
                        },
                    ];
                }),
            );

            const extractedSubCategories: Map<string, CategoryData> = new Map(
                subCategories.map((subCat) => {
                    const parentCaregoryId = (subCat.category.value as Category)
                        .id;
                    extractedCategories
                        .get(parentCaregoryId)
                        .SubCategoriesIds.push(subCat.id);
                    return [
                        subCat.id,
                        {
                            name: subCat.name,
                            menuItemsIds: [],
                            initialIndex: subCat.index,
                        },
                    ];
                }),
            );

            const extractedMenuItem: Map<string, MenuItemData> = new Map(
                menuItems.map((item) => {
                    if (item.Category.relationTo === "categories") {
                        const parentCategoryId = item.Category.value as string;
                        extractedCategories
                            .get(parentCategoryId)
                            .menuItemsIds.push(item.id);
                    } else {
                        const parentSubCategoryId = item.Category
                            .value as string;
                        extractedSubCategories
                            .get(parentSubCategoryId)
                            .menuItemsIds.push(item.id);
                    }
                    return [
                        item.id,
                        {
                            name: item.name,
                            price: item.price,
                            initialIndex: item.index,
                        },
                    ];
                }),
            );

            elements.sort((a, b) => {
                return (
                    extractedCategories.get(a).initialIndex -
                    extractedCategories.get(b).initialIndex
                );
            });

            extractedCategories.forEach((cat) => {
                cat.SubCategoriesIds.sort((a, b) => {
                    return (
                        extractedSubCategories.get(a).initialIndex -
                        extractedSubCategories.get(b).initialIndex
                    );
                });
                cat.menuItemsIds.sort((a, b) => {
                    return (
                        extractedMenuItem.get(a).initialIndex -
                        extractedMenuItem.get(b).initialIndex
                    );
                });
            });

            extractedSubCategories.forEach((subCat) => {
                subCat.menuItemsIds.sort((a, b) => {
                    return (
                        extractedMenuItem.get(a).initialIndex -
                        extractedMenuItem.get(b).initialIndex
                    );
                });
            });

            return {
                error: "",
                loading: false,
                categories: extractedCategories,
                subCategories: extractedSubCategories,
                menuItems: extractedMenuItem,
                data: elements,
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
                data: arrayMoveWithId(
                    state.data,
                    action.activeId,
                    action.overId,
                ),
            };
        case categoryActionKind.MOVE_SUB_CATEGORY: {
            const { parentId, activeId, overId } = action;
            const newCategories = MapSet(state.categories, parentId, (cat) => ({
                ...cat,
                SubCategoriesIds: arrayMoveWithId(
                    cat.SubCategoriesIds,
                    activeId,
                    overId,
                ),
            }));

            return {
                ...state,
                categories: newCategories,
            };
        }
        case categoryActionKind.CHANGE_SUB_CATEGORY_PARENT: {
            const { currentParentId, newParentId, subCategoryId } = action;

            if (currentParentId === newParentId) {
                return state;
            }

            const currentParentCat = state.categories.get(currentParentId);
            const newParentCat = state.categories.get(newParentId);
            if (!currentParentCat || !newParentCat) {
                return state;
            }

            const newCategories = MapSet(
                state.categories,
                currentParentId,
                (cat) => ({
                    ...cat,
                    SubCategoriesIds: cat.SubCategoriesIds.filter(
                        (subCat) => subCat !== subCategoryId,
                    ),
                }),
            ).set(newParentId, {
                ...newParentCat,
                SubCategoriesIds: [
                    ...newParentCat.SubCategoriesIds,
                    subCategoryId,
                ],
            });

            return {
                ...state,
                categories: newCategories,
            };
        }

        case categoryActionKind.RENAME_SUB_CATEGORY: {
            const { id, newName } = action;
            const newSubCategories = MapSet(
                state.subCategories,
                id,
                (subCat) => ({ ...subCat, name: newName }),
            );
            return {
                ...state,
                subCategories: newSubCategories,
            };
        }

        case categoryActionKind.RENAME_CATEGORY: {
            const { id, newName } = action;
            const newCategories = MapSet(state.categories, id, (cat) => ({
                ...cat,
                name: newName,
            }));
            return {
                ...state,
                categories: newCategories,
            };
        }

        case categoryActionKind.ADD_SUB_CATEGORY: {
            const { parentId, id, index, name } = action;

            const newCategories = MapSet(state.categories, parentId, (cat) => ({
                ...cat,
                SubCategoriesIds: [...cat.SubCategoriesIds, id],
            }));

            const newSubCategories = MapSet(state.subCategories, id, () => ({
                name: name,
                initialIndex: index,
                menuItemsIds: [],
            }));

            return {
                ...state,
                categories: newCategories,
                subCategories: newSubCategories,
            };
        }

        case categoryActionKind.ADD_CATEGORY: {
            const { id, name, index } = action;
            const newData = [...state.data, id];
            const newCategories = MapSet(state.categories, id, () => ({
                // TODO: Handle newly inputted category state
                name: name,
                initialIndex: index,
                SubCategoriesIds: [],
                menuItemsIds: [],
            }));

            return {
                ...state,
                data: newData,
                categories: newCategories,
            };
        }

        case categoryActionKind.MOVE_MENU_ITEM: {
            const { activeId, overId, parentId } = action;
            if (state.categories.has(parentId)) {
                const newCategories = MapSet(
                    state.categories,
                    parentId,
                    (cat) => ({
                        ...cat,
                        menuItemsIds: arrayMoveWithId(
                            cat.menuItemsIds,
                            activeId,
                            overId,
                        ),
                    }),
                );
                return {
                    ...state,
                    categories: newCategories,
                };
            } else {
                const newSubCategories = MapSet(
                    state.subCategories,
                    parentId,
                    (cat) => ({
                        ...cat,
                        menuItemsIds: arrayMoveWithId(
                            cat.menuItemsIds,
                            activeId,
                            overId,
                        ),
                    }),
                );
                return {
                    ...state,
                    subCategories: newSubCategories,
                };
            }
        }
        case categoryActionKind.DELETE_CATEGORY: {
            const { id } = action;
            const category = state.categories.get(id);
            const newMenuItems = new Map(state.menuItems);
            const newSubCategories = new Map(state.subCategories);

            category.menuItemsIds.forEach((itemId) => {
                newMenuItems.delete(itemId);
            });

            category.SubCategoriesIds.forEach((subCatId) => {
                deleteSubCategory(newSubCategories, newMenuItems, subCatId);
            });

            const newCategories = new Map(state.categories);
            newCategories.delete(id);

            const newData = state.data.filter((dataId) => dataId !== id);

            return {
                ...state,
                data: newData,
                categories: newCategories,
                subCategories: newSubCategories,
                menuItems: newMenuItems,
            };
        }
        case categoryActionKind.DELETE_SUB_CATEGORY: {
            const { id, parentId } = action;
            const newMenuItems = new Map(state.menuItems);
            deleteSubCategory(state.subCategories, newMenuItems, id);
            const newCategories = MapSet(state.categories, parentId, (cat) => ({
                ...cat,
                SubCategoriesIds: cat.SubCategoriesIds.filter(
                    (subCatId) => subCatId !== id,
                ),
            }));

            return {
                ...state,
                categories: newCategories,
                menuItems: newMenuItems,
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
          id: string;
          index: number;
          name: string;
      }
    | {
          type: categoryActionKind.ADD_CATEGORY;
          id: string;
          name: string;
          index: number;
      }
    | {
          type: categoryActionKind.MOVE_MENU_ITEM;
          activeId: string;
          overId: string;
          parentId: string;
      }
    | {
          type: categoryActionKind.DELETE_CATEGORY;
          id: string;
      }
    | {
          type: categoryActionKind.DELETE_SUB_CATEGORY;
          id: string;
          parentId: string;
      };

export function useCategories() {
    return useContext(CategoriesContext);
}

export function useCategoriesDispatch() {
    return useContext(CategoriesDispatchContext);
}

function arrayMoveWithId(arr: Array<string>, fromId: string, toId: string) {
    const fromIndex = arr.findIndex((item) => item === fromId);
    const toIndex = arr.findIndex((item) => item === toId);
    return arrayMove(arr, fromIndex, toIndex);
}

function MapSet<T, U>(map: Map<T, U>, key: T, updateFunc: (value: U) => U) {
    return new Map(map).set(key, updateFunc(map.get(key)));
}

function deleteSubCategory(
    subCategories: Map<string, CategoryData>,
    menuItems: Map<string, MenuItemData>,
    id: string,
): void {
    const subCat = subCategories.get(id);
    subCat.menuItemsIds.forEach((itemId) => {
        menuItems.delete(itemId);
    });
    subCategories.delete(id);
}
