import { Children, cloneElement } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const formats = {
    dayFormat: (date, culture, loca) => loca.format(date, "dddd D"),
    weekdayFormat: (date, culture, loca) => loca.format(date, "dddd"),
    agendaDateFormat: (date, culture, loca) =>
        loca.format(date, "dddd D MMMM YYYY")
};

const TouchCellWrapper = ({ children, value, onSelectSlot }) =>
    cloneElement(Children.only(children), {
        onTouchEnd: () => onSelectSlot({ action: "click", slots: [value] }),
        style: {
            className: `${children}`
        }
    });

export default function CalendarMobile() {
    const onSelectSlot = ({ action, slots /*, ...props */ }) => {
        console.log("onSelectSlot");
        if (action === "click") {
            console.log("click");
            alert("click");
        }
        return false;
    };
    return (
        <Calendar
            components={{
                dateCellWrapper: (props) => (
                    <TouchCellWrapper {...props} onSelectSlot={onSelectSlot} />
                )
            }}
            events={[]}
            formats={formats}
            localizer={localizer}
            selectable
            onSelectSlot={onSelectSlot}
            style={{ minHeight: 800 }}
        />
    );
};
