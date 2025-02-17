import { useQueries, UseQueryResult } from "@tanstack/react-query";
import { Category, SubCategory } from "../payload-types";
import { MenuItem } from "../types/Offers";

async function fetchCategories() {
    const response = await fetch("/api/categories", {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }

    const data = (await response.json()).docs as Category[];
    const orderedIds = data
        .sort((a, b) => a.index - b.index)
        .map((category) => category.id);
    const categoriesMap = new Map(
        data.map((category) => [category.id, category]),
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
    const subCategoriesMap = new Map(
        data.map((subCategory) => [subCategory.id, subCategory]),
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
    const menuItemsMap = new Map(
        data.map((menuItem) => [menuItem.id, menuItem]),
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
