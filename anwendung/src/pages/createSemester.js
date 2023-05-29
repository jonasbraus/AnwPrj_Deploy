import InputForm from "@/components/InputForm";
import {useRouter} from "next/router";
import Logout from "@/components/Logout";
import {useEffect} from "react";

export default function CreateSemester()
{
    const router = useRouter();
    let {courseName, startDate, endDate} = router.query;


    return (
        <div className={"normal-centered"}>
            <Logout/>
            <InputForm startDate={startDate} endDate={endDate} courseName={courseName}/>
        </div>
    )
}