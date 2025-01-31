import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";
import DragHandle from "./DragHandle";
import { Modal, useModal } from "@faceless-ui/modal";
import { Button } from "payload/components/elements";
import MoreIcon from "payload/dist/admin/components/icons/More";

interface SubCategorySortableItemProps {
    id: string;
    name: string;
}

function SubCategorySortableItem(props: SubCategorySortableItemProps) {
    const { openModal, closeModal } = useModal();
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: props.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };
    const modalId = "sub-cat-" + props.name + "-modal";
    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className="category-order__sub-category"
            >
                <DragHandle listeners={listeners} attributes={attributes} />
                {props.name}
                <Button
                    icon={<MoreIcon />}
                    buttonStyle="icon-label"
                    onClick={() => openModal(modalId)}
                    className="category-order__sub-category__more"
                />
            </div>
            <Modal slug={modalId}>
                <div className="category-order__modal">
                    <h2>Sub Category Options</h2>
                    <h3>{props.name}</h3>
                    <div className="category-order__modal__controls">
                        <Button
                            buttonStyle="primary"
                            type="button"
                            onClick={() => {
                                console.log("Edit sub category");
                                closeModal(modalId);
                            }}
                        >
                            Save
                        </Button>
                        <Button
                            buttonStyle="secondary"
                            type="button"
                            onClick={() => closeModal(modalId)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default SubCategorySortableItem;
