import { DEAL_SIDE } from '../../constants/dealsConstants';

export function BubblesCanvas (canvasRef, dealsList) {
    this.canvas = canvasRef;
    this.context = this.canvas.getContext('2d');
    this.bubbleList = [];
    let obj = this;
    this.canvas.addEventListener('click', function () {
        obj.addBubbles(dealsList);
    });
}

BubblesCanvas.prototype.addBubbles = function (dealsList) {
    let sX = 0;
    let sY = 0;
    dealsList.forEach((deal, i) => {
        this.createBall(sX, sY, deal);
        if (dealsList[i + 1]) sX += (dealsList[i + 1].size + deal.size) * 2;
        // if (dealsList[i - 1].size < deal.size) sY = deal.size;
    });
};

BubblesCanvas.prototype.updateDeals = function (deals) {
    this.bubbleList.forEach(bubble => {
        bubble.radius = deals[bubble.id].size;
        bubble.pips = deals[bubble.id].pips;
        bubble.itemColor = deals[bubble.id].itemColor;
        bubble.labelSize = deals[bubble.id].labelSize;
    });
};

BubblesCanvas.prototype.draw = function () {
    this.draw = this.draw.bind(this);
    requestAnimationFrame(this.draw);
    this.context.fillStyle = '#262626';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.bubbleList.forEach(currentBubble => {
        this.bubbleList.forEach(bubbleItem => {
            const distance = this.calculateDistance(currentBubble, bubbleItem);
            const collision = currentBubble.radius + bubbleItem.radius;
            if (distance <= collision && distance !== 0) {
                if (!bubbleItem.collisionList.includes(currentBubble.id)) {
                    const center = this.getCollisionPoint(currentBubble, bubbleItem);
                    this.getNewDirection(center, currentBubble, bubbleItem);
                    currentBubble.collisionList.push(bubbleItem.id);
                }
            }
        });
    });
    this.bubbleList.forEach(currentBubble => {
        if (currentBubble.x + currentBubble.dx > this.canvas.width - currentBubble.radius || currentBubble.x + currentBubble.dx < currentBubble.radius) {
            currentBubble.dx = -currentBubble.dx;
        }
        if (currentBubble.y + currentBubble.dy > this.canvas.height - currentBubble.radius || currentBubble.y + currentBubble.dy < currentBubble.radius) {
            currentBubble.dy = -currentBubble.dy;
        }
        currentBubble.x += currentBubble.dx;
        currentBubble.y += currentBubble.dy;
        currentBubble.collisionList = [];
        this.context.beginPath();
        this.context.arc(currentBubble.x, currentBubble.y, currentBubble.radius, 0, Math.PI * 2);
        this.context.fillStyle = 'transparent';
        this.context.fill();
        this.context.strokeStyle = currentBubble.itemColor;
        this.context.lineWidth = 5;
        this.context.stroke();
        this.context.closePath();
        this.context.beginPath();
        this.context.font = `bold ${currentBubble.labelSize}px Arial`;
        this.context.textAlign = 'center';
        this.context.fillStyle = 'white';
        this.context.fillText(currentBubble.instrumentName, currentBubble.x, currentBubble.y);
        this.context.closePath();
        this.context.beginPath();
        this.context.textAlign = 'center';
        this.context.fillStyle = currentBubble.itemColor;
        this.context.font = `bold ${currentBubble.labelSize * 0.7}px Arial`;
        this.context.fillText(`${currentBubble.side.toUpperCase() === DEAL_SIDE.BUY ? 'Buy' : 'Sell'} ${currentBubble.pips} pips`, currentBubble.x, currentBubble.y + currentBubble.radius * 0.3);
        this.context.closePath();
    });
};

BubblesCanvas.prototype.getCollisionPoint = function (currentBubble, bubbleItem) {
    return {
        x: currentBubble.x + (bubbleItem.x - currentBubble.x) * currentBubble.radius / (currentBubble.radius + bubbleItem.radius),
        y: currentBubble.y + (bubbleItem.y - currentBubble.y) * currentBubble.radius / (currentBubble.radius + bubbleItem.radius),
    };
};

BubblesCanvas.prototype.createBall = function (x, y, deal) {
    const fi = this.getRandomInt(1, 360) * Math.PI / 180;
    const v = 0.5;
    const radius = deal.size;
    const randomX = Math.cos(fi) * v;
    const randomY = Math.sin(fi) * v;
    const weight = Math.pow(radius, 3);
    const id = deal.dealId;
    const collisionList = [];
    if (x + randomX >= this.canvas.width - radius) {
        x -= radius;
    }
    if (x + randomX <= radius) {
        x += radius;
    }
    if (y + radius >= this.canvas.height - radius) {
        y -= radius;
    }
    if (y + randomY <= radius) {
        y += radius;
    }

    const obj = {
        radius,
        x,
        y,
        weight,
        id,
        dx: randomX,
        dy: randomY,
        collisionList,
        pips: deal.pips,
        labelSize: deal.labelSize,
        instrumentName: deal.instrumentName,
        side: deal.side,
        itemColor: deal.itemColor,
    };
    this.bubbleList.push(obj);
};

BubblesCanvas.prototype.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};

BubblesCanvas.prototype.calculateDistance = function (currentBubble, otherBubble) {
    return Math.sqrt(Math.pow(currentBubble.x - otherBubble.x, 2) + Math.pow(currentBubble.y - otherBubble.y, 2));
};

BubblesCanvas.prototype.getNewDirection = function (collisionPoint, currentBubble, otherBubble) {
    const staticWeight = 200;
    const collisionDistance = Math.sqrt(Math.pow(currentBubble.x - collisionPoint.x, 2) + Math.pow(currentBubble.y - collisionPoint.y, 2));
    const firstBasisVectorX = (collisionPoint.x - currentBubble.x) / collisionDistance;
    const firstBasisVectorY = (collisionPoint.y - currentBubble.y) / collisionDistance;
    const secondBasisVectorX = -firstBasisVectorY;
    const secondBasisVectorY = firstBasisVectorX;
    const velocityNormal = (currentBubble.dx * firstBasisVectorX + currentBubble.dy * firstBasisVectorY);
    const velocityTan = (currentBubble.dx * secondBasisVectorX + currentBubble.dy * secondBasisVectorY);
    const velocityNormalOtherBubble = (otherBubble.dx * firstBasisVectorX + otherBubble.dy * firstBasisVectorY);
    const velocityTanOtherBubble = (otherBubble.dx * secondBasisVectorX + otherBubble.dy * secondBasisVectorY);
    currentBubble.dx = velocityNormalOtherBubble * firstBasisVectorX + velocityTan * secondBasisVectorX;
    currentBubble.dy = velocityNormalOtherBubble * firstBasisVectorY + velocityTan * secondBasisVectorY;
    otherBubble.dx = velocityNormal * firstBasisVectorX + velocityTanOtherBubble * secondBasisVectorX;
    otherBubble.dy = velocityNormal * firstBasisVectorY + velocityTanOtherBubble * secondBasisVectorY;
};

BubblesCanvas.prototype.start = function () {
    this.draw();
};
