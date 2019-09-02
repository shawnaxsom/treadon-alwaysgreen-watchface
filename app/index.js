import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import userActivity from "user-activity";
import { HeartRateSensor } from "heart-rate";
import { display } from "display";

const month = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
const weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

clock.granularity = "seconds";

const background = document.getElementById("background");
const backgroundColor = document.getElementById("background-color");
const dateLabel = document.getElementById("dateLabel");
const dayLabel = document.getElementById("dayLabel");
const heartRateLabel = document.getElementById("heartRateLabel");
const hourlyStepsLabel = document.getElementById("hourlyStepsLabel");
const smallTimeLabel = document.getElementById("smallTimeLabel");
const timeLabel = document.getElementById("timeLabel");
const exerciseStepsLabel = document.getElementById("exerciseStepsLabel");
const totalStepsLabel = document.getElementById("totalStepsLabel");
const trajectoryStepsLabel = document.getElementById("trajectoryStepsLabel");

let stepsAtStartOfExercise = 0;
let stepsAtStartOfHour = 0;
let thisHour = 0;
let stopwatchTimeStart = null;

const show = elementName => {
  const el = document.getElementById(elementName);
  el.style.display = "inline";
};

const hide = elementName => {
  const el = document.getElementById(elementName);
  el.style.display = "none";
};

const drawDay = date => {
  dayLabel.text = weekday[date.getDay()];
};

const drawDate = date => {
  dateLabel.text = `${month[date.getMonth()]} ${date.getDate()}`;
};

const drawTime = date => {
  const today = date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  if (inExerciseMode) {
    smallTimeLabel.text = `${hours}:${mins}`;
  } else {
    timeLabel.text = `${hours}:${mins}`;
  }
};

function padZero(number, size) {
  number = number.toString();
  while (number.length < size) number = "0" + number;
  return number;
}

const drawStopWatch = date => {
  const diffSeconds = Math.abs(date - stopwatchTimeStart) / 1000;
  const minutes = Math.floor(diffSeconds / 60);
  const seconds = Math.floor(diffSeconds % 60);

  timeLabel.text = `${padZero(minutes, 2)}:${padZero(seconds, 2)}`;
};

const drawTotalSteps = () => {
  const amountSteps = userActivity.today.adjusted["steps"] || 0;
  totalStepsLabel.text = amountSteps;
};

const drawHourlySteps = date => {
  const today = date;
  const hour = today.getHours();

  const amountSteps = userActivity.today.adjusted["steps"] || 0;

  if (thisHour !== hour) {
    stepsAtStartOfHour = amountSteps;
    thisHour = hour;
  }

  hourlyStepsLabel.text = amountSteps - stepsAtStartOfHour;
};

const drawExerciseSteps = () => {
  const amountSteps = userActivity.today.adjusted["steps"] || 0;
  exerciseStepsLabel.text = amountSteps - stepsAtStartOfExercise;
};

const drawTrajectorySteps = date => {
  const today = date;
  const hour = today.getHours();
  const minute = today.getMinutes();
  const second = today.getSeconds();

  const amountSteps = userActivity.today.adjusted["steps"] || 0;

  const startHour = 8;
  const endHour = 20;

  const currentSeconds = (hour - startHour) * 60 * 60 + minute * 60 + second;
  const totalSeconds = (endHour - startHour) * 60 * 60;
  const targetSteps = 10000;

  if (hour < startHour) {
    trajectoryStepsLabel.text = `+${amountSteps}`;
  } else if (hour >= endHour) {
    if (amountSteps < targetSteps) {
      trajectoryStepsLabel.text = `-${targetSteps - amountSteps}`;
    } else {
      trajectoryStepsLabel.text = "";
    }
  } else {
    const expectedStepsSoFar = (currentSeconds / totalSeconds) * targetSteps;
    const currentDelta = Math.round(amountSteps - expectedStepsSoFar);
    trajectoryStepsLabel.text = `${currentDelta > 0 ? "+" : ""}${currentDelta}`;
  }
};

let hrm = null;

const monitorHeartRate = () => {
  if (HeartRateSensor) {
    hrm = new HeartRateSensor();
    // hrm.addEventListener("reading", () => {
    //   heartRateLabel.text = hrm.heartRate;
    // });
    hrm.start();
  }
};

const drawHeartRate = () => {
  if (hrm) {
    heartRateLabel.text = hrm.heartRate;
  }
};

monitorHeartRate();

function toHex(d) {
  return ("0" + Number(d).toString(16)).slice(-2).toUpperCase();
}

// const getColor = steps => {
//   const value = Math.max(0, Math.min(225, Math.round((steps / 10000) * 255)));
//   return `${toHex(255 - value)}${toHex(value)}20`;
// };

let lastTick = null;
let inExerciseMode = false;

background.addEventListener("click", evt => {
  inExerciseMode = !inExerciseMode;
  stopwatchTimeStart = lastTick.date;
  stepsAtStartOfExercise = userActivity.today.adjusted["steps"] || 0;

  setAutoOff();

  handleTick(lastTick);
});

const setAutoOff = () => {
  if (inExerciseMode && hrm.heartRate > 100) {
    if (display.autoOff === true) {
      display.autoOff = false;
      display.on = true;
      // display.brightnessOverride = 1.0;
    }
  } else {
    if (display.autoOff === false) {
      display.autoOff = true;
      // display.brightnessOverride = undefined;
    }
  }
};

const getBackgroundColor = today => {
  const hour = today.getHours();
  const minute = today.getMinutes();
  const second = today.getSeconds();
  const currentSteps = userActivity.today.adjusted["steps"] || 0;
  const startHour = 8;
  const endHour = 20;
  const currentSeconds = (hour - startHour) * 60 * 60 + minute * 60 + second;
  const totalSeconds = (endHour - startHour) * 60 * 60;
  const targetSteps = 10000;
  const expectedStepsSoFar = (currentSeconds / totalSeconds) * targetSteps;
  const currentDelta = Math.round(currentSteps - expectedStepsSoFar);

  let value;

  if (currentSteps >= targetSteps) {
    value = 225;
  } else {
    value = ((currentDelta + 2000) / 4000) * 225;
    value = Math.max(30, Math.min(225, Math.round(value)));
  }

  return `#${toHex(225 - value)}${toHex(value)}20`;
};

function handleExerciseModeTick(evt) {
  backgroundColor.style.fill = getBackgroundColor(evt.date);

  hide("dateLabel");
  hide("dayLabel");
  show("smallTimeLabel");
  show("exerciseStepsLabel");
  show("totalStepsLabel");
  show("bottomLine");
  show("totalStepsLabel");
  show("heartRateLabel");
  show("heartRateIcon");
  show("hourlyStepsLabel");
  show("trajectoryStepsLabel");
  show("topLine");

  drawStopWatch(evt.date);
  drawTime(evt.date);
  drawTotalSteps();
  drawHourlySteps(evt.date);
  drawExerciseSteps();
  drawTrajectorySteps(evt.date);
  drawHeartRate();
}

function handleClockModeTick(evt) {
  backgroundColor.style.fill = getBackgroundColor(evt.date);

  show("dateLabel");
  show("dayLabel");
  hide("bottomLine");
  hide("totalStepsLabel");
  hide("smallTimeLabel");
  hide("exerciseStepsLabel");
  hide("heartRateLabel");
  hide("heartRateIcon");
  hide("hourlyStepsLabel");
  hide("trajectoryStepsLabel");
  hide("topLine");

  drawDay(evt.date);
  drawDate(evt.date);
  drawTime(evt.date);
  drawTotalSteps();
  drawHourlySteps(evt.date);
  drawExerciseSteps();
  drawTrajectorySteps(evt.date);
  drawHeartRate();
}

const handleTick = evt => {
  if (inExerciseMode) {
    handleExerciseModeTick(evt);
  } else {
    handleClockModeTick(evt);
  }

  setAutoOff();
};

clock.ontick = evt => {
  lastTick = evt;

  handleTick(evt);
};
