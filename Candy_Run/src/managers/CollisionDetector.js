/**
 * Created by Fresher on 1/3/2017.
 */
var CollisionDetector = cc.Class.extend({


    offsetX: null,

    offsetY: null,


    world: null,

    frames: 0,
    drawNode: null,


    //drawDot: null,

    ctor: function (world) {

        this.offsetX = 0;

        this.offsetY = 0;

        this.world = world;
        // this.drawNode = new cc.DrawNode();

        //this.drawDot= new cc.Dra

       // this.world.graphicsParent.addChild(this.drawNode, 100);

        /*this.offsetX = -40 * this.world.character.scaleSize;
         this.offsetY = 0;*/

    },
    update: function (dt) {


        this.offsetX = this.world.character.offsetCollX;
        this.offsetY = this.world.character.offsetCollY;


        //fix me offset X and Y must change by stateMovement
        /*if (this.world.character.stateMachine.stateMovement instanceof StateSliding) {
         this.offsetY = -39;
         } else {
         this.offsetX = -40 * this.world.character.scaleSize;
         this.offsetY = 0;
         }*/


        this.frames++;
        //update array contains items, ground, obstacles collide with character.
        var objectsCollidingWithCharacter = this.getDataObjectsCollidingWithCharacter(dt);

        //handle collisions character with item objects.
        this.handleCollision(this.world.character, objectsCollidingWithCharacter);
    },
    handleCollision: function (character, collisionObjects) {
        // handle with character
        var i;


        //handle collide with ground
        if (collisionObjects.hasOwnProperty(globals.CLASS_TYPE_GROUND)) {
            //change state to running or ... somethings not thought yet

            // maybe jumping or sliding
            //if sliding do nothing
            if (character.stateMachine.stateMovement instanceof StateSliding) {
                //character.stateMachine.setStateMovement(new StateRunning(character));
            } else if (character.stateMachine.stateMovement instanceof StateJumping) {
                //if is jumping and going down (velocityY <0)
                if (character.velocity.y <= 0) {
                    character.stateMachine.changeState('stateMovement', new StateRunning());
                }
            } else if (character.stateMachine.stateMovement instanceof StateDoubleJumping) {
                character.stateMachine.changeState('stateMovement', new StateRunning());
            } else if (character.stateMachine.stateMovement instanceof StateFlying) {
                character.stateMachine.changeState('stateMovement', new StateRunning());
            }else if(character.stateMachine.stateMovement instanceof StateFalling ){
                var currentState= character.stateMachine.stateMovement;
                currentState.fell= true;
                character.setVelocityX(0);
            }else if (character.stateMachine.stateMovement instanceof StateInHeaven && character.getVelocity().y<=0 ){
                character.stateMachine.changeState('stateMovement', new StateRunning());


            }



        } else {

            //no ground collide
            //run here when jump or go to hole
            if (character.stateMachine.stateMovement instanceof StateRunning || character.stateMachine.stateMovement instanceof StateSliding ||
                ((character.stateMachine.stateMovement instanceof StateJumping ||character.stateMachine.stateMovement instanceof StateDoubleJumping )&& character.getPosition().y<90)) {
                cc.log("Die");
                character.stateMachine.changeState("stateMovement", new StateFalling());
            }


        }


        if (collisionObjects.hasOwnProperty(globals.CLASS_TYPE_ITEM)) {
            var itemData = collisionObjects[globals.CLASS_TYPE_ITEM];
            for (i = 0; i < itemData.length; i++) {
                // this.world.spawnEffectAt(1004, character.getPosition());//for testting
                var itemDataObject = itemData[i];
                var itemObject = itemDataObject["pObject"];
                //do effects here
                itemObject.doEffects(cr.game, this.world);
                this.world.releaseAObjectData(itemDataObject);
            }

        } else {
            // nothing here
        }

        if (collisionObjects.hasOwnProperty(globals.CLASS_TYPE_OBSTACLE)) {
            // apply damage or die...
            var currentVisibleState = character.stateMachine.stateVisible;
            if (!(currentVisibleState instanceof StateActiveInvisible)){
                character.stateMachine.changeState("stateVisible", new StateActiveInvisible());//actually singleton here.
                character.stateMachine.changeState("stateHP", new StateTakingDamage());
                this.world.factory.runEffectAtPosition(globals.EFFECT_HIT_OBSTCLE , character.getPosition(), this.world);
            }
            var currentGiantState = character.stateMachine.stateGiant;
            if (currentGiantState instanceof StateGiantActive){
                var obstaclesData = collisionObjects[globals.CLASS_TYPE_OBSTACLE];
                for (i = 0; i < obstaclesData.length; i++) {
                    var obstacleDataObject = obstaclesData[i];
                    var obstacleObject = obstacleDataObject["pObject"];
                    obstacleObject.stateMachineObstacle.changeState(StateObstacleBeKicked);
                }
            }

        } else {

            // nothing here

        }

        // handle with items
    },
    getDataObjectsCollidingWithCharacter: function (dt) {


        // get character position and body size
        var charPos = this.world.character.getPosition();
        var bodySize = this.world.character.getContentSize();


        //cc.log(charPos.x);

        //debug collision by drawing a boundary box for character
        var characterLeft = charPos.x + this.offsetX;
        var characterRight = charPos.x + bodySize.width + this.offsetX;
        var characterTop = charPos.y + this.offsetY + bodySize.height + this.offsetY;
        var characterBottom = charPos.y + this.offsetY;

        //cc.log(charPos.y);
        var posRectOrigin = {
            x: characterLeft,
            y: characterBottom
        };
        var posRectDes = {
            x: characterRight,
            y: characterTop

        };
        var colorRect = cc.color(255, 255, 255, 0);
        var colorLine = cc.color(255, 0, 0, 128);
        // this.drawNode.clear();
        // this.drawNode.drawRect(posRectOrigin, posRectDes, colorRect, 2, colorLine);
        // this.drawNode.drawDot(charPos, 5, cc.color(255, 0, 0, 128));


        var objectsAroundCharacter = this.world.getObjectsAroundCharacter(charPos, bodySize);
        var dataObjectsCollidingWithCharacter = {};

        for (var i = 0; i < objectsAroundCharacter.length; i++) {
            var objectDataInMap = objectsAroundCharacter[i];
            if (objectDataInMap.hasOwnProperty("pObject") && objectDataInMap["pObject"] != null) {
                var object = objectDataInMap["pObject"];
                var objectPos = object.sprite.getPosition();
                var objectSize = object.sprite.getContentSize();
                if (object.sprite.isVisible()) {
                    if (this.isCharacterOverlapWithObject(charPos, bodySize, objectPos, objectSize)) {

                        //cc.log('Va cham');
                        var objectTypeId = object.getObjectTypeId();
                        var classType = this.world.factory.getClassTypeByObjecType(objectTypeId);
                        if (!dataObjectsCollidingWithCharacter.hasOwnProperty(classType)) {
                            dataObjectsCollidingWithCharacter[classType] = [];
                        }
                        dataObjectsCollidingWithCharacter[classType].push(objectDataInMap);
                    }
                }
            }
        }
        return dataObjectsCollidingWithCharacter;
    },
    isCharacterOverlapWithObject: function (charPos, bodySize, objectPos, objectSize) {



        //fix position of rectangle for detect collision
        var characterLeft = charPos.x + this.offsetX;
        var characterRight = charPos.x + bodySize.width + this.offsetX;
        var characterTop = charPos.y + this.offsetY + bodySize.height + this.offsetY;
        var characterBottom = charPos.y + this.offsetY;


        var rect1 = {
            x: characterLeft,
            y: characterBottom,
            width: bodySize.width,
            height: bodySize.height

        };

        //cc.log("characterBottom: ", characterBottom);
        var objectLeft = objectPos.x;
        var objectRight = objectPos.x + objectSize.width;
        var objectTop = objectPos.y + objectSize.height;
        var objectBottom = objectPos.y;


        var rect2 = {
            x: objectLeft,
            y: objectBottom,
            width: objectSize.width,
            height: objectSize.height,
        };


        return (characterLeft <= objectRight && characterRight >= objectLeft &&
        characterTop >= objectBottom && characterBottom <= objectTop);
    }
});