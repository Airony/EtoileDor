import { useSortable } from "@dnd-kit/sortable";
import React, { useEffect } from "react";
import DragHandle from "./DragHandle";
import { CSS } from "@dnd-kit/utilities";
import {
    categoryActionKind,
    useCategories,
    useCategoriesDispatch,
} from "../contexts/CategoriesContext";
import { Button } from "payload/components/elements";
import MoreIcon from "payload/dist/admin/components/icons/More";
import MenuItemInput from "./MenuItemInput";
import { toast } from "react-toastify";
import MenuItemOptionsModal from "./MenuItemOptionsModal";
import { useModal } from "@faceless-ui/modal";

interface MenuItemProps {
    id: string;
    parentId: string;
}

interface MenuItemState {
    loading: boolean;
    editing: boolean;
}

function MenuItem({ id, parentId }: MenuItemProps) {
    const { menuItems } = useCategories();
    const dispatch = useCategoriesDispatch();
    const { name, price } = menuItems.get(id);
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: id });
    const [state, setState] = React.useState<MenuItemState>({
        loading: false,
        editing: false,
    });
    const inputRef = React.useRef<HTMLInputElement>(null);
    const { openModal } = useModal();

    useEffect(() => {
        if (state.editing) {
            inputRef.current?.focus();
        }
        return () => {};
    }, [state.editing]);

    function onCancel() {
        if (state.loading) {
            return;
        }
        setState({ ...state, editing: false });
    }

    async function onSave(name: string, price: number) {
        if (state.loading) {
            return;
        }
        setState({ ...state, loading: true });
        try {
            const response = await fetch(`/api/menu_items/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    price,
                }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }
            setState({ ...state, loading: false, editing: false });
            dispatch({
                type: categoryActionKind.UPDATE_MENU_ITEM,
                id,
                name,
                price,
            });
        } catch (error) {
            console.error(error);
            setState({ ...state, loading: false });
            toast.error("Failed to update menu item");
        }
    }

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const modalSlug = `options-modal-${id}`;

    return state.editing ? (
        <MenuItemInput
            loading={state.loading}
            onCancel={onCancel}
            onSave={onSave}
            inputRef={inputRef}
            defaultName={name}
            defaultPrice={price}
        />
    ) : (
        <div className="menu-item" ref={setNodeRef} style={style}>
            <div className="menu-item__left-items">
                <DragHandle listeners={listeners} attributes={attributes} />
                <p className="menu-item__name">{name}</p>
            </div>
            <div className="menu-item__right-items">
                <p className="menu-item__price">{price}</p>
                <Button
                    className="menu-item__edit-button"
                    icon="edit"
                    size="small"
                    buttonStyle="icon-label"
                    onClick={() =>
                        setState((state) => ({ ...state, editing: true }))
                    }
                />
                <Button
                    className="menu-item__more-button"
                    icon={<MoreIcon />}
                    size="small"
                    buttonStyle="icon-label"
                    onClick={() => openModal(modalSlug)}
                />
            </div>
            <MenuItemOptionsModal
                id={id}
                parentId={parentId}
                slug={modalSlug}
            />
        </div>
    );
}

export default MenuItem;
