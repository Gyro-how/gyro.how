---
title: "The gyro settings menu"
---

Depending on your UI Systems, adding various settings for each Gyro Settting is relativeily easy. Most games with provide you various settings specific to Gyroscopic input. Depending on your UI Systems, adding a simple toggle for enabling or disabling the gyro input can be easily implemented. This provides a straightforward way for players to control the gyro feature without needing to adjust detailed settings, and can be custom-tuned based on the game's UI need


:::note
Please refer to your UI framework's documents for implementing sliders, input fields, or other control elements. This session is entirely depended on it being available and correctly implemented. 
:::


for this session: we're going to provide you two simple examples: one for enabling/disabling the gyro input and other for adjusting the gyro sensitivity.


### Toggle for Gyro Input

the concept of enabling and disabling Gyro Input within the game's settings menu is straight foward, if we have a console variable or a similar mechanism to toggle the gyro camera input on/off on the fly: we can integrate it directly into the UI by binding the toggle to this variable.

using Alpine Faction (Community Patch for Red Faction 1) as a example: the entire UI Framework is primarily handled thru Console Commands. As we have a console variable that is controllable thru console commands (`g_alpine_game_config.gamepad_gyro_enabled`), we can easily expose it to the UI by creating a slider or input field that modifies this console variable. 


```cpp
    {
        .id = "gamepad_gyro_enabled",
        .key = "GamepadGyroEnabled",
        .label = "Gyro camera",
        .tooltip = "Move the Camera by tilting the controller.",
        .category = Cat::Input,
        .subcategory = "Controller - Gyro",
        .widget = Wid::Toggle,
        .access = AccBool{&AGS::gamepad_gyro_enabled},
        .apply = gyro_update_calibration_mode,
        .console_cmd = "gyro_camera",
        .unavailable_reason = needs_motion_sensors,
    },
```


### Gyro sensitivity scaling

Then, we can bind this console variable to a UI element, such as a slider, allowing the player to adjust the gyro sensitivity directly from the game's settings menu. This one is relatively easy to implement, we can take the UI slider widget/logic in a very similar matter as mouse input and apply it to `g_alpine_game_config.gamepad_gyro_sensitivity`. 

```cpp
    {
        .id = "gamepad_gyro_sensitivity",
        .key = "GamepadGyroCameraSensitivity",
        .label = "Gyro sensitivity",
        .tooltip = "How fast the view turns while tilting the controller.",
        .category = Cat::Input,
        .subcategory = "Controller - Gyro",
        .widget = Wid::Slider,
        .access = AccFloat{&AGS::gamepad_gyro_sensitivity, nullptr, 0.0f, 100.0f},
        .console_cmd = "gyro_sens",
        .ui_min = 0.0f,
        .ui_max = 10.0f,
        .ui_nudge = 0.1f,
        .ui_decimals = 2,
        .unavailable_reason = needs_gyro_enabled,
    },
```

:::tip{icon="heart"}
Do use the real world sensitivity / natural sensitivity scale for your gyro camera scaling. This means a sensitivity of 1.0 maps a real world turn to the same turn in-game.

for more details, refer to [Sensitivity](/building-blocks/sensitivity/)
:::

### End Results

Now we can review the UI Changes, here's what two newly added settings looks like in action:

[insert image here]

now you have a clear understanding of how to integrate core gyro settings into your game's UI. Now you can add additional gyro-specific advanced adjustments (acceleration, tightening, acceleration, etc.), following the same principles demonstrated above. Make sure to keep them optional and respect the player's control preferences. 
