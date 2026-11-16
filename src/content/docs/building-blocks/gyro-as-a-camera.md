---
title: "Gyro as a camera"
---

:::note
We recommend watching "Mouse-like Precision, No Aim Assist" panel from GCAP22 for a deeper understanding of gyro as a camera input.

<iframe width="1310" height="737" src="https://www.youtube.com/embed/krQ_ggZcN1Q" title="Mouse-like Precision Without Aim Assist: Making Good Gyro Controls" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

:::


We have a golden principle, which should be our main goal:

**Gyro is a mouse**.

Assigning the gyro as a Camera input translates a real movement to a proportionate in-game movement, allowing the player to move a cursor, aimer, or camera as if directly with their own hand. 

Here's a short video that demonstrates it in action on Fortnite. 

[video clip]

The main goal is to replicate how Fortnite handles Gyro as a Camera input. There are three different routes we'll take

## Camera implementation

Popular game engines already has a angular camera system in-place, so integrating gyro input involves converting the gyro data into camera rotation deltas and applying them to the existing camera system.

:::tip[Did you know?]
For Unreal Engine 4+ games: it would be something like `PlayerController.ControlRotation`
:::

Here's the example code taken from GyroWiki, [from Good Gyro Controls Part 1](https://gyrowiki.jibbsmart.com/blog:good-gyro-controls-part-1:the-gyro-is-a-mouse).

```cpp
// Mouse as a Camera Input
TurnCamera(MouseDelta.x * SensitivityX);
PitchCamera(MouseDelta.y * SensitivityY);
```


```cpp
// Gyro as a camera input
vec GyroDelta = GyroVec * DeltaTime;

TurnCamera(GyroDelta.x * SensitivityX);
PitchCamera(GyroDelta.y * SensitivityY);

```

This is a straightforward approach, as it directly maps the gyro input to camera rotation, similar to how mouse input is handled. 

For more details regarding sensitivity scaling, refer to [Sensitivity](/building-blocks/sensitivity/) page.


## Camera implementation without existing angular camera system

If your game or game engine don't have an existing angular camera system, you'll need to implement one from the ground up. This involves creating a camera object that can store its orientation as angles (pitch, yaw, roll) and updating these angles based on input from the gyro sensor, effectively simulating the behavior of an angular camera system. This can also be applied to  both Joystick and Mouse input.

Looking at Quake's source code's [`cl_input.c`]((https://github.com/id-Software/Quake/blob/master/WinQuake/cl_input.c#L232)), they rely on `cl.viewangles` to handle the heavy bulk of Camera Angles:

```c
void CL_AdjustAngles (void)
{
	float	speed;
	float	up, down;
	
	if (in_speed.state & 1)
		speed = host_frametime * cl_anglespeedkey.value;
	else
		speed = host_frametime;

	if (!(in_strafe.state & 1))
	{
		cl.viewangles[YAW] -= speed*cl_yawspeed.value*CL_KeyState (&in_right);
		cl.viewangles[YAW] += speed*cl_yawspeed.value*CL_KeyState (&in_left);
		cl.viewangles[YAW] = anglemod(cl.viewangles[YAW]);
	}
	if (in_klook.state & 1)
	{
		V_StopPitchDrift ();
		cl.viewangles[PITCH] -= speed*cl_pitchspeed.value * CL_KeyState (&in_forward);
		cl.viewangles[PITCH] += speed*cl_pitchspeed.value * CL_KeyState (&in_back);
	}
	
	up = CL_KeyState (&in_lookup);
	down = CL_KeyState(&in_lookdown);
	
	cl.viewangles[PITCH] -= speed*cl_pitchspeed.value * up;
	cl.viewangles[PITCH] += speed*cl_pitchspeed.value * down;

	if (up || down)
		V_StopPitchDrift ();
		
	if (cl.viewangles[PITCH] > 80)
		cl.viewangles[PITCH] = 80;
	if (cl.viewangles[PITCH] < -70)
		cl.viewangles[PITCH] = -70;

	if (cl.viewangles[ROLL] > 50)
		cl.viewangles[ROLL] = 50;
	if (cl.viewangles[ROLL] < -50)
		cl.viewangles[ROLL] = -50;
}
```


varous Quake sourceports that includes Gyro as as Camera input will rely on the same `cl.viewangles` structure to update the camera orientation. The same process we did from Camera Implementation will also apply here.

In case you still have no idea, let's look at Ironwail's gyro implementation as a example, the gyro input is applied directly to the `cl.viewangles`. 

```c
void IN_GyroMove(usercmd_t *cmd)
{

........

// apply gyro
cl.viewangles[YAW] += scale * gyro_yaw * gyro_yawsensitivity.value;
cl.viewangles[PITCH] -= scale * gyro_pitch * gyro_pitchsensitivity.value;

```



## Camera implementation without existing angular camera system

If that's impossible, we can adapt the pre-existing mouse camera code and apply the gyro input in a similar manner to how the mouse input is applied. 
Please refer to your mouse camera implementation.

:::danger
We don't recommend injecting Mouse Input's camera system onto Gyro Input without an existing angular camera system, as it may lead to inconsistent camera issues or sensitivities being shared across different input methods.
:::