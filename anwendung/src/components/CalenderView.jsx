import {useEffect, useRef, useState} from "react";
import Button from "@/components/Button";
import {list} from "postcss";
import Background from "@/components/Background";
import WeekSelector from "@/components/WeekSelector";
import {baseURL} from "@/components/Constants";

let cellHeight = 20;

let colors = ["#f80000", "#414141"]

let semesterStart;
let currentWeekStartDay;
let currentYear;
let selectedElement;
let grabbedDown;

export default function CalenderView(p) {

    const [entries, setEntries] = useState([[], [], [], [], [], []])
    const [update, setUpdate] = useState(false)
    const scrollRef = useRef(null);

    function readEntries() {
        let url = baseURL + "/entries?semesterid=" + localStorage.getItem("currentsid") +
            "&daynumber=" + currentWeekStartDay + "&yearnumber=" + currentYear + "&sessionid=" + localStorage.getItem("sessionid");
        try {
            fetch(url).then(r => r.json()).then(en => {
                setEntries(en)
            })
        }catch (e) {

        }
    }

    function pushEntry(currentColumnID, row) {
        let url = baseURL + "/entries" + "?sessionid=" + localStorage.getItem("sessionid")
        let json = {
            "id": 0,
            "daynumber": currentWeekStartDay + currentColumnID,
            "yearnumber": currentYear,
            "semesterid": localStorage.getItem("currentsid"),
            "usercreatedbyid": localStorage.getItem("userid"),
            "timestart": row,
            "timeend": row + 3,
            "info": ""
        }
        fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(json)
        }).then(r => {
            readEntries()
        })
    }

    function deleteEntry(id) {
        let url = baseURL + "/entries?id=" + id + "&sessionid=" + localStorage.getItem("sessionid");
        fetch(url, {
            method: "DELETE"
        }).then(r => readEntries())
    }

    function checkForElementAtRow(row, column) {
        let currentList = entries[column];
        for (let i = 0; i < currentList.length; i++) {
            if (currentList[i] != null) {
                if (row >= currentList[i].timestart && row <= currentList[i].timeend) {


                    return true;

                }
            }
        }

        return false;
    }

    function getElementInColumn(id, column) {
        let currentList = entries[column];
        for (let i = 0; i < currentList.length; i++) {
            if (currentList[i] != null) {
                if (currentList[i].id === id) {
                    return currentList[i];
                }
            }
        }

        return null;
    }

    function onMouseUp(e) {
        if (selectedElement != null) {
            let id = selectedElement.id;

            let url = baseURL + "/entries?sessionid=" + localStorage.getItem("sessionid");
            let json = {
                "id": id,
                "daynumber": 0,
                "yearnumber": 0,
                "semesterid": 0,
                "usercreatedbyid": 0,
                "timestart": selectedElement.timestart,
                "timeend": selectedElement.timeend,
                "info": ""
            }
            fetch(url, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(json)
            }).then(r => {
                readEntries()
            })

            selectedElement = null;
        }
    }

    function onMouseMove(e) {
        if (selectedElement != null) {
            let y_window = e.clientY;
            let y_target_offset = e.currentTarget.getBoundingClientRect().top;
            let row = Math.floor((y_window - y_target_offset) / cellHeight) + 1;
            let currentColumnID = parseInt(e.currentTarget.id)

            if (grabbedDown) {
                if (row - 1 > selectedElement.timestart) {

                    let free = true;
                    for(let i = 0; i < entries[currentColumnID].length; i++)
                    {
                        if(entries[currentColumnID][i] != null && selectedElement !== entries[currentColumnID][i])
                        {
                            if(row <= entries[currentColumnID][i].timeend &&
                                row >= entries[currentColumnID][i].timestart ||
                                row > entries[currentColumnID][i].timeend &&
                                selectedElement.timestart < entries[currentColumnID][i].timestart)
                            {
                                free = false;
                                break;
                            }
                        }
                    }

                    if(free) {
                        selectedElement.timeend = row + 1;
                    }
                }
            } else if (row + 2 < selectedElement.timeend)
            {
                let free = true;
                for(let i = 0; i < entries[currentColumnID].length; i++)
                {
                    if(entries[currentColumnID][i] != null && selectedElement !== entries[currentColumnID][i])
                    {
                        if(row < entries[currentColumnID][i].timeend &&
                            row >= entries[currentColumnID][i].timestart ||
                            row < entries[currentColumnID][i].timestart &&
                            selectedElement.timeend > entries[currentColumnID][i].timestart)
                        {
                            free = false;
                            break;
                        }
                    }
                }

                if(free)
                {
                    selectedElement.timestart = row;
                }
            }
            setUpdate(!update);
        }
    }

    function onMouseDown(e) {
        let y_window = e.clientY;
        let y_target_offset = e.currentTarget.getBoundingClientRect().top;
        let row = Math.floor((y_window - y_target_offset) / cellHeight) + 1;
        let currentColumnID = parseInt(e.currentTarget.id)
        let currentId = e.target.id;
        let currentUserID = localStorage.getItem("userid");

        if (e.button === 0) {
            if (!currentId.includes("e")) {
                if (!currentId.includes("grab")) {
                    if (!checkForElementAtRow(row + 2, currentColumnID)) {
                        pushEntry(currentColumnID, row)
                    }
                } else {
                    let parentID = parseInt(e.target.parentElement.id.replace("e", ""));
                    if(currentUserID == getElementInColumn(parentID, currentColumnID).usercreatedbyid) {
                        grabbedDown = currentId.includes("down")
                        selectedElement = getElementInColumn(parentID, currentColumnID);
                    }
                }
            }
        } else if (e.button === 2) {
            let parentID = parseInt(e.target.id.replace("e", ""));
            if (currentUserID == getElementInColumn(parentID, currentColumnID).usercreatedbyid && currentId.includes("e")) {
                let id = parseInt(currentId.replace("e", ""))
                deleteEntry(id)
            }
        }
    }

    function onWeekLeft() {
        currentWeekStartDay -= 7;
        readEntries()
    }

    function onWeekRight() {
        currentWeekStartDay += 7;
        readEntries()
    }

    function getEntryColor(userCreatedByID)
    {
        let id = localStorage.getItem("userid");
        if(id == userCreatedByID)
        {
            return "#77932b";
        }
        else
        {
            return "#a2a2a2";
        }
    }

    function getResizeBarColor(userCreatedByID)
    {
        let id = localStorage.getItem("userid");
        if(id == userCreatedByID)
        {
            return "#5a6c20";
        }
        else{
            return "#a2a2a2";
        }
    }

    useEffect(() => {
        semesterStart = 0;
        currentWeekStartDay = 0;
        currentYear = 2000;
        selectedElement = null;
        grabbedDown = false;

        let url = baseURL + "/semester/id?sessionid=" + localStorage.getItem("sessionid") +
            "&id=" + localStorage.getItem("currentsid");

        fetch(url).then(r => r.json()).then(s => {
            currentWeekStartDay = s.startday - new Date(s.startyear, 0, s.startday).getUTCDay();
            currentYear = s.startyear;
            semesterStart = s.startday;
        }).then(readEntries)

        scrollRef.current.scrollTop = 600;
        window.addEventListener("contextmenu", (e) => (e.preventDefault()))

        window.addEventListener("keypress", (e) => {
            try {
                if (e.key === "+") {
                    cellHeight += 2
                } else if (e.key === "-") {
                    if (cellHeight - 2 >= 8) {
                        cellHeight -= 2
                    }
                }
            } catch (e) {

            }
        })


        setInterval(function () {
            if (selectedElement == null) {
                readEntries()
            }
        }, 500);
    }, [])


    //returns internal format (0 - 96) to a string
    function internal_to_time(internal) {
        internal -= 1
        internal /= 4
        let integer = Math.floor(internal)
        let decimal = internal.toFixed(2);
        let minutes = Math.floor((decimal - integer) * 60);
        let minutes_string = minutes.toString().length === 1 ? "0" + minutes : minutes
        return integer + ":" + minutes_string;
    }

    let temp = []
    for (let i = 2; i <= 96; i += 2) {
        temp.push(i);
    }


    return (

        <div style={{
            display: "flex",
            height: "100vh",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <WeekSelector year={currentYear} startday={currentWeekStartDay} onFunctionLeft={() => onWeekLeft()}
                          onFunctionRight={() => onWeekRight()}/>
            <div id={update} style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "white",
                gap: 5,
            }}>
                <div style={{borderRadius: 10, padding: 10, backgroundColor: "#f1f1f1"}} className={"box-shadow"}>
                    <div>
                        <div className={"wochen-tag-container"}>
                            <div
                                className={"wochen-tag font-big"}>Montag {new Date(currentYear, 0, currentWeekStartDay).getDate()}.
                            </div>
                            <div
                                className={"wochen-tag font-big"}>Dienstag {new Date(currentYear, 0, currentWeekStartDay + 1).getDate()}.
                            </div>
                            <div
                                className={"wochen-tag font-big"}>Mittwoch {new Date(currentYear, 0, currentWeekStartDay + 2).getDate()}.
                            </div>
                            <div
                                className={"wochen-tag font-big"}>Donnerstag {new Date(currentYear, 0, currentWeekStartDay + 3).getDate()}.
                            </div>
                            <div
                                className={"wochen-tag font-big"}>Freitag {new Date(currentYear, 0, currentWeekStartDay + 4).getDate()}.
                            </div>
                            <div
                                className={"wochen-tag font-big"}>Samstag {new Date(currentYear, 0, currentWeekStartDay + 5).getDate()}.
                            </div>
                        </div>
                    </div>
                    <div className={"calender-container"} ref={scrollRef}>

                        <div className={"calender-view content"} style={{height: cellHeight * 96 + 10}}>


                            <div className={"spalte"}
                                 id={"0"} style={{gridTemplateRows: `repeat(96, ${cellHeight}px)`}}
                                 onMouseDown={e => onMouseDown(e)}
                                 onMouseMove={e => onMouseMove(e)}
                                 onMouseUp={e => onMouseUp(e)}>

                                {entries[0].map(d => (d != null && <div className={"entry"} style={{
                                    width: "100%",
                                    gridRowStart: d.timestart,
                                    gridRowEnd: d.timeend,
                                    backgroundColor: getEntryColor(d.usercreatedbyid)
                                }} id={d.id + "e"}>
                                    <div className={"resize-grab"} id={"grabup"} style={{
                                        backgroundColor: getResizeBarColor(d.usercreatedbyid)
                                    }}></div>
                                    <div style={{maxHeight: "60%"}} className={"no-pointer-events"}>
                                        <p>{internal_to_time(d.timestart) + " - " + internal_to_time(d.timeend)}</p>
                                        <p>Modul</p>
                                    </div>
                                    <div className={"resize-grab"} id={"grabdown"} style={{
                                        backgroundColor: getResizeBarColor(d.usercreatedbyid)
                                    }}></div>
                                </div>))}
                            </div>


                            <div className={"spalte"}
                                 id={"1"} style={{gridTemplateRows: `repeat(96, ${cellHeight}px)`}}
                                 onMouseDown={e => onMouseDown(e)}
                                 onMouseMove={e => onMouseMove(e)}
                                 onMouseUp={e => onMouseUp(e)}>

                                {entries[1].map(d => (d != null && <div className={"entry"} style={{
                                    width: "100%",
                                    gridRowStart: d.timestart,
                                    gridRowEnd: d.timeend,
                                    backgroundColor: getEntryColor(d.usercreatedbyid)
                                }} id={d.id + "e"}>

                                    <div className={"resize-grab"} id={"grabup"} style={{
                                        backgroundColor: getResizeBarColor(d.usercreatedbyid)
                                    }}></div>
                                    <div style={{maxHeight: "60%"}} className={"no-pointer-events"}>
                                        <p>{internal_to_time(d.timestart) + " - " + internal_to_time(d.timeend)}</p>
                                        <p>Modul</p>
                                    </div>
                                    <div className={"resize-grab"} id={"grabdown"} style={{
                                        backgroundColor: getResizeBarColor(d.usercreatedbyid)
                                    }}></div>
                                </div>))}
                            </div>


                            <div className={"spalte"}
                                 id={"2"} style={{gridTemplateRows: `repeat(96, ${cellHeight}px)`}}
                                 onMouseDown={e => onMouseDown(e)}
                                 onMouseMove={e => onMouseMove(e)}
                                 onMouseUp={e => onMouseUp(e)}>


                                {entries[2].map(d => (d != null && <div className={"entry"} style={{
                                    width: "100%",
                                    gridRowStart: d.timestart,
                                    gridRowEnd: d.timeend,
                                    backgroundColor: getEntryColor(d.usercreatedbyid)
                                }} id={d.id + "e"}>

                                    <div className={"resize-grab"} id={"grabup"} style={{
                                        backgroundColor: getResizeBarColor(d.usercreatedbyid)
                                    }}></div>
                                    <div style={{maxHeight: "60%"}} className={"no-pointer-events"}>
                                        <p>{internal_to_time(d.timestart) + " - " + internal_to_time(d.timeend)}</p>
                                        <p>Modul</p>
                                    </div>
                                    <div className={"resize-grab"} id={"grabdown"} style={{
                                        backgroundColor: getResizeBarColor(d.usercreatedbyid)
                                    }}></div>
                                </div>))}
                            </div>


                            <div className={"spalte"}
                                 id={"3"} style={{gridTemplateRows: `repeat(96, ${cellHeight}px)`}}
                                 onMouseDown={e => onMouseDown(e)}
                                 onMouseMove={e => onMouseMove(e)}
                                 onMouseUp={e => onMouseUp(e)}>

                                {entries[3].map(d => (d != null && <div className={"entry"} style={{
                                    width: "100%",
                                    gridRowStart: d.timestart,
                                    gridRowEnd: d.timeend,
                                    backgroundColor: getEntryColor(d.usercreatedbyid)
                                }} id={d.id + "e"}>

                                    <div className={"resize-grab"} id={"grabup"} style={{
                                        backgroundColor: getResizeBarColor(d.usercreatedbyid)
                                    }}></div>
                                    <div style={{maxHeight: "60%"}} className={"no-pointer-events"}>
                                        <p>{internal_to_time(d.timestart) + " - " + internal_to_time(d.timeend)}</p>
                                        <p>Moduel etc.</p>
                                    </div>
                                    <div className={"resize-grab"} id={"grabdown"} style={{
                                        backgroundColor: getResizeBarColor(d.usercreatedbyid)
                                    }}></div>
                                </div>))}
                            </div>


                            <div className={"spalte"}
                                 id={"4"} style={{gridTemplateRows: `repeat(96, ${cellHeight}px)`}}
                                 onMouseDown={e => onMouseDown(e)}
                                 onMouseMove={e => onMouseMove(e)}
                                 onMouseUp={e => onMouseUp(e)}>


                                {entries[4].map(d => (d != null && <div className={"entry"} style={{
                                    width: "100%",
                                    gridRowStart: d.timestart,
                                    gridRowEnd: d.timeend,
                                    backgroundColor: getEntryColor(d.usercreatedbyid)
                                }} id={d.id + "e"}>
                                    <div className={"resize-grab"} id={"grabup"} style={{
                                        backgroundColor: getResizeBarColor(d.usercreatedbyid)
                                    }}></div>
                                    <div style={{maxHeight: "60%"}} className={"no-pointer-events"}>
                                        <p>{internal_to_time(d.timestart) + " - " + internal_to_time(d.timeend)}</p>
                                        <p>Modul</p>
                                    </div>
                                    <div className={"resize-grab"} id={"grabdown"} style={{
                                        backgroundColor: getResizeBarColor(d.usercreatedbyid)
                                    }}></div>
                                </div>))}
                            </div>


                            <div className={"spalte"}
                                 id={"5"} style={{gridTemplateRows: `repeat(96, ${cellHeight}px)`}}
                                 onMouseDown={e => onMouseDown(e)}
                                 onMouseMove={e => onMouseMove(e)}
                                 onMouseUp={e => onMouseUp(e)}>


                                {entries[5].map(d => (d != null && <div className={"entry"} style={{
                                    width: "100%",
                                    gridRowStart: d.timestart,
                                    gridRowEnd: d.timeend,
                                    backgroundColor: getEntryColor(d.usercreatedbyid)
                                }} id={d.id + "e"}>
                                    <div className={"resize-grab"} id={"grabup"} style={{
                                        backgroundColor: getResizeBarColor(d.usercreatedbyid)
                                    }}></div>
                                    <div style={{maxHeight: "60%"}} className={"no-pointer-events"}>
                                        <p>{internal_to_time(d.timestart) + " - " + internal_to_time(d.timeend)}</p>
                                        <p>Modul</p>
                                    </div>
                                    <div className={"resize-grab"} id={"grabdown"} style={{
                                        backgroundColor: getResizeBarColor(d.usercreatedbyid)
                                    }}></div>
                                </div>))}
                            </div>
                        </div>


                        <div className={"overlay"} style={{backgroundColor: "rgba(0, 0, 0, 0)"}}>
                            {/*maps a list of internal time stamps to lines and time stamps*/}
                            {temp.map(i => (<div style={{
                                width: "100%",
                                height: cellHeight * 2,
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-around",
                                alignItems: "center",
                            }} className={"no-pointer-events"}>
                                <div style={{
                                    borderBottom: "1px solid #363636",
                                }}><p style={{
                                    color: "gray",
                                    marginTop: cellHeight - 3,
                                    marginRight: 120,
                                    fontSize: 12,
                                    textAlign: "center"
                                }}>{internal_to_time(i + 1)}</p></div>

                                <div style={{
                                    borderBottom: "1px solid #363636",
                                }}><p style={{
                                    color: "gray",
                                    marginTop: cellHeight - 3,
                                    marginRight: 120,
                                    fontSize: 12,
                                    textAlign: "center"
                                }}>{internal_to_time(i + 1)}</p></div>
                                <div style={{
                                    borderBottom: "1px solid #363636",
                                }}><p style={{
                                    color: "gray",
                                    marginTop: cellHeight - 3,
                                    marginRight: 120,
                                    fontSize: 12,
                                    textAlign: "center"
                                }}>{internal_to_time(i + 1)}</p></div>
                                <div style={{
                                    borderBottom: "1px solid #363636",
                                }}><p style={{
                                    color: "gray",
                                    marginTop: cellHeight - 3,
                                    marginRight: 120,
                                    fontSize: 12,
                                    textAlign: "center"
                                }}>{internal_to_time(i + 1)}</p></div>
                                <div style={{
                                    borderBottom: "1px solid #363636",
                                }}><p style={{
                                    color: "gray",
                                    marginTop: cellHeight - 3,
                                    marginRight: 120,
                                    fontSize: 12,
                                    textAlign: "center"
                                }}>{internal_to_time(i + 1)}</p></div>
                                <div style={{
                                    borderBottom: "1px solid #363636",
                                }}><p style={{
                                    color: "gray",
                                    marginTop: cellHeight - 3,
                                    marginRight: 120,
                                    fontSize: 12,
                                    textAlign: "center"
                                }}>{internal_to_time(i + 1)}</p></div>
                            </div>))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}