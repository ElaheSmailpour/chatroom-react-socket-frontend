
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
import Picker from 'emoji-picker-react';
import { Done as SentIcon, DoneAll as SeenIcon } from '@material-ui/icons';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import {
  AttachFileRounded,

  MicRounded as MicIcon,
} from '@material-ui/icons';

import axios from 'axios';
import { ReactMic } from 'react-mic';
const MessageBody = ({ message, classes }) => {
  if (message.type === 'voice')
    return (
      <audio controls>
        <source src={message.path} type={'audio/mpeg'} />
      </audio>
    );
  if (message.type === 'file')
    return (
      <div>
        <a target={'_blank'} href={message.path} className={classes.attachLink}>
          <Typography>
            {message.path.substring(message.path.lastIndexOf('-') + 1)}
          </Typography>
          <AttachFileRounded className={classes.attachIcon} />
        </a>
      </div>
    );
  else return <Typography>{message.msg}</Typography>;
};
const Chatroom = (props) => {
  const classes = useStyle();
  const scrollableGrid = useRef();
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState("");
  const [messageForEdit, setMessageForEdit] = useState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [record, setRecord] = useState(false);
  const [attachment, setAttachment] = useState()

  const [isTyping, setIsTyping] = useState()
  const [isTypingReceiver, setIsTypingReceiver] = useState();

  const socket = useRef();
  const userRef = useRef();
  const isTypingTimeoutId = useRef();
  const inputFileRef = useRef()
  useEffect(() => {
    userRef.current = user;
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
    if (!user)
    
      return;
    
    axios.get(`http://localhost:3010/getMessages/${props.location.state.name}/${user}`).then((res) => {

     setMessages(res.data.map(message => ({id : message._id,msg : message.message,sender : {name : message.sender,gender  : message.gender},receiver : {name : message.receiver}})))
    }).catch((err) => {
      alert("error getMessages")
    })
  }, [user])
  useEffect(() => {
    console.log('render use effect', props.location.state);
    socket.current.on('newMessage', (message) => {
      console.log(message);
      setMessages((messages) => messages.concat(message));
      scrollableGrid.current?.scroll(0, scrollableGrid.current?.scrollHeight);
      if (message.sender.name !== props.location.state.name)
        socket.current.emit('seenMessage', {
          id: message.id,
          sender: props.location.state.name,
          receiver: userRef.current,
        });
    });
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
    socket.current.on('seenMessage', (id) => {
      setMessages((messages) => {
        const index = messages.findIndex((item) => item.id == id);
        console.log(id, index);
        if (index !== -1) {
          return [
            ...messages.slice(0, index),
            { ...messages[index], seen: true },
            ...messages.slice(index + 1),
          ];
        } else return messages;
      });
    });

    socket.current.on('isTyping', ({ username, isTyping }) => {

      if (props.location.state.name !== username) {
        console.log('user : ' + username + ' isTyping:' + isTyping);
        setIsTypingReceiver(isTyping);
      }


    });

    socket.current.on('leftChat', (username) => {

      if (props.location.state.name !== username) {
        
      alert(username + "not online")
      }


    }, );
  }, []);



  const handleChangeMessage = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping) setIsTyping(true);
    if (isTypingTimeoutId.current)
      clearTimeout(isTypingTimeoutId.current);
    isTypingTimeoutId.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };
  useEffect(() => {
    socket.current.emit("isTyping", {
      sender: props.location.state.name,
      receiver: user,
      isTyping
    })
  }, [isTyping])

  // useEffect(() => {
  //   console.log('change isTyping:', isTyping);
  //   socket.current.emit('isTyping', {
  //     sender: props.location.state.name,
  //     receiver: user,
  //     isTyping,
  //   });
  // }, [isTyping])

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
  const onChangeFile = (e) => {
    const files = e.target.files
    if (files && files.length > 0)
      setAttachment(files[0])
    const data = new FormData();
    data.append("file", files[0])
    axios.post("http://localhost:3010/uploadFile", data).then((res) => {
      const filePath = res.data.filePath
      socket.current.emit("uploadFile", {
        path: filePath,
        sender: {
          name: props.location.state.name,
          gender: props.location.state.gender,
        },
        receiver: {
          name: userRef.current
        }
      })
      alert(" AttachFile send successfully")
    }).catch((err) => {
      console.log("errorAttachFile:", err)
      alert(" AttachFile send  not successfully")
    })
  }
  const attachFile = () => {
    inputFileRef.current.click()
  }



  const onEmojiClick = (event, emojiObject) => {

    setNewMessage(newMessage + emojiObject.emoji)
  };
  return (
    <div>
      <Paper className={classes.paper}>
        <Grid container direction={"column"}>
          <Grid item container>
            {users.map(userItem => <div onClick={() => joinChatWithUser(userItem.username)} className={classNames(classes.userItem, userItem.username === user && classes.userItemActive)}>{userItem.username}</div>)}
          </Grid>
        </Grid>
        <Grid container direction={"column"}>
          <Grid item className={classes.header} container alignItems={"center"} justifyContent={"center"}>
            <Typography className={classes.headerText}>

              {`chat with ${user} ${isTypingReceiver ? '(Typing...)' : ''}`}
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
                      <MessageBody message={message} classes={classes} />

                      <div style={{ display: 'flex', alignItems: 'center' }}>

                        {message.sender.name === props.location.state.name &&
                          (message.seen ? (
                            <SeenIcon style={{ marginLeft: '0.5rem' }} />
                          ) : (
                            <SentIcon style={{ marginLeft: '0.5rem' }} />
                          ))}
                        <Typography className={classes.date}>
                          {message.date && message.date.split("T")[1].split(".")[0]}
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
                            <IconButton style={{ marginRight: '1rem', }}>
                              <AttachFileRounded className={classes.attachBtn} onClick={attachFile} />
                              <input ref={inputFileRef} type="file" style={{ display: "none" }} onChange={onChangeFile} />
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
          <Grid item className={classes.footer} container justifyContent={'center'} alignItems={"center"}>
            <Grid item className={classes.emogiHover}>
              <IconButton
                className={classes.btnSend}

              >
                <EmojiEmotionsIcon />
              </IconButton>
              <Picker onEmojiClick={onEmojiClick} />
            </Grid>
            <Grid item>
              <IconButton
                className={classes.btnSend}
                onClick={startRecordVoice}
              >
                <MicIcon style={{ color: record ? 'green' : 'initial' }} />
              </IconButton>
            </Grid>
            <Grid item xs>
              <InputBase value={newMessage} onChange={handleChangeMessage}
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
