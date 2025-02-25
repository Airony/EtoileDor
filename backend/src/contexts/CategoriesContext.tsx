// import { createContext, useContext } from "react";
// import { Category, MenuItem, SubCategory } from "../payload-types";
// import { arrayMove } from "@dnd-kit/sortable";
// import { Dispatch } from "react";

// export const CategoriesContext = createContext<CategoriesState>(null);
// export const CategoriesDispatchContext =
//     createContext<Dispatch<categoryAction>>(null);

// export enum categoryActionKind {
//     LOADING = "LOADING",
//     ERROR = "ERROR",
//     FETCHED = "FETCHED",
//     UPDATE_CATEGORIES = "MOVE_CATEGORY",
//     MOVE_SUB_CATEGORY = "MOVE_SUB_CATEGORY",
//     SAVED = "SAVED",
//     CHANGE_SUB_CATEGORY_PARENT = "CHANGE_SUB_CATEGORY_PARENT",
//     RENAME_SUB_CATEGORY = "RENAME_SUB_CATEGORY",
//     RENAME_CATEGORY = "RENAME_CATEGORY",
//     ADD_SUB_CATEGORY = "ADD_SUB_CATEGORY",
//     ADD_CATEGORY = "ADD_CATEGORY",
//     MOVE_MENU_ITEM = "MOVE_MENU_ITEM",
//     DELETE_CATEGORY = "DELETE_CATEGORY",
//     DELETE_SUB_CATEGORY = "DELETE_SUB_CATEGORY",
//     ADD_MENU_ITEM = "ADD_MENU_ITEM",
//     UPDATE_MENU_ITEM = "UPDATE_MENU_ITEM",
//     CHANGE_MENU_ITEM_PARENT = "CHANGE_MENU_ITEM_PARENT",
//     DELETE_MENU_ITEM = "DELETE_MENU_ITEM",
// }

// export type MenuItemData = {
//     name: string;
//     price: number;
//     initialIndex: number;
// };
// export type CategoryData = {
//     name: string;
//     menuItems: string[];
//     initialIndex: number;
// };

// export type MyCategory = CategoryData & {
//     subCategories: string[];
// };

// export type CategoriesState = {
//     loading: boolean;
//     error: string;
//     data: string[];
//     categories: Map<string, MyCategory>;
//     subCategories: Map<string, CategoryData>;
//     menuItems: Map<string, MenuItemData>;
// };

// export function CategoriesReducer(
//     state: CategoriesState,
//     action: categoryAction,
// ): CategoriesState {
//     const { type } = action;
//     switch (type) {
//         case categoryActionKind.LOADING:
//             return { ...state, loading: true, error: "" };
//         case categoryActionKind.ERROR:
//             return { ...state, loading: false, error: action.error };
//         case categoryActionKind.FETCHED:
//             // This is gonna be long
//             const { categories, subCategories, menuItems } = action;
//             const elements = [];

//             // Put each subcategory into its parent category
//             const extractedCategories: Map<string, MyCategory> = new Map(
//                 categories.map((cat) => {
//                     elements.push(cat.id);
//                     return [
//                         cat.id,
//                         {
//                             name: cat.name,
//                             menuItems: [],
//                             subCategories: [],
//                             initialIndex: cat.index,
//                         },
//                     ];
//                 }),
//             );

//             const extractedSubCategories: Map<string, CategoryData> = new Map(
//                 subCategories.map((subCat) => {
//                     const parentCaregoryId = (subCat.category.value as Category)
//                         .id;
//                     extractedCategories
//                         .get(parentCaregoryId)
//                         .subCategories.push(subCat.id);
//                     return [
//                         subCat.id,
//                         {
//                             name: subCat.name,
//                             menuItems: [],
//                             initialIndex: subCat.index,
//                         },
//                     ];
//                 }),
//             );

//             const extractedMenuItem: Map<string, MenuItemData> = new Map(
//                 menuItems.map((item) => {
//                     if (item.Category.relationTo === "categories") {
//                         const parentCategoryId = item.Category.value as string;
//                         extractedCategories
//                             .get(parentCategoryId)
//                             .menuItems.push(item.id);
//                     } else {
//                         const parentSubCategoryId = item.Category
//                             .value as string;
//                         extractedSubCategories
//                             .get(parentSubCategoryId)
//                             .menuItems.push(item.id);
//                     }
//                     return [
//                         item.id,
//                         {
//                             name: item.name,
//                             price: item.price,
//                             initialIndex: item.index,
//                         },
//                     ];
//                 }),
//             );

//             elements.sort((a, b) => {
//                 return (
//                     extractedCategories.get(a).initialIndex -
//                     extractedCategories.get(b).initialIndex
//                 );
//             });

//             extractedCategories.forEach((cat) => {
//                 cat.subCategories.sort((a, b) => {
//                     return (
//                         extractedSubCategories.get(a).initialIndex -
//                         extractedSubCategories.get(b).initialIndex
//                     );
//                 });
//                 cat.menuItems.sort((a, b) => {
//                     return (
//                         extractedMenuItem.get(a).initialIndex -
//                         extractedMenuItem.get(b).initialIndex
//                     );
//                 });
//             });

//             extractedSubCategories.forEach((subCat) => {
//                 subCat.menuItems.sort((a, b) => {
//                     return (
//                         extractedMenuItem.get(a).initialIndex -
//                         extractedMenuItem.get(b).initialIndex
//                     );
//                 });
//             });

//             return {
//                 error: "",
//                 loading: false,
//                 categories: extractedCategories,
//                 subCategories: extractedSubCategories,
//                 menuItems: extractedMenuItem,
//                 data: elements,
//             };
//         case categoryActionKind.SAVED:
//             return {
//                 ...state,
//                 loading: false,
//                 error: "",
//             };
//         case categoryActionKind.UPDATE_CATEGORIES:
//             const { categoryIds: data } = action;
//             return {
//                 ...state,
//                 data,
//             };
//         case categoryActionKind.MOVE_SUB_CATEGORY: {
//             const { parentId, activeId, overId } = action;
//             const newCategories = MapSet(state.categories, parentId, (cat) => ({
//                 ...cat,
//                 subCategories: arrayMoveWithId(
//                     cat.subCategories,
//                     activeId,
//                     overId,
//                 ),
//             }));

//             return {
//                 ...state,
//                 categories: newCategories,
//             };
//         }
//         case categoryActionKind.CHANGE_SUB_CATEGORY_PARENT: {
//             const { currentParentId, newParentId, subCategoryId } = action;

//             if (currentParentId === newParentId) {
//                 return state;
//             }

//             const currentParentCat = state.categories.get(currentParentId);
//             const newParentCat = state.categories.get(newParentId);
//             if (!currentParentCat || !newParentCat) {
//                 return state;
//             }

//             const newCategories = MapSet(
//                 state.categories,
//                 currentParentId,
//                 (cat) => ({
//                     ...cat,
//                     subCategories: cat.subCategories.filter(
//                         (subCat) => subCat !== subCategoryId,
//                     ),
//                 }),
//             ).set(newParentId, {
//                 ...newParentCat,
//                 subCategories: [...newParentCat.subCategories, subCategoryId],
//             });

//             return {
//                 ...state,
//                 categories: newCategories,
//             };
//         }

//         case categoryActionKind.RENAME_SUB_CATEGORY: {
//             const { id, newName } = action;
//             const newSubCategories = MapSet(
//                 state.subCategories,
//                 id,
//                 (subCat) => ({ ...subCat, name: newName }),
//             );
//             return {
//                 ...state,
//                 subCategories: newSubCategories,
//             };
//         }

//         case categoryActionKind.RENAME_CATEGORY: {
//             const { id, newName } = action;
//             const newCategories = MapSet(state.categories, id, (cat) => ({
//                 ...cat,
//                 name: newName,
//             }));
//             return {
//                 ...state,
//                 categories: newCategories,
//             };
//         }

//         case categoryActionKind.ADD_SUB_CATEGORY: {
//             const { parentId, id, index, name } = action;

//             const newCategories = MapSet(state.categories, parentId, (cat) => ({
//                 ...cat,
//                 subCategories: [...cat.subCategories, id],
//             }));

//             const newSubCategories = MapSet(state.subCategories, id, () => ({
//                 name: name,
//                 initialIndex: index,
//                 menuItems: [],
//             }));

//             return {
//                 ...state,
//                 categories: newCategories,
//                 subCategories: newSubCategories,
//             };
//         }

//         case categoryActionKind.ADD_CATEGORY: {
//             const { id, name, index } = action;
//             const newData = [...state.data, id];
//             const newCategories = MapSet(state.categories, id, () => ({
//                 // TODO: Handle newly inputted category state
//                 name: name,
//                 initialIndex: index,
//                 subCategories: [],
//                 menuItems: [],
//             }));

//             return {
//                 ...state,
//                 data: newData,
//                 categories: newCategories,
//             };
//         }

//         case categoryActionKind.MOVE_MENU_ITEM: {
//             const { activeId, overId, parentId } = action;
//             if (state.categories.has(parentId)) {
//                 const newCategories = MapSet(
//                     state.categories,
//                     parentId,
//                     (cat) => ({
//                         ...cat,
//                         menuItems: arrayMoveWithId(
//                             cat.menuItems,
//                             activeId,
//                             overId,
//                         ),
//                     }),
//                 );
//                 return {
//                     ...state,
//                     categories: newCategories,
//                 };
//             } else {
//                 const newSubCategories = MapSet(
//                     state.subCategories,
//                     parentId,
//                     (cat) => ({
//                         ...cat,
//                         menuItems: arrayMoveWithId(
//                             cat.menuItems,
//                             activeId,
//                             overId,
//                         ),
//                     }),
//                 );
//                 return {
//                     ...state,
//                     subCategories: newSubCategories,
//                 };
//             }
//         }
//         case categoryActionKind.DELETE_CATEGORY: {
//             const { id } = action;
//             const category = state.categories.get(id);
//             const newMenuItems = new Map(state.menuItems);
//             const newSubCategories = new Map(state.subCategories);

//             category.menuItems.forEach((itemId) => {
//                 newMenuItems.delete(itemId);
//             });

//             category.subCategories.forEach((subCatId) => {
//                 deleteSubCategory(newSubCategories, newMenuItems, subCatId);
//             });

//             const newCategories = new Map(state.categories);
//             newCategories.delete(id);

//             const newData = state.data.filter((dataId) => dataId !== id);

//             return {
//                 ...state,
//                 data: newData,
//                 categories: newCategories,
//                 subCategories: newSubCategories,
//                 menuItems: newMenuItems,
//             };
//         }
//         case categoryActionKind.DELETE_SUB_CATEGORY: {
//             const { id, parentId } = action;
//             const newMenuItems = new Map(state.menuItems);
//             deleteSubCategory(state.subCategories, newMenuItems, id);
//             const newCategories = MapSet(state.categories, parentId, (cat) => ({
//                 ...cat,
//                 subCategories: cat.subCategories.filter(
//                     (subCatId) => subCatId !== id,
//                 ),
//             }));

//             return {
//                 ...state,
//                 categories: newCategories,
//                 menuItems: newMenuItems,
//             };
//         }
//         case categoryActionKind.ADD_MENU_ITEM: {
//             const { id, parentId, name, price, index, parentType } = action;
//             const newMenuItems = MapSet(state.menuItems, id, () => ({
//                 name: name,
//                 price: price,
//                 initialIndex: index,
//             }));

//             if (parentType === "categories") {
//                 const newCategories = MapSet(
//                     state.categories,
//                     parentId,
//                     (cat) => ({
//                         ...cat,
//                         menuItems: [...cat.menuItems, id],
//                     }),
//                 );
//                 return {
//                     ...state,
//                     categories: newCategories,
//                     menuItems: newMenuItems,
//                 };
//             } else {
//                 const newSubCategories = MapSet(
//                     state.subCategories,
//                     parentId,
//                     (cat) => ({
//                         ...cat,
//                         menuItems: [...cat.menuItems, id],
//                     }),
//                 );
//                 return {
//                     ...state,
//                     subCategories: newSubCategories,
//                     menuItems: newMenuItems,
//                 };
//             }
//         }
//         case categoryActionKind.UPDATE_MENU_ITEM: {
//             const { id, name, price } = action;
//             const newMenuItems = MapSet(state.menuItems, id, (item) => ({
//                 ...item,
//                 name: name,
//                 price: price,
//             }));
//             return {
//                 ...state,
//                 menuItems: newMenuItems,
//             };
//         }
//         case categoryActionKind.CHANGE_MENU_ITEM_PARENT: {
//             const { currentParentId, newParentId, id } = action;
//             // So currentParent can either be a category or a subcategory
//             // new Parent can either be a category or a subcategory
//             // First
//             if (currentParentId === newParentId) {
//                 return state;
//             }

//             // Remove the item from the current parent
//             const newCategories = new Map(state.categories);
//             const newSubCategories = new Map(state.subCategories);

//             if (newCategories.has(currentParentId)) {
//                 newCategories.set(currentParentId, {
//                     ...newCategories.get(currentParentId),
//                     menuItems: newCategories
//                         .get(currentParentId)
//                         .menuItems.filter((itemId) => itemId !== id),
//                 });
//             } else {
//                 newSubCategories.set(currentParentId, {
//                     ...newSubCategories.get(currentParentId),
//                     menuItems: newSubCategories
//                         .get(currentParentId)
//                         .menuItems.filter((itemId) => itemId !== id),
//                 });
//             }

//             // Add the item to the new parent
//             if (newCategories.has(newParentId)) {
//                 newCategories.set(newParentId, {
//                     ...newCategories.get(newParentId),
//                     menuItems: [
//                         ...newCategories.get(newParentId).menuItems,
//                         id,
//                     ],
//                 });
//             } else {
//                 newSubCategories.set(newParentId, {
//                     ...newSubCategories.get(newParentId),
//                     menuItems: [
//                         ...newSubCategories.get(newParentId).menuItems,
//                         id,
//                     ],
//                 });
//             }

//             return {
//                 ...state,
//                 categories: newCategories,
//                 subCategories: newSubCategories,
//             };
//         }
//         case categoryActionKind.DELETE_MENU_ITEM: {
//             const { id, parentId } = action;
//             const newMenuItems = new Map(state.menuItems);
//             newMenuItems.delete(id);

//             if (state.categories.has(parentId)) {
//                 const newCategories = MapSet(
//                     state.categories,
//                     parentId,
//                     (cat) => ({
//                         ...cat,
//                         menuItems: cat.menuItems.filter(
//                             (itemId) => itemId !== id,
//                         ),
//                     }),
//                 );
//                 return {
//                     ...state,
//                     categories: newCategories,
//                     menuItems: newMenuItems,
//                 };
//             } else {
//                 const newSubCategories = MapSet(
//                     state.subCategories,
//                     parentId,
//                     (cat) => ({
//                         ...cat,
//                         menuItems: cat.menuItems.filter(
//                             (itemId) => itemId !== id,
//                         ),
//                     }),
//                 );
//                 return {
//                     ...state,
//                     subCategories: newSubCategories,
//                     menuItems: newMenuItems,
//                 };
//             }
//         }
//         default:
//             break;
//     }
// }

// type categoryAction =
//     | {
//           type: categoryActionKind.ERROR;
//           error: string;
//       }
//     | {
//           type: categoryActionKind.LOADING | categoryActionKind.SAVED;
//       }
//     | {
//           type: categoryActionKind.FETCHED;
//           categories: Category[];
//           subCategories: SubCategory[];
//           menuItems: MenuItem[];
//       }
//     | {
//           type: categoryActionKind.UPDATE_CATEGORIES;
//           categoryIds: string[];
//       }
//     | {
//           type: categoryActionKind.MOVE_SUB_CATEGORY;
//           parentId: string;
//           activeId: string;
//           overId: string;
//       }
//     | {
//           type: categoryActionKind.CHANGE_SUB_CATEGORY_PARENT;
//           currentParentId: string;
//           newParentId: string;
//           subCategoryId: string;
//       }
//     | {
//           type: categoryActionKind.RENAME_SUB_CATEGORY;
//           id: string;
//           newName: string;
//       }
//     | {
//           type: categoryActionKind.RENAME_CATEGORY;
//           id: string;
//           newName: string;
//       }
//     | {
//           type: categoryActionKind.ADD_SUB_CATEGORY;
//           parentId: string;
//           id: string;
//           index: number;
//           name: string;
//       }
//     | {
//           type: categoryActionKind.ADD_CATEGORY;
//           id: string;
//           name: string;
//           index: number;
//       }
//     | {
//           type: categoryActionKind.MOVE_MENU_ITEM;
//           activeId: string;
//           overId: string;
//           parentId: string;
//       }
//     | {
//           type: categoryActionKind.DELETE_CATEGORY;
//           id: string;
//       }
//     | {
//           type: categoryActionKind.DELETE_SUB_CATEGORY;
//           id: string;
//           parentId: string;
//       }
//     | {
//           type: categoryActionKind.ADD_MENU_ITEM;
//           id: string;
//           parentId: string;
//           index: number;
//           name: string;
//           price: number;
//           parentType: "categories" | "sub_categories";
//       }
//     | {
//           type: categoryActionKind.UPDATE_MENU_ITEM;
//           id: string;
//           name: string;
//           price: number;
//       }
//     | {
//           type: categoryActionKind.CHANGE_MENU_ITEM_PARENT;
//           currentParentId: string;
//           newParentId: string;
//           id: string;
//       }
//     | {
//           type: categoryActionKind.DELETE_MENU_ITEM;
//           id: string;
//           parentId: string;
//       };

// export function useCategories() {
//     return useContext(CategoriesContext);
// }

// export function useCategoriesDispatch() {
//     return useContext(CategoriesDispatchContext);
// }

// function arrayMoveWithId(arr: Array<string>, fromId: string, toId: string) {
//     const fromIndex = arr.findIndex((item) => item === fromId);
//     const toIndex = arr.findIndex((item) => item === toId);
//     return arrayMove(arr, fromIndex, toIndex);
// }

// function MapSet<T, U>(map: Map<T, U>, key: T, updateFunc: (value: U) => U) {
//     return new Map(map).set(key, updateFunc(map.get(key)));
// }

// function deleteSubCategory(
//     subCategories: Map<string, CategoryData>,
//     menuItems: Map<string, MenuItemData>,
//     id: string,
// ): void {
//     const subCat = subCategories.get(id);
//     subCat.menuItems.forEach((itemId) => {
//         menuItems.delete(itemId);
//     });
//     subCategories.delete(id);
// }
