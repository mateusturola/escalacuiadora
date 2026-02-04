"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays={showOutsideDays}
      className={cn("p-3 w-full", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-sm font-medium capitalize",
        nav: "flex items-center gap-1",
        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7 gap-2 mb-2",
        head_cell: "h-9 flex items-center justify-center text-gray-500 font-medium text-xs uppercase truncate",
        row: "grid grid-cols-7 gap-2 mt-1",
        cell: "h-9 flex items-center justify-center p-0 relative",
        day: "h-9 w-9 p-0 font-normal inline-flex items-center justify-center rounded-md text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500",
        day_selected: "bg-teal-600 text-white hover:bg-teal-700 hover:text-white",
        day_today: "bg-gray-100 font-semibold",
        day_outside: "text-gray-400 opacity-50",
        day_disabled: "text-gray-300 opacity-50 hover:bg-transparent cursor-not-allowed",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
