/**
 * Created by SinhBlack on 1/7/2017.
 */
var TriggerHeavenAndGround = Trigger.extend({
    isInHeaven:false,
    initCharacterPosInHeaven:null,
    rememberedPosInGround:null,
    initCharacterPosInGround:null,
    ctor:function (world) {
        this._super(world);

        this.initCharacterPosInGround = this.world.character.getInitPosition();
        this.initCharacterPosInHeaven = cc.p(this.initCharacterPosInGround.x,
                    2*this.world.getChunkHeight() - cc.view.getVisibleSize().height + this.initCharacterPosInGround.y);
    },
    update:function(dt){
        //check if the character's pos go to heaven.
        var currentCameraY = this.world.graphicsParent.getCurrentCameraY();
        var characterPos = this.world.character.getPosition();

        if(!this.isInHeaven){
            this.rememberedPosInGround = cc.p(characterPos.x - 500, cc.view.getVisibleSize().height - 5);
        }

        var distanceY = Math.abs(characterPos.y - currentCameraY) + this.world.character.getContentSize().height/2;
        if (distanceY >= cc.view.getVisibleSize().height/2){
            this.world.releaseAllCurrentRenderedObjects();
            this.world.setIsNeedToInitVisibleChunks(true);
            //release ojects and teleport player here.
            if (this.isInHeaven){
                this.world.character.setPosition(this.rememberedPosInGround);
            }else{
                this.world.character.setPosition(this.initCharacterPosInHeaven);
            }

            this.isInHeaven = !this.isInHeaven;
            return true;
        }
        return false;
    }
});