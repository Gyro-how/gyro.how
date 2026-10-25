---
title: "Camera & sensitivity conflicts"
---

When using mixed input, there's several conflicts that can affects camera behavior and sensitivity due to being tied towards Joystick or Mouse Inputs.

### Input Camera Priority

When using mixed input, the system will prioritize the last active input. Typically, the last active input will have priority, meaning that if you switch from mouse to joystick, the joystick input will control the camera until the mouse is used again. This can lead to unexpected behavior if both inputs are used simultaneously.

[video example, many RE Engine-based games]


### Sensitivity Conflicts

Using mixed input can confuse the Camera Input's sensitivity scale, as it might increase or decrease unexpectedly depending on which input is currently active.

[video example, Neon White]


### Camera stuttering

Input switch may cause the camera's movement threshold to increase unexpectedly.

[video example from Apex Legends]

<iframe width="560" height="315" src="https://www.youtube.com/embed/SQIal5cXrAI?si=G1ity0NKJTfXGDG_" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


### Speed Ramping

If the Joystick input is used while the mouse is also active, the camera may cause unintended stutters or jittering.

[video example, days gone]

<iframe width="560" height="315" src="https://www.youtube.com/embed/vG_U3UOOjWI?si=xaexRPAQwfyLZhZq" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


### UI-related camera stutters.

If the Input system causes UI-related camera conflictions such as when interacting with menus or HUD elements, camera UI elements can cause jitters.

[video example, Perfect Dark PC Port]


### Solution: 

Depending on one of these factors: the rate it'll take to address these issues might be deeper, complex or outright difficult to solve. Please verify your Input Action system.

[As per Valve's documents](https://partner.steamgames.com/doc/steamhardware/recommendations): We recommend sanitizing the entire Input Action system to ensure consistent behavior across all input methods. Try to accumulate all camera rotation sources before updating your camera, instead of selecting only the last active one. 

Afterwards, test the camera output by moving both the camera joystick and the mouse at the same time, and confirm that the camera's movement doesn't cause any of the issues listed above.