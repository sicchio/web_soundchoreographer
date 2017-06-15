var mic;
var fft;
//var frequencySpectrum = [];

var instructions = ["left", "right", "up", "down", 
                    "1", "2", "3",
                    "loop", "if"
		   ];

var vertices = [];
var words = [];
var bands = [];
var bandTypes = ['bass','mid','treble'];
var directions = []

function setup() {
  createCanvas(640, 640);

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0,256);
  fft.setInput(mic);

  for (var i = 0; i < 12; i++) { 
    var v = createVector(random(width), random(height));
    vertices.push(v);
    words.push(random(instructions));
    bands.push(random(bandTypes));
    directions.push(random(TAU));
  }
}

function draw() {
  background(51);
  var spectrum = fft.analyze();

  var bass = fft.getEnergy("bass");
  var mid = fft.getEnergy("mid");
  var treble = fft.getEnergy("treble");

  // comment these out if you don't want the graph
  rect(width-50,height-40,10,0-bass);
  rect(width-35,height-40,10,0-mid);
  rect(width-20,height-40,10,0-treble);
    
  var reached = [];
  var unreached = [];

  for (var i = 0; i < vertices.length; i++) {
      var x = vertices[i].x;
      var y = vertices[i].y;
      var angle = directions[i];
      
      var energy = 0;

      switch (bands[i]) {
      case "bass":
	  energy = bass;
	  break;
      case "mid":
	  energy = mid;
	  break;
      case "treble":
	  energy = treble;
	  break;
      }
      // console.log("energy " + energy);
      var ox = cos(angle) * (energy/50);
      var oy = sin(angle) * (energy/50);
      var x = vertices[i].x + ox;
      var y = vertices[i].y + oy;
      directions[i] += (0.05 - random(0.1));

      if (x < 0) {
	  x = 0 - x;
	  directions[i] += 0 - directions[i];
      }
      if (x >= width) {
	  x = width - (x - width);
	  directions[i] += PI - directions[i];
      }
      if (y < 0) {
	  y = 0 - y;
	  directions[i] += HALF_PI - directions[i];
      }
      if (y >= height) {
	  y = height - (y -height);
	  directions[i] += (PI * 1.5) - directions[i];
      }
      vertices[i].x = x;
      vertices[i].y = y;
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
    ellipse(vertices[i].x, vertices[i].y, 10, 10);
    stroke(0);
    textSize(20);
      text(words[i], vertices[i].x, vertices[i].y,20,20)
  }

}



