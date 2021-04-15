import React from "react";
import Link from 'next/link'
import styles from './styles/assignmentchecklist.module.scss'
import { makeStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';


const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%"
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  actionsContainer: {
    marginBottom: theme.spacing(2)
  },
  resetContainer: {
    padding: theme.spacing(3)
  }
}));


function formatTimestamp(timestamp) {
  var d = new Date(timestamp);
  return ((d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear());

}
function getSteps() {
  return [
    ["Initialize: ", { 'link': '/assignments/initialchecklist/initialchecklist' }],
    ["Assignment Due Date: ", { 'date': "status" }],
    ["Peer Matching: ", { 'link': "/assignments/matching/matching" }],
    ["Review Due Date: ", { 'date': "status" }],
    ["Additional Matches: ", { 'link': "/assignments/checkmatching" }],
    ["TA Grading: ", { 'link': "/assignments/tamatchinglist/tamatchinglist" }],
    ["Review and Submission Reports: ", { 'link': "/assignments/reportlist/reportlist" }],
    // ["Submission Reports: ", { 'link': "/assignments/submissionreportlist/submissionreportlist" }],
    ["Appeal Period: ", { 'status': "Either Not started, Ongoing or Passed" }]
  ];
}

function incActiveStep(activeStep){
  if (activeStep == 7){
    return 0
  }
  else{
    return activeStep + 1
  }
}
function assignmentchecklist(props) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(1);
  const [peerReviews, setPeerReviews] = React.useState(true); // true if peer reviews are enabled
  const [rubric, setRubric] = React.useState(''); // state for the rubric
  // const [dueDate, setDueDate] = React.useState(Date.now()); // original assignment due date
  const [prDueDate, setPrDueDate] = React.useState(Date.now()); // PR assignment due date
  let assignmentId = props.assignmentId; // id of currently selected assignment
  let assignmentName = props.assignmentName;
  let dueDate = props.dueDate;
  let rubricId = props.rubricId;
  const steps = getSteps();

  return (
    <div className={classes.root}>
      <div className={styles.header}>Assignment Checklist</div>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label) => {

          // only for enabling and disabling peer reviews
          if (label[1].switch) {
            return (
              <Step key={label[0]}>
                <StepLabel>
                  {label[0]}
                  <Switch color="primary" checked={peerReviews ? true : false} onChange={() => setPeerReviews(!peerReviews)} />
                </StepLabel>
              </Step>)
          }
          // only for picking dates
          if (label[1].date) {
            return (
              <Step key={label[0]}>
                <StepLabel>
                  {/* TO DO : CHANGE INLINE STYLING */}
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ marginRight: '10px' }}>{label[0]}</div>
                    {formatTimestamp(label[0] == "Assignment Due Date: " ? dueDate : prDueDate)}
                  </div>
                </StepLabel>

              </Step>)
          }
          if (label[1].status) {
            return (
              <Step key={label[0]}>
                <StepLabel>{label[0] + label[1].status}</StepLabel>
              </Step>)
          }
          else {
            return (
              <Step key={label[0]}>
                <StepLabel>{label[0]}
                <Link href={{ pathname: label[1].link, query: { assignmentId: assignmentId, assignmentName: assignmentName, rubricId: rubricId, dueDate: dueDate } }}>
                  Edit
                </Link>
                  {/* <Link href={label[1].link} assignmentId={assignmentId} assignmentName={assignmentName}>Edit</Link> */}
                </StepLabel>
              </Step>)
          }
        })}
      </Stepper>
      <Button variant="contained" color="primary" style={{marginLeft: '20px'}} onClick={()=>setActiveStep(incActiveStep(activeStep))}>
        Next Step
      </Button>
    </div>
  );
}

export default assignmentchecklist;