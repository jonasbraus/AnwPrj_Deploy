import Button from "@/components/Button";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import Background from "@/components/Background";


let userModuleMapping = new Map()

export default function InputForm(p) {

    let startDateParam = "";
    let endDateParam = "";
    let courseNameParam = "";

    if (p.startDate != null) startDateParam = p.startDate;
    if (p.endDate != null) endDateParam = p.endDate;
    if (p.courseName != null) courseNameParam = p.courseName;

    const router = useRouter();

    const [startDate, setStartDate] = useState(startDateParam);
    const [endDate, setEndDate] = useState(endDateParam);
    const [courseName, setCourseName] = useState(courseNameParam);
    const [users, setUsers] = useState([]);
    const [checkedSelected, setCheckedSelected] = useState(new Array(100).fill(false))
    const [activatedSelected, setActivatedSelected] = useState(new Array(100).fill(false))
    const [modulesNames, setModulesNames] = useState(new Array(100).fill("Please Select"))

    async function getAllUsers() {
        console.log("update")
        let sessionid = localStorage.getItem("sessionid");
        let url = "http://localhost:8080/users/all?sessionid=" + sessionid;


        await fetch(url).then(response => response.json()).then(async user => {
            setUsers(user)
            let mURL = "http://localhost:8080/module/suid?sessionid=" + localStorage.getItem("sessionid") + "&semesterid=" + localStorage.getItem("currentsid") + "&userid=";
            for(let i = 0; i < user.length; i++)
            {
                mURL += user[i].id;
                if(i < user.length - 1)
                {
                    mURL += "a";
                }
            }

            fetch(mURL).then(result => result.json()).then(m => {
                let temp = []

                for(let i = 0; i < user.length; i++)
                {
                    temp.push(m[i] != null);
                }

                setCheckedSelected(temp);

                temp = []

                for(let i = 0; i < user.length; i++)
                {
                    temp.push(m[i] != null && m[i].activated === 1);

                    if(m[i] != null) {
                        let tempModuleInfo = new UserModuleInfo();
                        tempModuleInfo.setModuleName(m[i].name);
                        tempModuleInfo.setActivated(m[i].activated);
                        tempModuleInfo.setChecked(true);
                        tempModuleInfo.setUserid(user[i].id)
                        userModuleMapping.set(user[i].id, tempModuleInfo)
                    }
                }

                setActivatedSelected(temp);

                temp = []

                for(let i = 0; i < user.length; i++)
                {
                    temp.push(m[i] == null ? "Please Select" : m[i].name);
                }

                setModulesNames(temp);

            });

            for(let i = 0; i < user.length; i++)
            {
                if(!userModuleMapping.has(user[i].id)) {
                    let tempModuleInfo = new UserModuleInfo();
                    tempModuleInfo.setModuleName("Please Select");
                    tempModuleInfo.setActivated(0);
                    tempModuleInfo.setChecked(false);
                    tempModuleInfo.setUserid(user[i].id)
                    userModuleMapping.set(user[i].id, tempModuleInfo)
                }
            }
        });
    }

    useEffect(() => {
        getAllUsers()
        userModuleMapping.clear();
    }, [])


    async function onCreateClicked() {
        let startSplit = startDate.split("-");
        let endSplit = endDate.split("-");
        let startYear = parseInt(startSplit[0]);
        let endYear = parseInt(endSplit[0]);

        //month - 1 because jan = 0, day like month... but because of next lines 3 to 4 not - 1
        let startInternalDate = new Date(startYear, parseInt(startSplit[1]) - 1, parseInt(startSplit[2]))
        let endInternalDate = new Date(endYear, parseInt(endSplit[1]) - 1, parseInt(endSplit[2]))

        let startDayInYear = Math.round((startInternalDate - new Date(startYear, 0, 0)) / (1000 * 60 * 60 * 24));
        let endDayInYear = Math.round((endInternalDate - new Date(endYear, 0, 0)) / (1000 * 60 * 60 * 24));

        let id = p.courseName == null ? 0 : localStorage.getItem("currentsid");

        let json = {
            "id": id,
            "startday": startDayInYear,
            "endday": endDayInYear,
            "name": courseName,
            "startyear": startYear,
            "endyear": endYear
        }

        let url = "http://localhost:8080/semester?sessionid=" + localStorage.getItem("sessionid");
        let method = p.courseName == null ? "POST" : "PUT";


        let semesterid = localStorage.getItem("currentsid");
        let tempsid = 0;
        await fetch(url, {
            method: method,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(json)
        }).then(response => response.json()).then(semester => {
            tempsid = semester.id
        });


        if (method === "POST") {
            semesterid = tempsid;
        }

        for (let [key, value] of userModuleMapping) {

            let json1 = {
                "id": 0,
                "userid": value.getUserid(),
                "semesterid": semesterid,
                "name": value.getModuleName(),
                "activated": value.getActivated()
            }
            if (value.getChecked()) {
                let updateURL = "http://localhost:8080/module?sessionid=" + localStorage.getItem("sessionid");
                await fetch(updateURL, {
                    method: method,
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(json1)
                })
            }
            else
            {
                let deleteURL = "http://localhost:8080/module?sessionid=" + localStorage.getItem("sessionid") +
                    "&semesterid=" + semesterid +
                    "&userid=" + value.getUserid();
                await fetch(deleteURL, {
                    method: "DELETE"
                })
            }
        }

        router.back();
    }

    class UserModuleInfo {
        constructor() {
            this.moduleName = "";
            this.userid = 0;
            this.activated = 0
            this.checked = false
        }

        getModuleName() {
            return this.moduleName
        }

        getUserid() {
            return this.userid
        }

        getActivated() {
            return this.activated
        }

        getChecked() {
            return this.checked
        }

        setModuleName(name) {
            this.moduleName = name
        }

        setUserid(id) {
            this.userid = id
        }

        setActivated(a) {
            this.activated = a
        }

        setChecked(b) {
            this.checked = b
        }
    }

    function onModuleClicked(user, module, index) {

        if (userModuleMapping.has(user.id)) {
            let temp = userModuleMapping.get(user.id)
            temp.setModuleName(module)
            temp.setUserid(user.id)
        }

        let temp = [];

        for(let i = 0; i < modulesNames.length; i++)
        {
            temp.push(modulesNames[i]);
        }

        temp[index] = module;

        setModulesNames(temp);
    }

    function onSelectedCheckBox(user, state, index) {
        if (userModuleMapping.has(user.id)) {
            userModuleMapping.get(user.id).setChecked(state.target.checked);
        } else {
            let temp = new UserModuleInfo()
            temp.setChecked(state.target.checked)
            temp.setUserid(user.id)
            userModuleMapping.set(user.id, temp)
        }
        let temp = []

        for(let i = 0; i < checkedSelected.length; i++)
        {
            temp.push(checkedSelected[i]);
        }

        temp[index] = state.target.checked;

        setCheckedSelected(temp);

    }

    function onActivatedCheckBox(user, state, index) {
        if (userModuleMapping.has(user.id)) {
            let t = state.target.checked ? 1 : 0;
            userModuleMapping.get(user.id).setActivated(t);
            console.log(userModuleMapping.get(user.id).getActivated())
        }

        let temp = []

        for(let i = 0; i < checkedSelected.length; i++)
        {
            temp.push(activatedSelected[i]);
        }

        temp[index] = state.target.checked;

        setActivatedSelected(temp);

    }

    return (
        <>
            <Background/>
            <div className="inputForm box-shadow">
                <p style={{
                    fontSize: "18px",
                    color: "#777777",
                    fontWeight: 500,
                    width: 150
                }}>SemesterName</p>
                <input className="courseNameInput box-shadow" value={courseName}
                       onChange={(e) => setCourseName(e.target.value)}/>
                <div className="semesterRangeInput">
                    <div className="semesterDateLables">
                        <p className="semesterDateLable" style={{
                            fontSize: " 18px",
                            color: "#777777",
                            fontWeight: 500,
                            width: 150
                        }}>Semesterstart</p>
                        <p className="semesterDateLable" style={{
                            fontSize: " 18px",
                            color: "#777777",
                            fontWeight: 500,
                            width: 150
                        }}>Semesterende</p>
                    </div>
                    <div className="semesterDateInputPair">
                        <input type="date" id="start" className={"box-shadow selector"} value={startDate}
                               style={{padding: 5}}
                               onChange={(e) => setStartDate(e.target.value)}/>
                        <p className="inputFieldSeperator">-</p>
                        <input type="date" id="start" className={"box-shadow selector"} value={endDate}
                               style={{padding: 5}}
                               onChange={(e) => setEndDate(e.target.value)}/>
                    </div>
                </div>
                <div className="round-border dozentSelector">
                    <table>
                        <tbody>
                        <tr>
                            <th style={{
                                fontSize: " 18px",
                                color: "#777777",
                                fontWeight: 500,
                            }}>Wählen
                            </th>
                            <th style={{
                                fontSize: " 18px",
                                color: "#777777",
                                fontWeight: 500,
                            }}>Freischalten
                            </th>
                            <th style={{
                                fontSize: " 18px",
                                color: "#777777",
                                fontWeight: 500,
                                textAlign: "center"
                            }}>Dozent
                            </th>
                            <th style={{
                                fontSize: " 18px",
                                color: "#777777",
                                fontWeight: 500,
                                textAlign: "center",
                            }}>Modul
                            </th>
                        </tr>
                        {users.map((user, i) => (
                            <tr>

                                <td>
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                    }}><input type="checkbox" onChange={(e) => {
                                        onSelectedCheckBox(user, e, i)
                                    }} checked={checkedSelected[i]}/></div>
                                </td>

                                <td>
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                    }}><input type="checkbox" onChange={(e) => {
                                        onActivatedCheckBox(user, e, i);
                                    }} checked={activatedSelected[i]}/></div>
                                </td>
                                <td style={{textAlign: "center"}}>{user.firstName + " " + user.lastName}</td>
                                <select id={"userSelect"} name={"userSelect"} className={"box-shadow selector"}
                                        multiple={false} style={{
                                    maxHeight: 80,
                                    marginTop: 10,
                                    padding: "5px 2px"
                                }} onChange={(e) => {
                                    onModuleClicked(user, e.target.value, i)
                                }} value={modulesNames[i]}>
                                    <option value={"Please Select"}>Please Select</option>
                                    <option value={"Programmieren"}>Programmieren</option>
                                    <option value={"BWL"}>BWL</option>
                                    <option value={"Lineare Algebra"}>Lineare Algebra</option>
                                    <option value={"Analysis"}>Analysis</option>
                                    <option value={"AnwendungsProjekt"}>AnwendungsProjekt</option>
                                </select>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div id="buttons">
                    <Button color="rgba(54,54,54,0.64)" width="100px" height="30px" text="Abbrechen" onClick={() => {
                        router.back()
                    }}/>
                    <Button color="#77932b" width="100px" height="30px" text="Speichern" onClick={() => {
                        onCreateClicked()
                    }}/>
                </div>
            </div>
        </>
    )
}