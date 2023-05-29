import Button from "@/components/Button";
import React, {useEffect, useState} from "react";
import SemesterTile from "@/components/SemesterTile";
import InputForm from "@/components/InputForm";
import {useRouter} from "next/router";
import PopUp from "@/components/PopUp";
import Background from "@/components/Background";
import Logout from "@/components/Logout";
import {baseURL} from "@/components/Constants"

export default function SemesteroverviewLecturer(p) {
    function getModules() {
        let urlTest = baseURL + "/module/id?sessionid=" + localStorage.getItem("sessionid");

        fetch(urlTest).then(response => response.json()).then(m => {
            setEntries(m);
            let args = "";
            for(let i = 0; i < m.length; i++)
            {
                args += m[i].semesterid;

                if(i < m.length - 1)
                {
                    args += "a";
                }
            }

            let temp = []
            let semesterURL = baseURL + "/semester/id/all?ids=" + args + "&sessionid=" + localStorage.getItem("sessionid");
            fetch(semesterURL).then(r => r.json()).then(sem => {
                sem.map(e => {
                    temp.push(e.name)
                })
            }).then(() => setSemesterNames(temp))
        })

    }

    function onClickSemester(e, m) {
        if (m.target === m.currentTarget) {
            localStorage.setItem("currentsid", e.id)
            router.push("/planning")
        }

    }


    useEffect(() => {
        getModules();
    }, [])

    const [entries, setEntries] = useState([]);
    const [semesterNames, setSemesterNames] = useState([]);
    const router = useRouter();


    return (
        <div className={"semester-overview"}>
            <Logout/>
            <Background/>
            {entries.map((e, index) => (
                <SemesterTile
                    editable = {false} text={semesterNames[index]} text2={e.name} onClick={(f) => onClickSemester(e, f)}
                />
            ))}
        </div>
    );
}