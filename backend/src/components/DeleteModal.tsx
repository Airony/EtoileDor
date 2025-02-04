import React from "react";
import { Button } from "payload/components/elements";
import { Modal, useModal } from "@faceless-ui/modal";

interface DeleteModalProps {
    slug: string;
    deletedName: string;
    onDeletion: () => void;
    warning?: string;
}

function DeleteModal({
    slug,
    deletedName,
    onDeletion,
    warning = "",
}: DeleteModalProps) {
    const { closeModal } = useModal();
    return (
        <Modal slug={slug} closeOnBlur={false}>
            <div className="delete-modal">
                <h2>Confirm Deletion</h2>
                <p>Are you sure you want to delete {deletedName} ?</p>
                {warning && <p className="delete-modal__warning">{warning}</p>}

                <div className="delete-modal__controls">
                    <Button
                        buttonStyle="secondary"
                        type="button"
                        onClick={() => closeModal(slug)}
                        className="delete-modal__cancel-btn"
                    >
                        Cancel
                    </Button>
                    <Button
                        buttonStyle="primary"
                        type="button"
                        onClick={() => {
                            onDeletion();
                            closeModal(slug);
                        }}
                        className="delete-modal__delete-btn"
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default DeleteModal;
