## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Short Summary

This project parses and visualizes data from an Amazon Ion log file. It includes:

- **Robust Ion Parsing**: Handles all Ion value types (int, decimal, boolean, string, struct, list, blob, etc.)
- **Session and Robot Info**: Displays essential information about the session and the robot
- **Topic Playback**: Plays back recorded topic messages over time with a dropdown selector
- **Console Logging**: Prints text-based messages (e.g., `/rosout_agg`) with a search/filter function
- **3D Robot Model Rendering**: Loads and displays the robot’s 3D model
- **Robot Path Tracking**: Animates the robot’s movement over time based on recorded position data
- **Bonus - OhmniClean Log**: Demonstrates video playback from JPEG-compressed frames embedded in the log

A live deployment is available at: [https://datdt1935-ion.vercel.app/](https://datdt1935-ion.vercel.app/)

file .ion at testing download at
https://drive.google.com/drive/folders/128mWQS91NCNtuv_Y81XDiV9GAvGNEDJT?usp=sharing
