// Declare all the commonly used Box2D objects as variables for convenience
let b2Vec2 = Box2D.Common.Math.b2Vec2;
let b2BodyDef = Box2D.Dynamics.b2BodyDef;
let b2Body = Box2D.Dynamics.b2Body;
let b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
let b2World = Box2D.Dynamics.b2World;
let b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
let b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
let b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
let b2ContactListener = Box2D.Dynamics.b2ContactListener;

const box2d = {
    scale: 30, 
    init: function() {
        let gravity = new b2Vec2(0, 9.8);
        const allowSleep = true;

        box2d.world = new b2World(gravity, allowSleep);
        //this.setupDebugDraw();
    },

    debugCanvas: undefined,
    setupDebugDraw: function() {
        // Dynamically create a canvas for the debug drawing
        if (!box2d.debugCanvas) {
            let canvas = document.createElement("canvas");
            canvas.width = 1024;
            canvas.height = 480;
            document.body.appendChild(canvas);
            canvas.style.top = "480px";
            canvas.style.position = "absolute";
            canvas.style.background = "white";
            box2d.debugCanvas = canvas;
        }
        // Set up debug draw
        let debugContext = box2d.debugCanvas.getContext("2d");
        let debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(debugContext);
        debugDraw.SetDrawScale(box2d.scale);
        debugDraw.SetFillAlpha(0.3);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        box2d.world.SetDebugDraw(debugDraw);
    },

    createRectangle: function(entity, definition) {
        let bodyDef = new b2BodyDef();

        if(entity.isStatic) {
            bodyDef.type = b2Body.b2_staticBody;
        } else {
            bodyDef.type = b2Body.b2_dynamicBody;
        }

        bodyDef.position.x = entity.x / this.scale;
        bodyDef.position.y = entity.y / this.scale;
        if(entity.angle) {
            bodyDef.angle = Math.PI * entity.angle / 180;
        }

        let fixtureDef = new b2FixtureDef();

        fixtureDef.density = definition.density;
        fixtureDef.friction = definition.friction;
        fixtureDef.restitution = definition.restitution;

        fixtureDef.shape = new b2PolygonShape();
        fixtureDef.shape.SetAsBox(entity.width / 2 / this.scale, entity.height / 2 / box2d.scale);

        let body = box2d.world.CreateBody(bodyDef);

        body.SetUserData(entity);
        body.CreateFixture(fixtureDef);

        return body;
    },
    createCircle: function(entity, definition) {
        let bodyDef = new b2BodyDef();

        if (entity.isStatic) {
            bodyDef.type = b2Body.b2_staticBody;
        } else {
            bodyDef.type = b2Body.b2_dynamicBody;
        }
        bodyDef.position.x = entity.x / box2d.scale;
        bodyDef.position.y = entity.y / box2d.scale;

        if (entity.angle) {
            bodyDef.angle = Math.PI * entity.angle / 180;
        }

        let fixtureDef = new b2FixtureDef();

        fixtureDef.density = definition.density;
        fixtureDef.friction = definition.friction;
        fixtureDef.restitution = definition.restitution;
        fixtureDef.shape = new b2CircleShape(entity.radius / box2d.scale);

        let body = box2d.world.CreateBody(bodyDef);

        body.SetUserData(entity);
        body.CreateFixture(fixtureDef);

        return body;
    }
}

const entities = {
    definitions: {
        "glass": {
            fullHealth: 100,
            density: 2.4,
            friction: 0.4, 
            restitution: 0.15
        },
        "wood": {
            fullHealth: 500,
            density: 0.7,
            friction: 0.4,
            restitution: 0.4
        },
        "dirt": {
            density: 3.0,
            friction: 1.5,
            restitution: 0.2
        },
        "burger": {
            shape: "circle",
            fullHealth: 40,
            radius: 25,
            density: 1,
            friction: 0.5,
            restitution: 0.4
        },
        "sodacan": {
            shape: "rectangle",
            fullHealth: 80,
            width: 40,
            height: 60,
            density: 1,
            friction: 0.5,
            restitution: 0.7
        },
        "fries": {
            shape: "rectangle",
            fullHealth: 50,
            width: 40,
            height: 50,
            density: 1,
            friction: 0.5,
            restitution: 0.6
        },
        "apple": {
            shape: "circle",
            radius: 25,
            density: 1.5,
            friction: 0.5,
            restitution: 0.4
        },
        "orange": {
            shape: "circle",
            radius: 25,
            density: 1.5,
            friction: 0.5,
            restitution: 0.4
        },
        "strawberry": {
            shape: "circle",
            radius: 15,
            density: 2.0,
            friction: 0.5,
            restitution: 0.4
        }
    },
    create: function(entity) {
        let definition = entities.definitions[entity.name];

        if(!definition) {
            console.log('Undefined entity name', entity.name);

            return;
        }

        switch(entity.type) {
            case "block": // simple rectangles
                entity.health = definition.fullHealth;
                entity.fullHealth = definition.fullHealth;
                entity.shape = "rectangle";
                entity.sprite = loader.loadImage("resources/icons/entities/" + entity.name + ".png");
                box2d.createRectangle(entity, definition);
            break;
            case "ground": // simple rectangles
                // No need for health. These are indestructible
                entity.shape = "rectangle";
                // No need for sprites. These won't be drawn at all
                box2d.createRectangle(entity, definition);
            break;
            case "hero": // simple circles
            case "villain": // can be circles or rectangles
                entity.health = definition.fullHealth;
                entity.fullHealth = definition.fullHealth;
                entity.sprite = loader.loadImage("resources/icons/entities/" + entity.name + ".png");
                entity.shape = definition.shape;
                if (definition.shape === "circle") {
                    entity.radius = definition.radius;
                    box2d.createCircle(entity, definition);
                } else if (definition.shape === "rectangle") {
                    entity.width = definition.width;
                    entity.height = definition.height;
                    box2d.createRectangle(entity, definition);
                }
            break;
            default:
                console.log("Undefined entity type", entity.type);
            break;
        }
    },
    draw: function(entity, position, angle) {
        game.context.translate(position.x * box2d.scale - game.offsetLeft, position.y * box2d.scale);
        game.context.rotate(angle);
        let padding = 1;
        switch (entity.type) {
            case "block":
                game.context.drawImage(entity.sprite, 0, 0, entity.sprite.width, entity.sprite.height, -entity.width / 2 - padding, -entity.height / 2 - padding, entity.width + 2 * padding, entity.height + 2 * padding);
                break;
            case "villain":
            case "hero":
                if (entity.shape === "circle") {
                    game.context.drawImage(entity.sprite, 0, 0, entity.sprite.width, entity.sprite.height, -entity.radius - padding, -entity.radius - padding, entity.radius * 2 + 2 * padding, entity.radius * 2 + 2 * padding);
                } else if (entity.shape === "rectangle") {
                    game.context.drawImage(entity.sprite, 0, 0, entity.sprite.width, entity.sprite.height, -entity.width / 2 - padding, -entity.height / 2 - padding, entity.width + 2 * padding, entity.height + 2 * padding);
                }
                break;
            case "ground":
            // Do nothing... We draw objects like the ground & slingshot separately
                break;
        }
        game.context.rotate(-angle);
        game.context.translate(-position.x * box2d.scale + game.offsetLeft, -position.y * box2d.scale);
    }
}
