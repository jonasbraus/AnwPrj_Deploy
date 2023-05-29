let startParts = []
let endParts = []
const months = [["Januar", 31], ["Februar", 28], ["März", 31], ["April", 30], ["Mai", 31], ["Juni", 30], ["Juli", 31], ["August", 31], ["September", 30], ["Oktober", 31], ["November", 30], ["Dezember", 31]]
const days = months.map((month => month[1]))
let result = []
let check = true
const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
export default function BasicDateCalendar(p) {
    if (check) {
        generateCalendar("01.12.2024", "15.09.2025")
        check = false
    }
    return (
        <div className={"Down"}>
            {result.map((monthResult, index = 0) => (
                <div key={months} className={"A"}>
                    <p>{getMonthName(index)}</p>
                    <div className={"Days"}>
                        {weekdays.map((weekday) => (
                            <p key={weekday}>{weekday}</p>
                        ))}
                        {monthResult.map((date) => (
                            <p key={date}>{date}</p>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

function getMonthName(monthIndex) {
    if (startParts[1] - 1 + monthIndex < 12) {
        return months[startParts[1] - 1 + monthIndex][0];
    } else {
        return months[startParts[1] - 1 + monthIndex - 12][0];
    }
}


function generateCalendar(start, ende)
{
    splitter(start, ende)
    if (startParts[2] < endParts[2])
    {
        for (let i = startParts[1] - 1; i <= 11; i++)
        {
            let monthResult = [];
            for (let j = 1; j <= days[i]; j++)
            {
                if (
                    new Date(startParts[2], i, j) >= new Date(startParts[2], startParts[1] - 1, startParts[0]) &&
                    new Date(startParts[2], i, j) <= new Date(startParts[2], 11, 31)
                )
                {
                    monthResult.push(j);
                }
            }
            result.push(monthResult);
            if (i == 11)
            {
                for (let h = 0; h <= endParts[1] - 1; h++)
                {
                    let monthResultNewYear = [];
                    for (let g = 1; g <= days[h]; g++)
                    {
                        if (new Date(endParts[2], h, g) <= new Date(endParts[2], endParts[1] - 1, endParts[0]))
                        {
                            monthResultNewYear.push(g);
                        }
                    }
                    result.push(monthResultNewYear);
                }
            }
        }
    } else
    {
        for (let i = startParts[1] - 1; i <= endParts[1] - 1; i++)
        {
            let monthResult = [];
            for (let j = 1; j <= days[i]; j++)
            {
                if (
                    new Date(startParts[2], i, j) >= new Date(startParts[2], startParts[1] - 1, startParts[0]) &&
                    new Date(startParts[2], i, j) <= new Date(startParts[2], endParts[1] - 1, endParts[0])
                )
                {
                    monthResult.push(j);
                }
            }
            result.push(monthResult);
        }
    }
}

function splitter(startDate, endDate)
{
    startParts = startDate.split(".")
    //Transformer()
    if (startParts[1][0] === 0) //prüft ob die erste Stelle des Monats eine 0 vorne stehen hat
    {
        startParts[1] = startParts[1][1] //überschreibt den Monat ohne die 0
    }
    endParts = endDate.split(".") //prüft ob die erste Stelle des Monats eine 0 vorne stehen hat
    if (endParts[1][0] === 0)
    {
        endParts[1] = endParts[1][1] //überschreibt den Monat ohne die 0
    }
}

function Transformer()
{
    let formattedDateStr = startParts[1] + "/" + startParts[0] + "/" + startParts[2];
    console.log(formattedDateStr)
    let weekday = new Date(formattedDateStr).getDay();
    console.log(weekday);
}