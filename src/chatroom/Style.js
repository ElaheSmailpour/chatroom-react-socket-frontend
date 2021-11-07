import {makeStyles} from "@material-ui/styles";

export default makeStyles(theme => ({
  paper: {
    width: '50rem',
    height: 'max-content',
    margin: '3rem auto'
  },
  header: {
    background: "#DDE",
    height: '5rem',
  },
  middle: {
    background:"white",
    height: '20rem',
    overflowY:"auto"
  },
  footer: {
    background:"grey",
    height: 'max-content'
  },
  headerText:{
    fontSize: '2.5rem',
    marginRight: '1rem',
  },
  input: {
    flex: "1",
    width: '100%',
    background: "#fafafa",
    margin: "1rem",
    padding: "1rem",
    border: "2px solid #cacaca",
    borderRadius: "1rem",
    height: "3rem",
  },
  btnsend:{
    margin:"1rem"
  },
  avatar:{
    width: '4rem',
   borderRaduis:"50%",
   marginleft: "1rem"
  },
  messageParent:{
    marginTop:"1rem"
  },
  message:{
    border: "1px solid #ebebeb",
    borderRadius: '2rem',
    backgroundColor: 'white',
    padding: '1rem 1.5rem'
  }
}))