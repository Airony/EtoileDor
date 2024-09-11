import {
    Button,
    Calendar,
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    DateInput,
    DatePicker,
    DateSegment,
    Dialog,
    Group,
    Heading,
    Popover,
    Text,
    type DatePickerProps,
    type DateValue,
} from "react-aria-components";

import MyLabel from "./MyLabel";
import Arrow from "../icons/arrow-drop-down.svg?react";
import MyFieldError from "./MyFieldError";

interface MyDatePickerProps<T extends DateValue> extends DatePickerProps<T> {
    label: string;
}

function MyDatePicker<T extends DateValue>({
    label,
    className = "",
    ...props
}: MyDatePickerProps<T>) {
    return (
        <DatePicker className={"flex flex-col " + className} {...props}>
            <MyLabel>{label}</MyLabel>
            <Group className="flex flex-row gap-2 border-2 border-primary-600 p-4">
                <DateInput
                    className={
                        "flex w-full flex-row font-main text-primary-300"
                    }
                >
                    {(segment) => (
                        <DateSegment
                            segment={segment}
                            className="outline-none focus:outline-2 focus:outline-secondary-200"
                        />
                    )}
                </DateInput>
                <Button className="text-primary-300 outline-none focus:outline-2 focus:outline-secondary-200">
                    <Arrow className="w-6 fill-primary-300" />
                </Button>
            </Group>
            <Text slot="description" />
            <MyFieldError />
            <Popover>
                <Dialog>
                    <Calendar className="border-2 border-primary-600 bg-primary-950 p-4">
                        <div
                            className={
                                "mb-5 flex flex-row items-center justify-between"
                            }
                        >
                            <Button
                                slot="previous"
                                className="p-0.5 outline-none hover:bg-primary-750 focus:outline-2 disabled:cursor-not-allowed disabled:opacity-45"
                            >
                                <Arrow className="w-6 rotate-90 fill-primary-300" />
                            </Button>
                            <Heading className="font-main text-sm text-primary-300" />
                            <Button
                                slot="next"
                                className="p-0.5 outline-none hover:bg-primary-750 focus:outline-2 disabled:cursor-not-allowed disabled:opacity-45"
                            >
                                <Arrow className="w-6 -rotate-90 fill-primary-300" />
                            </Button>
                        </div>
                        <CalendarGrid>
                            <CalendarGridHeader>
                                {(day) => (
                                    <CalendarHeaderCell className="px-2 text-left font-main text-xs text-primary-500">
                                        {day}
                                    </CalendarHeaderCell>
                                )}
                            </CalendarGridHeader>
                            <CalendarGridBody>
                                {(date) => (
                                    <CalendarCell
                                        date={date}
                                        className="w[30px] bg-primary-850 p-2 font-main text-xs text-primary-300 outline-none hover:bg-primary-750 focus:bg-primary-750 selected:bg-secondary-700 disabled:cursor-default disabled:bg-transparent disabled:text-primary-600 xs:w-[45px] sm:text-sm"
                                    />
                                )}
                            </CalendarGridBody>
                        </CalendarGrid>
                        <Text slot="errorMessage" />
                    </Calendar>
                </Dialog>
            </Popover>
        </DatePicker>
    );
}

export default MyDatePicker;
