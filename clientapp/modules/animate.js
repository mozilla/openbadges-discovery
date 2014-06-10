module.exports = function init(canvas) {

  createjs.MotionGuidePlugin.install(createjs.Tween);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - INIT VARS / OBJECTS        
  var stage = new createjs.Stage(canvas);

  var offsetX = 0;

// - - - - - - - - - - - - - - - - - - - - - SPRITESHEET CLOUDS
  var ssCloud  = new createjs.SpriteSheet({ "animations":{
    "mainLoop":[0, 14]},
    "images":["/static/animation/headerClouds.svg"],
    "frames":{
        "regX":0,
        "regY":0,
        "height":90,
        "width":105,
        "count":15
    }
  });

  var spriteCloud1 = new createjs.Sprite(ssCloud, "mainLoop");
      spriteCloud1.x = 283;
      spriteCloud1.y = 26;
      spriteCloud1.framerate = 5;
      spriteCloud1.stop();

  var spriteCloud2 = new createjs.Sprite(ssCloud, "mainLoop");
      spriteCloud2.x = 278;
      spriteCloud2.y = 145;
      spriteCloud2.framerate = 5;
      spriteCloud2.stop();

  var spriteCloud3 = new createjs.Sprite(ssCloud, "mainLoop");
      spriteCloud3.x = 847;
      spriteCloud3.y = 59;
      spriteCloud3.framerate = 5;
      spriteCloud3.stop();

// - - - - - - - - - - - - - - - - - - - - - SPRITESHEET GEESE
  var ssGoose1  = new createjs.SpriteSheet({ "animations":{
    "mainLoop":{frames:[0,0,1,2,3,4,5,6,6,6,5,4,3,2,1]}},
    "images":["/static/animation/headerGoose.svg"],
    "frames":{
        "regX":0,
        "regY":0,
        "height":20,
        "width":36,
        "count":7
    }
  });

  var ssGoose2  = new createjs.SpriteSheet({ "animations":{
    "mainLoop":{frames:[3,2,1,0,0,1,2,3,4,5,6,6,6,5,4]}},
    "images":["/static/animation/headerGoose.svg"],
    "frames":{
        "regX":0,
        "regY":0,
        "height":20,
        "width":36,
        "count":7
    }
  });

  var ssGoose3  = new createjs.SpriteSheet({ "animations":{
    "mainLoop":{frames:[6,6,6,5,4,3,2,1,0,0,1,2,3,4,5]}},
    "images":["/static/animation/headerGoose.svg"],
    "frames":{
        "regX":0,
        "regY":0,
        "height":20,
        "width":36,
        "count":7
    }
  });

  var spriteGoose1 = new createjs.Sprite(ssGoose1, "mainLoop");
      spriteGoose1.framerate = 22;

  var spriteGoose2 = new createjs.Sprite(ssGoose2, "mainLoop");
      spriteGoose2.framerate = 22;

  var spriteGoose3 = new createjs.Sprite(ssGoose3, "mainLoop");
      spriteGoose3.framerate = 22;

  var spriteGoose4 = new createjs.Sprite(ssGoose1, "mainLoop");
      spriteGoose4.framerate = 22;

  var spriteGoose5 = new createjs.Sprite(ssGoose2, "mainLoop");
      spriteGoose5.framerate = 22;


  var spriteGooseGuide = new createjs.Sprite(ssGoose2, "mainLoop");
      spriteGooseGuide.framerate = 22;


// - - - - - - - - - - - - - - - - - - - - - CONTAINER GEESE

  var containerGeese = new createjs.Container();
      containerGeese.x = 200;
      containerGeese.y = 300;

      spriteGoose1.x = 15;
      spriteGoose1.y = 0;

      spriteGoose2.x = 30;
      spriteGoose2.y = 20;

      spriteGoose3.x = -12;
      spriteGoose3.y = 13;

      spriteGoose4.x = -24;
      spriteGoose4.y = 28;

      spriteGoose5.x = -34;
      spriteGoose5.y = 45;

// - - - - - - - - - - - - - - - - - - - - - SPRITESHEET TRAIN

  var ssTrain  = new createjs.SpriteSheet({ "animations":{
    "mainLoop":[0, 2]},
    "images":["/static/animation/headerTrain_v2.svg"],
    "frames":{
        "regX":0,
        "regY":0,
        "height":20,
        "width":30,
        "count":3
    }
  });



  var spriteTrain = new createjs.Sprite(ssTrain, "mainLoop");
      spriteTrain.framerate = 6;
      spriteTrain.x = -50;
      spriteTrain.y = -100;
      spriteTrain.regY = 12;
      spriteTrain.scaleX = 1.3;
      spriteTrain.scaleY = 1.3;

  var trainWagon1 = new createjs.Bitmap("/static/animation/headerTrainWagon4.svg");
      trainWagon1.x = -50;
      trainWagon1.y = -100;
      trainWagon1.regY = 12;
      trainWagon1.scaleX = 1.3;
      trainWagon1.scaleY = 1.3;

  var trainWagon2 = new createjs.Bitmap("/static/animation/headerTrainWagon4.svg");
      trainWagon2.x = -50;
      trainWagon2.y = -100;
      trainWagon2.regY = 12;
      trainWagon2.scaleX = 1.3;
      trainWagon2.scaleY = 1.3;

  var trainWagon3 = new createjs.Bitmap("/static/animation/headerTrainWagon4.svg");  
      trainWagon3.x = -50;
      trainWagon3.y = -100;  
      trainWagon3.regY = 12;
      trainWagon3.scaleX = 1.3;
      trainWagon3.scaleY = 1.3;


// - - - - - - - - - - - - - - - - - - - - - DISPLAYLIST
  
  stage.addChild(spriteTrain);
  stage.addChild(trainWagon1);
  stage.addChild(trainWagon2);
  stage.addChild(trainWagon3);

  stage.addChild(containerGeese);
  containerGeese.addChild(spriteGoose1, spriteGoose2, spriteGoose3, spriteGoose4, spriteGoose5);

  stage.addChild(spriteCloud1);
  stage.addChild(spriteCloud2);
  stage.addChild(spriteCloud3);

 // stage.addChild(spriteGooseGuide);

  

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - TICKER
  createjs.Ticker.setFPS(30);
  createjs.Ticker.addEventListener("tick", stage);


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - TWEENS
  aniCLoud1();
  aniCLoud2();
  aniCLoud3();
  aniContainergeeseStart();
  aniTrainStart();

// - - - - - - - - - - - - - - - - - - - - - TWEENS CLOUDS OLD
  function aniCLoud1Start(){
      spriteCloud1.play();
  }
  function aniCLoud1Complete(){
      spriteCloud1.stop();
      aniCLoud1();
  }
  function aniCLoud1() {
      offsetX1 = spriteCloud1.x - 75;
      createjs.Tween.get(spriteCloud1)
                    .wait(Math.floor((Math.random() * 10000)))
                    .call(aniCLoud1Start)
                    .to({x:offsetX1}, 7500, createjs.Ease.cubicInOut)
                    .to({x:offsetX1 + 75}, 7500, createjs.Ease.cubicInOut)
                    .call(aniCLoud1Complete)
                    ;

  }


  function aniCLoud2Start(){
      spriteCloud2.play();
  }
  function aniCLoud2Complete(){
      spriteCloud2.stop();
      aniCLoud2();
  }
  function aniCLoud2() {
      offsetX2 = spriteCloud2.x + 75;
      createjs.Tween.get(spriteCloud2)
                    .wait(Math.floor((Math.random() * 10000)))
                    .call(aniCLoud2Start)
                    .to({x:offsetX2}, 7500, createjs.Ease.cubicInOut)
                    .to({x:offsetX2 - 75}, 7500, createjs.Ease.cubicInOut)
                    .call(aniCLoud2Complete)
                    ;

  }


  function aniCLoud3Start(){
      spriteCloud3.play();
  }
  function aniCLoud3Complete(){
      spriteCloud3.stop();
      aniCLoud3();
  }
  function aniCLoud3() {
      offsetX3 = spriteCloud3.x + 75;
      createjs.Tween.get(spriteCloud3)
                    .wait(Math.floor((Math.random() * 10000)))
                    .call(aniCLoud3Start)
                    .to({x:offsetX3}, 7500, createjs.Ease.cubicInOut)
                    .to({x:offsetX3 - 75}, 7500, createjs.Ease.cubicInOut)
                    .call(aniCLoud3Complete)
                    ;

  }


// - - - - - - - - - - - - - - - - - - - - - TWEENS CONTAINER GEESE
  function aniContainergeeseStart(){
      createjs.Tween.get(containerGeese)
                    .wait(10000)
                    .call(aniContainerGeese)
                    ;
  }

  function aniContainerGeese() {
      offsetGeeseX = 100 + Math.floor((Math.random() * 800));
      containerGeese.x = offsetGeeseX;
      containerGeese.y = 300;
      containerGeese.rotation = 20;
      createjs.Tween.get(containerGeese)
                    .to({x:(offsetGeeseX + 200), y:-100}, 10000)
                    .wait(Math.floor(5000 + (Math.random() * 20000)))
                    .call(aniContainerGeese)
                    ;
  }


  function aniTrainStart () {
    createjs.Tween.get(spriteTrain)
            .wait(15000)
            .call(aniTrain);
  }

  function aniTrain() {

    spriteTrain.x = -50;
    spriteTrain.y = -100;

    trainWagon1.x = -50;
    trainWagon1.y = -100;

    trainWagon2.x = -50;
    trainWagon2.y = -100;

    trainWagon3.x = -50;
    trainWagon3.y = -100;


    createjs.Tween.get(spriteTrain)
            .to({rotation:32}, 1)
            .to({x:380, y:170}, 10000)
            .to({guide:{ path:[380,170, 450,210,500,210]}, rotation:0},2400)
            .to({x:570, y:210}, 1500)
            .to({guide:{ path:[570,210, 660,210,700,150]}, rotation:-60},2800)
            .to({x:830, y:-100}, 6500)
            .wait(1050)
            .wait(Math.floor(5000 + (Math.random() * 7500)))
            .call(aniTrain);
      

    createjs.Tween.get(trainWagon1)
            .wait(350)
            .to({rotation:32}, 1)
            .to({x:380, y:170}, 10000)
            .to({guide:{ path:[380,170, 450,210,500,210]}, rotation:0},2400)
            .to({x:570, y:210}, 1500)
            .to({guide:{ path:[570,210, 660,210,700,150]}, rotation:-60},2800)
            .to({x:830, y:-100}, 6500)
            .wait(700);

          

    createjs.Tween.get(trainWagon2)
            .wait(700)
            .to({rotation:32}, 1)
            .to({x:380, y:170}, 10000)
            .to({guide:{ path:[380,170, 450,210,500,210]}, rotation:0},2400)
            .to({x:570, y:210}, 1500)
            .to({guide:{ path:[570,210, 660,210,700,150]}, rotation:-60},2800)
            .to({x:830, y:-100}, 6500)
            .wait(350);


          

    createjs.Tween.get(trainWagon3)
            .wait(1050)
            .to({rotation:32}, 1)
            .to({x:380, y:170}, 10000)
            .to({guide:{ path:[380,170, 450,210,500,210]}, rotation:0},2400)
            .to({x:570, y:210}, 1500)
            .to({guide:{ path:[570,210, 660,210,700,150]}, rotation:-60},2800)
            .to({x:830, y:-100}, 6500);    
  }

}; // function init