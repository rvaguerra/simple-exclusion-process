const EULER = 2.71828;

const w = 600;
const h = 600;
const res = 25;
const dim = w / res;
const size = 5;
const count = 100;

const targetFrameRate = 10;
const deltaT = 0.01;
const computationsPerFrame = 1;

const particles = [];
const moveSet = [];

function exponentialDistribution(lambda, x) {
    return 1 - Math.pow(EULER, -1 * lambda * x);
}

function move() {
    return shuffle(moveSet)[0];
}

function createPositionHash(position) {
    return `${position.x}|${position.y}`;
}

function constrainToScreen(position) {
    return createVector(
        position.x < 0 ? (res - 1) : (position.x >= res ? 0 : position.x),
        position.y < 0 ? (res - 1) : (position.y >= res ? 0 : position.y)
    );
}

function compute() {
    const currentHashMap = new Set();
    const nextHashMap = new Set();

    // snapshot: current state
    for (let p of particles) {
        currentHashMap.add(createPositionHash(p.position));
    }

    for (let p of particles) {
        if (!p.shouldMove()) {
            continue;
        }

        // preview next position
        const nextPosition = constrainToScreen(p.position.copy().add(move()));
        const nextPositionHash = createPositionHash(nextPosition);

        // simple exclusion process
        if (nextHashMap.has(nextPositionHash) || currentHashMap.has(nextPositionHash)) {
            const currentPositionHash = createPositionHash(p.position);
            nextHashMap.add(currentPositionHash);
            continue;
        }

        // update hash maps
        nextHashMap.add(nextPositionHash);
        currentHashMap.delete(nextPositionHash);

        p.moveTo(nextPosition);
        p.updateDistribution();
    }

    for (let p of particles) {
        p.update();
    }
}

class Particle {
    constructor(id, position) {
        this.id = id;
        this.position = position;
        this.distribution = 0;
        this.timer = 0;

        this.updateDistribution();
    }

    updateDistribution() {
        this.distribution = exponentialDistribution(1 / res, random());
    }

    moveTo(position) {
        this.position = position;
    }

    shouldMove() {
        const result = this.timer >= this.distribution;
        if (result) {
            this.timer = 0;
        }
        return result;
    }

    update() {
        this.timer += deltaT;
    }

    draw() {
        const c = map(this.id, 0, count - 1, 0, 100);
        fill(c, 100, 100);
        circle(
            this.position.x * dim + 0.5 * dim,
            this.position.y * dim + 0.5 * dim,
            dim * 0.75
        );

        fill((c + 50) % 100, 100, 100);
        text(
            this.distribution.toFixed(2),
            this.position.x * dim + 0.5 * dim,
            this.position.y * dim + 0.5 * dim
        );
    }
}

function setup() {
    createCanvas(w, h);

    colorMode(HSB, 100);

    textAlign(CENTER, CENTER);
    textSize(dim * 0.3);

    noStroke();

    // initial state
    for (let i = 0; i < count; i++) {
        const p = createVector(
            Math.floor(res / 2),
            Math.floor(res / 2)
        );
        particles.push(new Particle(i, p));
    }

    // initialize move sets
    moveSet.push(
        createVector(1, 0),
        createVector(0, 1),
        createVector(-1, 0),
        createVector(0, -1)
    );

    frameRate(targetFrameRate);
}

function draw() {
    background(0, 0, 0);

    for (let i = 0; i < computationsPerFrame; i++) {
        compute();
    }

    for (let p of particles) {
        p.draw();
    }
}
