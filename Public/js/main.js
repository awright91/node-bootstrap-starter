

var GameState = {

	init: function() {
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;

		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.game.physics.arcade.gravity.y = 1000;

		this.cursors = this.game.input.keyboard.createCursorKeys();

		this.game.world.setBounds(0, 0, 2400, 1000);

		this.RUNNING_SPEED = 180;
		this.JUMPING_SPEED = 550;
	},

	preload: function() {
		this.load.image('ground', 'assets/images/ground.png');
		this.load.image('platform', 'assets/images/platform.png');
		this.load.image('goal', 'assets/images/gorilla3.png');
		this.load.image('arrowButton', 'assets/images/arrowButton.png');
		this.load.image('actionButton', 'assets/images/actionButton.png');
		this.load.image('barrel', 'assets/images/barrel.png');

		this.load.spritesheet('player', 'assets/images/player_spritesheet.png', 28, 30, 5, 1, 1);
		this.load.spritesheet('fire', 'assets/images/fire_spritesheet.png', 20, 21, 2, 1, 1);

		this.load.text('level', 'assets/data/level.json');
	},

	create: function() {

			//Parse the JSON platform data
		this.levelData = JSON.parse(this.game.cache.getText('level'));

			this.grounds = this.add.group();
		this.grounds.enableBody = true;

		this.levelData.groundData.forEach(function(ground) {
			this.grounds.create(ground.x, ground.y, 'ground');
		}, this);

			this.grounds.setAll('body.immovable', true);
		this.grounds.setAll('body.allowGravity', false);

		//Platform Elements

		this.platforms = this.add.group();
		this.platforms.enableBody = true;

		this.levelData.platformData.forEach(function(element){
			this.platforms.create(element.x, element.y, 'platform');
		}, this);

		this.platforms.setAll('body.immovable', true);
		this.platforms.setAll('body.allowGravity', false);

		//Player 

		this.player = this.add.sprite(this.levelData.playerStart.x, this.levelData.playerStart.y, 'player', 3);
		this.player.anchor.setTo(0.5);
		this.game.physics.arcade.enable(this.player);

		this.player.animations.add('walking', [0, 1, 2, 1], 6, true);

		this.player.body.collideWorldBounds = true;


		this.game.camera.follow(this.player);

		//Fire Elements

		this.fires = this.add.group();
		this.fires.enableBody = true;


		var fire;
		this.levelData.fireData.forEach(function(element) {
			fire = this.fires.create(element.x, element.y, 'fire');
			fire.animations.add('fire', [0, 1], 4, true);
			fire.play('fire');
		}, this);

		this.fires.setAll('body.allowGravity', false);

		//Goal Gorilla

		this.goal = this.add.sprite(this.levelData.goalData.x, this.levelData.goalData.y, 'goal');
		this.game.physics.arcade.enable(this.goal);
		this.goal.body.allowGravity = false;

		//Barrels 

		this.barrels = this.add.group();
		this.barrels.enableBody = true;

		this.createBarrel();
		this.barrelCreator = this.game.time.events.loop(Phaser.Timer.SECOND * 2, this.createBarrel, this);
	}, 



	update: function() {

		this.game.physics.arcade.collide(this.player, this.grounds);
		this.game.physics.arcade.collide(this.player, this.platforms);

		this.game.physics.arcade.collide(this.barrels, this.grounds);
		this.game.physics.arcade.collide(this.barrels, this.platforms);

		//Loser 
		this.game.physics.arcade.overlap(this.player, this.fires, this.killPlayer);
		this.game.physics.arcade.overlap(this.player, this.barrels, this.killPlayer);

		//Winner 
		this.game.physics.arcade.overlap(this.player, this.goal, this.win);

		this.player.body.velocity.x = 0;

		if(this.cursors.left.isDown) {
			console.log(this.player.y);
			this.player.body.velocity.x = -this.RUNNING_SPEED;
			this.player.scale.setTo(1);
			this.player.play('walking');
		} else if (this.cursors.right.isDown) {
			this.player.body.velocity.x = this.RUNNING_SPEED;
			this.player.scale.setTo(-1, 1);
			this.player.play('walking');
		}  else {
			this.player.animations.stop();
			this.player.frame = 3;
		}

		if(this.cursors.up.isDown && this.player.body.touching.down) {
				this.player.body.velocity.y = -this.JUMPING_SPEED;
		}

		this.barrels.forEach(function(barrel) {
			if(barrel.x < 10 && barrel.y > 800) {
				barrel.kill();
			}
		}, this);
	}, 

	killPlayer: function(player, fire) {
		game.state.start('GameState');
	}, 

	win: function(player, fire) {
		alert('Congratulations, Faith! You won!!!!!!');
		game.state.start('GameState');
	}, 

	createBarrel: function() {
		//give me the first dead sprite, if there are any 
		var barrel = this.barrels.getFirstExists(false);

		if(!barrel) {
			barrel = this.barrels.create(0, 0, 'barrel');
		}
		barrel.body.collideWorldBounds = true;
		barrel.body.bounce.set(1, 0);

		barrel.reset(2350, 10);
		barrel.body.velocity.x = 150;

		this.createLeftBarrel();
	},
	createLeftBarrel: function() {
		var barrel = this.barrels.getFirstExists(false);

		if(!barrel) {
			barrel = this.barrels.create(0, 0, 'barrel');
		}
		barrel.body.collideWorldBounds = true;
		barrel.body.bounce.set(1, 0);

		barrel.reset(20, 10);
		barrel.body.velocity.x = 150;
	}

}

//initiate the Phaser framework
var game = new Phaser.Game(600, 592, Phaser.AUTO);

game.state.add('GameState', GameState);
game.state.start('GameState');