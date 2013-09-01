Game.utils = {};
Game.utils.add_default = function(_var, val){ if (typeof _var == 'undefined'){_var = val;}};
(function(){
  var x_dif, y_dif, a_tan, hyp;
  Game.utils.point_to = function(from_x, from_y, to_x, to_y){
    x_dif = to_x - from_x;
    y_dif = to_y - from_y;
    a_tan = Math.atan2(y_dif,x_dif);
    return a_tan;
  };
  Game.utils.normalize = function(from_x, from_y, to_x, to_y){
    x_dif = to_x - from_x;
    y_dif = to_y - from_y;
    hyp = (x_dif*x_dif)+(y_dif*y_dif);
    hyp = Math.sqrt(hyp);
    return [(x_dif/hyp),(y_dif/hyp)];
  }
  Game.utils.randomize_direction = function(){
    return  Game.utils.normalize(0,0,Math.random()*10-5,Math.random()*10-5);
  }
  Game.utils.proximity = function(from_x, from_y, to_x, to_y){
    x_dif = to_x - from_x;
    y_dif = to_y - from_y;
    return Math.sqrt((x_dif*x_dif)+(y_dif*y_dif));
  }
})();
(function(){
  var id = 0;
  Game.utils.assign_id = function(){return id++;};
})();
Game.utils.cool_off = function(obj, delta){
  obj.cooldown_left -= delta*1000;
  obj.cooldown_left =(obj.cooldown_left < 0)? 0 : obj.cooldown_left;
};
Game.utils.clone = function (obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
};