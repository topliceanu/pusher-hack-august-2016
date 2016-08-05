window.onload = function() {
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  var video = document.createElement('video');
  var detector;
  var audio = new AudioContext();
  var smoother = new Smoother([0.9995, 0.9995, 0.9995, 0.9995], [0, 0, 0, 0], 0.1);

  window.navigator.webkitGetUserMedia({video: true}, function(stream) {
    try {
      video.src = window.URL.createObjectURL(stream);
    } catch (error) {
      video.src = stream;
    }
    window.requestAnimationFrame(play);
  }, function (error) {
    alert("WebRTC not available");
  });

  function highlight(context, coord) {
    // Draw coordinates on video overlay:
    context.beginPath();
    context.lineWidth = '2';
    context.fillStyle = 'rgba(0, 255, 255, 0.5)';
    context.fillRect(
      coord[0] / video.videoWidth * canvas.clientWidth,
      coord[1] / video.videoHeight * canvas.clientHeight,
      coord[2] / video.videoWidth * canvas.clientWidth,
      coord[3] / video.videoHeight * canvas.clientHeight);
    context.stroke();
  }

  var isDetected = false;
  var detectedToOff = _.debounce(function () {
    console.log("detect no fist!");
    isDetected = false;
    stopOscillator();
  }, 500);

  var detectedToOn = function (coord) {
    console.log("detect fist!");
    isDetected = true;

    var x = coord[0] + coord[2] / 2;
    var y = coord[1] + coord[3] / 2;
    createOscillator({clientX: x, clientY: y})
  };

  function play() {
    window.requestAnimationFrame(play);
    if (video.paused) video.play();

    // Draw video overlay:
    canvas.width = Math.floor(100 * video.videoWidth / video.videoHeight);
    canvas.height = 100;
    context.drawImage(video, 0, 0, canvas.clientWidth, canvas.clientHeight);

    if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {

      // Prepare the detector once the video dimensions are known:
      if (!detector) {
        var width = Math.floor(140 * video.videoWidth / video.videoHeight);
        var height = 140;
        detector = new objectdetect.detector(width, height, 1.1, objectdetect.handfist);
      }

      // Perform the actual detection:
      var coords = detector.detect(video, 1, 1, false, true); //format of coords: [x1, y1, x2, y2] ?

      if (coords[0]) {

        var coord = coords[0];

        // Rescale coordinates from detector to video coordinate space:
        coord[0] = coord[0] * video.videoWidth / detector.canvas.width; // x - upper-left corner
        coord[1] = coord[1] * video.videoHeight / detector.canvas.height; // y - upper-left corner
        coord[2] = coord[2] * video.videoWidth / detector.canvas.width; // width
        coord[3] = coord[3] * video.videoHeight / detector.canvas.height; // height
        smoothedCoords = smoother.smooth(coord)

        detectedToOn(smoothedCoords);
        detectedToOff();

        highlight(context, smoothedCoords)
        changeFrequency({
          clientX: smoothedCoords[0] + smoothedCoords[2] / 2,
          clientY: smoothedCoords[1] + smoothedCoords[3] / 2
        });
      }
    }
  }

  // Theremin part

  var audio = new AudioContext();
  var gainNode = audio.createGain();
  var circle = document.querySelector('#circle');
  var oscillator = null;

  gainNode.connect(audio.destination);


  function calculateFrequency (mouseXPosition) {
      var minFrequency = 20,
          maxFrequency = 2000;

      // hack
      mouseXPosition -= 80;
      if (mouseXPosition < 0) { mouseXPosition = 0; }
      if (mouseXPosition > 470) { mouseXPosition = 470; }

      var frequency = ((mouseXPosition / 470) * maxFrequency) + minFrequency;
      return frequency;
  };

  function calculateGain (mouseYPosition) {
      var minGain = 0,
          maxGain = 1;

      // hack
      mouseYPosition -= 60
      if (mouseYPosition < 0) { mouseYPosition = 0; }
      if (mouseYPosition > 360) { mouseYPosition = 360; }

      var gain = 1 - ((mouseYPosition / 360) * maxGain) + minGain;
      return gain;
  };

  var drawCircle = function (x, y) {
    x = x / 640 * document.body.clientWidth;
    y = y / 480 * document.body.clientHeight;

    circle.style.background = '#f2ed63';
    circle.style.display = 'block';
    circle.style.left = x + 'px';
    circle.style.top = y + 'px';
    circle.style.position = 'absolute';
    circle.style.width = '20px';
    circle.style.height = '20px';
    circle.style.borderRadius = '50%';
  };

  function createOscillator (e) {
    if (!oscillator) {
      var xPos = e.clientX;
      var yPos = e.clientY;

      drawCircle(xPos, yPos)
      oscillator = audio.createOscillator();
      oscillator.frequency.setTargetAtTime(calculateFrequency(xPos), audio.currentTime, 0.001);
      gainNode.gain.setTargetAtTime(calculateGain(yPos), audio.currentTime, 0.001);
      oscillator.connect(gainNode);
      oscillator.start(audio.currentTime);
    }
  };

  function stopOscillator () {
    if (oscillator) {
      circle.style.display = 'none';
      oscillator.stop(audio.currentTime);
      oscillator.disconnect();
      oscillator = null;
    }
  };

  function changeFrequency (e) {
    var xPos = e.clientX;
    var yPos = e.clientY;

    oscillator.frequency.setTargetAtTime(calculateFrequency(xPos), audio.currentTime , 0.001);
    gainNode.gain.setTargetAtTime(calculateGain(yPos), audio.currentTime, 0.001);
    drawCircle(xPos, yPos);
  };
};

// debug mode
var canvas = document.getElementById('canvas');
if (location.hash === "#debug") {
  canvas.style.display = "inherit";
}
else {
  canvas.style.display = "none";
}

