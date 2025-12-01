class Entity {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.markedForDeletion = false;
    }
}

class Tower extends Entity {
    constructor(x, y, type, ownerSide) {
        super(x, y, type);
        this.ownerSide = ownerSide;
        this.range = 150;
        this.cooldown = 0;
        this.maxCooldown = 60;
        this.damage = 10; // Default damage
        this.color = '#ffeb3b';
        this.emoji = '�'; // Default emoji
        this.effect = null; // 'slow'

        // Inferno Tower specific
        this.currentTarget = null;
        this.rampTicks = 0;

        if (type === 'tower_rapid') {
            this.maxCooldown = 20;
            this.damage = 5;
            this.range = 120;
            this.emoji = '⚡';
        } else if (type === 'tower_slow') {
            this.maxCooldown = 90;
            this.damage = 15;
            this.range = 180;
            this.emoji = '❄️';
            this.effect = 'slow';
        } else if (type === 'tower_inferno') {
            this.maxCooldown = 0; // Continuous fire
            this.damage = 1; // Base DPS (per tick damage handled in update)
            this.emoji = '🔥';
            this.range = 200;
        }
    }

    update(monsters, bullets) {
        // Inferno Tower Logic
        if (this.type === 'tower_inferno') {
            // Check if current target is still valid
            if (this.currentTarget) {
                const dist = Math.hypot(this.currentTarget.x - this.x, this.currentTarget.y - this.y);
                if (this.currentTarget.health <= 0 || dist > this.range || this.currentTarget.markedForDeletion) {
                    this.currentTarget = null;
                    this.rampTicks = 0;
                }
            }

            // Find new target if needed
            if (!this.currentTarget) {
                let bestDist = this.range;
                for (const monster of monsters) {
                    // Only target enemies
                    if (monster.ownerSide === this.ownerSide) continue;

                    const dist = Math.hypot(monster.x - this.x, monster.y - this.y);
                    if (dist <= this.range && dist < bestDist) {
                        this.currentTarget = monster;
                        bestDist = dist;
                    }
                }
            }

            // Attack current target
            if (this.currentTarget) {
                this.rampTicks++;
                // Damage doubles every 60 ticks (1 second)
                // Base damage per tick = 1/60 (to get 1 DPS base)
                // Multiplier = 2 ^ floor(rampTicks / 60)
                const multiplier = Math.pow(2, Math.floor(this.rampTicks / 60));
                const damagePerTick = (1 / 60) * multiplier;

                this.currentTarget.takeDamage(damagePerTick);
            }
            return;
        }

        // Standard Tower Logic
        if (this.cooldown > 0) {
            this.cooldown--;
            return;
        }

        // Find target
        let target = null;
        let minDist = this.range;

        for (const monster of monsters) {
            // Only target enemies
            if (monster.ownerSide === this.ownerSide) continue;

            const dist = Math.hypot(monster.x - this.x, monster.y - this.y);
            if (dist <= this.range && dist < minDist) {
                target = monster;
                minDist = dist;
            }
        }

        if (target) {
            this.cooldown = this.maxCooldown;
            this.shoot(target, bullets);
        }
    }

    shoot(target, bullets) {
        bullets.push(new Bullet(this.x, this.y, target, this.damage, this.type, this.effect));
    }

    draw(ctx) {
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);

        // Draw Laser for Inferno Tower
        if (this.type === 'tower_inferno' && this.currentTarget) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.currentTarget.x, this.currentTarget.y);

            // Laser gets thicker/redder as it ramps up
            const rampLevel = Math.floor(this.rampTicks / 60);
            const width = Math.min(10, 2 + rampLevel);
            const red = Math.min(255, 100 + rampLevel * 50);

            ctx.lineWidth = width;
            ctx.strokeStyle = `rgb(${red}, 50, 0)`;
            ctx.stroke();

            // Reset context
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#000';
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y + 15, 5, 0, Math.PI * 2);
        ctx.fillStyle = this.ownerSide === 'left' ? '#ff4081' : '#00bcd4';
        ctx.fill();
    }
}

class Monster extends Entity {
    constructor(x, y, type, path, ownerSide) {
        super(x, y, type);
        this.path = path;
        this.ownerSide = ownerSide;
        this.pathIndex = 0;
        this.baseSpeed = 1;
        this.speed = 1;
        this.health = 5;
        this.maxHealth = 5;
        this.reward = 10;
        this.emoji = '🐰';
        this.damageToBase = 1;

        // Summoning ability
        this.summonTimer = 0;
        this.summonCooldown = 300; // 5 seconds at 60fps

        if (type === 'monster_tank') {
            this.baseSpeed = 0.5;
            this.speed = 0.5;
            this.health = 20;
            this.maxHealth = 20;
            this.reward = 25;
            this.emoji = '🐼';
            this.damageToBase = 5;
        } else if (type === 'monster_titan') {
            this.baseSpeed = 0.25;
            this.speed = 0.25;
            this.health = 200;
            this.maxHealth = 200;
            this.reward = 100;
            this.emoji = '👹';
            this.damageToBase = 20;
        }

        if (path && path.length > 0) {
            this.x = path[0].x;
            this.y = path[0].y;
        }
    }

    update() {
        // Apply slow effect
        if (this.slowTimer > 0) {
            this.slowTimer--;
            this.speedModifier = 0.5; // 50% slow
        } else {
            this.speedModifier = 1.0;
        }

        // Summoning Ability (Titan)
        if (this.type === 'monster_titan') {
            this.summonTimer++;
            if (this.summonTimer >= this.summonCooldown) {
                this.summonTimer = 0;
                return { type: 'summon', entityType: 'monster_fast' };
            }
        }

        const currentSpeed = this.baseSpeed * this.speedModifier;

        if (this.pathIndex >= this.path.length - 1) {
            return 'reached_base';
        }

        const target = this.path[this.pathIndex + 1];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < currentSpeed) {
            this.x = target.x;
            this.y = target.y;
            this.pathIndex++;
        } else {
            this.x += (dx / dist) * currentSpeed;
            this.y += (dy / dist) * currentSpeed;
        }
    }

    takeDamage(amount, effect) {
        this.health -= amount;
        if (effect === 'slow') {
            this.slowTimer = 120; // 2 seconds at 60fps
        }

        if (this.health <= 0) {
            this.markedForDeletion = true;
            return true;
        }
        return false;
    }

    draw(ctx) {
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.save();
        if (this.pathIndex < this.path.length - 1) {
            const target = this.path[this.pathIndex + 1];
            if (target.x < this.x) {
                ctx.translate(this.x, this.y);
                ctx.scale(-1, 1);
                ctx.fillText(this.emoji, 0, 0);
            } else {
                ctx.fillText(this.emoji, this.x, this.y);
            }
        } else {
            ctx.fillText(this.emoji, this.x, this.y);
        }
        ctx.restore();

        // Slow effect visual
        if (this.slowTimer > 0) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 188, 212, 0.3)'; // Blue glow
            ctx.fill();
        }

        // Health bar
        const hpPercent = this.health / this.maxHealth;
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 10, this.y - 20, 20, 4);
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.x - 10, this.y - 20, 20 * hpPercent, 4);

        ctx.beginPath();
        ctx.arc(this.x, this.y - 25, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.ownerSide === 'left' ? '#ff4081' : '#00bcd4';
        ctx.fill();
    }
}

class Bullet extends Entity {
    constructor(x, y, target, damage, type, effect) {
        super(x, y, 'bullet');
        this.target = target;
        this.damage = damage;
        this.effect = effect; // 'slow' or null
        this.speed = 8;
        this.color = '#000';

        if (type === 'tower_slow') {
            this.color = '#00bcd4';
        }
    }

    update() {
        if (this.target.markedForDeletion) {
            this.markedForDeletion = true;
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < this.speed) {
            this.x = this.target.x;
            this.y = this.target.y;
            this.hit();
        } else {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }

    hit() {
        this.markedForDeletion = true;
        this.target.takeDamage(this.damage, this.effect);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}
