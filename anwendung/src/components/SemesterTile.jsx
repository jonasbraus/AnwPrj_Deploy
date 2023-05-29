import StatusBar from "@/components/StatusBar";
import React, {useEffect} from "react";
import Button from "@/components/Button";
import {deleteItem, editItem} from "@/components/Icons";

export default function SemesterTile(p)
{
    let editable = true;
    if (p.editable != null)
    {
        editable = p.editable
    }
    useEffect(() =>
    {
        window.addEventListener("contextmenu", (e) => (e.preventDefault()))
    })

    return (
        <div onClick={(e) => p.onClick(e)} className={"semester-tile box-shadow"}>
            <p style={{
                lineHeight: "80%"
            }}>{p.text}</p>
            <p style={{
                lineHeight: "80%",
                color: "gray"
            }}>{p.text2}</p>
            <StatusBar progress={0}/>
            <div style={{
                display: editable ? "flex" : "none",
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