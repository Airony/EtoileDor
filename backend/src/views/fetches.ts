import { useQueries, UseQueryResult } from "@tanstack/react-query";
import { Category, SubCategory, MenuItem } from "../payload-types";

interface CategoryData {
    name: string;
    id: string;
    index: number;
    menuItems: string[];
    subCategories: string[];
}

interface SubCategoryData {
    name: string;
    id: string;
    index: number;
    menuItems: string[];
}
interface MenuItemData {
    name: string;
    price: number;
    id: string;
    index: number;
}

async function fetchCategories() {
    const response = await fetch("/api/categories?limit=0&depth=0", {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }

    const data = (await response.json()).docs as Category[];
    const orderedIds = data
        .sort((a, b) => a.index - b.index)
        .map((category) => category.id);
    const categoriesMap: Map<string, CategoryData> = new Map(
        data.map((category) => [
            category.id,
            {
                name: category.name,
                id: category.id,
                index: category.index,
                menuItems: (category.menu_items as string[]) || [],
                subCategories: (category.sub_categories as string[]) || [],
            },
        ]),
    );

    return { categoriesMap, orderedIds };
}

async function fetchSubCategories() {
    const response = await fetch("/api/sub_categories?limit=0&depth=1", {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch sub categories");
    }

    const data = (await response.json()).docs as SubCategory[];
    const subCategoriesMap: Map<string, SubCategoryData> = new Map(
        data.map((subCategory) => [
            subCategory.id,
            {
                name: subCategory.name,
                id: subCategory.id,
                index: subCategory.index,
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
                index: menuItem.index,
            },
        ]),
    );
    return menuItemsMap;
}

type CategoriesQueryResult = Awaited<ReturnType<typeof fetchCategories>>;
type SubCategoriesQueryResult = Awaited<ReturnType<typeof fetchSubCategories>>;
type MenuItemsQueryResult = Awaited<ReturnType<typeof fetchMenuItems>>;
type CombinedQueryResult = {
    categories: CategoriesQueryResult;
    subCategories: SubCategoriesQueryResult;
    menuItems: MenuItemsQueryResult;
};

type combinedQuery = {
    data: CombinedQueryResult;
    isLoading: boolean;
    isError: boolean;
};

function combineQueries(
    results: [
        UseQueryResult<CategoriesQueryResult>,
        UseQueryResult<SubCategoriesQueryResult>,
        UseQueryResult<MenuItemsQueryResult>,
    ],
): combinedQuery {
    const [categories, subCategories, menuItems] = results;
    if (!categories.data || !subCategories.data || !menuItems.data) {
        return {
            data: undefined,
            isLoading: false,
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
            },
            {
                queryKey: ["subCategories"],
                queryFn: fetchSubCategories,
            },
            {
                queryKey: ["menuItems"],
                queryFn: fetchMenuItems,
            },
        ],
        combine: combineQueries,
    });
};
