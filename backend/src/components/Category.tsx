import React, { useEffect } from "react";
import MenuItemList from "./MenuItemList";
import SubCategoriesList from "./SubCategoriesList";
import { Button } from "payload/components/elements";
import {
    categoryActionKind,
    useCategories,
    useCategoriesDispatch,
} from "../contexts/CategoriesContext";
import MenuItemInput from "./MenuItemInput";
import { toast } from "react-toastify";

interface CategoryProps {
    id: string;
}

interface State {
    loading: boolean;
    inputting: boolean;
}

function Category({ id }: CategoryProps) {
    const { categories } = useCategories();
    const dispatch = useCategoriesDispatch();
    const category = categories.get(id);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [state, setState] = React.useState<State>({
        loading: false,
        inputting: false,
    });

    useEffect(() => {
        if (state.inputting) {
            inputRef.current?.focus();
        }
        return () => {};
    }, [state.inputting]);

    function handleAddBtnPress() {
        if (state.loading) {
            return;
        }

        if (state.inputting) {
            inputRef.current?.focus();
        }
        setState({
            ...state,
            inputting: true,
        });
    }

    function handleCancel() {
        if (state.loading) {
            return;
        }
        setState({ ...state, inputting: false });
    }

    async function handleSave(name: string, price: number) {
        setState({ ...state, loading: true });

        try {
            const index = category.menuItemsIds.length;
            const response = await fetch("/api/menu_items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    price,
                    Category: {
                        relationTo: "categories",
                        value: id,
                    },
                    index: index,
                }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const responseData = await response.json();
            if (!responseData.doc?.id) {
                throw new Error();
            }

            dispatch({
                type: categoryActionKind.ADD_MENU_ITEM,
                id: responseData.doc.id,
                parentId: id,
                parentType: "categories",
                index,
                name: name,
                price: price,
            });

            setState({ ...state, inputting: false, loading: false });
        } catch (error) {
            console.error(error);
            toast.error("Failed to save menu item");
            setState({ ...state, loading: false });
        }
    }

    return (
        <div key={id} className="categories-list__category">
            <div className="categories-list__category-header">
                <h2>{category.name}</h2>
                <Button
                    icon="plus"
                    size="small"
                    aria-label={`Add menu item to category {category.name}`}
                    buttonStyle="secondary"
                    onClick={handleAddBtnPress}
                >
                    Add Item
                </Button>
            </div>
            <div className="categories-list__category-content">
                <div className="categories-list__items-container">
                    <MenuItemList list={category.menuItemsIds} parentId={id} />
                    {state.inputting && (
                        <MenuItemInput
                            inputRef={inputRef}
                            loading={state.loading}
                            onCancel={handleCancel}
                            onSave={handleSave}
                        />
                    )}
                </div>
                <SubCategoriesList parentId={id} />
            </div>
        </div>
    );
}

export default Category;
