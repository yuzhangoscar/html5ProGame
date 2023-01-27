const b2Vec2 = Box2D.Common.Math.b2Vec2;
const b2BodyDef = Box2D.Dynamics.b2BodyDef;
const b2Body = Box2D.Dynamics.b2Body;
const b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
const b2World = Box2D.Dynamics.b2World;
const b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
const b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
const b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
const b2RevoluteJointDef = Box2D.Dynamics.b2RevoluteJointDef;

let world;
const scale = 30;
const timeStep = 1 / 60;
const velocityIterations = 8;
const positionIterations = 3;
let context;
const radius = 10;
const interval = 5000;
const football = new Image();
football.src = "resources/icons/football.png";
let total=0;

function drawAllBodies() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let body = world.GetBodyList(); body; body = body.GetNext()) {
        let entity = body.GetUserData();
        if (entity) {
            context.drawImage(football, body.GetPosition().x * scale, body.GetPosition().y * scale, radius, radius);
        }
    }
}

function init() {
    let gravity = new b2Vec2(0, 9.8);
    const allowSleep = true;

    world = new b2World(gravity, allowSleep);
    createFloor();
    createWall(5, 0, 2.15);
    createWall(645, 0, 0.99);
    setInterval(() => {
        for (let index = 0; index < 5; index++) {
            createCircularBody(150, 50, radius);
        }
    }, interval);
    setupDebugDraw();
    animate();
}

function animate() {
    world.Step(timeStep, velocityIterations, positionIterations);
    drawAllBodies();
    world.ClearForces();
    //world.DrawDebugData();
    //setTimeout(animate, timeStep);
    window.requestAnimationFrame(animate);
}

function createWall(positionX, positionY, angle) {
    let bodyDef = new b2BodyDef;

    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = positionX / scale;
    bodyDef.position.y = positionY / scale;
    bodyDef.angle = angle;

    let fixtureDef = new b2FixtureDef;

    fixtureDef.density = 1.0;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.2;

    fixtureDef.shape = new b2PolygonShape;
    fixtureDef.shape.SetAsBox(10 / scale, 300 / scale);

    let body = world.CreateBody(bodyDef);
    let fixture = body.CreateFixture(fixtureDef);
}

function createFloor() {
    let bodyDef = new b2BodyDef;

    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = 640 / 2 / scale;
    bodyDef.position.y = 450 / scale;

    let fixtureDef = new b2FixtureDef;

    fixtureDef.density = 1.0;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.2;

    fixtureDef.shape = new b2PolygonShape;
    fixtureDef.shape.SetAsBox(320 / scale, 10 / scale);

    let body = world.CreateBody(bodyDef);
    let fixture = body.CreateFixture(fixtureDef);
}

function setupDebugDraw() {
    context = document.getElementById('canvas').getContext('2d');

    let debugDraw = new b2DebugDraw();

    context.drawImage(football, 10, 10, radius, radius);
    debugDraw.SetSprite(context);
    debugDraw.SetDrawScale(scale);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

    world.SetDebugDraw(debugDraw);
}

function createRectangularBody() {
    let bodyDef = new b2BodyDef();

    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.x = 40 / scale;
    bodyDef.position.y = 100 / scale;

    let fixtureDef = new b2FixtureDef();

    fixtureDef.density = 1.0;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.3;
    fixtureDef.shape = new b2PolygonShape();
    fixtureDef.shape.SetAsBox(30 / scale, 50 / scale);

    let body = world.CreateBody(bodyDef);
    let fixture = body.CreateFixture(fixtureDef);
}

function createCircularBody(positionX, positionY, size) {
    let bodyDef = new b2BodyDef();

    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.x = positionX / scale;
    bodyDef.position.y = positionY / scale;

    let fixtureDef = new b2FixtureDef();

    fixtureDef.density = 1.0;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.7;

    fixtureDef.shape = new b2CircleShape(size / scale);

    let body = world.CreateBody(bodyDef);
    let fixture = body.CreateFixture(fixtureDef);

    body.SetUserData({sprite: football});

    return body;
}
