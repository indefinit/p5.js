function setup(){
  createCanvas(windowWidth, windowHeight, 'webgl');

}
function draw(){
  background(255);

  
  var rotAngle = map(mouseX, 0, windowWidth, -90, 90);
  translate(0,0,-100);
  push();
  //rect(width/2, height/2, 100,100);
  rotateX(radians(rotAngle));
  //plane(50,150);
  box();
  pop();
}

function windowResized(){

  resizeCanvas(windowWidth, windowHeight);
}