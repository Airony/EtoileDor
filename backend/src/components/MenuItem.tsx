import { useSortable } from "@dnd-kit/sortable";
import React, { useEffect } from "react";
import DragHandle from "./DragHandle";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "payload/components/elements";
import MoreIcon from "payload/dist/admin/components/icons/More";
import MenuItemInput from "./MenuItemInput";
import MenuItemOptionsModal from "./MenuItemOptionsModal";
import { useModal } from "@faceless-ui/modal";
import { useMenuQuery } from "../views/fetches";
import useEditMenuItem from "../reactHooks/useEditMenuItem";

interface MenuItemProps {
    id: string;
    parentId: string;
}

function MenuItem({ id, parentId }: MenuItemProps) {
    const { data } = useMenuQuery();
    const { menuItems } = data;
    const { name, price } = menuItems.get(id);
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: id });
    const [isEditing, setIsEditing] = React.useState<boolean>(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const { openModal } = useModal();
    const editMutation = useEditMenuItem(id);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
        return () => {};
    }, [isEditing]);

    function onCancel() {
        setIsEditing(false);
    }

    function onSave(newName: string, newPrice: number) {
        setIsEditing(false);
        if (newName === name && newPrice === price) {
            return;
        }
        editMutation.mutate({ name: newName, price: newPrice });
    }

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const modalSlug = `options-modal-${id}`;

    return isEditing ? (
        <MenuItemInput
            loading={false}
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
                    onClick={() => setIsEditing(true)}
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
