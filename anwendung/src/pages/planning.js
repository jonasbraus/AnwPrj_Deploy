import CalenderView from "@/components/CalenderView";
import Background from "@/components/Background";
import Logout from "@/components/Logout";

export default function planning(p)
{

    return (
        <div className={"normal-centered"}>
            <Logout/>
            <Background/>
            <CalenderView/>
        </div>
    )
}