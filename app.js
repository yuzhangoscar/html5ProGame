const game = {
    mode: "intro",
    slightshotX: 140,
    slightshotY: 280,
    slightshotBandX: 140+55,
    slightshotBandY: 280+23,
    ended: false,
    score: 0,
    offsetLeft: 0,
    maxSpeed: 3,
    heroes: undefined,
    villains: undefined,
    init: function() {
        const playgameButton = document.querySelector('#playgame');
        playgameButton.addEventListener('click', () => {
            game.showLevelScreen();
        });
        game.canvas = document.querySelector('#gamecanvas');
        game.context = game.canvas.getContext('2d');
        levels.init();
        mouse.init();
        game.hideScreens();
        game.showScreen('gamestartscreen');
    },
    hideScreens: function() {
        const screens = document.querySelectorAll('.gamelayer');
        for (let index = screens.length - 1; index >= 0; index--) {
            let screen = screens[index];
            screen.style.display = 'none';
        }
    },
    hideScreen: function(id) {
        const screen = document.querySelector(`#` + `${id}`);
        screen.style.display = 'none';
    },
    showScreen: function(id) {
        const screen = document.querySelector(`#` +`${id}`);
        screen.style.display = 'block';
    },
    showLevelScreen: function() {
        game.hideScreens();
        game.showScreen('levelselectscreen');
    },
    countHeroesAndVillains: function() {
        game.heroes = [];
        game.villains = [];
        for (let body = box2d.world.GetBodyList(); body; body = body.GetNext()) {
            let entity = body.GetUserData();
            if (entity) {
                if (entity.type === "hero") {
                    game.heroes.push(body);
                } else if (entity.type === "villain") {
                    game.villains.push(body);
                }
            }
        }
    },
    handleGameLogic: function() {
        if (game.mode === "intro") {
            if(game.panTo(700)) {
                game.mode = "load-next-hero";
            }
        }
        if(game.mode === "wait-for-firing") {
            if(mouse.dragging) {
                game.panTo(mouse.x + game.offsetLeft);
            } else {
                game.panTo(game.slightshotX);
            }
        }
        if (game.mode === "load-next-hero") {
            // First count the heroes and villains and populate their respective arrays
            game.countHeroesAndVillains();
            // Check if any villains are alive, if not, end the level (success)
            if (game.villains.length === 0) {
                game.mode = "level-success";
                return;
            }
            // Check if there are any more heroes left to load, if not end the level (failure)
            if (game.heroes.length === 0) {
                game.mode = "level-failure";
                return;
            }
            // Load the hero and set mode to wait-for-firing
            if (!game.currentHero) {
            // Select the last hero in the heroes array
                game.currentHero = game.heroes[game.heroes.length - 1];
                // Starting position for loading the hero
                var heroStartX = 180;
                var heroStartY = 180;
                // And position it in mid-air, slightly above the slingshot
                game.currentHero.SetPosition({ x: heroStartX / box2d.scale, y: heroStartY / box2d.scale });
                game.currentHero.SetLinearVelocity({ x: 0, y: 0 });
                game.currentHero.SetAngularVelocity(0);
                // And since the hero had been sitting on the ground and is "asleep" in Box2D, "wake" it
                game.currentHero.SetAwake(true);
            } else {
            // Wait for hero to stop bouncing on top of the slingshot and fall asleep
            // and then switch to wait-for-firing
                game.panTo(game.slingshotX);
                if (!game.currentHero.IsAwake()) {
                    game.mode = "wait-for-firing";
                }
            }
            if (game.mode === "firing") {
                // If the mouse button is down, allow the hero to be dragged around and aimed
                // If not, fire the hero into the air
            }
            if (game.mode === "fired") {
            // Pan to the location of the current hero as it flies
            // Wait till the hero stops moving or is out of bounds
            }
            if (game.mode === "level-success" || game.mode === "level-failure") {
            // First pan all the way back to the left
            // Then show the game has ended and show the ending screen
            }
        }
    },
    panTo: function(newCenter) {
        let minOffset = 0;
        let maxOffset = game.currentLevel.backgroundImage.width - game.canvas.width;
        let currentCenter = game.offsetLeft + game.canvas.width/2;

        if(Math.abs(newCenter - currentCenter) > 0 && game.offsetLeft <= maxOffset && game.offsetLeft >= minOffset) {
            let deltaX = (newCenter - currentCenter)/2;
            if(Math.abs(deltaX) > game.maxSpeed) {
                deltaX = game.maxSpeed * Math.sign(deltaX);
            }
            if(Math.abs(deltaX) <= 1) {
                deltaX = (newCenter - currentCenter);
            }
            game.offsetLeft += deltaX;
            if(game.offsetLeft <= minOffset) {
                game.offsetLeft = minOffset;
                return true;
            }
            else if(game.offsetLeft >= maxOffset) {
                game.offsetLeft = maxOffset;
                return true;
            }
            else {
                return true;
            }
        }
    },
    start: function() {
        game.hideScreens();
        game.showScreen('gamecanvas');
        game.showScreen('scorescreen');
        game.mode = "intro";
        game.currentHero = undefined;
        game.offsetLeft = 0;
        game.ended = false;
        game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);
    },
    animate: function() {
        // Animate the characters
        let currentTime = new Date().getTime();
        if (game.lastUpdateTime) {
        let timeStep = (currentTime - game.lastUpdateTime) / 1000;
            box2d.step(timeStep);
        }
        game.lastUpdateTime = currentTime;

        game.handleGameLogic();
        game.context.drawImage(game.currentLevel.backgroundImage, game.offsetLeft / 4, 0, game.canvas.width, game.canvas.height, 0, 0, game.canvas.width, game.canvas.height);
        game.context.drawImage(game.currentLevel.foregroundImage, game.offsetLeft, 0, game.canvas.width, game.canvas.height, 0, 0, game.canvas.width, game.canvas.height);
        game.context.drawImage(game.slingshotImage, game.slightshotX - game.offsetLeft, game.slightshotY);
        game.drawAllBodies();
        game.context.drawImage(game.slingshotFrontImage, game.slightshotX - game.offsetLeft, game.slightshotY);
        if (!game.ended) {
            game.animationFrame= window.requestAnimationFrame(game.animate, game.canvas);
        }
    },
    drawAllBodies: function() {
        // Draw debug data if a debug canvas has been set up
        if (box2d.debugCanvas) {
            box2d.world.DrawDebugData();
        }
        // Iterate through all the bodies and draw them on the game canvas
        for (let body = box2d.world.GetBodyList(); body; body = body.GetNext()) {
            let entity = body.GetUserData();
            if (entity) {
                entities.draw(entity, body.GetPosition(), body.GetAngle());
            }
        }
    }
}

const levels = {
    data: [{
        foreground: "desert-foreground",
        background: "clouds-background",
        entities:[
            // The ground
            { type: "ground", name: "dirt", x: 500, y: 440, width: 1000, height: 20,
            isStatic: true },
            // The slingshot wooden frame
            { type: "ground", name: "wood", x: 190, y: 390, width: 30, height: 80,
            isStatic: true },
            { type: "block", name: "wood", x: 500, y: 380, angle: 90, width: 100, height: 25 },
            { type: "block", name: "glass", x: 500, y: 280, angle: 90, width: 100, height: 25 },
            { type: "villain", name: "burger", x: 500, y: 205, calories: 590 },
            { type: "block", name: "wood", x: 800, y: 380, angle: 90, width: 100, height: 25 },
            { type: "block", name: "glass", x: 800, y: 280, angle: 90, width: 100, height: 25 },
            { type: "villain", name: "fries", x: 800, y: 205, calories: 420 },
            { type: "hero", name: "orange", x: 80, y: 405 },
            { type: "hero", name: "apple", x: 140, y: 405 }
        ]
    }, {
        foreground: "desert-foreground",
        background: "clouds-background",
        entities:[
            // The ground
            { type: "ground", name: "dirt", x: 500, y: 440, width: 1000, height: 20,
            isStatic: true },
            // The slingshot wooden frame
            { type: "ground", name: "wood", x: 190, y: 390, width: 30, height: 80,
            isStatic: true },
            { type: "block", name: "wood", x: 850, y: 380, angle: 90, width: 100, height: 25 },
            { type: "block", name: "wood", x: 700, y: 380, angle: 90, width: 100, height: 25 },
            { type: "block", name: "wood", x: 550, y: 380, angle: 90, width: 100, height: 25 },
            { type: "block", name: "glass", x: 625, y: 316, width: 150, height: 25 },
            { type: "block", name: "glass", x: 775, y: 316, width: 150, height: 25 },
            { type: "block", name: "glass", x: 625, y: 252, angle: 90, width: 100, height: 25 },
            { type: "block", name: "glass", x: 775, y: 252, angle: 90, width: 100, height: 25 },
            { type: "block", name: "wood", x: 700, y: 190, width: 150, height: 25 },
            { type: "villain", name: "burger", x: 700, y: 152, calories: 590 },
            { type: "villain", name: "fries", x: 625, y: 405, calories: 420 },
            { type: "villain", name: "sodacan", x: 775, y: 400, calories: 150 },
            { type: "hero", name: "strawberry", x: 30, y: 415 },
            { type: "hero", name: "orange", x: 80, y: 405 },
            { type: "hero", name: "apple", x: 140, y: 405 }
        ]
    }],
    init: function() {
        const levelSelectScreen = document.querySelector('#levelselectscreen');
        const buttonClickHandler = function() {
            game.hideScreen('levelselectscreen');
            levels.load(this.value-1);
        };

        for (let i = 0; i < levels.data.length; i++) {
            const button = document.createElement("input");
            button.type = "button";
            button.value = (i+1);
            button.addEventListener('click', buttonClickHandler);

            levelSelectScreen.appendChild(button);
        }
    },
    load: function(number) {
        box2d.init();

        game.currentLevel={number:number};
        game.score=0;

        document.querySelector('#score').innerHTML = 'score: '+ game.score;
        let level = levels.data[number];

        game.currentLevel.backgroundImage = loader.loadImage('resources/icons/backgrounds/' + level.background + '.png');
        game.currentLevel.foregroundImage = loader.loadImage('resources/icons/backgrounds/' + level.foreground + '.png');
        game.slingshotImage = loader.loadImage('resources/icons/slingshot.png');
        game.slingshotFrontImage = loader.loadImage('resources/icons/slingshot-front.png');

        for(let index = level.entities.length - 1; index >= 0; index--) {
            let entity = level.entities[index];
            entities.create(entity);
        }

        loader.onload = game.start;
    }
};

const loader = {
    loaded: false,
    loadedCount: 0,
    totalCount: 0,
    init: function() {
    },
    loadImage: function(url) {
        this.loaded = false;
        this.totalCount++;
        game.showScreen('loadingscreen');
        let image = new Image();
        image.addEventListener('load', loader.itemLoaded, false);
        image.src = url;

        return image;
    },
    loadSound: function(url) {
        this.loaded = false;
        this.totalCount++;
        game.showScreen('loadingscreen');
        let audio = new Audio();
        audio.addEventListener('canplaythrough', loader.itemLoaded, false);
        audio.src = url + '.mp3';

        return audio;
    },
    itemLoaded: function(ev) {
        loader.loadedCount++;
        document.querySelector('#loadingmessage').innerHTML = 'Loaded' + loader.loadedCount + ' of' + loader.totalCount;
        if(loader.loadedCount === loader.totalCount) {
            loader.loaded = true;
            loader.loadedCount = 0;
            loader.totalCount = 0;

            game.hideScreen('loadingscreen');
            if(loader.onload) {
                loader.onload();
                loader.onload = undefined;
            }
        }
    }
}

const mouse = {
    x: 0,
    y: 0,
    down: false,
    dragging: false,

    init: function() {
        const canvas = document.getElementById('gamecanvas');

        canvas.addEventListener('mousemove', mouse.mousemovehandler, false);
        canvas.addEventListener('mousedown', mouse.mousedownhandler, false);
        canvas.addEventListener('mouseup', mouse.mouseuphandler, false);
        canvas.addEventListener('mouseout', mouse.mouseuphandler, false);
    },
    mousemovehandler: function(ev) {
        let offset = game.canvas.getBoundingClientRect();

        mouse.x = ev.clientX - offset.left;
        mouse.y = ev.clientY - offset.top;

        if(mouse.down) {
            mouse.dragging = true;
        }
        console.log('mouse move');

        ev.preventDefault();
    },
    mousedownhandler: function(ev) {
        mouse.down = true;
        console.log('mouse down');

        ev.preventDefault();
    },
    mouseuphandler: function(ev) {
        mouse.down = false;
        mouse.dragging = false;
        console.log('mouse up');

        ev.preventDefault();
    }
}

window.addEventListener('load', () => {
    console.log('page has been loaded.');
    game.init();
});
