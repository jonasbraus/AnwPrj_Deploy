import StatusBar from "@/components/StatusBar";
import React, {useEffect} from "react";
import Button from "@/components/Button";
import {deleteItem, editItem} from "@/components/Icons";

export default function SemesterTile(p)
{
    useEffect(() =>
    {
        window.addEventListener("contextmenu", (e) => (e.preventDefault()))
    })

    return (
        <div onClick={(e) => p.onClick(e)} className={"semester-tile box-shadow"}>
            <p>{p.text}</p>
            <StatusBar progress={0}/>
            <div style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 5
            }}>
                <Button icon={deleteItem} width={30} height={30} color={"#ffffff"} onClick={p.onButtonDeleteClick}/>
                <Button icon={editItem} width={30} height={30} color={"#ffffff"} onClick={p.onButtonEditClick}/>
            </div>
        </div>
    )
}