import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";
import DragHandle from "./DragHandle";
import { useModal } from "@faceless-ui/modal";
import { Button } from "payload/components/elements";
import MoreIcon from "payload/dist/admin/components/icons/More";
import { useCategories } from "../contexts/CategoriesContext";
import SubCategoryOptionsModal from "./SubCategoryOptionsModal";

interface SubCategorySortableItemProps {
    id: string;
    parentId: string;
}

function SubCategorySortableItem({
    id,
    parentId,
}: SubCategorySortableItemProps) {
    const { subCategories } = useCategories();
    const { name } = subCategories.get(id);

    const { openModal } = useModal();
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const modalId = "sub-cat-" + id + "-modal";
    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className="category-ordered-item"
            >
                <DragHandle listeners={listeners} attributes={attributes} />

                <p>{name}</p>
                <div className="category-ordered-item__control-group">
                    <Button
                        icon={<MoreIcon />}
                        buttonStyle="icon-label"
                        onClick={() => openModal(modalId)}
                        className="category-order__sub-category__more"
                    />
                </div>
            </div>

            <SubCategoryOptionsModal
                slug={modalId}
                id={id}
                parentId={parentId}
            />
        </>
    );
}

export default SubCategorySortableItem;
