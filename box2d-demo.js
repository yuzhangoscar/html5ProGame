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

function init() {
    let gravity = new b2Vec2(0, 9.8);
    const allowSleep = true;

    world = new b2World(gravity, allowSleep);
    createFloor();
    createRectangularBody();
    for (let index = 0; index < 50; index++) {
        createCircularBody(index+40, index+10, index+0.01);
    }
    setupDebugDraw();
    animate();
}

function animate() {
    world.Step(timeStep, velocityIterations, positionIterations);
    world.ClearForces();
    world.DrawDebugData();
    setTimeout(animate, timeStep);
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
}
