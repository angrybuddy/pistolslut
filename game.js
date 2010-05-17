// Load required engine components
Engine.include("/rendercontexts/context.canvascontext.js");
Engine.include("/spatial/container.spatialgrid.js");
Engine.include("/engine/engine.timers.js");
Engine.include("/textrender/text.vector.js");
Engine.include("/textrender/text.renderer.js");
Engine.include("/resourceloaders/loader.sprite.js");

// Load game objects
Game.load("/rock.js");
Game.load("/player.js");
Game.load("/bullet.js");
Game.load("/particle.js");

Engine.initObject("Spaceroids", "Game", function() {

/**
 * @class The game.
 */
var Spaceroids = Game.extend({

	constructor: null,

	renderContext: null,

	fieldBox: null,
	centerPoint: null,
	areaScale: $.browser.Wii ? 0.7 : 0.93,

	engineFPS: 30,

	collisionModel: null,

	rocks: 0,

	fieldWidth: 500,
	fieldHeight: 580,

	debug: true,
	playerObj: null,

	showStart: false,

	pEngine: null,

	level: 0,

	evolved: false,

	spriteLoader: null,
	loadTimeout: null,
	
	/**
	 * Clean up the playfield, removing any objects that are
	 * currently within the render context.  Used to initialize the game
	 * and to handle transitions between attract mode and play mode.
	 */
	cleanupPlayfield: function() {
		// Remove any rocks still floating around
		var objs = this.renderContext.getObjects();
		while (objs.length > 0)
		{
			objs.shift().destroy();
		}

		this.rocks = 0;
		this.level = 0;
	},

	/**
	 * A simple mode where the title, game over message,
	 * and start message are displayed with asteroids in the background
	 */
	attractMode: function() {
		this.cleanupPlayfield();
		Spaceroids.isAttractMode = true;

		var pWidth = this.fieldWidth;
		var pHeight = this.fieldHeight;

		// Add some asteroids
		for (var a = 0; a < 3; a++)
		{
			var rock = SpaceroidsRock.create(null, null, pWidth, pHeight);
			this.renderContext.add(rock);
			rock.setup();
			rock.killTimer = Engine.worldTime + 2000;
		}

		// var flash = function() {
		// 	if (!Spaceroids.showStart)
		// 	{
		// 		Spaceroids.start.setDrawMode(TextRenderer.DRAW_TEXT);
		// 		Spaceroids.showStart = true;
		// 		Spaceroids.intv.restart();
		// 	}
		// 	else
		// 	{
		// 		Spaceroids.start.setDrawMode(TextRenderer.NO_DRAW);
		// 		Spaceroids.showStart = false;
		// 		Spaceroids.intv.restart();
		// 	}
		// };
		// 
		// Spaceroids.intv = Timeout.create("startkey", 1000, flash);

		// Start up a particle engine
		this.pEngine = ParticleEngine.create()
		this.renderContext.add(this.pEngine);

		this.playerObj = SpaceroidsPlayer.create();
		this.renderContext.add(this.playerObj);
		this.playerObj.setup(pWidth, pHeight);

		Spaceroids.pEngine.addParticle(SimpleParticle.create(Point2D.create(25, 25)));
		Spaceroids.pEngine.update(this.renderContext, Engine.worldTime);

		// Create a new rock every 20 seconds
		Spaceroids.attractTimer = Interval.create("attract", 500,
			function() {
				// var rock = SpaceroidsRock.create(null, null, Spaceroids.fieldWidth, Spaceroids.fieldHeight);
				// Spaceroids.renderContext.add(rock);
				// rock.setup();
				// rock.killTimer = Engine.worldTime + 2000;
		});
	},

	nextLevel: function() {
		Spaceroids.level++;

		if (Spaceroids.level > 7) {
			Spaceroids.level = 7;
		}

		// Add some asteroids
		var pWidth = this.fieldWidth;
		var pHeight = this.fieldHeight;

		for (var a = 0; a < Spaceroids.level + 1; a++)
		{
			var rock = SpaceroidsRock.create(null, null, pWidth, pHeight);
			this.renderContext.add(rock);
			rock.setup();
		}
	},

	/**
	 * Called to set up the game, download any resources, and initialize
	 * the game to its running state.
	 */
	setup: function() {
		$("#loading").remove();

		// Set the FPS of the game
		Engine.setFPS(this.engineFPS);
		
		// Create the 2D context
		this.fieldBox = Rectangle2D.create(0, 0, this.fieldWidth, this.fieldHeight);
		this.centerPoint = this.fieldBox.getCenter();
		this.renderContext = CanvasContext.create("playfield", this.fieldWidth, this.fieldHeight);
		this.renderContext.setWorldScale(this.areaScale);
		Engine.getDefaultContext().add(this.renderContext);
		this.renderContext.setBackgroundColor("#000000");

		// We'll need something to detect collisions
		this.collisionModel = SpatialGrid.create(this.fieldWidth, this.fieldHeight, 7);
		
		// Load the resources		
		this.spriteLoader = SpriteLoader.create();
		this.spriteLoader.load("girl", this.getFilePath("resources/girl.js"));

		// Don't start until all of the resources are loaded
		Spaceroids.loadTimeout = Timeout.create("wait", 250, Spaceroids.waitForResources);
		this.waitForResources();
	},

  waitForResources: function(){
		if (Spaceroids.spriteLoader.isReady()) {
			Spaceroids.loadTimeout.destroy();
			Spaceroids.attractMode();
			return;
	  }
	  else
	  	Spaceroids.loadTimeout.restart();
  },

	/**
	 * Called when the game is being shut down to allow the game
	 * the chance to clean up any objects, remove event handlers, and
	 * destroy the rendering context.
	 */
	teardown: function() {
		this.renderContext.destroy();
	},

	/**
	 * A simple method that determines if the position is within the supplied bounding
	 * box.
	 *
	 * @param pos {Point2D} The position to test
	 * @param bBox {Rectangle2D} The bounding box of the playfield
	 * @type Boolean
	 */
	inField: function(pos, bBox) {
		var newPos = this.wrap(pos, bBox);
		return newPos.equals(pos);
	},

	/**
	 * Called to wrap an object around the edges of the playfield.
	 *
	 * @param pos {Point2D} The position of the object
	 * @param bBox {Rectangle2D} The bounding box of the playfield
	 */
	wrap: function(pos, bBox) {

		var rX = bBox.len_x();
		var rY = bBox.len_y();

		// Wrap if it's off the playing field
		var p = new Point2D(pos);
		var x = p.x;
		var y = p.y;
		var fb = this.renderContext.getViewport().get();

		//console.debug(p, fb);

		if (pos.x < fb.x || pos.x > fb.r ||
			 pos.y < fb.y || pos.y > fb.b)
		{
			if (pos.x > fb.r + rX)
			{
				x = (fb.x - (rX - 1));
			}
			if (pos.y > fb.b + rY)
			{
				y = (fb.y - (rY - 1));
			}
			if (pos.x < fb.x - rX)
			{
				x = (fb.r + (rX - 1));
			}
			if (pos.y < fb.y - rY)
			{
				y = (fb.b + (rY - 1));
			}
			p.set(x,y);
		}
		return p;
	}

});

return Spaceroids;

});
