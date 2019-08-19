import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import userActivity from "user-activity";
import { HeartRateSensor } from "heart-rate";

// Update the clock every second
clock.granularity = "seconds";

// Get a handle on the <text> element
const myLabel = document.getElementById("myLabel");

let stepsAtStartOfHour = 0;
let thisHour = 0;

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
  myLabel.text = `${hours}:${mins}`;
};

const drawTotalSteps = () => {
  const amountSteps = userActivity.today.adjusted["steps"] || 0;
  const totalStepsLabel = document.getElementById("totalStepsLabel");
  totalStepsLabel.text = amountSteps;
};

const drawHourlySteps = date => {
  const hourlyStepsLabel = document.getElementById("hourlyStepsLabel");
  const today = date;
  const hour = today.getHours();

  const amountSteps = userActivity.today.adjusted["steps"] || 0;

  if (thisHour !== hour) {
    stepsAtStartOfHour = amountSteps;
    thisHour = hour;
  }

  hourlyStepsLabel.text = amountSteps - stepsAtStartOfHour;
};

const drawTrajectorySteps = date => {
  const trajectoryStepsLabel = document.getElementById("trajectoryStepsLabel");
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
    trajectoryStepsLabel.text = `${
      currentDelta > 0 ? "+" : ""
    }${currentDelta}`;
  }
};

const hrm = null;

const monitorHeartRate = () => {
  if (HeartRateSensor) {
    const heartRateLabel = document.getElementById("heartRateLabel");

    hrm = new HeartRateSensor();
    // hrm.addEventListener("reading", () => {
    //   heartRateLabel.text = hrm.heartRate;
    // });
    hrm.start();
  }
}

const drawHeartRate = () => {
  if (hrm) {
    const heartRateLabel = document.getElementById("heartRateLabel");
    heartRateLabel.text = hrm.heartRate;
  }
}

monitorHeartRate();

clock.ontick = evt => {
  drawTime(evt.date);
  drawTotalSteps();
  drawHourlySteps(evt.date);
  drawTrajectorySteps(evt.date);
  drawHeartRate();
};

