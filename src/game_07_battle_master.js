(function () {
  Game.bm = {};

  Game.enemy_stats = [
    {type: 'lame_brain', hp: 6.0, speed: 70.0, attack: 'melee_1', damage: 1.0, movement: 'wonder', graphic: [4,4,28,22,0]},
    {type: 'stand_n_shoot', hp: 6.0, speed: 70.0, attack: 'melee_1', damage: 1.0, movement: 'wonder', graphic: [4,136,32,18,0]},
    {type: 'back_stabber', hp: 6.0, speed: 70.0, attack: 'melee_1', damage: 1.0, movement: 'wonder', graphic: [6,62,20,18,0]},
    {type: 'big_n_heavy', hp: 6.0, speed: 70.0, attack: 'melee_1', damage: 1.0, movement: 'wonder', graphic: [66,159,32,32,0]}
  ];

  var spawn_cooldown = 750;
  Game.bm.spawn_cooldown_left = 0;
  Game.update_battle_master = function(B,delta){
    if (enemies_to_spawn){
      Game.utils.count_down(B, 'spawn_cooldown_left', delta);
      if (!B.spawn_cooldown_left){
        B.spawn_cooldown_left = spawn_cooldown;
        for (var i = 0; i < portal_queue.length; i++){
          if (portal_queue[i].length){
            var type_index = portal_queue[i].splice(Math.floor(Math.random()*portal_queue[i].length),1);
            Game.spawn_enemy(Game.enemy_stats[type_index],portal_transforms[i].position.x,portal_transforms[i].position.y);
            enemies_to_spawn--;
          }
        }
      }
    }
  };

  
  var enemies_to_spawn = 0;
  Game.spawn_enemy = function(stats, x_pos, y_pos){
    var new_enemy = Game.utils.clone(stats);
    new_enemy.active = true;
    new_enemy.transform = {
      visible: true,
      position: {x: x_pos, y: y_pos, z: 1},
      rotation: {x: 0, y: 0, z: 0},
      scale: {x: 4, y: 4},
      offset: {x: new_enemy.graphic[0], y: new_enemy.graphic[1], r: new_enemy.graphic[4]},
      width: new_enemy.graphic[2],
      height: new_enemy.graphic[3]
    };
    new_enemy.max_hp = new_enemy.hp;
    new_enemy.vol = [0,0];
    new_enemy.col = 14;
    new_enemy.wonder = 0;
    new_enemy.standing = 500;
    new_enemy.chasing = false;
    new_enemy.attack_wind_up = 400;
    new_enemy.attack_wind_up_left = 400;
    new_enemy.die = Game.enemy_functions.die;
    new_enemy.melee_hit = false;
    Game.enemies.push(new_enemy);
    Game.graphics.draw_list[1].push(new_enemy.transform);
  };

  var type_distribution = [0.45, 0.2, 0.15, 0.1];
  var type_population = [10, 4, 2, 1];
  var wave_base = 20;
  var bm = Game.bm;
  bm.wave = 1;
  var pts;
  Game.bm.craft_enemy = function(obj, points){
    var enemy = Game.utils.clone(obj);
    switch (obj.type){
      case 'lame_brain':
      default:
        enemy.hp += Math.round(points * 0.5 /3 );
        enemy.speed += Math.round(points * 0.5 / 3);
        enemy.damage += Math.round(points * 0.34 / 3);
        break;
    }
    return enemy;
  };
  var wave_e_types = [];
  var wave_e_count = [];
  Game.bm.do_wave = function(pts){
    wave_base *= 1.08;
    // figure in luck meter...

    // distribute points...
    var e_ratio = [];
    // var e_count = [];
    enemies_to_spawn = 0;
    var e_ratio_total = 0;
    type_distribution.map(function(item){
      var et = Math.random()*100*item;
      e_ratio_total += et;
      e_ratio.push(et);
    });
    for(var i = 0; i < e_ratio.length; i++){
      e_ratio[i] = (e_ratio[i] / e_ratio_total) * wave_base;
      // number of mobs = points alloted to type / total points for round / type_distribution * type_population
      wave_e_count[i] = Math.round(e_ratio[i]/wave_base/type_distribution[i]*type_population[i]);
      wave_e_types[i] = Game.bm.craft_enemy(Game.enemy_stats[i],e_ratio[i]/wave_e_count[i]);
      enemies_to_spawn += wave_e_count[i];
      for (var j = 0; j < wave_e_count[i]; j++){
        portal_queue[Math.floor(Math.random()*portal_queue.length)].push(i);
      }
      // var crafted_enemy = Game.bm.craft_enemy(Game.enemy_stats[i],e_ratio[i]/e_count[i]);
      // while (e_count[i]--){
      //   Game.spawn_enemy(crafted_enemy, 400,100);
      // }
    };
  }

  var portal_layout = [];
  portal_layout[3] = [1,2];
  portal_layout[4] = [2,2];
  portal_layout[5] = [2,1,2];
  portal_layout[6] = [2,2,2];
  portal_layout[7] = [2,3,2];
  portal_layout[8] = [3,2,3];
  portal_layout[9] = [3,3,3];
  portal_layout[10] = [3,4,3];
  portal_layout[11] = [4,3,4];
  portal_layout[12] = [4,4,4];
  portal_layout[13] = [3,4,3,3];
  portal_layout[14] = [3,4,3,4];
  portal_layout[15] = [4,4,4,3];
  portal_layout[16] = [4,4,4,4];

  var portal_queue = [];
  var portal_transforms = [];
  for (var i = 0; i < 16; i++){
    portal_transforms.push({
      visible: true,
      position: {x: 100, y: 100, z: 0},
      rotation: {x: 0, y: 0, z: 0},
      scale: {x: 1, y: 1},
      offset: {x: 3, y: 194, r: 0},
      width: 40,
      height: 40
    });
  }

  var portal_count = 5;
  Game.bm.set_portals = function(count){
    portal_queue = [];
    for (var i = 0; i < portal_transforms.length; i++){
      portal_transforms[i].visible = false;
    }
    Game.graphics.draw_list[0] = [];
    var portal_spacing = [];
    var portal_spacing_v = 880/(portal_layout[count].length + 1);
    portal_layout[count].map(function(num){
      portal_spacing.push(1200/(num+1));
    });
    var transform_index = 0;
    for (var i = 0; i < portal_layout[count].length; i++){
      for (var j = 0; j < portal_layout[count][i]; j++){
        portal_transforms[transform_index].visible = true;
        portal_transforms[transform_index].position.x = portal_spacing[i] * (j+1);
        portal_transforms[transform_index].position.y = portal_spacing_v * (i+1);
        portal_transforms[transform_index].position.x += (Math.random()*portal_spacing[i])-portal_spacing[i]/2;
        portal_transforms[transform_index].position.y += (Math.random()*portal_spacing_v)-portal_spacing_v/2;
        Game.graphics.draw_list[0].push(portal_transforms[transform_index]);
        portal_queue.push([]);
        transform_index++;
      }
    }
  };

  Game.bm.set_portals(portal_count)
  Game.bm.do_wave();
})();

