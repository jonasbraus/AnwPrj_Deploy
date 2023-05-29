import Button from "@/components/Button";
import React, {useEffect, useState} from "react";
import SemesterTile from "@/components/SemesterTile";
import InputForm from "@/components/InputForm";
import {useRouter} from "next/router";
import PopUp from "@/components/PopUp";
import Background from "@/components/Background";
import Logout from "@/components/Logout";

export default function SemesterOverview(p)
{
    async function getSemesters()
    {
        let urlTest = "http://localhost:8080/semester/all?sessionid=" + localStorage.getItem("sessionid");


            await fetch(urlTest).then(response => response.json()).then(s => {
                setEntries(s)
            })

    }

    function onClickSemester(e, m)
    {
        if(m.target === m.currentTarget)
        {
            localStorage.setItem("currentsid", e.id)
            router.push("/planning")
        }

    }

    function onClickNewSemester()
    {
        localStorage.setItem("currentsid", 0);
        router.push("/createSemester");
    }


    function togglePopup()
    {
        if(modalDisplay === "block")
        {
            setModalDisplay("none");
        }
        else
        {
            setModalDisplay("block");
        }
    }

    function funcButtonAbort()
    {
        togglePopup();
    }

    async function funcButtonDelete()
    {
        let id = localStorage.getItem("currentsid");
        let url = "http://localhost:8080/semester?sessionid=" + localStorage.getItem("sessionid") + "&id=" + id;
        await fetch(url, {
            method: "DELETE"
        });

        togglePopup();
        getSemesters();
    }

    async function funcButtonEdit(e, m)
    {

        localStorage.setItem("currentsid", e.id);
        let semester = e;

        let startYear = semester.startyear;
        let endYear = semester.endyear;
        let startDay = semester.startday;
        let endDay = semester.endday;
        //+1 because input field shows date in another way then the date object does
        let startDate = new Date(startYear, 0, startDay + 1);
        let endDate = new Date(endYear, 0, endDay + 1);

        await router.push({
            pathname: "/createSemester",
            query: {courseName: semester.name, startDate: startDate.toISOString().slice(0, 10), endDate: endDate.toISOString().slice(0, 10)},
        });
        getSemesters();
    }

    useEffect(() => {
        getSemesters();

    }, [])


    const [entries, setEntries] = useState([])
    const [modalDisplay, setModalDisplay] = useState("none");
    const [modalHint, setModalHint] = useState("");
    const router = useRouter()

    return (
        <div className={"semester-overview"}>
            <Logout/>
            <Background/>
            {
                entries.map(e => (<SemesterTile text={e.name} onClick={(f) => onClickSemester(e, f)} onButtonDeleteClick={() => {
                        localStorage.setItem("currentsid", e.id)
                        setModalHint(e.name + " Löschen?");
                        togglePopup();
                }} onButtonEditClick={(m) => {
                    localStorage.setItem("currentsid", e.id)
                    funcButtonEdit(e, m);
                }}/>))
            }
            <Button color={"#dcdcdc"} text={"+"} width={240} height={160} fontColor={"black"} fontSize={50}
            onClick={() => onClickNewSemester()}/>
            <PopUp hint={modalHint} text1={"Abbrechen"} text2={"Löschen"} displayState={modalDisplay}
            function1={funcButtonAbort} function2={funcButtonDelete}/>
        </div>
    )
}