---
title: "Calibration"
---

:::note
Your game engine, or input API/platform SDK, may already include a calibration system. Please refer to your platform's documentation for guidance on how to use it.

:::

## Manual Calibration

At present, gyros in modern controllers sometimes require calibration. They're very good at giving relative rotational velocities, but over time can have the wrong idea of where "zero" is. Calibration is just finding where the gyro thinks zero is so we can correct it.

Measuring the gyro output when the controller is stationary is how we get that zero. But since we have no reliable way of telling if the controller is still, we need to prompt the player to put the controller down or hold it still so the game can get the zero value. If the player's holding it, their hands are shaky; even if the controller is perfectly still, the gyro's output will be slightly noisy. Either way, getting the zero value at an instant is probably not going to be good enough — better to get the average output over a short window of time:

```cpp
// current velocity, uncalibrated
Vec3 Velocity;

// for calibration
int NumOffsetSamples;
Vec3 AccumulatedOffset;
bool Calibrating;
//...

// settings
float Sensitivity;
//...

Vec3 GetCalibrationOffset() {
   if (NumOffsetSamples == 0) {
      return Vec3::Zero;
   }
   return AccumulatedOffset / NumOffsetSamples;
}

void ResetCalibration() {
   NumOffsetSamples = 0;
   AccumulatedOffset = Vec3::Zero;
}

void ProcessInput(float deltaTime) {
   if (Calibrating) {
      NumOffsetSamples++;
      AccumulatedOffset += Velocity;
   }

   // we're using gyro as a mouse, only need 2D input
   Vec2 gyroVelocity = Vec2(Velocity.X, Velocity.Y);
   Vec3 offset = GetCalibrationOffset();
   Vec2 gyroCalibration = Vec2(offset.X, offset.Y);
   Vec2 calibratedGyro = gyroVelocity - gyroCalibration;

   ProcessGyroInput(calibratedGyro,
      deltaTime, Sensitivity);
}
```

Now that we have our gyro calibration system in place, we can build a Calibration UI where players can initiate the calibration process.

We can create a simple UI element within the Settings configuration that instructs the player to place the controller down and hold it still. When the player initiates calibration, the system will start collecting samples to determine the gyro's zero offset, and calibrate it automatically.

If your platform/controller doesn't need calibration, you can skip the initial prompt, but still provide an option for players to recalibrate manually from the menu.

## Automatic Calibration

If we want to reduce player friction, we can implement an auto-calibration system that works out when the controller is sitting still and adjusts the calibration offset itself, without requiring explicit input from the player.

:::caution
Some platforms handle automatic calibration at the system level (it's common in Nintendo Switch games, for example), so you may not need to implement your own auto-calibration system. Check your platform's documentation first.

Unfortunately, implementing a reliable auto-calibration system can be tricky and may lead to a poor player experience if not done carefully.
:::

The goal is to calibrate without requiring players to do it manually, and the catch is that we have no direct way of knowing the controller is still. But there's a useful trick: the accelerometer can tell us. If the accelerometer reading isn't changing much from one sample to the next, the controller isn't being moved, so it's safe to sample the gyro's zero.

Every accelerometer has a little noise of its own though, and how much varies a lot between controllers. So the system works in two stages:

:::tip[Did you know?]
This approach is modelled on the gyro calibration in [SDL's `testcontroller.c` test program](https://github.com/libsdl-org/SDL/blob/main/test/testcontroller.c)
:::

1. **Noise profiling**: while the controller sits still, measure the biggest sample-to-sample accelerometer change. That's this controller's noise ceiling.
2. **Drift profiling**: while the accelerometer stays under that ceiling, the controller counts as still, so we let the manual calibration code above average the gyro. If the controller gets moved, throw the partial average away and start the window again.

Notice that the auto-calibration never averages the gyro itself. It only decides *when* `Calibrating` should be on, and the manual calibration code does the rest.

A few notes on units: gyro is in degrees per second, acceleration is in G (1 G = 9.80665 m/s², so divide first if your API reports m/s²), and time is in seconds. We measure stages in time rather than a fixed number of samples because controller polling rates vary wildly. `LengthSquared(v)` is just `v.X*v.X + v.Y*v.Y + v.Z*v.Z`.

First, the state and the settings we'll tune:

```cpp
// current acceleration, in G
Vec3 Acceleration;

// for auto-calibration
enum AutoCalibrationStage { NoiseProfiling, DriftProfiling, AutoCalibrationDone };
AutoCalibrationStage Stage;
float StageTime;               // seconds spent in the current stage
Vec3 LastAcceleration;
bool HasLastAcceleration;
float NoiseTolerance;          // learned noise ceiling (squared), grows during NoiseProfiling
//...

// settings
bool AutoCalibrate = true;                      // let players turn this off
const float MaxNoise = 0.075f;                  // G. A bigger jump between samples = being moved
const float SettleTime = 0.5f;                  // seconds to ignore ringing after set-down
const float NoiseTime = 4.0f;                   // seconds spent measuring the noise ceiling
const float DriftTime = 5.0f;                   // seconds spent averaging the gyro
const float InitialNoiseTolerance = 1e-6f;
const float NoiseMargin = 2.0f;                 // headroom on the learned ceiling (squared)
//...
```

Then the auto-calibration itself:

```cpp
void ResetAutoCalibration() {                   // call at startup, or from a "Recalibrate" button
   Stage = NoiseProfiling;
   StageTime = 0.0f;
   NoiseTolerance = InitialNoiseTolerance;
   HasLastAcceleration = false;
   Calibrating = false;
   ResetCalibration();
}

void ProcessAutoCalibration(float deltaTime) {
   // how much did the accelerometer change since the last sample? (squared)
   float change = 0.0f;
   if (HasLastAcceleration) {
      change = LengthSquared(Acceleration - LastAcceleration);
   }
   LastAcceleration = Acceleration;
   HasLastAcceleration = true;

   StageTime += deltaTime;

   if (Stage == NoiseProfiling) {
      Calibrating = false;

      if (change > MaxNoise * MaxNoise) {       // being moved: start this stage over
         StageTime = 0.0f;
         NoiseTolerance = InitialNoiseTolerance;
         return;
      }

      // after the settle time, the biggest wobble we see is the noise ceiling
      if (StageTime > SettleTime && change > NoiseTolerance) {
         NoiseTolerance = change;
      }

      if (StageTime >= SettleTime + NoiseTime) {
         Stage = DriftProfiling;
         StageTime = 0.0f;
         NoiseTolerance *= NoiseMargin;         // headroom, see below
         ResetCalibration();
      }
   } else if (Stage == DriftProfiling) {
      if (change > NoiseTolerance) {            // moved: discard the partial average
         Calibrating = false;
         ResetCalibration();
         StageTime = 0.0f;
      } else {
         Calibrating = true;                    // still: the manual code accumulates this sample
         if (StageTime >= DriftTime && NumOffsetSamples > 0) {
            Calibrating = false;                // freeze the offset
            Stage = AutoCalibrationDone;
         }
      }
   } else {
      Calibrating = false;
   }
}
```

Afterwards, we modify the baseline gyro calibration system to include our auto-calibration. Each time we get a sample, we fill in `Velocity` and `Acceleration` and call `ProcessInput`. The auto-calibration runs first so the `Calibrating` flag is up to date before the manual code reads it:

```cpp
void ProcessAutoCalibration(float deltaTime);

void ProcessInput(float deltaTime) {
   if (AutoCalibrate) {
      ProcessAutoCalibration(deltaTime);
   }

   if (Calibrating) {
      NumOffsetSamples++;
      AccumulatedOffset += Velocity;
   }

   // ...the rest of ProcessInput is unchanged
}
```

Now the calibration system includes an automatic stage that watches for the controller sitting still and updates the offset by itself. Note that it runs one full cycle and then stops (`AutoCalibrationDone`) until you call `ResetAutoCalibration()` again, whether that's from a "Recalibrate" button, or from the menu-driven setup below.


### Automatic Calibration configuration

You might notice we have an `AutoCalibrate = true;` in place. We'll need it to control whether the automatic calibration system is active or not.

This is important as automatic calibration can fail. It'll interpret the player slowly and steadily moving the controller intentionally (such as to follow a slow or distant target) as needing recalibration. This feels really bad when it happens.

To counteract: we'll use the `AutoCalibrate` toggle to let the end-user enable or disable the auto-calibration system. Depending on your input API, game engine or platform SDK, your system may already include the ability to turn it off; refer to your platform's documentation for more details.

We can add it to our input's gyro settings and make it toggleable by the end-user through a menu option or settings panel.

The remaining settings are worth knowing about when tuning:

| Setting | Default | What it does |
|---|---|---|
| `MaxNoise` | 0.075 G | Any sample-to-sample jump bigger than this means the controller is being moved. SDL's [`testcontroller.c`](https://github.com/libsdl-org/SDL/blob/main/test/testcontroller.c) uses this value, tuned on a DualShock 4 (a particularly noisy accelerometer). Raise it if a controller never gets past noise profiling while sitting on a table. |
| `SettleTime` | 0.5 s | Ignore the accelerometer right after the controller is put down, since it can still be "ringing". |
| `NoiseTime` | 4 s | How long we spend measuring the noise ceiling. |
| `DriftTime` | 5 s | How long the gyro is averaged. More time means a more accurate offset. |
| `NoiseMargin` | 2.0 | Headroom on the learned ceiling (it scales the squared value). Without it, a single sample slightly noisier than anything seen in the noise stage would restart the drift stage, and calibration can take much longer than it should. Set it to 1.0 to match SDL `testcontroller.c`'s noise margins. |

#### Menu-driven detection

We have a recommendation. We can have the gyro auto-calibration become active only while the player is in the menu navigation portion of the game, and have it be disabled for regular gameplay. This keeps the gyro output stable, and prevents unwanted recalibration during active gameplay.

To do that, we'll upgrade our `AutoCalibrate` variable from a `bool` to the new `AutoCalibrationMode` enum. This is the setting the player picks in the menu, and it gives them three choices:

| Mode | Behaviour |
|---|---|
| Off | Auto-calibration never runs. |
| Menu Only | Auto-calibration runs only while a menu is open, and never during gameplay. |
| Always | Auto-calibration may run in menus and during gameplay. |

```cpp
enum AutoCalibrationMode {
   AutoCalibrateOff,              // never
   AutoCalibrateMenuOnly,         // only while MenuActive; never during gameplay
   AutoCalibrateAlways            // may run in menus and during gameplay
};
AutoCalibrationMode AutoCalibrate = AutoCalibrateMenuOnly;
```

The mode is the player's *choice*; it doesn't change as menus open and close. What changes is a second piece of state, `MenuActive`, which your UI code sets whenever a menu opens or closes. The auto-calibration compares the two each sample to decide whether it's allowed to run:

```cpp
// current game state, set by your UI code
bool MenuActive;                  // true while a menu is up: main menu, pause menu, etc.

bool IsAutoCalibrationAllowed() {
   if (AutoCalibrate == AutoCalibrateAlways) {
      return true;
   }
   if (AutoCalibrate == AutoCalibrateMenuOnly) {
      return MenuActive;
   }
   return false;
}
```

So the menu detection system itself can be very small. A simple counter handles nested menus (opening Settings from the Pause menu, for example) so that closing the inner menu doesn't switch `MenuActive` off while the outer one is still up:

```cpp
int OpenMenuCount;

void OnMenuOpened() {             // call from your UI whenever any menu opens
   OpenMenuCount++;
   MenuActive = true;
}

void OnMenuClosed() {             // call from your UI whenever any menu closes
   if (OpenMenuCount > 0) {
      OpenMenuCount--;
   }
   MenuActive = OpenMenuCount > 0;
}
```

Now we need the auto-calibration to react when it becomes allowed (a menu opened) or stops being allowed (the menu closed, or the player changed the mode). We'll start a fresh cycle when it becomes allowed, and tidy up when it stops:

```cpp
bool AutoCalibrationRunning;      // were we allowed to run on the previous sample?
Vec3 BackupOffset;                // the previous offset, kept while a recalibration is under way
bool HasBackupOffset;

void StartAutoCalibration() {
   // remember the current offset so an interrupted recalibration doesn't leave us without one
   HasBackupOffset = NumOffsetSamples > 0;
   BackupOffset = GetCalibrationOffset();
   ResetAutoCalibration();
}

void StopAutoCalibration() {
   Calibrating = false;
   if (Stage != AutoCalibrationDone && HasBackupOffset) {
      // interrupted before finishing: put the previous offset back (one sample == that offset)
      NumOffsetSamples = 1;
      AccumulatedOffset = BackupOffset;
   }
}
```

The backup matters because our calibration stores its offset in the same accumulator it averages into. Starting a recalibration wipes the old offset, so if the player closes the menu before the cycle finishes, they'd be left with a partial offset or none at all. `StopAutoCalibration` puts the previous one back. It also clears `Calibrating`, so switching the mode to Off partway through a cycle can't leave the flag stuck on.

Finally, `ProcessAutoCalibration` gets a new first step, and `ProcessInput` no longer needs the `if (AutoCalibrate)` check, because the permission check now lives inside:

```cpp
void ProcessAutoCalibration(float deltaTime) {
   bool allowed = IsAutoCalibrationAllowed();
   if (allowed != AutoCalibrationRunning) {     // menu opened/closed, or the setting changed
      AutoCalibrationRunning = allowed;
      if (allowed) {
         StartAutoCalibration();
      } else {
         StopAutoCalibration();
      }
   }
   if (!allowed) {
      return;
   }

   // ...everything else in ProcessAutoCalibration stays the same
}

void ProcessInput(float deltaTime) {
   ProcessAutoCalibration(deltaTime);

   if (Calibrating) {
      NumOffsetSamples++;
      AccumulatedOffset += Velocity;
   }

   // ...the rest of ProcessInput is unchanged
}
```

With this in place, "Menu Only" runs a fresh calibration cycle every time a menu opens, and leaves the offset alone during gameplay.