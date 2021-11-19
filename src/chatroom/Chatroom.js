import React, { useRef } from 'react';
import SocketIOClient from 'socket.io-client'
import { useEffect, useState } from 'react';
import Paper from "@material-ui/core/Paper";
import useStyle from './Style'
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from '@material-ui/icons/Send';
import classNames from 'classnames';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

import {
  AttachFileRounded,

  MicRounded as MicIcon,
} from '@material-ui/icons';

import axios from 'axios';
import { ReactMic } from 'react-mic';
const Chatroom = (props) => {
  const classes = useStyle();
  const scrollableGrid = useRef();
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState("");
  const [messageForEdit, setMessageForEdit] = useState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [record, setRecord] = React.useState(false);
  const socket = useRef();
  const userRef = useRef();

  useEffect(() => {
    userRef.current=user;
  }, [user])
  useEffect(() => {
    socket.current = SocketIOClient.connect("http://localhost:3010/socket");
  }, [])
  useEffect(() => {
    axios.get("http://localhost:3010/getUsers").then((res) => {
      setUsers(res.data.filter(item => item.username !== props.location.state.name))
    }).catch((err) => {
      alert("error getUsers")
    })
  }, [])
  useEffect(() => {
    console.log("render use effect", props.location.state);
    socket.current.on("newMessage", (message) => {
      console.log(message);
      setMessages(messages => messages.concat(message));
      scrollableGrid.current.scroll(0, scrollableGrid.current.scrollHeight);
    })
    socket.current.on("deleteMsg", id => {
      setMessages(lastMessages => lastMessages.filter(item => item.id !== id))


    })
    socket.current.on("editMessage", ({ msg, id }) => {
      setMessages(messages => {
        console.log("messages", messages)
        const message = messages.find(item => {

          return item.id === id
        })
        if (message)
          message.msg = msg;
        return messages
      })

    })
  }, []);





  const sendMessage = () => {
    if (!newMessage)
      return;
    if (messageForEdit) {
      socket.current.emit("editMessage", {
        id: messageForEdit,
        msg: newMessage,
        sender: props.location.state.name,
        receiver: user

      });
      setMessageForEdit(undefined)
    }
    else
      socket.current.emit("newMessage", {
        id: "",
        msg: newMessage,
        sender: {
          name: props.location.state.name,
          gender: props.location.state.gender,
        },
        receiver: {
          name: user
        }
      });
    setNewMessage("");
  }

  const _handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  }

  const onDeleteClick = (id) => {
    socket.current.emit("deleteMsg", id);
  };

  const onEditClick = (id, msg) => {
    setNewMessage(msg)
    setMessageForEdit(id)
  };


  const joinChatWithUser = (username) => {
    setMessages([]);
    if (user)
      socket.current.emit('leftChat', {
        username: user,
        myUsername: props.location.state.name,
      });
    setUser(username);
    socket.current.emit('joinChat', {
      username,
      myUsername: props.location.state.name,
    });
  };
  const startRecordVoice = () => {
    if (record)
      setRecord(false)
    else
      setRecord(true)

  }
  const onData = (recordedBlob) => {
    console.log('chunk of real-time data is: ', recordedBlob);
  };

  const onStop = (recordedBlob) => {
   
    console.log('recordedBlob is: ', recordedBlob);
    const formData = new FormData();
    formData.append('voiceMessage', recordedBlob.blob);
    axios.post("http://localhost:3010/uploadVoice", formData).then((res) => {
      socket.current.emit("uploadVoice", {
        path: res.data.filePath,
        sender: {
          name: props.location.state.name,
          gender: props.location.state.gender,
        },
        receiver: {
          name: userRef.current
        }
      })
      alert(" voice send successfully")
    }).catch((err) => {
      console.log("errorVoice:", err)
      alert(" voice send  not successfully")
    })
  }
  return (
    <div>
      <Paper className={classes.paper}>
        <Grid container direction={"column"}>
          <Grid item container>
            {users.map(userItem => <div onClick={() => joinChatWithUser(userItem.username)} className={classNames(classes.userItem, userItem.username === user && classes.userItemActive)}>{userItem.username}</div>)}
          </Grid>
        </Grid>
        <Grid container direction={"column"}>
          <Grid item className={classes.header} container alignItems={"center"} justify={"center"}>
            <Typography className={classes.headerText}>
              {`chat with ${user} `}
            </Typography>
          </Grid>
          <Grid item className={classes.middle} direction={"column"} ref={scrollableGrid}>
            {
              messages.map((message) => {
                return <Grid item container
                  className={classNames(classes.messageParent,
                    message.sender.name !== props.location.state.name && classes.message_reverse)}
                  alignItems={"center"}>
                  <Grid item>
                    <img title={message.sender.name}
                      src={message.sender.gender === 0 ? "/images/male_user.png" : "/images/famale_user.png"}
                      alt={message.sender.name} className={classes.avatar} />
                  </Grid>
                  <Grid item>
                    <div className={classNames(classes.message,
                      message.sender.name !== props.location.state.name ? classes.messageHe : classes.messageMe)}>
                      <Typography className={classes.sender}>
                        {message.sender.name}
                      </Typography>

                      {message.type === "voice" ? <audio controls>
                        <source src={message.path} type={"audio/mpeg"} />
                      </audio> :
                        <Typography>
                          {message.msg}
                        </Typography>
                      }
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography className={classes.date}>
                          {message.date.split("T")[1].split(".")[0]}
                        </Typography>
                        {
                          message.sender.name === props.location.state.name &&
                          <>
                            <IconButton style={{ marginRight: '1rem', }} onClick={() => onDeleteClick(message.id)}>
                              <DeleteIcon className={classes.deleteBtn} />
                            </IconButton>
                            <IconButton style={{ marginRight: '1rem', }} onClick={() => onEditClick(message.id, message.msg)}>
                              <EditIcon className={classes.editBtn} />
                            </IconButton>
                          </>
                        }
                      </div>
                    </div>
                  </Grid>
                </Grid>
              })
            }
          </Grid>
          <Grid item className={classes.footer} container justify={'center'} alignItems={"center"}>
            <Grid item>
              <IconButton
                className={classes.btnSend}
                onClick={startRecordVoice}
              >
                <MicIcon style={{ color: record ? 'green' : 'initial' }} />
              </IconButton>
            </Grid>
            <Grid item xs>
              <InputBase value={newMessage} onChange={e => setNewMessage(e.target.value)}
                className={classes.input} onKeyDown={_handleKeyDown} />
            </Grid>
            <Grid item>
              <IconButton className={classes.btnSend} onClick={sendMessage} >

                <SendIcon />
              </IconButton>

            </Grid>
          </Grid>
        </Grid>
      </Paper>
      <ReactMic
        record={record}
        className={classes.soundWave}
        onStop={onStop}
        onData={onData}
        strokeColor="#000000"
        backgroundColor="#FF4081"
      />
    </div>
  );
};

export default Chatroom