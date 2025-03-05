import {
    Button,
    ListBox,
    ListBoxItem,
    Popover,
    Select,
    SelectValue,
    type Key,
    type ListBoxItemProps,
    type SelectProps,
} from "react-aria-components";
import MyLabel from "./MyLabel";
import Arrow from "../icons/arrow-drop-down.svg?react";
import MyFieldError from "./MyFieldError";

export interface Option {
    value: string | number;
    label: string;
}

interface SelectMenuProps<T extends object> extends SelectProps<T> {
    className?: string;
    label: string;
    options: Option[];
    defaultSelectedKey?: Key;
    isRequired?: boolean;
}

function SelectMenu<T extends object>({
    options,
    className = "",
    isDisabled = false,
    ...props
}: SelectMenuProps<T>) {
    return (
        <Select className={`flex flex-col ${className}`} {...props}>
            <MyLabel>{props.label}</MyLabel>
            <Button
                className={`${isDisabled ? "cursor-not-allowed opacity-50" : ""} group flex w-full items-center justify-between border-2 border-primary-600 p-4 outline-none focus:border-secondary-400`}
                isDisabled={isDisabled}
            >
                <SelectValue className="font-main text-xs text-primary-300 xs:text-sm sm:text-base" />
                <Arrow className="w-7 fill-primary-300 transition-transform duration-200 ease-out group-aria-expanded:rotate-180" />
            </Button>
            <MyFieldError />
            <Popover
                className="w-[var(--trigger-width)] overflow-auto border-2 border-secondary-400 bg-primary-800"
                offset={0}
            >
                <ListBox>
                    {options.map((option) => (
                        <SelectItem
                            key={option.value}
                            id={option.value}
                            text={option.label}
                        ></SelectItem>
                    ))}
                </ListBox>
            </Popover>
        </Select>
    );
}

function SelectItem(props: ListBoxItemProps & { text: string }) {
    return (
        <ListBoxItem
            {...props}
            className="group flex cursor-pointer border border-primary-700 p-4 outline-none data-[selected]:border-secondary-700 data-[selected]:bg-secondary-700 data-[selected]:text-primary-300 hover:bg-primary-750 focus:bg-primary-750 hover:selected:bg-secondary-600 focus:selected:bg-secondary-600"
            key={props.id}
            textValue={props.text}
        >
            <span className="block w-full font-main text-xs text-primary-300 xs:text-sm sm:text-base">
                {props.text}
            </span>
        </ListBoxItem>
    );
}

export default SelectMenu;
