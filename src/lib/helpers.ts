
import { Currencies } from "./currency"

export function DateToUTCDate(date: Date) {
    // Create a new date that represents midnight UTC on the given date
    return new Date(
        Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            0,  // Set hours to 0
            0,  // Set minutes to 0
            0,  // Set seconds to 0
            0   // Set milliseconds to 0
        )
    )
}

export function DateToUTCEndOfDay(date: Date) {
    // Create a new date that represents 23:59:59.999 UTC on the given date
    return new Date(
        Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            23,  // Set hours to 23
            59,  // Set minutes to 59
            59,  // Set seconds to 59
            999  // Set milliseconds to 999
        )
    )
}

export function GetFormatterForCurrency(currency: string) {
    const locale = Currencies.find(c => c.value === currency)?.locale

    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency
    })
}