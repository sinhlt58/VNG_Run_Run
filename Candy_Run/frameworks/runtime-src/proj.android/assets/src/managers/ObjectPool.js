/**
 * Created by SinhBlack on 1/1/2017.
 */
var ObjectPool = cc.Class.extend({
    available:null,
    inUse:{}, // maybe not use @@!
    testCoutCreated:0,
    ctor:function (classTypes) {
        this.available = {};
        for (var i=0; i<classTypes.length; i++){
            this.available[classTypes[i]] = [];
            this.inUse[classTypes[i]] = [];
        }
    },
    getObjectByClassType:function (classType) {
        var object;
        if (this.available[classType].length == 0){
            if (classType == "Item"){
                object = new Item();
            }else if(classType == "Ground"){
                object = new Ground();
            }else if (classType == "Obstacle"){
                object = new Obstacle();
            }
            object.sprite = new cc.Sprite();
            object.sprite.retain();
            this.testCoutCreated++;
        }else{
            object = this.available[classType].pop();
        }
       // this.inUse[classType].push(object);
        return object;
    },
    releaseObject:function (object, classType) {
        if (object){
            this.available[classType].push(object);
        }
    }
});