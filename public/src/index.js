window.onload = function() {
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  var video = document.createElement('video');
  var detector;
  var audio = new AudioContext();

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

  function play() {
    window.requestAnimationFrame(play);
    if (video.paused) video.play();

    // Draw video overlay:
    canvas.width = ~~(100 * video.videoWidth / video.videoHeight);
    canvas.height = 100;
    context.drawImage(video, 0, 0, canvas.clientWidth, canvas.clientHeight);

    if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {

      // Prepare the detector once the video dimensions are known:
      if (!detector) {
        var width = ~~(140 * video.videoWidth / video.videoHeight);
        var height = 140;
        detector = new objectdetect.detector(width, height, 1.1, objectdetect.handfist);
      }

      // Perform the actual detection:
      var coords = detector.detect(video, 0.5); //format of coords: [x1, y1, x2, y2] ?

      if (coords[0]) {
        var coord = coords[0];

        // Rescale coordinates from detector to video coordinate space:
        coord[0] *= video.videoWidth / detector.canvas.width;
        coord[1] *= video.videoHeight / detector.canvas.height;
        coord[2] *= video.videoWidth / detector.canvas.width;
        coord[3] *= video.videoHeight / detector.canvas.height;

        highlight(context, coord)

        changeFrequency({
          clientX: coord[0] + coord[2] / 2,
          clientY: coord[1] + coord[3] / 2
        });
      }
    }
  }

  // Theremin part

  var audio = new AudioContext(),
      gainNode = audio.createGain(),
      oscillator = null;

  gainNode.connect(audio.destination);
  createOscillator({clientX: 70, clientY: 50})


  function calculateFrequency (mouseXPosition) {
      var minFrequency = 20,
          maxFrequency = 2000;

      // hack
      mouseXPosition -= 80;
      if (mouseXPosition < 0) { mouseXPosition = 0; }
      if (mouseXPosition > 470) { mouseXPosition = 470; }

      var frequency = ((mouseXPosition / 470) * maxFrequency) + minFrequency;
      console.log('=========', frequency);
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
      console.log('>>>>>>>>>>', gain);
      return gain;
  };

  function createOscillator (e) {
    var xPos = e.clientX;
    var yPos = e.clientY;

    oscillator = audio.createOscillator();
    oscillator.frequency.setTargetAtTime(calculateFrequency(xPos), audio.currentTime, 0.001);
    gainNode.gain.setTargetAtTime(calculateGain(yPos), audio.currentTime, 0.001);
    oscillator.connect(gainNode);
    oscillator.start(audio.currentTime);
  };

  function changeFrequency (e) {
    var xPos = e.clientX;
    var yPos = e.clientY;

    oscillator.frequency.setTargetAtTime(calculateFrequency(xPos), audio.currentTime , 0.001);
    gainNode.gain.setTargetAtTime(calculateGain(yPos), audio.currentTime, 0.001);
  };
};
