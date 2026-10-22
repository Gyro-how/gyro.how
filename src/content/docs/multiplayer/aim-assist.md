---
title: "Aim assist"
---

When shipping it on Multiplatform, or shipping with Controller support within a shooter genre: you're expected to introduce Aim Assistance to compensate for the Joystick users. 

However, if you were to introduce Controller's Aim Assist system: the assist can also conflict with both Gyro and Mouse Input. 

We're going to higlight the most notable Aim Assists system that can negatively affect Gyro as a Camera and Mixed Input.



## Problems

### Snap-based Assist

back in [Black Mesa's Necro Patch](https://store.steampowered.com/news/app/362890/view/4174347361777844150): [Auto-Aim functionality was added to Black Mesa](https://steamcommunity.com/app/362890/discussions/0/6733519291681971343/), specific for Game Controllers.

Prior to the revised setup in the Resonance Decade update: the previous setup was too aggressive, making it nearly impossible to aim with both Gyro, Mouse and Joystick input at the same time. Yes, unlike the vast majority: this one is applied at the game-level.

As a result: the snapping magnetism is absurdly strong for no reason

[placeholder gif]

Thankfully, Black Mesa provides the ability to change all of that within `Black Mesa\bms\cfg\Skill.ctg`, but this isn't user-friendly. Ideally: all the Auto-Aim functionality should be customizable within the Menu UI.

### Rotational-based Assistance

Let's say: you want to "aim" and "turn" as if you're a dolly-camera. Honestly it's hard to describe but Rotational AA is like that. No need to rely on Joystick Camera!

Here's a quick example using Highguard as our case study.

[placeholder video embed]

As you can see: the Rotational Aim Assist becomes intentionally active when combining it with Mouse and Controller Inputs at the same time. This is due to Aim Assist activation system being tied towards Gamepad Inputs..

This could be manageable as long as the general Joystick and Mouse camera isn't conflicted.


### Speed-based Aim Assist

Speed-based Aim Assist adjusts the aim assistance strength based on the speed of the player's input. The faster the input, the stronger the assist becomes. This can be particularly useful for Controller users who need help with quick target tracking.

But what if the Aim Assist camera system will try to slow down the ramp speed? Here's yet another example using Cyberpunk 2077:

[placeholder video embed]

As you can see, within default Aim Assist settings (**including Target Snapping**): your Mixed Input aiming functionality creates conflict issues as the game does not account for Simultaneous Usage. Normally: it'll slow down if you're aiming.
But this function can be reduced!

[placeholder video embed]

You noticed that Cyberpunk 2077 provides the ability to adjust the Aim Assist strength and function within the UI, which is great. But depending on how the game's input system is prioritized: this effect can be reduced by changing the in-game Aim Assist settings…but it's minor at best, and intrusive at worse.

### What if we combine everything?

Well, Deadlock: Rogue is a perfect example of this. Combining every examples into one and apply it across all Precision-based Input types can create devastating results.

[placeholder video embed]

Originally, the option to disable Aim Assist didn't exist back when it was recorded, but nowadays: players have the ability to turn it off if they wish.


:::danger
Do not force Aim Assist into both Gyro and Mouse Inputs simultaneously. This create conflicts and negatively impact the player's camera movement experience.
:::

  
  
## Solution

now that we highlighted a selected of Aim Assist types, here's our suggested solutions:

### Do not apply traditional Aim Assist towards Gyro Input

If you're planning to implement Gyro Aiming support to your game: it's a simple solution: **the Gyro as a Camera input is meant to behave like a Mouse Input**. It is not recommended to add traditional Aim Assist to Gyro camera system.

If your game still needs Aim Assist for Joystick users or you want to ease into Gyro:

* Apply automatic Aim Assist activation system based on whenever the Gyro Input is activated or not (this is the standardized route)
* Disable Aim Assist becomes if Gyro Input is enabled within the UI.
* Apply an extremely light form of Auto-Aim (for Steam Input API developers: [Valve recommends it](https://partner.steamgames.com/doc/features/steam_controller/getting_started_for_devs#11))

The first option happens to be a **standard for Good Gyro Controls**, where the Aim Assist is automatically disable whenever the Gyro Input is in use. This setup can be seen in Fortnite, The Finals and Call of Duty: Modern Warfare 4.

the second option could address concerns for ADS-only Gyro usage but Hip-Fire can still Aim Assist usages upon close quarters aim.

The third option is something I haven't seen, but ideally: only having one specific type of Aim Assistance that doesn't conflict with the Camera Input such as Bullet Magnetism can be kept…but it needs to be in the same system as Mouse Input.

### Don't tie Aim Assist systems towards Controller Joystick Input

This seems to be a consistent source of problems for various games that have Aim Assistance. Very often: it never accounts for Mixed Input and sometimes native Gyro Aim usage.

This will create unintended consequences for in the road where bad actors can take advantage of the system by intentionally putting a rubber band to the joystick. Or intentionally add a tiny bit of inner Deadzone to trick the game into thinking it's using Gamepad input.

Best route is to provide both toggles for each Input Methods' Aim Assist functions (see: Halo Infinite), or a simple toggle to enable Simultaneous Input but disable Aim Assist completely, more on that on Number 3rd and 4th!

### Provide the ability to allow Simultaneous Input/Mixed within UI toggle

tesrserse

some games like ***I Am Your Beast***, ***Cultic***, ***Tom Clancy's Ghost Recon: Breakpoint***, ***Assassin's Creed Valhalla*** and ***Splitgate: Area Reloaded*** provides the ability to allow both Input Methods to be used at the same time.

This option primarily benefits the Accessibility crowd the most, but it's prove useful for Multiplayer games, while making it easier to manage Cross-Play Matchmaking session. Cross-Play tag to indicate that this user is using a specialized setup.

:::tip{icon="heart"}
As Multiplayer lobbies shows player's platform icon next to input icon. We personally suggest giving them special visual icon badge to indicate mixed input usage.

For more details, refer to [Fairness and Matchmaking](/multiplayer/fairness-and-matchmaking/).
:::


### Whitelist virtual inputs

This option is a riskier one, but is a "two-birds-one-stone" solution to fixing Simultaneous Inputs and prevent Aim Assist abuses when using an Input Remapper for nefarious use.

The Finals employs this tactic for ReWASD users, which forcefully turns off Aim Assist. While DOOM Eternal uses it to forcefully lock Controller button prompts if launch thru Steam Input mode (for Steam version).