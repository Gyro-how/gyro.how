---
title: "Button prompts"
---

When it comes to developing a Input system, the developer will implement a Glyph (Button Prompts) detection system so that it can actively checks for a Input Method the player is using, and then the glyphs will change accordingly. This ensures that whenever the Player switches between input methods, they will acively switch between the corresponding button prompts.

The negative side effecets is when the player tries to use a Controller input and a Keyboard/Mouse Input simultanously, the Input's glyph detection system will get confused and will flicker between two Input glyphs.

[placeholder gif]

In the case of Mixed Inputs usage, this is the most common occurrence that players will consisently encounter. 

and: it's the easiest fix!

### Addressing Mixed Input's Glyph Flickering

#### Excluding Mouse Movement Events

This is most common fix to the Glyph Flicker issue. By excluding mouse movement events from the input event filtering system, we can prevent unnecessary flickering between mouse and controller glyphs.

This fix is entirely depended on your Input System's glyph detection, actual implementation may vary. The following examples will be using a custom WIP experimental branch for Perfect Dark PC Port.

[show video of the glyph flicker]

here's the live code snippet:

```c
        case SDL_KEYDOWN:
            lastKey = VK_KEYBOARD_BEGIN + event->key.keysym.scancode;
            break;


        case SDL_MOUSEMOTION:
            if (event->motion.xrel != 0 || event->motion.yrel != 0) {
                lastKey = VK_MOUSE_BEGIN;
            }
            break;


        case SDL_CONTROLLERBUTTONDOWN: {
            lastKey = VK_JOY1_BEGIN + event->cbutton.button;
            SDL_GameController *ctrl = SDL_GameControllerFromInstanceID(event->cdevice.which);
            const s32 idx = inputControllerGetIndex(ctrl);
            if (idx >= 0) {
                lastKey += idx * INPUT_MAX_CONTROLLER_BUTTONS;
            }
            break;
        }
```


for our case, `inputEventFilter` is where we use Input Glyph detection for determining the current input method and updating the button prompts accordingly. This ensures that the correct button prompts are displayed based on the player's active input method.

What we need to do is exclude Mouse movement event out of the Input Event filtering system.

To achieve this, you can add a condition to ignore `SDL_MOUSEMOTION` events, remove `SDL_MOUSEMOTION` handling from your input event processing entirely. 

```c
        case SDL_KEYDOWN:
            lastKey = VK_KEYBOARD_BEGIN + event->key.keysym.scancode;
            break;


        case SDL_CONTROLLERBUTTONDOWN: {
            lastKey = VK_JOY1_BEGIN + event->cbutton.button;
            SDL_GameController *ctrl = SDL_GameControllerFromInstanceID(event->cdevice.which);
            const s32 idx = inputControllerGetIndex(ctrl);
            if (idx >= 0) {
                lastKey += idx * INPUT_MAX_CONTROLLER_BUTTONS;
            }
            break;
        }
```
now, let's review the changes to our glpyh detection system:

[placeholder video]

this is how you can fix the button prompt flicker issue. This is easiest route to maintain consistent Mixed Input support. You might've noticed that we remove the Mouse Movement event altogether?

### User-configurable option

An accessibility-based, user-configurable option allows players to force Glyph Input as opposed to be entirely automatic. This option should influence the input glyph detection. 

Afterwards, we'll have to modify our input event handling to respect the `inputGlyphOverride` setting by introducing `inputGlyphOverride` checks (`GLYPH_OVERRIDE_CONTROLLER`) and (`GLYPH_OVERRIDE_KEYBOARDMOUSE`), ensuring that the correct input glyphs are displayed based on the user's preference.

```c
        case SDL_MOUSEBUTTONUP:
            if (padsCfg[0].inputGlyphOverride != GLYPH_OVERRIDE_CONTROLLER) {
                lastKey = VK_MOUSE_BEGIN - 1 + event->button.button;
            }
            break;


        case SDL_CONTROLLERBUTTONDOWN: {
            if (padsCfg[0].inputGlyphOverride != GLYPH_OVERRIDE_KEYBOARDMOUSE) {
                lastKey = VK_JOY1_BEGIN + event->cbutton.button;
                SDL_GameController *ctrl = SDL_GameControllerFromInstanceID(event->cdevice.which);
                const s32 idx = inputControllerGetIndex(ctrl);
                if (idx >= 0) {
                    lastKey += idx * INPUT_MAX_CONTROLLER_BUTTONS;
                }
            }
            break;
        }
```

Afterwards, we can integrate `inputGlyphOverride` into the Controls UI system. 

[placeholder image]

This allows players to manually select their preferred Input Glyph method, regardless of the players' current input method. For players who have a specialized Input device, this option ensures that the correct glyphs are displayed for their specific setups.