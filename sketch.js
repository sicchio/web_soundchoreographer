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
var sine = []
// five minutes
var duration = 6 * 60 * 1000

var maxVertices = 25
var minVertices = 3

function addWord() {
    var v = createVector(random(width), random(height));
    vertices.push(v);
    words.push(random(instructions));
    bands.push(random(bandTypes));
    directions.push(random(TAU));
}

function removeWord() {
    vertices.shift();
    words.shift();
    bands.shift();
    directions.shift();
}

function setup() {
  createCanvas(640, 640);

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0,256);
  fft.setInput(mic);

  for (var i = 0; i < 12; i++) {
	addWord()
  }

  for (var i = 0; i < 32; ++i) {
      sine.push(1-((cos(i * (TAU/32))/2)+0.5))
  }
}

function addRemoveVertices(cycle) {
    var target = floor((sine[floor(cycle*sine.length)] * (maxVertices - minVertices)) + minVertices);
    //console.log(floor(cycle*sine.length))
    //console.log(sine[floor(cycle*sine.length)])
    while (target > vertices.length) {
	addWord()

    }
    while (target < vertices.length) {
	removeWord()
    }
}

function draw() {
  var cycle = (millis() % duration) / duration
    
  background(51);

    addRemoveVertices(cycle)
    
  var spectrum = fft.analyze();

  var bass = fft.getEnergy("bass");
  var mid = fft.getEnergy("mid");
  var treble = fft.getEnergy("treble");

  // comment these out if you don't want the graph
  fill(128,128,255);
  rect(width-74,height-80,10,0-(bass*0.25));
  fill(128,255,128);
  rect(width-47,height-80,10,0-(mid*0.25));
  fill(255,128,128);
  rect(width-20,height-80,10,0-(treble*0.25));
  fill(255,255,255)
    
  var reached = [];
  var unreached = [];

  stroke(200,200,200)
  for (var i = 0; i < (sine.length -1); ++i) {
    line((width-74) + (i*2),
	 (height-30) - (sine[i]*20),
	 (width-74) + ((i+1)*2),
	 (height-30) - (sine[i+1]*20)
	);
  }
    
  stroke(255,255,255)
  line((width-74) + cycle*64,
       height-50,
       (width-74) + cycle*64,
       height-30
      )

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
    stroke(255);
    switch(bands[i]) {
      case "bass":
	fill(128,128,255);
	energy = bass;
	break;
      case "mid":
	fill(128,255,128);
	energy = mid;
	break;
      case "treble":
	fill(255,128,128);
	energy = treble;
	break;
    }
    ellipse(vertices[i].x, vertices[i].y, 10, 10);
      fill(255);
    stroke(0);
    textSize(20);
    text(words[i], vertices[i].x, vertices[i].y,20,20)
  }

}
