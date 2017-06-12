var vertices = [];
var mic;
var fft;
//var frequencySpectrum = [];


var instructions = ["left", "right", "up", "down", 
                           "1", "2", "3",
                           "loop", "if"];



function setup() {
  createCanvas(640, 640);

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0,256);
  fft.setInput(mic);
}

function draw() {
  background(51);

  var spectrum = fft.analyze();
  console.log(spectrum.length);

  

  for (var i = 0; i < spectrum.length; i++) { 
    var v = createVector(i*100+100, random(height));
    vertices.push(v);
  }


  var reached = [];
  var unreached = [];

  for (var i = 0; i < vertices.length; i++) {
    unreached.push(vertices[i]);
  }

  reached.push(unreached[0]);
  unreached.splice(0, 1);

  while (unreached.length > 0) {
    var record = 1024;
    var rIndex;
    var uIndex;
    for (var i = 0; i < reached.length; i++) {
      for (var j = 0; j < unreached.length; j++) {
        var v1 = reached[i];
        var v2 = unreached[j];
        var d = dist(v1.x, v1.y, v2.x, v2.y);
        if (d < record) {
          record = d;
          rIndex = i;
          uIndex = j;
        }
      }
    }
    stroke(255);
    strokeWeight(2);
    line(reached[rIndex].x, reached[rIndex].y, unreached[uIndex].x, unreached[uIndex].y);
    reached.push(unreached[uIndex]);
    unreached.splice(uIndex, 1);
  }
  
  for (var i = 0; i < vertices.length; i++) {
    fill(255);
    stroke(255);
    ellipse(vertices[i].x, vertices[i].y, 16, 16);
    stroke(0);
    text(random(instructions), vertices[i].x, vertices[i].y, 16, 16)
  }

}



