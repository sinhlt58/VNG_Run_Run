/**
 * Created by Fresher on 1/11/2017.
 */
var SkillPetRespawn = cc.Class.extend({
    respawnHP: 300,
    ctor:function () {


    },
    init:function (character) {
        character.numOfLife += 1;
    },
    update:function (character) {
        // if (character.isDead() && character.numOfLife > 0){
        //     character.currentHP = this.respawnHP;
        //     character.numOfLife -= 1;
        //     character.respawnToPosition();
        // }
    }
});