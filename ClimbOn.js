//gui
let instruct, welcome, play, reset;
let water = {};
let ind = 0;
let nextlevel, hm, msg;
let ins = {show:true,fy:-96,ty:-4,cy:-96};//true y, false y, current y
let gameState = 'start';//start, ingame, nextlevel, store
let stateTimer = 0;
let bellsound, coinsound, bkmusic;
let rain = [];
//grips and background
let backimg;
let c = 0;
let grip=[];
let coinimg;
let griploc=[];
let y = 0;
let bubbles=[];
let popsound;
//grip offsets
let gpf = [];
//person
let people = [];
let purch = [];
let body=[];
let skin = 0;
let canrotatebody = true;
let tintplr = false;
let bro=[0,1,2,1,2,3,4,3,4];
let transform = [];
let anchor=[];
let skiprock = false;//making the limb skip the grip so it takes 2 clicks to grab
//levelvars
let lvl = 1;
let coincount = 0;
let drowntimer = 0;
//store
let storebk, store_bm, store_m,shop, storelocked, storebuy;
function preload() {
  bkmusic = loadSound('assets/background.wav');
  backimg = loadImage('assets/background.png');
  water.img = loadImage('assets/water.png');
  reset = loadImage('assets/reset.png');
  play = loadImage('assets/play.png');
  welcome = loadImage('assets/welcome.png');
  nextlevel = loadImage('assets/nextlevel.png');
  hm = loadImage('assets/hm.png');
  msg = loadImage('assets/msg0.png');
  instruct = loadImage('assets/instruct.png');
  coinimg = loadImage('assets/coin.png');
  for (let i = 0; i < 8; i++) {
    grip[i] = loadImage('assets/g'+i+'.png');
  }
  grip[8] = loadImage('assets/bell0.png');//the final target (the bell)
  for(let b = 0; b < 4; b++){
    people[b]=[];
    for (let i = 0; i < 5; i++) {
      people[b][i] = loadImage('assets/body'+b+i+'.png');
    }
  }
  for (let i = 0; i < 5; i++) {
    body[i] = people[0][i];
  }
}
function setup() {
  createCanvas(640,480);
  //resize stuff
  bkmusic.play();
  bkmusic.loop();
  textAlign(RIGHT,CENTER);
  textSize(20);
  water.x = 0;
  water.y = 0;
  water.my = 0;
  bellsound = loadSound('assets/bell.mp3');
  coinsound = loadSound('assets/coin.wav');
  popsound = loadSound('assets/pop.wav');
  storebk = loadImage('assets/store.png');
  store_m = loadImage('assets/store_mask.png');
  storelocked = loadImage('assets/store_mask2.png');
  storebuy = loadImage('assets/store_mask3.png');
  store_bm = loadImage('assets/store_buttonmask.png');
  shop = loadImage('assets/shop.png');
  for (let i = 0; i < 8; i++) {
    grip[i].resize(grip[i].width/7,grip[i].height/7);
  }
  coinimg.resize(coinimg.width/2.5,coinimg.height/2.5);
  generateLevel(0);
  for(let b = 0; b < 4; b++){
    for (let i = 0; i < 5; i++) {
      people[b][i].resize(people[b][i].width/1.5,people[b][i].height/1.5);
    }
  }
  //add rain
  for(let i = 0; i < 400; i++){
    rain[i] = {x:random(0,640),y:random(-20,480-20)};
  }
  for(let i = 0; i < 4; i++){
    purch[i] = {};
  }
  purch[0].p = true;
  purch[0].c = 0;
  purch[1].p = false;
  purch[1].c = 20;
  purch[2].p = false;
  purch[2].c = 40;
  purch[3].p = false;
  purch[3].c = 60;
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
  gpf[0] = {
    x:11.5,
    y:1.5
  };
  gpf[1] = {
    x:5.5,
    y:9.5
  };
  gpf[2] = {
    x:7.5,
    y:2.5
  };
  gpf[3] = {
    x:4.5,
    y:0.5
  };
  gpf[4] = {
    x:7.5,
    y:5.5
  };
  gpf[5] = {
    x:5.5,
    y:10.5
  };
  gpf[6] = {
    x:3.5,
    y:14.5
  };
  gpf[7] = {
    x:6.5,
    y:2.5
  };
  //type
  //0: not anchord
  //1: anchord to mouse
  //2: anchord to rock
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
    if(!ins.show) water.my-=0.14;
    water.x = sin(stateTimer/100)*100-100;
    water.y = y+water.my+480;
    image(backimg, 0, y-1440);
    for(let i = 0; i < griploc.length; i++){
      let yeet = y-1440+griploc[i].y;
      if(yeet > -60 && yeet < 480){
        if(griploc[i].type != -1){//if its not a starting position
          image(grip[griploc[i].type],griploc[i].x,y-1440+griploc[i].y);
          if(griploc[i].worth && griploc[i].type < 8){
            image(coinimg,griploc[i].x + gpf[griploc[i].type].x,y-1440+griploc[i].y + gpf[griploc[i].type].y);
          }
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
    //draw bubbles
    if(bubbles.length > 0 && bubbles[0].y < water.y+13){
      bubbles.shift();
      popsound.play();
    }
    fill(255);
    noStroke();
    for(let i = 0; i < bubbles.length; i++){
      ellipse(bubbles[i].x,bubbles[i].y,10,10);
      bubbles[i].y-=5;
      bubbles[i].x += sin(bubbles[i].r)*5;
      bubbles[i].r += 1.5;
    }
    //calculate the angle of the players body
    getPlayerAngle();
    calculatePlayer();
    drawPlayer();
    //draw gui
    //draw rain
    strokeWeight(3);
    stroke(143, 171, 255, 50);
    for(let i = 0; i < rain.length; i++){
      let x = rain[i].x;
      let y = rain[i].y;
      line(x,y,x,y+20);
      rain[i].y += 10;
      if(rain[i].y > 480) rain[i].y = -20;
    }
    noStroke();
    let headpoint = transform[0].y+transform[0].py+sin(transform[0].angle-PI/2)*60-20;
    let hpx = transform[0].x+transform[0].px+cos(transform[0].angle-PI/2)*60;
    if(headpoint > water.y){
      drowntimer++;
      if(drowntimer > 20 && stateTimer%((floor((drowntimer-20)/25))+2) == 0) bubbles.push({x:hpx,y:headpoint+20,r:random(0,100)});
      if(drowntimer > 350){
        restartButHarder();
      }
    }else{
      drowntimer = 0;
    }
    fill(0);
    text("coins:"+coincount,500,18);
    //progress bar
    if(dist(mouseX,mouseY, 27,25) < 14){
      tint(200);
    }
    image(reset,13,11);
    noTint();
    //shop
    if(dist(mouseX,mouseY, 30,57) < 14){
      tint(200);
      text("opens the shop (and pauses game)",420,13);
    }
    image(shop,13,47);
    noTint();

    drawProgressBar(540,7,91,18,y/1440);
    if(ins.show){
      ins.cy = Math.lerp(ins.cy,ins.ty,0.1);
    }else{
      ins.cy = Math.lerp(ins.cy,ins.fy,0.1);
    }
    image(instruct,20,ins.cy);
    image(water.img,water.x,water.y);
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
    else if(gameState == 'nextlevel'){//next level state = 'nextlevel'
      stateTimer++;
      background(0,0,0);
      if(stateTimer > 20){
        image(hm,226,74);
        if(stateTimer > 50){
          image(msg,107,200);
          if(stateTimer > 80)
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
    else if(gameState == 'store'){
      image(storebk,0,0);
      if(mouseX > 107 && mouseX < 164 && mouseY > 38 && mouseY < 69) image(store_bm,107,38);
      drawSquare(7,189,0,true);
      drawSquare(165,189,1,true);
      drawSquare(324,189,2,true);
      drawSquare(481,189,3,true);
      fill(0);
      text(coincount,517,53);
    }
}
function drawSquare(x,y,g,b){
  if(mouseX > x && mouseX < x+150 && mouseY > y && mouseY < y+161){
    if(b){
      if(purch[g].p)image(store_m,x,y);
      else if(purch[g].c > coincount) image(storelocked,x,y);
      else image(storebuy,x,y);
    }
    return true;
  }
  return false;
}
function getPlayerAngle(){
    let _a = inbounds(0,0,0);
    let _b = inbounds(1,0,0);
    let _c = inbounds(2,0,0);
    let _d = inbounds(3,0,0);
    let _abx = (_a.x + _b.x)/2;
    let _cdx = (_c.x + _d.x)/2;
    let _aby = (_a.y + _b.y)/2;
    let _cdy = (_c.y + _d.y)/2;
  //distance from target point to shoulder is greater than x
  if(dist(_abx,_aby,_cdx,_cdy) > 30) transform[0].angle = Math.atan2(_aby-_cdy, _abx-_cdx) + PI/2;
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
    let angle = transform[1].angle;
    if(L > 6){
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
  }
  if(limb == 1){
    let lx = transform[0].x+transform[0].px+cos(transform[0].angle-PI/4)*37;//start of limb
    let ly = transform[0].y+transform[0].py+sin(transform[0].angle-PI/4)*37;
    let L = dist(lx,ly,posx,posy);
    let angle = transform[3].angle;
    if(L > 6){
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
  }
  if(limb == 2){
    let lx = transform[0].x+transform[0].px+cos(transform[0].angle+1.1)*37;//start of limb
    let ly = transform[0].y+transform[0].py+sin(transform[0].angle+1.1)*37;
    let L = dist(lx,ly,posx,posy);
    let angle = transform[7].angle;
    if(L > 6){
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
  }
  if(limb == 3){
    let lx = transform[0].x+transform[0].px+cos(transform[0].angle-4.3)*37;//start of limb
    let ly = transform[0].y+transform[0].py+sin(transform[0].angle-4.3)*37;
    let L = dist(lx,ly,posx,posy);
    let angle = transform[5].angle;
    if(L > 6){
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
}
function mousePressed() {
  onclick();
}
function mouseReleased(){
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
  rect(x,y,w,h,5,5,5,5);
  fill(0,255,0);
  noStroke();
  rect(x+1,y+1,(w-2)*pg,h-2,5,5,5,5);
}
function restartButHarder(){
  bubbles = [];
  water.x = 0;
  water.my = 0;
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
function onclick(){
  if(gameState == "ingame"){
    //check for reset button
    if(dist(mouseX,mouseY, 27,25) < 14){
      restartButHarder();
    }
    if(dist(mouseX,mouseY, 30,57) < 14){
      gameState = 'store';
    }
    let lx = 0;
    let ly = 0;
    let order = [[0,1,2,3],[1,0,3,2]];
    for(let e = 0; e < 4; e++){
    switch(order[ind%2][e]){
      case 0:
      lx = transform[1].x+transform[1].px+cos(transform[1].angle-PI/2)*37+cos(transform[2].angle-PI/2)*37;
      ly = transform[1].y+transform[1].py+sin(transform[1].angle-PI/2)*37+sin(transform[2].angle-PI/2)*37;
      if(mouseOver(lx,ly,20) && allNotAnchord()){
        anchor[0].type = 1;
        ind++;
        skiprock = true;
      }
      break;
      case 1:
      lx = transform[3].x+transform[3].px+cos(transform[3].angle-PI/2)*37+cos(transform[4].angle-PI/2)*37;
      ly = transform[3].y+transform[3].py+sin(transform[3].angle-PI/2)*37+sin(transform[4].angle-PI/2)*37;
      if(mouseOver(lx,ly,20) && allNotAnchord()){
        anchor[1].type = 1;
        ind++;
        skiprock = true;
      }
      break;
      case 2:
      lx = transform[5].x+transform[5].px+cos(transform[5].angle-PI/2)*37+cos(transform[6].angle-PI/2)*37;
      ly = transform[5].y+transform[5].py+sin(transform[5].angle-PI/2)*37+sin(transform[6].angle-PI/2)*37;
      if(mouseOver(lx,ly,20) && allNotAnchord()){
        anchor[3].type = 1;
        ind++;
        skiprock = true;
      }
      break;
      case 3:
      lx = transform[7].x+transform[7].px+cos(transform[7].angle-PI/2)*37+cos(transform[8].angle-PI/2)*37;
      ly = transform[7].y+transform[7].py+sin(transform[7].angle-PI/2)*37+sin(transform[8].angle-PI/2)*37;
      if(mouseOver(lx,ly,20) && allNotAnchord()){
        anchor[2].type = 1;
        ind++;
        skiprock = true;
      }
      break;
    }
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
              bellsound.play();
            }
            else{//its just a regular grip
              anchor[boi].type = 2;
              anchor[boi].index = i;
              if(griploc[i].worth){
                griploc[i].worth = false;
                coinsound.play();
                coincount+=5;
              }
            }
          }
        }
      }
    }
  }//end gamestate = ingame
  else if(gameState == 'start'){
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
  else if(gameState == 'store'){
    if(mouseX > 107 && mouseX < 164 && mouseY > 38 && mouseY < 69){
      gameState = 'ingame';
    }

    if(drawSquare(7,189,0,false)){
      switchtop(0);
    }
    if(drawSquare(165,189,1,false)){
      switchtop(1);
    }
    if(drawSquare(324,189,2,false)){
      switchtop(2);
    }
    if(drawSquare(481,189,3,false)){
      switchtop(3);
    }
  }
}
function switchtop(r){
  if(purch[r].p){
    for (let i = 0; i < 5; i++) {
      body[i] = people[r][i];
    }
    gameState = 'ingame';
  }else if(purch[r].c <= coincount){
    purch[r].p = true;
    coincount = coincount - purch[r].c;
    for (let i = 0; i < 5; i++) {
      body[i] = people[r][i];
    }
    gameState = 'ingame';
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
function generateLevel(lvl){
  //experiment .length = 0
  griploc.length = 0;
  c=0;
   griploc[c] = {
     x:256,
     y:247+1440,
     type:-1,
     worth:false
   };
   c++;
   griploc[c] = {
     x:306,
     y:249+1440,
     type:-1,
     worth:false
   };
   c++;
   griploc[c] = {
     x:297,
     y:454+1440,
     type:-1,
     worth:false
   };
   c++;
   griploc[c] = {
     x:266,
     y:457+1440,
     type:-1,
     worth:false
   };
   c++;

  noiseSeed(random(0,100));
  //the bountries for grips are between
  //75 and 1843 for the y
  //76 and 536 for x
  let n = 0;
  let r = {ee:50,n:0.35,z:0.12};
  if(lvl < 5){
    r = [{ee:20,n:2,z:0},{ee:35,n:1.5,z:0.03},{ee:38,n:1,z:0.06},{ee:42,n:0.7,z:0.08},{ee:46,n:0.4,z:0.1}][lvl];
  }
  for(let y = 1; y < 25; y++){
    n = noise(y/r.n)*200;
    for(let x = 0; x < 4; x++){
      let a = random(-r.ee,r.ee);
      let b = random(-r.ee,r.ee);
      let _b = y*(1920/25)+b;
      let _a = x*120+120+a+n;
      if(random() > r.z){
        addGrip(_a,_b);
      }
    }
  }
  //put bell on
  griploc[c] = {
     x:297,
     y:10,
     type:8
   };
}
function addGrip(aa,bb){
  //((mouseX+73600-76)%(536-76))+76
  griploc[c] = {
    x:((aa+73600-76)%(536-76))+76,//keep within the walls
    y:constrain(bb,0,1840),
    type:Math.floor(Math.random()*8),
    worth:random()>0.85?true:false
  };
  c++;
}
