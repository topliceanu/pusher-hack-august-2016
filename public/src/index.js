window.onload = function() {
  var smoother = new Smoother([0.9995, 0.9995], [0, 0], 0);
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  var video = document.createElement('video');
  var detector;

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
      }
    }
  }
};
