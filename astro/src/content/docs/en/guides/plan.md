---
title: "Motion Planning"
description: "Required setup: smabo-app + smabo-esp32 + smabo-brain-ros"
---

## Roadmap

This page is the guide for the 'Motion Planning' node on the roadmap below.

This guide assumes you have completed the [Robot Arm](/en/guides/arm/) and [brain-ros](/en/guides/brainros/) guides.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="plan"
       aria-label="smabo build guide roadmap (Motion Planning highlighted)"></svg>
</div>

## Overview

This page explains how to implement the "Motion Planning" feature.

<br />

Specifically, you will:

- Run motion planning

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"web","to":"brain","transport":"ws","lines":["Goal pose","Plan / execute request"]},{"from":"brain","to":"web","transport":"ws","lines":["Planned motion","Joint angles"]},{"from":"brain","to":"esp32","transport":"ws","lines":["Servo command"]},{"from":"esp32","to":"brain","transport":"ws","lines":["Joint angles"]}]' data-active="brain,esp32"
       data-variant="brainros"
       aria-label="smabo system diagram (smabo-brain-ros and smabo-esp32 highlighted)"></svg>
</div>

## Required Parts

No new parts are needed.

## 3D Printing Parts

No new parts are added this time.

## Assembly

There is no new assembly this time.  
Use the robot built in [Robot Arm](/en/guides/arm/) as is.

## Wiring

There is no new wiring this time.  
Keep the wiring from [Robot Arm](/en/guides/arm/).

## Finished Result

The completed robot looks like this.

Note: no new wiring is added, so it is the same as in [Robot Arm](/en/guides/arm/).

![smabo with the robot arm](/images/arm_complete.webp)

## Operation

Check that everything works with the steps below.

### Startup Procedure

<a href="/en/guides/startup/" data-steps="smabo-brain-rosの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-brain-ros---smabo-webの接続,smabo-brain---esp32の接続,smabo-web---esp32の接続">Follow the startup procedure here</a>.

<br />

Then open the 'Motion Plan' tab in smabo-web.

### Servo Settings

In 'Modes/servos' in the 'Config' tab of smabo-web:

- enable 'arm\_joint\_1', 'arm\_joint\_2', 'arm\_joint\_3' and 'arm\_joint\_4'
- set 'mode' to 'manual'

![The Config tab of smabo-web, with arm_joint_1 to arm_joint_4 enabled and mode set to manual outlined in red](/images/plan_servo_settings.png)

### Starting Motion Planning

First, press 'Start Motion Plan' to start motion planning mode.

![The Motion Plan tab of smabo-web, with the 'Start Motion Plan' button outlined in red](/images/plan_start.png)

### Setting the Goal Pose

Set the pose you want the robot arm to move to.

First, select the group to move in 'Planning group'.  
Here, select 'arm'.

![The Motion Plan tab of smabo-web, with 'arm' in 'Planning group' outlined in red](/images/plan_group_arm.png)

<br />

Next, set the pose of the robot arm.  
Set arm\_joint\_1 to 3 to any angles you like.

![The Motion Plan tab of smabo-web, with the goal angle sliders for arm_joint_1 to 3 outlined in red](/images/plan_goal_joints.png)

### Planning and Executing

Plan the motion and execute it.

First, press 'Plan' to plan the motion of the robot arm from the current pose to the goal pose.

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/plan_web.mp4" type="video/mp4"></video>

<br />

Then press 'Execute', and you can see the real smabo arm move as planned with 'Plan'.

<br />

Note: in the video below, the 'Plan & Execute' button plans and executes the motion in one step.

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/plan_real.mp4" type="video/mp4"></video>

## Next

This page is one of the end points of the roadmap.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="plan"
       aria-label="smabo build guide roadmap (Motion Planning highlighted)"></svg>
</div>
