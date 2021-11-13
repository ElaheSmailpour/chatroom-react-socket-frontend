import React from 'react';
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import useStyle from './Style'
import classNames from 'classnames';
import Axios from "axios"

const LoginApp = (props) => {

  const [name, setName] = React.useState("");
  const [gender, setGender] = React.useState("");


  //methods
  const validation = (user) => {
    console.log("validation", user);
    if (!user.name)
      return "Enter your Name";
    else if (user.gender === "" || user.gender === -1)
      return "Enter your Gender";
    return null;
  }
  const submit = () => {
    console.log(name, gender);
    const error = validation({ name, gender });
    if (error)
      return alert(error);
    Axios.post("http://localhost:3010/login", {
      username: name,
      gender,

    }).then(res => {
      props.history.push({
        pathname: "chatroom",
        state: {
          name,
          gender,
        }
      });
    }).catch(err => {
      console.log("err=", err)
      alert("error login!")
    })


  }

  const classes = useStyle();
  return (
    <Grid container direction={"column"}>
      <Grid item>
        <Typography className={classes.headerText}>
          Chatroom
        </Typography>
      </Grid>
      <Grid item container justify={"center"} alignItems={"center"} spacing={2}>
        <Grid item>
          <label className={classes.label}>Name:</label>
        </Grid>
        <Grid item>
          <TextField id="outlined-basic" variant="outlined"
            value={name} onChange={e => setName(e.target.value)} />
        </Grid>
      </Grid>
      <Grid item container justify={"center"} alignItems={"center"}
        spacing={2} style={{ marginTop: '2rem' }}>
        <Grid item>
          <label className={classes.label}>Gender:</label>
        </Grid>
        <Grid item>
          <FormControl variant="outlined" className={classNames(classes.formControl, classes.formControl1)}>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={gender}
              onChange={e => setGender(e.target.value)}
              label="gender"
            >
              <MenuItem value={-1}>
                <em>None</em>
              </MenuItem>
              <MenuItem value={0}>men</MenuItem>
              <MenuItem value={1}>women</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Grid item container justify={"center"}>
        <Button variant="contained" color="primary" className={classes.button} onClick={submit}>
          Login
        </Button>
      </Grid>
    </Grid>
  );
};

export default LoginApp;