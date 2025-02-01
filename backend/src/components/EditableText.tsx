import React from "react";
import { TextInput } from "payload/components/forms";
import { Button } from "payload/components/elements";
import EditIcon from "payload/dist/admin/components/icons/Edit";
import CheckIcon from "payload/dist/admin/components/icons/Check";
import CancelIcon from "payload/dist/admin/components/icons/X";

interface EditableText {
    isEditing: boolean;
    value: string;
    editedValue: string;
    path: string;
    name: string;
    className?: string;
    handleSaveEdit: () => void;
    handleStartEdit: () => void;
    handleCancelEdit: () => void;
    onChange: (newValue: string) => void;
}

function EditableText({
    isEditing,
    editedValue,
    value,
    name,
    path,
    className = "",
    handleCancelEdit,
    handleSaveEdit,
    handleStartEdit,
    onChange,
}: EditableText) {
    return (
        <div className={className + "editable-text"}>
            {isEditing ? (
                <>
                    <TextInput
                        path={path}
                        name={name}
                        value={editedValue}
                        onChange={(e) => onChange(e.target.value)}
                        className="editable-text__input"
                    />
                    <Button
                        buttonStyle="icon-label"
                        size="small"
                        onClick={handleSaveEdit}
                        className="editable-text__save"
                        icon={<CheckIcon />}
                        aria-label="Save name"
                    />
                    <Button
                        buttonStyle="icon-label"
                        icon={<CancelIcon />}
                        size="small"
                        onClick={handleCancelEdit}
                        className="editable-text__cancel"
                        aria-label="Cancel name change"
                    />
                </>
            ) : (
                <>
                    <p className="editable-text__value">{value}</p>
                    <Button
                        buttonStyle="icon-label"
                        size="small"
                        icon={<EditIcon />}
                        onClick={handleStartEdit}
                        className="editable-text__edit"
                        aria-label="Edit name"
                    />
                </>
            )}
        </div>
    );
}

export default EditableText;
