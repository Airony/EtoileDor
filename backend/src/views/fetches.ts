import { useQueries, UseQueryResult } from "@tanstack/react-query";
import { Category, SubCategory, MenuItem } from "../payload-types";

export interface CategoryData {
    name: string;
    id: string;
    menuItems: string[];
    subCategories: string[];
}

export interface SubCategoryData {
    name: string;
    id: string;
    menuItems: string[];
}
export interface MenuItemData {
    name: string;
    price: number;
    id: string;
}

async function fetchCategories() {
    const response = await fetch("/api/categories/get_all", {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }

    const data = (await response.json()) as Category[];
    const orderedIds = data
        .sort((a, b) => a.index - b.index)
        .map((category) => category.id);
    const categoriesMap: Map<string, CategoryData> = new Map(
        data.map((category) => [
            category.id,
            {
                name: category.name,
                id: category.id,
                menuItems: (category.menu_items as string[]) || [],
                subCategories: (category.sub_categories as string[]) || [],
            },
        ]),
    );

    return { categoriesMap, orderedIds };
}

async function fetchSubCategories() {
    const response = await fetch("/api/sub_categories/get_all", {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch sub categories");
    }

    const data = (await response.json()) as SubCategory[];
    const subCategoriesMap: Map<string, SubCategoryData> = new Map(
        data.map((subCategory) => [
            subCategory.id,
            {
                name: subCategory.name,
                id: subCategory.id,
                menuItems: (subCategory.menu_items as string[]) || [],
            },
        ]),
    );

    return subCategoriesMap;
}

async function fetchMenuItems() {
    const response = await fetch("/api/menu_items?limit=0&depth=0", {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch menu items");
    }

    const data = (await response.json()).docs as MenuItem[];
    const menuItemsMap: Map<string, MenuItemData> = new Map(
        data.map((menuItem) => [
            menuItem.id,
            {
                name: menuItem.name,
                price: menuItem.price,
                id: menuItem.id,
            },
        ]),
    );
    return menuItemsMap;
}

export type CategoriesQueryData = Awaited<ReturnType<typeof fetchCategories>>;
export type SubCategoriesQueryData = Awaited<
    ReturnType<typeof fetchSubCategories>
>;
export type MenuItemsQueryData = Awaited<ReturnType<typeof fetchMenuItems>>;

export type CategoriesQueryResult = UseQueryResult<CategoriesQueryData>;
export type SubCategoriesQueryResult = UseQueryResult<SubCategoriesQueryData>;
export type MenuItemsQueryResult = UseQueryResult<MenuItemsQueryData>;
type CombinedQueryResult = {
    categories: CategoriesQueryData;
    subCategories: SubCategoriesQueryData;
    menuItems: MenuItemsQueryData;
};

type combinedQuery = {
    data: CombinedQueryResult;
    isLoading: boolean;
    isError: boolean;
};

function combineQueries(
    results: [
        CategoriesQueryResult,
        SubCategoriesQueryResult,
        MenuItemsQueryResult,
    ],
): combinedQuery {
    const [categories, subCategories, menuItems] = results;
    if (!categories.data || !subCategories.data || !menuItems.data) {
        return {
            data: undefined,
            isLoading: true,
            isError:
                categories.isError ||
                subCategories.isError ||
                menuItems.isError,
        };
    }
    return {
        data: {
            categories: categories.data,
            subCategories: subCategories.data,
            menuItems: menuItems.data,
        },
        isLoading: false,
        isError: false,
    };
}

export const useMenuQuery = () => {
    return useQueries({
        queries: [
            {
                queryKey: ["categories"],
                queryFn: fetchCategories,
                refetchOnMount: false,
            },
            {
                queryKey: ["subCategories"],
                queryFn: fetchSubCategories,
                refetchOnMount: false,
            },
            {
                queryKey: ["menuItems"],
                queryFn: fetchMenuItems,
                refetchOnMount: false,
            },
        ],
        combine: combineQueries,
    });
};
