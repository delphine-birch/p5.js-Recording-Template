var canv = window.document.getElementById("canvas");

var width = 800;
var height = 800;

//Recording variables
var filename = "p5recording"
var recordedFrames = 0;
//Desired length of recording in seconds
var length = 1;
var frameRate = 30;
var recording = false;
var numFrames;

let sketch = function(p) {
  p.preload = function() {
    p.preRecord();

    //MAIN PRELOAD CODE GOES HERE
  }

  p.setup = function() {
    p.createCanvas(width, height);
    p.colorMode(p.HSL, 1, 1, 1, 1);
    p.rectMode(p.CENTER);

    //MAIN SETUP CODE GOES HERE
  }

  p.draw = function() {
    p.background(0.96);

    //MAIN DRAW CODE GOES HERE

    p.record();
  }

  //Setup recording
  p.preRecord = function() {
    numFrames = length * frameRate;
    HME.createH264MP4Encoder().then(enc => {
                encoder = enc
                encoder.outputFilename = filename
                encoder.width = width
                encoder.height = height
                encoder.frameRate = frameRate
                encoder.kbps = 50000 // video quality
                encoder.groupOfPictures = 10 // lower if you have fast actions.
                encoder.initialize()
            })
  }

  //Handle Recording Input - press r to start/stop recording, R(shift + r) to reset the recording.
  p.keyTyped = function() {
    //toggle recording state
    if (p.key == 'r') {
      if (recording) { recording = false; }
      else { recording = true; }
    }
    //reset recording
    if (p.key == 'R') {
      recording = false
      recordedFrames = 0
      console.log('recording stopped')
      encoder.finalize();
      encoder.delete()
      p.preRecord();
    }
  }

  p.record = function() {
    if (recording) {
      console.log('recording');
      //add frame to recording
      encoder.addFrameRgba(p.drawingContext.getImageData(0, 0, encoder.width, encoder.height).data);
      recordedFrames++;
    }

    // finalize encoding and export as mp4
    if (recordedFrames === numFrames) {
      recording = false;
      recordedFrames = 0;
      console.log('recording stopped');
      //save file
      encoder.finalize();
      const uint8Array = encoder.FS.readFile(encoder.outputFilename);
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(new Blob([uint8Array], { type: 'video/mp4' }));
      anchor.download = encoder.outputFilename;
      anchor.click();
      encoder.delete();

      recording = false;
      p.preRecord(); // reinitialize encoder
    }
  }
}

new p5 (sketch, canv);
