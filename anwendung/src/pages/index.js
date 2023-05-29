import {Inter} from 'next/font/google'
import React, {useState} from "react";
import StatusBar from "@/components/StatusBar";
import Button from "@/components/Button";
import {arrowLeft, arrowRight} from "@/components/Icons";
import WeekSelector from "@/components/WeekSelector";
import PopUp from "@/components/PopUp";
import CalenderView from "@/components/CalenderView";
import DateElement from "@/components/DateElement";
import InputForm from "@/components/InputForm";
import Login from "@/components/Login";
import Test from "@/components/Test";
import BasicDateCalendar from "@/components/CalendarSideBar";
import {randomInt} from "next/dist/shared/lib/bloom-filter/utils";
import Background from "@/components/Background";


const inter = Inter({subsets: ['latin']})

export default function Home(p) {

    return (


        <div className={"normal-centered"}>
            <Background/>
            <h1 style={{
                fontSize: 40,
                fontWeight: "bold",
                color: "#77932b",
                marginBottom: "5%",
                textShadow: "2px 2px 2px rgba(0, 0, 0, 0.2)",
                textAlign: "center"
            }}>Willkommen in deinem Vorlesungsplaner</h1>
            <Login/>
        </div>
    )
}