import type { ComponentProps } from "react";
import { TextField, Input } from "react-aria-components";
import MyLabel from "./MyLabel";
import MyFieldError from "./MyFieldError";

interface TextInputProps extends ComponentProps<typeof TextField> {
    label: string;
    className?: string;
}

function TextInput({ label, className = "", ...props }: TextInputProps) {
    return (
        <TextField className={"flex flex-col " + className} {...props}>
            <MyLabel>{label}</MyLabel>
            <Input className="border-2 border-primary-600 bg-transparent p-3 font-main text-xs text-primary-300 outline-none focus:border-secondary-400 xs:text-sm sm:p-4 sm:text-base" />
            <MyFieldError />
        </TextField>
    );
}

export default TextInput;
