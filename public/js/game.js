class Game {
    constructor(canvas, callbacks) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.callbacks = callbacks;

        this.width = 1024;
        this.height = 768;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.pathLeft = [
            { x: 0, y: 200 },
            { x: 300, y: 200 },
            { x: 300, y: 500 },
            { x: 700, y: 500 },
            { x: 700, y: 200 },
            { x: 1024, y: 200 }
        ];

        this.pathRight = [
            { x: 1024, y: 568 },
            { x: 724, y: 568 },
            { x: 724, y: 268 },
            { x: 324, y: 268 },
            { x: 324, y: 568 },
            { x: 0, y: 568 }
        ];

        this.towers = [];
        this.monsters = [];
        this.bullets = [];

        this.buildMode = null;
        this.mySide = null;

        this.lastTime = 0;
        this.animationId = null;

        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        this.mouseX = 0;
        this.mouseY = 0;
    }

    setSide(side) {
        this.mySide = side;
    }

    start() {
        if (!this.animationId) {
            this.lastTime = performance.now();
            this.accumulatedTime = 0;
            this.tick = 0;
            this.loop(this.lastTime);
        }
    }

    loop(timestamp) {
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.accumulatedTime += dt;

        const FIXED_STEP = 1000 / 60; // 60 Hz

        while (this.accumulatedTime >= FIXED_STEP) {
            this.update();
            this.accumulatedTime -= FIXED_STEP;
            this.tick++;
        }

        this.draw();

        this.animationId = requestAnimationFrame((t) => this.loop(t));
    }

    update() {
        // Fixed update, no dt needed for logic if we assume 1 tick = 1 unit of time
        this.towers.forEach(tower => tower.update(this.monsters, this.bullets));

        for (let i = this.monsters.length - 1; i >= 0; i--) {
            const monster = this.monsters[i];
            const result = monster.update();

            if (result && result.type === 'summon') {
                // Summon new monster at titan's location
                const summoned = new Monster(monster.x, monster.y, result.entityType, monster.path, monster.ownerSide);
                summoned.pathIndex = monster.pathIndex; // Start where titan is
                this.monsters.push(summoned);
            } else if (result === 'reached_base') {
                if (this.mySide === 'left' && monster.path === this.pathRight) {
                    this.callbacks.onBaseHit(monster.damageToBase);
                } else if (this.mySide === 'right' && monster.path === this.pathLeft) {
                    this.callbacks.onBaseHit(monster.damageToBase);
                }

                this.monsters.splice(i, 1);
            } else if (monster.markedForDeletion) {
                if (this.mySide === 'left' && monster.path === this.pathRight) {
                    this.callbacks.onMonsterKilled(monster.reward);
                } else if (this.mySide === 'right' && monster.path === this.pathLeft) {
                    this.callbacks.onMonsterKilled(monster.reward);
                }
                this.monsters.splice(i, 1);
            }
        }

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update();
            if (bullet.markedForDeletion) {
                this.bullets.splice(i, 1);
            }
        }

        // Periodic Sync Check (every 60 ticks = 1 second)
        if (this.tick % 60 === 0) {
            const checksum = this.getChecksum();
            this.callbacks.onSyncCheck(this.tick, checksum);
        }
    }

    getChecksum() {
        // Simple checksum: Sum of all entity positions and health
        let sum = 0;
        this.monsters.forEach(m => {
            sum += Math.floor(m.x) + Math.floor(m.y) + m.health;
        });
        this.towers.forEach(t => {
            sum += Math.floor(t.x) + Math.floor(t.y);
        });
        return sum;
    }

    draw() {
        this.ctx.fillStyle = '#a5d6a7';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, 0);
        this.ctx.lineTo(this.width / 2, this.height);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.setLineDash([10, 10]);
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.drawPath(this.pathLeft, '#e0e0e0');
        this.drawPath(this.pathRight, '#d7ccc8');

        this.ctx.font = '60px Arial';
        this.ctx.fillText('🏰', 10, this.height / 2);
        this.ctx.fillText('🏰', this.width - 70, this.height / 2);

        this.towers.forEach(t => t.draw(this.ctx));
        this.monsters.forEach(m => m.draw(this.ctx));
        this.bullets.forEach(b => b.draw(this.ctx));

        if (this.buildMode) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.5;
            this.ctx.beginPath();
            this.ctx.arc(this.mouseX, this.mouseY, 30, 0, Math.PI * 2);

            const valid = this.isValidPosition(this.mouseX, this.mouseY);
            this.ctx.fillStyle = valid ? '#fff' : '#f00';
            this.ctx.fill();

            this.ctx.restore();
        }
    }

    drawPath(path, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x, path[i].y);
        }
        this.ctx.lineWidth = 40;
        this.ctx.strokeStyle = color;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = (e.clientX - rect.left) * (this.width / rect.width);
        this.mouseY = (e.clientY - rect.top) * (this.height / rect.height);
    }

    handleClick(e) {
        if (this.buildMode) {
            if (this.isValidPosition(this.mouseX, this.mouseY)) {
                this.callbacks.onBuild(this.buildMode, this.mouseX, this.mouseY);
                this.buildMode = null;
                document.body.style.cursor = 'default';
            }
        }
    }

    isValidPosition(x, y) {
        if (this.mySide === 'left' && x >= this.width / 2) return false;
        if (this.mySide === 'right' && x < this.width / 2) return false;

        if (this.isNearPath(x, y, this.pathLeft)) return false;
        if (this.isNearPath(x, y, this.pathRight)) return false;

        for (const tower of this.towers) {
            const dist = Math.hypot(tower.x - x, tower.y - y);
            if (dist < 60) return false;
        }

        return true;
    }

    isNearPath(x, y, path) {
        for (let i = 0; i < path.length - 1; i++) {
            const p1 = path[i];
            const p2 = path[i + 1];
            const dist = this.distToSegment(x, y, p1.x, p1.y, p2.x, p2.y);
            if (dist < 40) return true;
        }
        return false;
    }

    distToSegment(x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq != 0) param = dot / len_sq;

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        }
        else if (param > 1) {
            xx = x2;
            yy = y2;
        }
        else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    addTower(type, x, y, ownerSide) {
        this.towers.push(new Tower(x, y, type, ownerSide));
    }

    spawnMonster(type, ownerSide) {
        const path = ownerSide === 'left' ? this.pathLeft : this.pathRight;
        this.monsters.push(new Monster(0, 0, type, path, ownerSide));
    }

    // Snapshot for Reconnection
    getSnapshot() {
        return {
            towers: this.towers.map(t => ({
                x: t.x, y: t.y, type: t.type, ownerSide: t.ownerSide
            })),
            monsters: this.monsters.map(m => ({
                x: m.x, y: m.y, type: m.type, ownerSide: m.ownerSide,
                pathIndex: m.pathIndex, health: m.health
            }))
        };
    }

    loadSnapshot(snapshot) {
        this.towers = snapshot.towers.map(t => new Tower(t.x, t.y, t.type, t.ownerSide));
        this.monsters = snapshot.monsters.map(m => {
            const path = m.ownerSide === 'left' ? this.pathLeft : this.pathRight;
            const monster = new Monster(m.x, m.y, m.type, path, m.ownerSide);
            monster.pathIndex = m.pathIndex;
            monster.health = m.health;
            return monster;
        });
    }
}
