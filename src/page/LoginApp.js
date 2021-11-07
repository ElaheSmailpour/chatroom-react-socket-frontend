
import { useState } from "react";
const LoginApp = (props) => {
    const [name, setName] = useState("")
    const [gender, setGender] = useState("")
    const validation = (user) => {
        console.log("validation", user);
        if (!user.name)
            return "enter your Name:";
        else if (user.gender === "" || user.gender === -1)
            return "enter your Gender:";
        return null;
    }
    const submit = () => {
        console.log(name, gender);
        const error = validation({ name, gender });
        if (error)
            return alert(error);
        props.history.push({
            pathname: "chatroom",
            state: {
                name,
                gender,
            }
        });
    }
    return (
        <div>
            <h1>Chatroom</h1>
            <label>Name</label>
            <input type="text" placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
            <label>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value={-1}>None</option>
                <option value={0}>Men </option>
                <option value={1}>Women</option>


            </select>
            <button onClick={submit}>Login Chatroom</button>
        </div>
    )
}

export default LoginApp