import React, { useRef } from 'react';
import SocketIOClient from 'socket.io-client'
import { useEffect } from 'react';
import Paper from "@material-ui/core/Paper";
import useStyle from './Style'
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from '@material-ui/icons/Send';
import classNames from 'classnames';
import DeleteIcon from '@material-ui/icons/Delete';
const Chatroom = (props) => {
    const messages = [
        {
            id: "",
            msg: "سلام خوب هستید ؟",
            sender: {
                name: "علی",
                gender: 0,
            },
        },
        {
            id: "",
            msg: "خیلی ممنون",
            sender: {
                name: "محمد",
                gender: "0",
            },
        },
        {
            id: "",
            msg: "خبببببببب",
            sender: {
                name: "علی",
                gender: "0",
            },
        },
        {
            id: "",
            msg: "چیکار داری ؟!",
            sender: {
                name: "علی",
                gender: "0",
            },
        },
        {
            id: "",
            msg: "فردا امتحان چی داریم ؟",
            sender: {
                name: "محمد",
                gender: "0",
            },
        },
        {
            id: "",
            msg: "امتحان کنسله",
            sender: {
                name: "زهرا",
                gender: "1",
            },
        },
    ];
    const [newMessage, setNewMessage] = React.useState([])
    const classes = useStyle();
    const socket = React.useRef(SocketIOClient.connect("http://localhost:3010/socket"));
    React.useEffect(() => {
        console.log("render use effect", props.location.state);

    })
    return (
        <div>
            <Paper className={classes.paper}>
                <Grid container direction={"column"}>
                    <Grid item className={classes.header} container alignItems={"center"} justify={"center"}>
                        <Typography className={classes.headerText}>
                            Chatroom
                        </Typography>
                    </Grid>
                    <Grid item className={classes.middle} direction={"column"}>
                        {
                            messages.map((message) => {
                                return <Grid item container
                                    className={classNames(classes.messageParent,
                                        message.sender.name !== props.location.state.name && classes.message_reverse)}
                                    alignItems={"center"}>
                                    <Grid item>

                                        <img title={message.sender.name} src={message.sender.gender === 0 ? "/images/male_user.png" : "/images/famale_user.png"} alt={message.sender.name} className={classes.avatar} />
                                    </Grid>

                                    <Grid item>
                                        <div className={classes.message}>
                                            <Typography >
                                                {message.msg}
                                            </Typography>
                                        </div>
                                    </Grid>

                                </Grid>
                            })
                        }



                    </Grid>

                    <Grid item className={classes.footer} container alignItems={"center"} justify={"center"}>
                        <Grid item xs>
                            <InputBase value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className={classes.input} />
                        </Grid>

                        <Grid item >
                            <IconButton className={classes.btnsend} >
                                <SendIcon />
                            </IconButton>
                        </Grid>


                    </Grid>
                </Grid>
            </Paper>
        </div >
    )
}

export default Chatroom