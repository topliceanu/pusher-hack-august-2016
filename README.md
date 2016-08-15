# HTML5 Theremin

This project was submitted at the internal Pusher hackathon, august 2016.

## Gist

HTML5 Theremin is a digital music instrument that lives entirely in a web page.

You play it just like you would a theremin, by waving your hands in front of it.

This javascript version, however, uses `getUserMedia` to capture a video stream from your laptop’s camera.
That feeds into a image recognition loop which uses [js-objectdetect](https://github.com/mtschirs/js-objectdetect) to locate your closed fist and it’s position relative to the corners of the image.
The sound is produced  using the `Web Audio API` by translating the (X, Y) coordinates of the hand into the (frequency, gain) parameters of the standard oscillator.

## How to run

```bash
npm install
npm run dev
```

Enjoy!

## Credits

- This project is a heavily modified version of js-objectdetect's [examples/example_gesture_input.htm](https://github.com/mtschirs/js-objectdetect/blob/master/examples/example_gesture_input.htm). Go check out the library, it's amazing!
- The sound generation component is inspired by this lovely SmashingMag post [Making Music In A Browser: Recreating Theremin With JS And Web Audio API](https://www.smashingmagazine.com/2016/06/make-music-in-the-browser-with-a-web-audio-theremin/)

