//gui
let instruct, welcome, play, reset;
let nextlevel, hm, msg;
let ins = {show:true,fy:-96,ty:-4,cy:-96};//true y, false y, current y
let gameState = 'start';//start, ingame, nextlevel
let stateTimer = 0;
//grips and background
let backimg;
let c = 0;
let grip=[];
let griploc=[];
let y = 0;
//person
let body=[];
let bro=[0,1,2,1,2,3,4,3,4];
let transform = [];
let anchor=[];
let skiprock = false;//making the limb skip the grip so it takes 2 clicks to grab
//levelvars
let lvl = 0;
function preload() {
  backimg = loadImage('assets/background.png');
  reset = loadImage('assets/reset.png');
  play = loadImage('assets/play.png');
  welcome = loadImage('assets/welcome.png');
  nextlevel = loadImage('assets/nextlevel.png');
  hm = loadImage('assets/hm.png');
  msg = loadImage('assets/msg0.png');
  instruct = loadImage('assets/instruct.png');
  for (let i = 0; i < 8; i++) {
    grip[i] = loadImage('assets/g'+i+'.png');
  }
  grip[8] = loadImage('assets/bell0.png');//the final target (the bell)
  //load person
  for (let i = 0; i < 5; i++) {
    body[i] = loadImage('assets/body'+i+'.png');
  }
}
function setup() {
  createCanvas(640,480);
  for (let i = 0; i < 8; i++) {
    grip[i].resize(grip[i].width/7,grip[i].height/7);
  }
  //generate grip positions
  //generate invisable grips for starting positions
  //type -1 is no link permissions, only starting positions
  c=0;
   griploc[c] = {
     x:256,
     y:247+1440,
     type:-1
   };
   c++;
   griploc[c] = {
     x:306,
     y:249+1440,
     type:-1
   };
   c++;
   griploc[c] = {
     x:297,
     y:454+1440,
     type:-1
   };
   c++;
   griploc[c] = {
     x:266,
     y:457+1440,
     type:-1
   };
   c++;
  generateLevel(0);
  griploc[c] = {
     x:297,
     y:10,
     type:8
   };
  //player setup
  for (let i = 0; i < 5; i++) {
    body[i].resize(body[i].width/1.5,body[i].height/1.5);
  }
  //x and y are the rotational offset to px py
  transform[0] = {//body
    x:29,
    y:63,
    px:100,
    py:100,
    angle:0
  };
  transform[1] = {//arm left
    x:10,
    y:38,
    px:96,
    py:96,
    angle:0
  };
  transform[2] = {//hand left
    x:7,
    y:38,
    px:96,
    py:96,
    angle:0
  };
  transform[3] = {//arm right
    x:10,
    y:38,
    px:200,
    py:96,
    angle:0
  };
  transform[4] = {//hand right
    x:7,
    y:38,
    px:200,
    py:96,
    angle:0
  };
  transform[5] = {//left leg
    x:11,
    y:44,
    px:100,
    py:200,
    angle:PI
  };
  transform[6] = {//left foot
    x:9,
    y:36,
    px:100,
    py:200,
    angle:PI
  };
   transform[7] = {//right leg
    x:11,
    y:44,
    px:100,
    py:200,
    angle:PI
  };
  transform[8] = {//right foot
    x:9,
    y:36,
    px:100,
    py:200,
    angle:PI
  };
  //type
  //0: not anchord
  //1: anchord to mouse
  //2: anchord to rock

  //indexes normaly 0-1-2-3
  //9-10-14-13
  anchor[0]={
    x:0,
    y:0,
    type: 2,
    index:0
  };
  anchor[1]={
    x:0,
    y:0,
    type:2,
    index:1
  };
  anchor[2]={
    x:0,
    y:0,
    type:2,
    index:2
  };
  anchor[3]={
    x:0,
    y:0,
    type:2,
    index:3
  };
  transform[0].py = y+290;
  transform[0].px = 250;
  calculatePlayer();
}
function draw(){
  if(gameState == "ingame"){
    stateTimer++;
    image(backimg, 0, y-1440);
    for(let i = 0; i < griploc.length; i++){
      let yeet = y-1440+griploc[i].y;
      if(yeet > -60 && yeet < 480){
        if(griploc[i].type != -1){//if its not a starting position
          image(grip[griploc[i].type],griploc[i].x,y-1440+griploc[i].y);
        }
      }
    }
    //calculate grip positions
    for(let i = 0; i < anchor.length; i++){
      if(anchor[i].type == 0){
        //the limb isn't connected to anything
      }
      if(anchor[i].type == 1){
        //the limb is coneected to the mouse
        anchor[i].x = mouseX;
        anchor[i].y = mouseY;
        grab(i,mouseX,mouseY);
      }
      if(anchor[i].type == 2){
        anchor[i].x = griploc[anchor[i].index].x+15;
        anchor[i].y = y-1440+griploc[anchor[i].index].y+15;
        grab(i,anchor[i].x,anchor[i].y);
      }
    }
    //determin the average location of its 4 grips
    let a = 0, b = 0, c = 0;
    for(let i = 0; i < 4; i++){
      if(anchor[i].type == 2){//held by grip
        a += anchor[i].x;
        b += anchor[i].y;
        c++;
      }
      if(anchor[i].type == 1){
        let memes = inbounds(i,mouseX,mouseY);
        if(memes.yes){//held by mouse
          a += anchor[i].x;
          b += anchor[i].y;
          c++;
        }
        else{//if the limb isnt inbounds, take the furthest bound for it to use as the average
          a += memes.x;
          b += memes.y;
          c++;
        }
      }
    }
    //move camera so player is in the center of the screen
    let delta = (transform[0].py-170)/-100;
    if(delta > 0){
      y += delta;
    }
    //constrain y
    if(y > 1440){
      y = 1440;
    }
    //put players position to the center of its 4 grips
    if(c > 3){
      transform[0].px = a/c - transform[0].x;
      transform[0].py = b/c - transform[0].y - 10;
    }
    calculatePlayer();
    drawPlayer();

    //draw GUI elements
    //progress bar
    if(dist(mouseX,mouseY, 27,25) < 18){
      tint(200);
    }
    image(reset,13,11);
    noTint();
    drawProgressBar(540,7,91,18,y/1440);
    if(ins.show){
      ins.cy = Math.lerp(ins.cy,ins.ty,0.1);
    }else{
      ins.cy = Math.lerp(ins.cy,ins.fy,0.1);
    }
    image(instruct,20,ins.cy);

  }//end gameState == "ingame"
  //not in game
  else if(gameState == 'start'){
      image(welcome,0,0);

      if(dist(mouseX,mouseY,518,351) < 100){
        tint(200,200,200);
      }
      image(play,384,232);
      noTint();
    }
    else{//next level state = 'nextlevel'
      stateTimer++;
      background(0,0,0);
      if(stateTimer > 20){
        image(hm,226,74);
        if(stateTimer > 50){
          image(msg,107,200);
          if(stateTimer > 80){
            if(mouseX > 182 && mouseX < 428 && mouseY > 338 && mouseY < 408){
              tint(170,170,170);
            }
            else{
              noTint();
            }
            image(nextlevel,181,338);
            noTint();
          }
        }
      }
    }
}
function calculatePlayer(){
  //calculate left arm position
  let a = transform[0].x+transform[0].px+cos(transform[0].angle-2.28)*37;// body's roational center + cos(angleoffset) * radius to arm center
  let b = transform[0].y+transform[0].py+sin(transform[0].angle-2.28)*37;
  transform[1].px = a-transform[1].x;//subtract the rotational offset to give position
  transform[1].py = b-transform[1].y;
  //calculate left hand position
  a = transform[1].x+transform[1].px+cos(transform[1].angle-PI/2)*37;
  b = transform[1].y+transform[1].py+sin(transform[1].angle-PI/2)*37;
  transform[2].px = a-transform[2].x;
  transform[2].py = b-transform[2].y;
  //calculate right arm position
  a = transform[0].x+transform[0].px+cos(transform[0].angle-PI/4)*37;
  b = transform[0].y+transform[0].py+sin(transform[0].angle-PI/4)*37;
  transform[3].px = a-transform[3].x;
  transform[3].py = b-transform[3].y;
  //calculate right hand position
  a = transform[3].x+transform[3].px+cos(transform[3].angle-PI/2)*37;
  b = transform[3].y+transform[3].py+sin(transform[3].angle-PI/2)*37;
  transform[4].px = a-transform[4].x;
  transform[4].py = b-transform[4].y;
  //calculate left leg position
  a = transform[0].x+transform[0].px+cos(transform[0].angle-4.3)*36;
  b = transform[0].y+transform[0].py+sin(transform[0].angle-4.3)*36;
  transform[5].px = a-transform[5].x;
  transform[5].py = b-transform[5].y;
  //left foot
  a = transform[5].x+transform[5].px+cos(transform[5].angle-PI/2)*37;
  b = transform[5].y+transform[5].py+sin(transform[5].angle-PI/2)*37;
  transform[6].px = a-transform[6].x;
  transform[6].py = b-transform[6].y;
  //calculate right leg position
  a = transform[0].x+transform[0].px+cos(transform[0].angle+1.1)*37;
  b = transform[0].y+transform[0].py+sin(transform[0].angle+1.1)*37;
  transform[7].px = a-transform[7].x;
  transform[7].py = b-transform[7].y;
  //right foot
  a = transform[7].x+transform[7].px+cos(transform[7].angle-PI/2)*37;
  b = transform[7].y+transform[7].py+sin(transform[7].angle-PI/2)*37;
  transform[8].px = a-transform[8].x;
  transform[8].py = b-transform[8].y;
  //draw body over all limbs
}
function drawPlayer(){
  drawImg(2);
  drawImg(4);
  drawImg(6);
  drawImg(8);
  drawImg(1);
  drawImg(3);
  drawImg(5);
  drawImg(7);
  drawImg(0);
}
function ra(a,b,c){
  translate(a, b);
  rotate(c);
  translate(-a, -b);
}
function drawImg(t){
  push();
  ra(transform[t].x+transform[t].px,transform[t].y+transform[t].py,transform[t].angle);
  image(body[bro[t]],transform[t].px,transform[t].py);
  pop();
}
function grab(limb,posx,posy){
  if(limb == 0){
    let lx = transform[0].x+transform[0].px+cos(transform[0].angle-2.28)*37;//start of limb
    let ly = transform[0].y+transform[0].py+sin(transform[0].angle-2.28)*37;
    let L = dist(lx,ly,posx,posy);
    let angle = 0;
    if(posx-lx<0){
      angle = Math.atan((posy-ly)/(posx-lx))-PI/2;
    }
    else{
      angle = Math.atan((posy-ly)/(posx-lx))+PI/2;
    }
    if(L < 37*2){
      let limit = 1.3;
      let shift = acos(1/(37/(L/2)));
      if(abs(shift) < limit){
        transform[1].angle = angle-shift;
        transform[2].angle = angle+shift;
      }
      else{
        transform[1].angle = angle-limit;
        transform[2].angle = angle+limit;
      }
    }else{
      transform[1].angle = angle;
      transform[2].angle = angle;
    }
  }
  if(limb == 1){
    let lx = transform[0].x+transform[0].px+cos(transform[0].angle-PI/4)*37;//start of limb
    let ly = transform[0].y+transform[0].py+sin(transform[0].angle-PI/4)*37;
    let L = dist(lx,ly,posx,posy);
    let angle = 0;
    if(posx-lx<0){
      angle = Math.atan((posy-ly)/(posx-lx))-PI/2;
    }
    else{
      angle = Math.atan((posy-ly)/(posx-lx))+PI/2;
    }
    if(L < 37*2){
      let limit = 1.3;
      let shift = acos(1/(37/(L/2)));
      if(abs(shift) < limit){
        transform[3].angle = angle+shift;
        transform[4].angle = angle-shift;
      }
      else{
        transform[3].angle = angle+limit;
        transform[4].angle = angle-limit;
      }
    }else{
      transform[3].angle = angle;
      transform[4].angle = angle;
    }
  }
  if(limb == 2){
    let lx = transform[0].x+transform[0].px+cos(transform[0].angle+1.1)*37;//start of limb
    let ly = transform[0].y+transform[0].py+sin(transform[0].angle+1.1)*37;
    let L = dist(lx,ly,posx,posy);
    let angle = 0;
    if(posx-lx<0){
      angle = Math.atan((posy-ly)/(posx-lx))-PI/2;
    }
    else{
      angle = Math.atan((posy-ly)/(posx-lx))+PI/2;
    }
    if(L < 37*2){
      let limit = 1.3;
      let shift = acos(1/(37/(L/2)));
      if(abs(shift) < limit){
        transform[7].angle = angle-shift;
        transform[8].angle = angle+shift;
      }
      else{
        transform[7].angle = angle-limit;
        transform[8].angle = angle+limit;
      }
    }else{
      transform[7].angle = angle;
      transform[8].angle = angle;
    }
  }
  if(limb == 3){
    let lx = transform[0].x+transform[0].px+cos(transform[0].angle-4.3)*37;//start of limb
    let ly = transform[0].y+transform[0].py+sin(transform[0].angle-4.3)*37;
    let L = dist(lx,ly,posx,posy);
    let angle = 0;
    if(posx-lx<0){
      angle = Math.atan((posy-ly)/(posx-lx))-PI/2;
    }
    else{
      angle = Math.atan((posy-ly)/(posx-lx))+PI/2;
    }
    if(L < 37*2){
      let limit = 1.3;
      let shift = acos(1/(37/(L/2)));
      if(abs(shift) < limit){
        transform[5].angle = angle+shift;
        transform[6].angle = angle-shift;
      }
      else{
        transform[5].angle = angle+limit;
        transform[6].angle = angle-limit;
      }
    }else{
      transform[5].angle = angle;
      transform[6].angle = angle;
    }
  }
}
function mousePressed() {
  onclick();
}
function touchStarted(){
  onclick();
}
function mouseReleased(){
  onrelease();
}
function touchEnded(){
  onrelease();
}
function mouseOver(x,y,r){
  if(dist(mouseX,mouseY,x,y) < r){
    return true;
  }
  return false;
}
function allNotAnchord(){
  if(anchor[0].type != 1 && anchor[1].type != 1 && anchor[2].type != 1 && anchor[3].type != 1){
    return true;
  }
  return false;
}
function anchoring(){
  for(let i = 0; i < 4; i++){
    if(anchor[i].type == 1){
      return i;
    }
  }
  return -1;
}
function inbounds(limb,posx,posy){
  let L = -1;
  let lx = 0;
  let ly = 0;
  let fx = 0;
  let fy = 0;
  if(limb == 0){
    lx = transform[0].x+transform[0].px+cos(transform[0].angle-2.28)*37;//start of limb
    ly = transform[0].y+transform[0].py+sin(transform[0].angle-2.28)*37;
    fx = transform[1].x+transform[1].px+cos(transform[1].angle-PI/2)*37+cos(transform[2].angle-PI/2)*37;
    fy = transform[1].y+transform[1].py+sin(transform[1].angle-PI/2)*37+sin(transform[2].angle-PI/2)*37;
  }
  if(limb == 1){
    lx = transform[0].x+transform[0].px+cos(transform[0].angle-PI/4)*37;//start of limb
    ly = transform[0].y+transform[0].py+sin(transform[0].angle-PI/4)*37;
    fx = transform[3].x+transform[3].px+cos(transform[3].angle-PI/2)*37+cos(transform[4].angle-PI/2)*37;
    fy = transform[3].y+transform[3].py+sin(transform[3].angle-PI/2)*37+sin(transform[4].angle-PI/2)*37;
  }
  if(limb == 2){
    lx = transform[0].x+transform[0].px+cos(transform[0].angle+1.1)*37;//start of limb
    ly = transform[0].y+transform[0].py+sin(transform[0].angle+1.1)*37;
    fx = transform[7].x+transform[7].px+cos(transform[7].angle-PI/2)*37+cos(transform[8].angle-PI/2)*37;
    fy = transform[7].y+transform[7].py+sin(transform[7].angle-PI/2)*37+sin(transform[8].angle-PI/2)*37;
  }
  if(limb == 3){
    lx = transform[0].x+transform[0].px+cos(transform[0].angle-4.3)*37;//start of limb
    ly = transform[0].y+transform[0].py+sin(transform[0].angle-4.3)*37;
    fx = transform[5].x+transform[5].px+cos(transform[5].angle-PI/2)*37+cos(transform[6].angle-PI/2)*37;
    fy = transform[5].y+transform[5].py+sin(transform[5].angle-PI/2)*37+sin(transform[6].angle-PI/2)*37;
  }
  L = dist(lx,ly,posx,posy);
  if(L<90){
    return {yes:true,x:fx,y:fy};
  }
  return {yes:false,x:fx,y:fy};
}
Math.lerp = function (value1, value2, amount) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
};
function drawProgressBar(x,y,w,h,pg){
  stroke(0);
  strokeWeight(2);
  fill(255);
  rect(x,y,w,h);
  fill(0,255,0);
  noStroke();
  rect(x+1,y+1,(w-2)*pg,h-2);
}
function restartButHarder(){
y = 0;
skiprock = false;//making the limb skip the grip so it takes 2 clicks to grab
  c=0;
   griploc[c] = {
     x:256,
     y:247+1440,
     type:-1
   };
   c++;
   griploc[c] = {
     x:306,
     y:249+1440,
     type:-1
   };
   c++;
   griploc[c] = {
     x:297,
     y:454+1440,
     type:-1
   };
   c++;
   griploc[c] = {
     x:266,
     y:457+1440,
     type:-1
   };
   c++;

   //generate level
  generateLevel(lvl);

  griploc[c] = {
     x:297,
     y:10,
     type:8
   };
  //x and y are the rotational offset to px py
  transform[0] = {//body
    x:29,
    y:63,
    px:100,
    py:100,
    angle:0
  };
  transform[1] = {//arm left
    x:10,
    y:38,
    px:96,
    py:96,
    angle:0
  };
  transform[2] = {//hand left
    x:7,
    y:38,
    px:96,
    py:96,
    angle:0
  };
  transform[3] = {//arm right
    x:10,
    y:38,
    px:200,
    py:96,
    angle:0
  };
  transform[4] = {//hand right
    x:7,
    y:38,
    px:200,
    py:96,
    angle:0
  };
  transform[5] = {//left leg
    x:11,
    y:44,
    px:100,
    py:200,
    angle:PI
  };
  transform[6] = {//left foot
    x:9,
    y:36,
    px:100,
    py:200,
    angle:PI
  };
   transform[7] = {//right leg
    x:11,
    y:44,
    px:100,
    py:200,
    angle:PI
  };
  transform[8] = {//right foot
    x:9,
    y:36,
    px:100,
    py:200,
    angle:PI
  };
  //type
  //0: not anchord
  //1: anchord to mouse
  //2: anchord to rock

  //indexes normaly 0-1-2-3
  //9-10-14-13
  anchor[0]={
    x:0,
    y:0,
    type: 2,
    index:0
  };
  anchor[1]={
    x:0,
    y:0,
    type:2,
    index:1
  };
  anchor[2]={
    x:0,
    y:0,
    type:2,
    index:2
  };
  anchor[3]={
    x:0,
    y:0,
    type:2,
    index:3
  };
  transform[0].py = y+290;
  transform[0].px = 250;
  calculatePlayer();
}
function generateLevel(lvl){
  //the bountries for grips are between
  //75 and 1843 for the y
  //76 and 524 for x
  //basic beginner level
  if(lvl == 0){
    for(let y = 1; y < 25; y++){
      for(let x = 0; x < 4; x++){

        griploc[c] = {
          x:x*120+120 + 0,
          y:y*(1920/25) + 0,
          type:Math.floor(Math.random()*7)
        };

        c++;
      }
    }
  }
  else if(lvl > 0){
    //something intelegent
  }
}
function onclick(){
  if(gameState == "ingame"){
    //check for reset button
    if(dist(mouseX,mouseY, 27,25) < 18){
      restartButHarder();
    }

    let lx = transform[1].x+transform[1].px+cos(transform[1].angle-PI/2)*37+cos(transform[2].angle-PI/2)*37;
    let ly = transform[1].y+transform[1].py+sin(transform[1].angle-PI/2)*37+sin(transform[2].angle-PI/2)*37;
    if(mouseOver(lx,ly,20) && allNotAnchord()){
      anchor[0].type = 1;
      skiprock = true;
    }
    lx = transform[3].x+transform[3].px+cos(transform[3].angle-PI/2)*37+cos(transform[4].angle-PI/2)*37;
    ly = transform[3].y+transform[3].py+sin(transform[3].angle-PI/2)*37+sin(transform[4].angle-PI/2)*37;
    if(mouseOver(lx,ly,20) && allNotAnchord()){
      anchor[1].type = 1;
      skiprock = true;
    }
    lx = transform[5].x+transform[5].px+cos(transform[5].angle-PI/2)*37+cos(transform[6].angle-PI/2)*37;
    ly = transform[5].y+transform[5].py+sin(transform[5].angle-PI/2)*37+sin(transform[6].angle-PI/2)*37;
    if(mouseOver(lx,ly,20) && allNotAnchord()){
      anchor[3].type = 1;
      skiprock = true;
    }
    lx = transform[7].x+transform[7].px+cos(transform[7].angle-PI/2)*37+cos(transform[8].angle-PI/2)*37;
    ly = transform[7].y+transform[7].py+sin(transform[7].angle-PI/2)*37+sin(transform[8].angle-PI/2)*37;
    if(mouseOver(lx,ly,20) && allNotAnchord()){
      anchor[2].type = 1;
      skiprock = true;
    }
    if(!skiprock){
      for(let i = 0; i < griploc.length; i++){
        let yeet = y-1440+griploc[i].y;
        if(yeet > -20 && yeet < 480){
          let boi = anchoring();
          if(griploc[i].type != -1 && mouseOver(griploc[i].x+15,yeet+15,20) && boi != -1 && inbounds(boi,griploc[i].x+15,yeet+15).yes){//anchoring is -1 if there is no limb is of type 1
            if(griploc[i].type == 8){
              //is it the bell?
              gameState = 'nextlevel';
              stateTimer = 0;
            }
            else{//its just a regular grip
              anchor[boi].type = 2;
              anchor[boi].index = i;
            }
          }
        }
      }
    }
  }//end gamestate = ingame
  else if(gameState == 'start'){
    //518 351 r100
    if(dist(mouseX,mouseY,518,351) < 100){
      ins.show = true;//show the instructions
      gameState = 'ingame';
      stateTimer = 0;
    }
  }
  else if(gameState == 'nextlevel'){
    if(mouseX > 182 && mouseX < 428 && mouseY > 338 && mouseY < 408 && stateTimer > 80){
      gameState = 'ingame';
      stateTimer = 0;
      restartButHarder();
      //harder becuase the levels about to increase :)
      lvl++;
    }
  }
}
function onrelease(){
  if(gameState == 'ingame'){
    skiprock = false;
    if(stateTimer > 50){
      ins.show = false;
    }
  }
}
