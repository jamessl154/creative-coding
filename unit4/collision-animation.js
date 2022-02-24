const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const math = require('canvas-sketch-util/math')

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

// https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
// implementation of animation
const animate = () => {
  console.log('domestika');
  requestAnimationFrame(animate)
}
// animate()

const sketch = ({ context, width, height }) => {

  // N.B. this is outside of the animation scope
  // 40 agents are created at random but fixed x,y (0,width||height)
  // with a random but fixed velocity between -1,1
  const agents = []
  for (let i=0; i < 5; i++) {
    const x = random.range(0, width)
    const y = random.range(0, height)

    agents.push(new Agent(x, y))
  }

  return () => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    for (let i=0; i < agents.length; i++) {
      const agent = agents[i]

      for (let j=i+1; j < agents.length; j++) {
        const other = agents[j]

        const dist = agent.pos.getDistance(other.pos)

        if (dist > 500) continue

        context.lineWidth = math.mapRange(dist, 0, 500, 15, 0.5)

        if (dist < 100) { // if dist < 2 * radius of each sphere
          // swap the velocities, momentum is conserved
          const tmpx = agent.vel.x
          const tmpy = agent.vel.y
          agent.collide(other.vel.x, other.vel.y)
          other.collide(tmpx, tmpy)
        }

        context.beginPath()
        context.moveTo(agent.pos.x, agent.pos.y)
        context.lineTo(other.pos.x, other.pos.y)
        context.stroke()
      }
    }

    agents.forEach(agent => { // for each agent on single frame
      agent.update() // each agents pos.x,pos.y position changes by vel.x,vel.y velocity
      agent.bounce(width, height) // inverts velocity if new point is out of bounds
      agent.draw(context) // redraws the point with updated pos.x,pos.y
    })
  };
};

canvasSketch(sketch, settings);

class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
  
  getDistance(v) {
    const dx = this.x - v.x
    const dy = this.y - v.y
    return Math.sqrt(dx**2 + dy**2)
  }
}

class Agent {
  constructor(x, y) {
    this.pos = new Vector(x, y)
    this.vel = new Vector(random.range(-1,1), random.range(-1, 1))
    this.radius = 50
    this.fertile = true
  }

  bounce(width, height) {
    if (this.pos.x <= this.radius || this.pos.x >= width - this.radius) this.vel.x *= -1
    if (this.pos.y <= this.radius || this.pos.y >= height - this.radius) this.vel.y *= -1
  }

  update() {
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
  }

  collide(collisionVelx, collisionVely) {
    this.vel.x = collisionVelx
    this.vel.y = collisionVely
  }

  draw(context) {
    context.save()
    context.translate(this.pos.x, this.pos.y)

    context.lineWidth = 4

    context.beginPath()
    context.arc(0, 0, this.radius, 0, Math.PI*2)
    context.fill()
    context.stroke()

    context.restore()
  }
}