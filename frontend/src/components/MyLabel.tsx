import { Label } from "react-aria-components";

function MyLabel({ children }: { children: React.ReactNode }) {
    return (
        <Label className="mb-4 font-main text-sm text-secondary-200 xs:text-base md:text-lg">
            {children}
        </Label>
    );
}

export default MyLabel;
