"use strict";
window.onbeforeunload = function (e) {
    e = e || window.event;
    // For IE and Firefox prior to version 4
    if (e) {
        e.returnValue = 'Are you sure you want to close? Your progress will be lost.';
    }
    return 'Are you sure you want to close? Your progress will be lost.';
};
class Game {
    static get PLAY_MODE() {
        return 'play';
    }
    static get BUILD_MODE() {
        return 'build';
    }
    static staticConstructor() {
        this.playMode = this.PLAY_MODE;
        this.refreshRateCounter = [];
        this.refreshRateHigher60 = false;
        this.refreshRate = null;
        this.refreshRates = [];
        this.currentRetryToGetFps = 0;
        this.maxRetriesToGetFps = 10;
        this.averageFps = null;
        this.percentOfFpsHigher70 = null;
    }
    static executeGameMode() {
        if (this.playMode === this.PLAY_MODE) {
            window.requestAnimationFrame(play);
        }
        else if (this.playMode === this.BUILD_MODE) {
            console.log("Error");
            //window.requestAnimationFrame(build);
        }
    }
    static startAnimating(fps) {
        this.fpsInterval = 1000 / fps;
        this.then = 0;
        this.startTime = this.then;
    }
    static updateFPSInterval(timestamp) {
        this.now = timestamp;
        this.elapsed = this.now - this.then;
        if (!this.refreshRate) {
            this.refreshRateCounter.unshift(this.now);
            const waitFrames = 15;
            if (this.refreshRateCounter.length === waitFrames) {
                var t0 = this.refreshRateCounter.pop();
                this.refreshRate = Math.floor(1000 * waitFrames / (this.now - t0));
                if (this.refreshRate > 70) {
                    this.refreshRateHigher60 = true;
                }
                this.refreshRateCounter = [];
                this.currentRetryToGetFps++;
                this.refreshRates.push(this.refreshRate);
                if (this.currentRetryToGetFps < this.maxRetriesToGetFps) {
                    this.refreshRate = null;
                }
                else {
                    this.averageFps = this.refreshRates.reduce((partialSum, a) => partialSum + a, 0) / this.refreshRates.length;
                    const refreshRateHigher70 = this.refreshRates.filter((refreshRate) => refreshRate > 70);
                    if (refreshRateHigher70.length > 0) {
                        this.percentOfFpsHigher70 = refreshRateHigher70.length / this.refreshRates.length * 100;
                        this.percentOfFpsHigher70 > 80 ? this.refreshRateHigher60 = true : this.refreshRateHigher60 = false;
                    }
                    else {
                        this.percentOfFpsHigher70 = 0;
                    }
                }
            }
        }
    }
    static resetFpsInterval() {
        this.then = this.now - (this.elapsed % this.fpsInterval);
    }
}
class Display {
    static staticConstructor(canvas, canvasWidth, canvasHeight) {
        this.ctx = canvas;
        //this.ctx.imageSmoothingEnabled = false;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }
    static drawLine(x, y, endX, endY, color = "000000", strokeWidth = 1, ctx = this.ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = '#' + color;
        ctx.stroke();
    }
    static drawRectangle(x, y, width, height, color = "000000", ctx = this.ctx) {
        ctx.beginPath();
        ctx.rect(Math.round(x), Math.round(y), width, height);
        ctx.fillStyle = "#" + color;
        ctx.fill();
        ctx.closePath();
    }
    static drawRectangleWithAlpha(x, y, width, height, color = "000000", ctx = this.ctx, alpha = 0) {
        this.ctx.globalAlpha = alpha;
        this.drawRectangle(x, y, width, height, color, ctx);
        this.ctx.globalAlpha = 1;
    }
    static drawRectangleBorder(x, y, width, height, color = "000000", lineWidth = 1, ctx = this.ctx) {
        ctx.beginPath();
        ctx.rect(Math.round(x), Math.round(y), width, height);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = "#" + color;
        ctx.stroke();
        ctx.closePath();
    }
    static drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh) {
        this.ctx.drawImage(img, Math.round(sx), Math.round(sy), sw, sh, dx, dy, dw, dh);
    }
    static drawImageWithRotation(img, sx, sy, sw, sh, dx, dy, dw, dh, radians = 0) {
        if (radians === 0) {
            this.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        }
        else {
            const halfImageWidth = dw / 2;
            const halfImageHeight = dh / 2;
            this.ctx.translate(dx + halfImageWidth, dy + halfImageHeight);
            this.ctx.rotate(radians);
            this.ctx.drawImage(img, Math.round(sx), Math.round(sy), sw, sh, -halfImageWidth, -halfImageHeight, dw, dh);
            this.ctx.rotate(-radians);
            this.ctx.translate(-dx - halfImageWidth, -dy - halfImageHeight);
        }
    }
    static drawImageWithAlpha(img, sx, sy, sw, sh, dx, dy, dw, dh, alpha) {
        this.ctx.globalAlpha = alpha;
        this.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        this.ctx.globalAlpha = 1;
    }
    static drawPixelArray(pixelArray, x, y, pixelArrayUnitSize, pixelArrayUnitAmount, ctx = this.ctx) {
        if (pixelArray) {
            for (var pixelArrayPosY = 0; pixelArrayPosY < pixelArrayUnitAmount; pixelArrayPosY++) {
                for (var pixelArrayPosX = 0; pixelArrayPosX < pixelArrayUnitAmount; pixelArrayPosX++) {
                    const color = pixelArray[pixelArrayPosY][pixelArrayPosX];
                    color !== 0 && color !== "transp" &&
                        this.drawRectangle(x + pixelArrayPosX * pixelArrayUnitSize, y + pixelArrayPosY * pixelArrayUnitSize, Math.round(pixelArrayUnitSize), Math.round(pixelArrayUnitSize), color, ctx);
                }
            }
        }
    }
    static drawGrid(width, height, distance, color = '383838', strokeWidth = 1, ctx = this.ctx) {
        for (var i = 0; i < width; i++) {
            this.drawLine(i * distance, 0, i * distance, height * distance, color, strokeWidth, ctx);
        }
        for (var j = 0; j < height; j++) {
            this.drawLine(0, j * distance, width * distance, j * distance, color, strokeWidth, ctx);
        }
    }
    static displayLoadingScreen(loadedAssets, soundsLength) {
        const loadingBarWidth = this.canvasWidth / 3;
        const loadingBarHeight = 20;
        const leftPos = this.canvasWidth / 2 - loadingBarWidth / 2;
        const topPos = this.canvasHeight / 2 - loadingBarHeight / 2;
        const progressPadding = 5;
        this.drawRectangleBorder(leftPos, topPos, loadingBarWidth, loadingBarHeight, WorldDataHandler.textColor);
        const progressWidth = (loadingBarWidth - progressPadding * 2) / soundsLength * loadedAssets;
        this.drawRectangle(leftPos + progressPadding, topPos + progressPadding, progressWidth, loadingBarHeight - progressPadding * 2, WorldDataHandler.textColor);
    }
    static displayStartScreen(currentGeneralFrame, maxFrames) {
        PlayMode.updateGeneralFrameCounter();
        const textColor = "#" + WorldDataHandler.textColor;
        this.displayText(WorldDataHandler.gamesName, this.canvasWidth / 2, this.canvasHeight / 2, 30, textColor);
        var moduloDivider = maxFrames / 3;
        if (currentGeneralFrame % moduloDivider < moduloDivider / 2) {
            this.displayText("Press enter to continue", this.canvasWidth / 2, this.canvasHeight / 2 + 40, 18, textColor);
        }
    }
    static measureText(text) {
        const measurements = this.ctx.measureText(text);
        return { width: measurements.width, height: measurements.height };
    }
    static displayEndingScreen(spriteCanvas, currentGeneralFrame, maxFrames) {
        PlayMode.updateGeneralFrameCounter();
        let totalCollectibles = 0;
        let collectedCollectibles = 0;
        WorldDataHandler.levels.forEach((level) => {
            level.levelObjects.forEach((levelObject) => {
                if (levelObject.type === ObjectTypes.COLLECTIBLE) {
                    totalCollectibles++;
                    if (levelObject.extraAttributes.collected) {
                        collectedCollectibles++;
                    }
                }
            });
        });
        const collectiblesExist = totalCollectibles > 0;
        const extraPadding = collectiblesExist ? 16 : 0;
        const textColor = "#" + WorldDataHandler.textColor;
        this.displayText(WorldDataHandler.endingMessage, this.canvasWidth / 2, this.canvasHeight / 2 - 36 - extraPadding, 30, textColor);
        let endTime = GameStatistics.getFinalTime() || "XX:XX:XX";
        let deathCounter = GameStatistics.deathCounter;
        let collectibleCollectedText = `- ${collectedCollectibles}/${totalCollectibles}`;
        this.displayText(`Time: ${endTime}`, this.canvasWidth / 2, this.canvasHeight / 2 + 4 - extraPadding, 18, textColor);
        this.displayText(`Deaths: ${deathCounter}`, this.canvasWidth / 2, this.canvasHeight / 2 + 34 - extraPadding, 18, textColor);
        if (collectiblesExist) {
            const spriteIndex = SpritePixelArrays.getIndexOfSprite(ObjectTypes.COLLECTIBLE);
            var { tileSize } = WorldDataHandler;
            if (tileSize == undefined)
                tileSize = NaN;
            const canvasYSpritePos = spriteIndex * tileSize;
            const collectibleCollectedTextLength = this.ctx.measureText(collectibleCollectedText).width;
            Display.drawImage(spriteCanvas, 0, canvasYSpritePos, tileSize, tileSize, this.canvasWidth / 2 - (collectibleCollectedTextLength / 2) - 15, this.canvasHeight / 2 + 54 - tileSize, tileSize, tileSize);
            this.displayText(collectibleCollectedText, this.canvasWidth / 2 + 15, this.canvasHeight / 2 + 48, 18, textColor);
        }
        var moduloDivider = maxFrames / 3;
        if (currentGeneralFrame % moduloDivider < moduloDivider / 2) {
            this.displayText("Press enter to restart", this.canvasWidth / 2, this.canvasHeight / 2 + 64 + extraPadding, 12, textColor);
        }
        if (Controller.enter && !PauseHandler.restartedGame) {
            PauseHandler.restartedGame = true;
            PauseHandler.currentRestartGameFrameCounter = PauseHandler.restartGameMaxFrames;
            SoundHandler.guiSelect.stopAndPlay();
        }
        PauseHandler.handleRestart();
    }
    static displayText(text = "", xPos, yPos, size = 30, color = "white", alignPos = "center") {
        this.ctx.font = size + "px DotGothic16";
        this.ctx.fillStyle = color;
        this.ctx.textAlign = alignPos;
        this.ctx.fillText(text, xPos, yPos);
    }
    static animateFade(currentFrame, totalFrames) {
        const percent = currentFrame / totalFrames * 100;
        const parcelAmount = 10;
        const parcelHeight = this.canvasHeight / parcelAmount;
        const widthParcelAmount = Math.ceil(this.canvasWidth / parcelHeight);
        if (Camera.viewport != undefined) {
            for (var i = 0; i <= widthParcelAmount; i++) {
                for (var j = 0; j <= parcelAmount; j++) {
                    const relativeWidth = parcelHeight / 100 * percent + 1;
                    this.drawRectangle(i * parcelHeight + ((parcelHeight - relativeWidth) / 2) + Camera.viewport.left, j * parcelHeight + ((parcelHeight - relativeWidth) / 2) + Camera.viewport.top, relativeWidth, relativeWidth);
                }
            }
        }
    }
}
class Camera {
    static staticConstructor(context, canvasWidth, canvasHeight, worldWidth, worldHeight) {
        this.follow = { x: 0, y: 0 };
        this.context = context;
        this.viewport = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            width: canvasWidth,
            halfWidth: canvasWidth / 2,
            height: canvasHeight,
            halfHeight: canvasHeight / 2,
            scale: [1.0, 1.0],
            worldWidth: worldWidth,
            worldHeight: worldHeight
        };
        this.moveTo(this.viewport.halfWidth, this.viewport.halfHeight);
        this.updateViewport();
    }
    static begin() {
        this.context.save();
        this.applyTranslation();
    }
    static end() {
        this.context.restore();
    }
    static applyTranslation() {
        //this.context.scale(2, 2)
        this.context.translate(-this.viewport.left, -this.viewport.top);
    }
    static updateViewport() {
        this.viewport.left = this.follow.x - this.viewport.halfWidth;
        this.viewport.top = this.follow.y - this.viewport.halfHeight;
    }
    static zoomTo(z) {
        this.canvasWidth = z;
        this.updateViewport();
    }
    static followObject(x, y) {
        let newFollowX;
        let newFollowY;
        let positionChanged = false;
        newFollowX = this.outOfBoundsXCorrection(x);
        newFollowY = this.outOfBoundsYCorrection(y);
        if (newFollowX && newFollowX !== this.follow.x) {
            this.follow.x = newFollowX;
            positionChanged = true;
        }
        if (newFollowY && newFollowY !== this.follow.y) {
            this.follow.y = newFollowY;
            positionChanged = true;
        }
        if (positionChanged) {
            this.updateViewport();
        }
    }
    static outOfBoundsXCorrection(x) {
        if (x <= this.viewport.halfWidth) {
            return Math.round(this.viewport.halfWidth);
        }
        else if (x >= this.viewport.worldWidth - this.viewport.halfWidth) {
            return Math.round(this.viewport.worldWidth - this.viewport.halfWidth);
        }
        else {
            return Math.round(x);
        }
    }
    static outOfBoundsYCorrection(y) {
        if (y <= this.viewport.halfHeight) {
            return Math.round(this.viewport.halfHeight);
        }
        else if (y >= this.viewport.worldHeight - this.viewport.halfHeight) {
            return Math.round(this.viewport.worldHeight - this.viewport.halfHeight);
        }
        else {
            return Math.round(y);
        }
    }
    static moveTo(x, y) {
        this.follow.x = this.outOfBoundsXCorrection(x);
        this.follow.y = this.outOfBoundsYCorrection(y);
        this.updateViewport();
    }
    static screenToWorld(x, y) {
        return { x: x - this.viewport.left, y: y - this.viewport.top };
    }
    static worldToScreen(x, y) {
        return { x: x + this.viewport.left, y: y + this.viewport.top };
    }
}
class AnimationHelper {
    static staticConstructor() {
        this.walkingFrameDuration = 7;
        this.defaultFrameDuration = 20;
        this.facingDirections = {
            top: "top",
            right: "right",
            bottom: "bottom",
            left: "left",
        };
        this.switchableBlockColors = {
            red: "red",
            blue: "blue",
        };
        this.alignments = {
            vertical: "vertical",
            horizontal: "horizontal",
            corner: "corner"
        };
        this.pathVariants = {
            singlePoint: "singlePoint",
            line: "line",
            enclosed: "enclosed",
        };
        this.possibleDirections = {
            forwards: "forwards",
            backwards: "backwards"
        };
    }
    static lightenDarkenColor(col, amt) {
        var usePound = false;
        if (col[0] == "#") {
            col = col.slice(1);
            usePound = true;
        }
        var num = parseInt(col, 16);
        var r = (num >> 16) + amt;
        if (r > 255)
            r = 255;
        else if (r < 0)
            r = 0;
        var b = ((num >> 8) & 0x00FF) + amt;
        if (b > 255)
            b = 255;
        else if (b < 0)
            b = 0;
        var g = (num & 0x0000FF) + amt;
        if (g > 255)
            g = 255;
        else if (g < 0)
            g = 0;
        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
    }
    static hexToRGB(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec("#" + hex);
        if (result != null) {
            return result = {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            };
        }
    }
    static setSquishValues(obj, squishWidth, squishHeight, squishFrames = 10, direction = this.facingDirections.bottom) {
        const squishAble = obj.type === "player" ? obj?.spriteObject?.squishAble
            : obj?.spriteObject?.[0]?.squishAble;
        if (squishAble) {
            let newSquishWidth = squishWidth;
            let newSquishHeight = squishHeight;
            if (direction === this.facingDirections.left ||
                direction === this.facingDirections.right) {
                newSquishWidth = squishHeight;
                newSquishHeight = squishWidth;
            }
            obj.squishWidth = newSquishWidth;
            obj.squishHeight = newSquishHeight;
            obj.squishWidthStep = (newSquishWidth - obj.drawWidth) / squishFrames;
            obj.squishHeightStep = (newSquishHeight - obj.drawHeight) / squishFrames;
        }
    }
    static checkSquishUpdate(obj) {
        if (obj.drawWidth !== obj.squishWidth) {
            obj.squishXOffset = (obj.drawWidth - obj.originalDrawWidth) / 2;
            obj.drawWidth += obj.squishWidthStep;
            if (obj.drawWidth >= obj.squishWidth && obj.squishWidthStep > 0 ||
                obj.drawWidth <= obj.squishWidth && obj.squishWidthStep < 0) {
                obj.drawWidth = obj.squishWidth;
                this.setSquishValues(obj, obj.originalDrawWidth, obj.originalDrawHeight);
            }
        }
        if (obj.drawHeight !== obj.squishHeight) {
            obj.drawHeight += obj.squishHeightStep;
            obj.squishYOffset = (obj.drawHeight - obj.originalDrawHeight);
            if (obj.drawHeight >= obj.squishHeight && obj.squishHeightStep > 0 ||
                obj.drawHeight <= obj.squishHeight && obj.squishHeightStep < 0) {
                obj.drawHeight = obj.squishHeight;
            }
        }
    }
    static setInitialSquishValues(obj) {
        obj.drawWidth = obj.tileSize;
        obj.drawHeight = obj.tileSize;
        obj.squishWidth = obj.tileSize;
        obj.squishHeight = obj.tileSize;
        obj.squishWidthStep = 0;
        obj.squishHeightStep = 0;
        obj.originalDrawWidth = obj.tileSize;
        obj.originalDrawHeight = obj.tileSize;
        obj.squishXOffset = 0;
        obj.squishYOffset = 0;
    }
}
class CustomSpriteHandler {
    static staticConstructor() {
        this.customSpriteSelector = document.getElementById('customSpriteSelector');
        this.indexToDelete = 0;
    }
    static addOptionToSelect(value, text) {
        let opt = document.createElement("option");
        opt.value = value;
        opt.innerHTML = text;
        this.customSpriteSelector.append(opt);
    }
    static populateSpriteSelectBox() {
        var i, L = this.customSpriteSelector?.options?.length - 1;
        for (i = L; i >= 0; i--) {
            this.customSpriteSelector.remove(i);
        }
        this.addOptionToSelect("tile", "Tile");
        this.addOptionToSelect(SpritePixelArrays.DISAPPEARING_BLOCK_SPRITE.name, SpritePixelArrays.DISAPPEARING_BLOCK_SPRITE.descriptiveName);
        this.addOptionToSelect(SpritePixelArrays.RED_BLOCK.name, SpritePixelArrays.RED_BLOCK.descriptiveName);
        this.addOptionToSelect(SpritePixelArrays.BLUE_BLOCK.name, SpritePixelArrays.BLUE_BLOCK.descriptiveName);
        const notCopyableSprites = [ObjectTypes.FINISH_FLAG_CLOSED, ObjectTypes.PORTAL2, ObjectTypes.PORTAL, ObjectTypes.PATH_POINT, ObjectTypes.COLLECTIBLE];
        const copyableObjects = SpritePixelArrays.allSprites.filter((sprite) => sprite.type === SpritePixelArrays.SPRITE_TYPES.object && !notCopyableSprites.includes(sprite.name)
            && !sprite.custom);
        copyableObjects.forEach((copyableObject) => {
            this.addOptionToSelect(copyableObject.name, copyableObject.descriptiveName);
        });
        this.addOptionToSelect("deco", "Deco");
    }
    /*
    static initializeModal() {
        ModalHandler.showModal('customSpriteModal');
        this.populateSpriteSelectBox();
    }
    */
    static getClonedObjectSprite(customSpriteName) {
        const spriteObject = SpritePixelArrays.getSpritesByName(customSpriteName)[0];
        const countExistingCustomSpritesOfThisType = SpritePixelArrays.getCustomSprites()?.filter((customSprite) => customSprite.name === customSpriteName)?.length;
        const clonedSprite = JSON.parse(JSON.stringify(spriteObject));
        clonedSprite.custom = true;
        clonedSprite.descriptiveName = `${spriteObject.descriptiveName} ${countExistingCustomSpritesOfThisType + 2}`;
        return clonedSprite;
    }
    /*
    static showDeleteModal(index) {
        this.indexToDelete = index;
        ModalHandler.showModal('deleteCustomSpriteConfirmation')
    }*/
    /*
    static deleteSpriteConfirmed() {
        this.removeCustomSprite(this.indexToDelete);
        ModalHandler.closeModal('deleteCustomSpriteConfirmation')
    }*/
    static getClonedDecoSprite() {
        const allDecoNumbers = SpritePixelArrays.getSpritesByType(SpritePixelArrays.SPRITE_TYPES.deko).map((deco) => {
            var r = /\d+/;
            return deco.descriptiveName.match(r);
        });
        const clonedSprite = JSON.parse(JSON.stringify(SpritePixelArrays.DEKO_SPRITE));
        clonedSprite.custom = true;
        clonedSprite.descriptiveName = `Deco ${Math.max(...allDecoNumbers) + 1}`;
        return clonedSprite;
    }
    static getClonedTileSprite() {
        const clonedSprite = JSON.parse(JSON.stringify(SpritePixelArrays.TILE_1));
        clonedSprite.custom = true;
        const customTiles = SpritePixelArrays.getSpritesByType(SpritePixelArrays.SPRITE_TYPES.tile).filter((tile) => tile.custom && tile.descriptiveName.includes("Custom tile"));
        const newTileValue = customTiles.length + 1;
        const highestGenericTileValue = 17;
        const newName = highestGenericTileValue + newTileValue;
        clonedSprite.name = newName;
        clonedSprite.descriptiveName = `Custom tile ${newTileValue}`;
        return clonedSprite;
    }
    /*
    static spriteAddedOrDeleted() {
        tileMapHandler.setTileTypes();
        spriteSheetCreator.createSpriteSheet();
        TabNavigation.redrawAfterAddedOrDeletedSprite();
        TabNavigation.drawSpritesByType();
        DrawSectionHandler.removeOptions();
        DrawSectionHandler.fillSelectBox();
    }*/
    static removeTile(levelHeight, levelWidth, tileMap, spriteName) {
        for (var tilePosY = 0; tilePosY < levelHeight; tilePosY++) {
            for (var tilePosX = 0; tilePosX < levelWidth; tilePosX++) {
                if (tileMap[tilePosY][tilePosX] === spriteName) {
                    tileMap[tilePosY][tilePosX] = 0;
                }
            }
        }
    }
    static removeByDescriptiveName(dataArray, spriteName) {
        for (var i = dataArray.length - 1; i >= 0; i--) {
            if (dataArray[i].spriteObject[0].descriptiveName === spriteName) {
                dataArray.splice(i, 1);
            }
        }
    }
    static resetYIndexOfLevelObjects() {
        tileMapHandler.levelObjects?.forEach((levelObject) => {
            if (levelObject?.customName && WorldDataHandler.tileSize != undefined) {
                levelObject.canvasYSpritePos = SpritePixelArrays.getIndexOfSprite(levelObject.customName, 0, "descriptiveName") *
                    WorldDataHandler.tileSize;
            }
        });
    }
    static resetYIndexOfDekoSprites(decoIndex) {
        WorldDataHandler.levels.forEach((level) => {
            for (var i = level.deko.length - 1; i >= 0; i--) {
                if (level.deko[i].index > decoIndex) {
                    level.deko[i].index -= 1;
                }
            }
        });
        tileMapHandler.deko = tileMapHandler.createInitialDeko(WorldDataHandler.levels[tileMapHandler.currentLevel].deko);
    }
    static removeSpritesFromWorldData(sprite) {
        if (!sprite?.name) {
            if (sprite.name === ObjectTypes.DEKO) {
                //deko
                this.removeByDescriptiveName(tileMapHandler.deko, sprite.descriptiveName);
                var r = /\d+/;
                const decoIndex = sprite.descriptiveName.match(r) - 1;
                WorldDataHandler.levels.forEach((level) => {
                    for (var i = level.deko.length - 1; i >= 0; i--) {
                        if (level.deko[i].index === decoIndex) {
                            level.deko.splice(i, 1);
                        }
                    }
                });
                this.resetYIndexOfDekoSprites(decoIndex);
            }
            else {
                if (tileMapHandler.levelObjects != undefined) {
                    //objects
                    for (var i = tileMapHandler.levelObjects.length - 1; i >= 0; i--) {
                        if (tileMapHandler.levelObjects[i]?.customName === sprite.descriptiveName) {
                            tileMapHandler.levelObjects.splice(i, 1);
                        }
                    }
                    WorldDataHandler.levels.forEach((level) => {
                        for (var i = level.levelObjects.length - 1; i >= 0; i--) {
                            if (level.levelObjects[i]?.extraAttributes?.customName === sprite.descriptiveName) {
                                level.levelObjects.splice(i, 1);
                            }
                        }
                    });
                    this.resetYIndexOfLevelObjects();
                }
            }
        }
        else {
            //tile
            this.removeTile(tileMapHandler.levelHeight, tileMapHandler.levelWidth, tileMapHandler.tileMap, sprite.name);
            WorldDataHandler.levels.forEach((level) => {
                const levelHeight = level.tileData.length;
                const levelWidth = level.tileData[0].length;
                this.removeTile(levelHeight, levelWidth, level.tileData, sprite.name);
            });
        }
    }
}
class Collision {
    static staticConstructor(tileMapHandler) {
        this.tileMapHandler = tileMapHandler;
    }
    static objectsColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width + obj2.hitBoxOffset &&
            obj1.x + obj1.width > obj2.x - obj2.hitBoxOffset &&
            obj1.y < obj2.y + obj2.height + obj2.hitBoxOffset &&
            obj1.y + obj1.height > obj2.y - obj2.hitBoxOffset;
    }
    static pointAndObjectColliding(point, obj) {
        return point.x < obj.x + obj.width &&
            point.x > obj.x &&
            point.y < obj.y + obj.height &&
            point.y > obj.y;
    }
}
class CharacterCollision {
    static staticConstructor(tileMapHandler) {
        this.tileMapHandler = tileMapHandler;
        this.passableTiles = [0, 5];
    }
    static checkHazardsCollision(obj) {
        this.tileMapHandler.levelObjects.forEach((levelObject) => {
            if (Collision.objectsColliding(obj, levelObject)) {
                levelObject.collisionEvent();
            }
        });
    }
    static checkCollisionsWithWorld(obj, cornerCorrection = false) {
        this.checkHazardsCollision(obj);
        this.groundUnderFeet(obj);
        this.checkTileCollisions(obj, cornerCorrection);
    }
    static checkPointCollissionsWithAllObjects(positions, obj) {
        return this.tileMapHandler.levelObjects.find((levelObject) => {
            if (obj.unpassableObjects.includes(levelObject.type) && levelObject.key !== obj.key) {
                return positions.find((position) => {
                    return Collision.pointAndObjectColliding(position, levelObject);
                });
            }
        });
    }
    static checkMovementBasedObjectCollission(obj) {
        if (obj?.unpassableObjects) {
            if (obj.yspeed > 0) {
                const collidedWithObject = this.checkPointCollissionsWithAllObjects([obj.bottom_left_pos, obj.bottom_right_pos], obj);
                if (collidedWithObject) {
                    obj.y = collidedWithObject.y - (obj.height);
                    obj.hitUnpassableObject(AnimationHelper.facingDirections?.bottom, collidedWithObject);
                }
            }
            else if (obj.yspeed < 0) {
                const collidedWithObject = this.checkPointCollissionsWithAllObjects([obj.top_left_pos, obj.top_right_pos], obj);
                if (collidedWithObject) {
                    obj.y = collidedWithObject.y + (obj.height);
                    obj.hitUnpassableObject(AnimationHelper.facingDirections?.top, collidedWithObject);
                }
            }
            if (obj.xspeed < 0) {
                const collidedWithObject = this.checkPointCollissionsWithAllObjects([obj.bottom_left_pos, obj.top_left_pos], obj);
                if (collidedWithObject) {
                    obj.x = collidedWithObject.x + (obj.width);
                    obj.hitUnpassableObject(AnimationHelper.facingDirections?.left, collidedWithObject);
                }
            }
            else if (obj.xspeed > 0) {
                const collidedWithObject = this.checkPointCollissionsWithAllObjects([obj.top_right_pos, obj.bottom_right_pos], obj);
                if (collidedWithObject) {
                    obj.x = collidedWithObject.x - (obj.width);
                    obj.hitUnpassableObject(AnimationHelper.facingDirections?.right, collidedWithObject);
                }
            }
        }
    }
    static checkTileCollisions(obj, cornerCorrection = false) {
        obj.y += obj.yspeed;
        this.getEdges(obj);
        // collision to the bottom
        if (obj.yspeed > 0) {
            if ((obj.bottom_right !== 0)
                || (obj.bottom_left !== 0)) {
                // not a cloud...
                if (obj.bottom_right !== 5 &&
                    obj.bottom_left !== 5) {
                    obj.y = obj.bottom * tileMapHandler.tileSize - (obj.height + 1);
                    obj.hitWall(AnimationHelper.facingDirections?.bottom);
                }
                else {
                    //cloud
                    if (obj.prev_bottom < obj.bottom) {
                        obj.y = obj.bottom * tileMapHandler.tileSize - (obj.height + 1);
                        obj.hitWall(AnimationHelper.facingDirections?.bottom);
                    }
                }
            }
        }
        // collision to the top
        else if (obj.yspeed < 0) {
            if (!this.passableTiles.includes(obj.top_right)
                || !this.passableTiles.includes(obj.top_left)) {
                cornerCorrection ? this.checkTopCornerCorrection(obj) : this.correctTopPosition(obj);
            }
        }
        obj.x += obj.xspeed;
        this.getEdges(obj);
        // collision to the left
        if (obj.xspeed < 0) {
            if (!this.passableTiles.includes(obj.top_left)
                || !this.passableTiles.includes(obj.bottom_left)) {
                obj.x = (obj.left + 1) * tileMapHandler.tileSize;
                obj.hitWall(AnimationHelper.facingDirections?.left);
            }
        }
        // collision to the right
        else if (obj.xspeed > 0) {
            if (!this.passableTiles.includes(obj.top_right)
                || !this.passableTiles.includes(obj.bottom_right)) {
                obj.x = obj.right * tileMapHandler.tileSize - (obj.width + 1);
                obj.hitWall(AnimationHelper.facingDirections?.right);
            }
        }
        obj.prev_bottom = obj.bottom;
    }
    static correctTopPosition(obj) {
        obj.y = obj.bottom * tileMapHandler.tileSize + 1;
        obj.hitWall(AnimationHelper.facingDirections?.top);
    }
    static checkTopCornerCorrection(obj) {
        const offset = Math.floor(this.tileMapHandler.tileSize / 4);
        const topY = obj.top_right_pos.y - Math.floor(this.tileMapHandler.tileSize / 2);
        const rightX = obj.top_right_pos.x - offset;
        const leftX = obj.top_left_pos.x + offset;
        const rightTileVaue = tileMapHandler.getTileValueForPosition(rightX);
        const leftTileVaue = tileMapHandler.getTileValueForPosition(leftX);
        const topValue = tileMapHandler.getTileValueForPosition(topY);
        const topRightTileValue = tileMapHandler.getTileLayerValueByIndex(topValue, rightTileVaue);
        const topLeftTileValue = tileMapHandler.getTileLayerValueByIndex(topValue, leftTileVaue);
        const touchingSwitch = [obj.top_left, obj.top_right].includes(ObjectTypes.SPECIAL_BLOCK_VALUES.redBlueSwitch);
        if (!touchingSwitch && this.passableTiles.includes(topRightTileValue) && this.passableTiles.includes(obj.top_left)) {
            obj.x = rightTileVaue * this.tileMapHandler.tileSize;
        }
        else if (!touchingSwitch && this.passableTiles.includes(topLeftTileValue) && this.passableTiles.includes(obj.top_right)) {
            obj.x = leftTileVaue * this.tileMapHandler.tileSize + 1;
        }
        else {
            this.correctTopPosition(obj);
        }
    }
    static groundUnderFeet(obj) {
        const left_foot_x = this.tileMapHandler.getTileValueForPosition(obj.x);
        const right_foot_x = this.tileMapHandler.getTileValueForPosition(obj.x + obj.width);
        const foot_y = this.tileMapHandler.getTileValueForPosition(obj.y + (obj.height + 1));
        const left_foot = this.tileMapHandler.tileMap[foot_y][left_foot_x];
        const right_foot = this.tileMapHandler.tileMap[foot_y][right_foot_x];
        const current_tile = left_foot !== 0 ? left_foot : right_foot;
        switch (current_tile) {
            case 0:
                obj.speed = obj.swimming ? obj.air_acceleration / 2 : obj.air_acceleration;
                obj.currentMaxSpeed = obj.maxSpeed;
                obj.friction = obj.air_friction;
                if (!Controller.jump || obj.jumpframes >= obj.maxJumpFrames || obj.jumpPressedToTheMax || PauseHandler.justClosedPauseScreen) {
                    obj.falling = true;
                }
                break;
            case 5:
                if (obj.yspeed < 0 &&
                    (!Controller.jump || obj.jumpframes >= obj.maxJumpFrames || obj.jumpPressedToTheMax)) {
                    obj.falling = true;
                }
                //if speed is 0, but player is somewhere in the middle of the 5 tile, not exactly on top
                if (obj.yspeed === 0 && (obj.y + obj.height + 1) % this.tileMapHandler.tileSize !== 0) {
                    obj.falling = true;
                }
                break;
            default:
                obj.speed = obj.swimming ? obj.groundAcceleration / 2 : obj.groundAcceleration;
                obj.currentMaxSpeed = obj.swimming ? obj.maxSpeed / 2 : obj.maxSpeed;
                obj.friction = obj.groundFriction;
                break;
        }
    }
    static getEdges(obj) {
        const hitBoxOffset = obj?.hitBoxOffset || 0;
        //Pixel values
        const rightX = obj.x + obj.width + hitBoxOffset;
        const leftX = obj.x - hitBoxOffset;
        const bottomY = obj.y + obj.height + hitBoxOffset;
        const topY = obj.y - hitBoxOffset;
        obj.top_right_pos = { x: rightX, y: topY };
        obj.top_left_pos = { x: leftX, y: topY };
        obj.bottom_right_pos = { x: rightX, y: bottomY };
        obj.bottom_left_pos = { x: leftX, y: bottomY };
        //Tile values
        obj.right = tileMapHandler.getTileValueForPosition(rightX);
        obj.left = tileMapHandler.getTileValueForPosition(leftX);
        obj.bottom = tileMapHandler.getTileValueForPosition(bottomY);
        obj.top = tileMapHandler.getTileValueForPosition(topY);
        obj.top_right = tileMapHandler.getTileLayerValueByIndex(obj.top, obj.right);
        obj.top_left = tileMapHandler.getTileLayerValueByIndex(obj.top, obj.left);
        obj.bottom_right = tileMapHandler.getTileLayerValueByIndex(obj.bottom, obj.right);
        obj.bottom_left = tileMapHandler.getTileLayerValueByIndex(obj.bottom, obj.left);
        obj?.wallJumpChecked && obj.checkWallJumpReady();
    }
}
class WorldDataHandler {
    static _staticConstructor() {
        this.initialPlayerPosition = { x: 2, y: 10 };
        this.levels = [this.createEmptyLevel(), this.exampleLevel(), this.createEmptyLevel()];
        this.tileSize = 24;
        this.gamesName = "Example name";
        this.endingMessage = "Thx for playing!";
        this.backgroundColor = '000000';
        this.textColor = 'ffffff';
        this.effects = [];
    }
    static createEmptyLevel() {
        const tileData = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
        return {
            tileData: tileData,
            levelObjects: [],
            deko: [],
            paths: [],
        };
    }
    static exampleLevel() {
        let exampleLevelTileData = this.createEmptyLevel().tileData;
        for (var i = 0; i < 6; i++) {
            exampleLevelTileData[11][i] = 2;
        }
        for (var i = exampleLevelTileData[0].length - 1; i > exampleLevelTileData[0].length - 7; i--) {
            exampleLevelTileData[6][i] = 2;
        }
        const levelObjects = [
            { ...this.initialPlayerPosition, type: ObjectTypes.START_FLAG },
            { x: exampleLevelTileData[0].length - 3, y: 5, type: ObjectTypes.FINISH_FLAG }
        ];
        return {
            tileData: exampleLevelTileData,
            levelObjects: levelObjects,
            deko: [],
            paths: [],
        };
    }
    static calucalteCanvasSize() {
        return {
            width: this.levels[0].tileData[0].length * this.tileSize,
            height: this.levels[0].tileData.length * this.tileSize,
        };
    }
}
class TileMapHandler {
    constructor(tileSize, startingLevel, spriteCanvas, player) {
        this.setTileTypes();
        this.tileSize = tileSize;
        this.pixelArrayUnitAmount = 8;
        this.pixelArrayUnitSize = tileSize / this.pixelArrayUnitAmount;
        this.player = player;
        this.effects = [];
        this.currentLevel = startingLevel;
        this.resetLevel(startingLevel);
        this.spriteCanvas = spriteCanvas;
        this.currentGeneralFrameCounter = 0;
        this.generalFrameCounterMax = 480;
    }
    setTileTypes() {
        this.TILE_TYPES = {};
        SpritePixelArrays.allTileSprites().forEach(sprite => {
            this.TILE_TYPES[sprite.name] = SpritePixelArrays.getIndexOfSprite(sprite.name);
        });
    }
    resetLevel(levelIndex) {
        SFXHandler.resetSfx();
        this.tileMap = WorldDataHandler.levels[levelIndex].tileData;
        this.updateLevelDimensions();
        this.setInitialPlayerAndCameraPos(levelIndex);
        this.levelObjects = [];
        this.levelObjects = this.createInitialObjects(WorldDataHandler.levels[levelIndex].levelObjects);
        this.deko = this.createInitialDeko(WorldDataHandler.levels[levelIndex].deko);
        this.paths = this.createInitialPaths(WorldDataHandler.levels[levelIndex].paths);
        this.effects = EffectsHandler.getCurrentLevelEffects(this.currentLevel);
        this.currentGeneralFrameCounter = 0;
        this.player.resetAll();
    }
    setInitialPlayerAndCameraPos(levelIndex) {
        //This is a fallback, in case no flag was set in a level (start, ending, or if user forgot to set it)
        let initialPlayerValue = { x: 0, y: 0 };
        WorldDataHandler.levels[levelIndex].levelObjects.forEach((levelObject) => {
            if (levelObject.type === ObjectTypes.START_FLAG) {
                initialPlayerValue.x = levelObject.x * this.tileSize;
                initialPlayerValue.y = levelObject.y * this.tileSize;
            }
        });
        this.player.initialY = initialPlayerValue.x;
        this.player.initialX = initialPlayerValue.y;
        Camera.moveTo(initialPlayerValue.x, initialPlayerValue.y);
    }
    updateLevelDimensions() {
        this.levelWidth = this.getLevelWidth();
        this.levelHeight = this.getLevelHeight();
        if (Camera.viewport) {
            Camera.viewport.worldWidth = this.levelWidth * this.tileSize;
            Camera.viewport.worldHeight = this.levelHeight * this.tileSize;
        }
    }
    createInitialPaths(initialPaths) {
        var paths = [];
        initialPaths && initialPaths.forEach((initialPath) => {
            const { speed, stopFrames, movementDirection, pathVariant } = initialPath;
            let newPath = new Path(this, speed, stopFrames, movementDirection);
            newPath.pathVariant = pathVariant;
            newPath.pathPoints = initialPath.pathPoints.map((pathPoint) => new PathPoint(pathPoint.initialX, pathPoint.initialY, this.tileSize, pathPoint.alignment));
            newPath.checkObjectsOnPath();
            newPath.rearrangePathPoints();
            paths.push(newPath);
        });
        return paths;
    }
    createInitialObjects(initialObjects) {
        var levelObjects = [];
        initialObjects && initialObjects.forEach((initialObject) => {
            const { type, x, y } = initialObject;
            const extraAttributes = initialObject.extraAttributes ? initialObject.extraAttributes : {};
            var Type = ObjectTypes.objectToClass[type];
            levelObjects.push(new Type(x, y, this.tileSize, type, this, extraAttributes));
        });
        return levelObjects;
    }
    createInitialDeko(initialDekos) {
        var dekos = [];
        initialDekos && initialDekos.forEach((initialDeko) => {
            const { x, y, index } = initialDeko;
            dekos.push(new Deko(x, y, this.tileSize, index));
        });
        return dekos;
    }
    drawGrid() {
        Display.drawGrid(this.levelWidth, this.levelHeight, this.tileSize);
    }
    displayTiles() {
        for (var tilePosY = 0; tilePosY < this.levelHeight; tilePosY++) {
            for (var tilePosX = 0; tilePosX < this.levelWidth; tilePosX++) {
                var tileType = this.tileMap[tilePosY][tilePosX];
                if (this.checkIfPositionAtTheEdge(tilePosX, tilePosY)) {
                    tileType = "edge";
                    if (this.checkIfStartOrEndingLevel()) {
                        tileType = 0;
                    }
                }
                if (tileType !== 0) {
                    Display.drawImage(this.spriteCanvas, 0, this.TILE_TYPES[tileType] * this.tileSize, this.tileSize, this.tileSize, tilePosX * this.tileSize, tilePosY * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
    }
    displayObjects(arr) {
        if (arr) {
            for (var i = arr.length - 1; i >= 0; i--) {
                arr[i]?.draw(this.spriteCanvas);
            }
        }
    }
    displayObjectsOrDeko(arr) {
        if (arr) {
            for (var i = arr.length - 1; i >= 0; i--) {
                arr[i].draw(this.spriteCanvas);
            }
        }
    }
    displayLevel() {
        const isPlayMode = Game.playMode === Game.PLAY_MODE;
        if (isPlayMode) {
            if (PauseHandler.paused) {
                return;
            }
        }
        const [backgroundObjects, foregroundObjects] = TilemapHelpers.splitArrayIn2(this.levelObjects, (e) => SpritePixelArrays.backgroundSprites.includes(e.type));
        this.displayObjectsOrDeko(this.deko);
        isPlayMode && this.effects.length && EffectsRenderer.displayEffects();
        this.displayObjects(backgroundObjects);
        this.displayObjectsOrDeko(this.paths);
        this.displayObjects(foregroundObjects);
        this.displayTiles();
    }
    switchToNextLevel() {
        const nextLevel = PlayMode.customExit?.levelIndex || this.currentLevel + 1;
        const levelAmounth = WorldDataHandler.levels.length;
        if (this.currentLevel < levelAmounth - 1) {
            this.currentLevel = nextLevel;
            if (this.currentLevel === levelAmounth - 1) {
                GameStatistics.stopTimer();
            }
            this.resetLevel(this.currentLevel);
            /*
            if (typeof LevelNavigationHandler === 'function') {
                LevelNavigationHandler.updateLevel();
            }*/
        }
        else {
            console.log("error");
        }
    }
    resetDynamicObjects() {
        for (var i = this.levelObjects.length; i >= 0; i--) {
            const laserObject = this.levelObjects[i]?.type === ObjectTypes.LASER;
            if (this.levelObjects[i]?.type === ObjectTypes.CANON_BALL || this.levelObjects[i]?.type === ObjectTypes.ROCKET || laserObject) {
                !laserObject && SFXHandler.createSFX(this.levelObjects[i].x, this.levelObjects[i].y, 1);
                this.levelObjects.splice(i, 1);
            }
            if (this.levelObjects[i]?.resetObject) {
                this.levelObjects[i].resetObject();
            }
        }
        this.paths.forEach((path) => path.resetObjectsToInitialPosition());
        //Check here if tilemaphandler is missing objects from WorldDataHandler (if somethign was deleted)
    }
    filterObjectsByTypes(types) {
        return this.levelObjects.filter((levelObject) => types.includes(levelObject.type));
    }
    getLevelHeight() {
        return this.tileMap.length;
    }
    getLevelWidth() {
        return this.tileMap[0].length;
    }
    getTileValueForPosition(pos) {
        return Math.floor(pos / this.tileSize);
    }
    getTileLayerValueByIndex(y, x) {
        return this.tileMap[y]?.[x];
    }
    checkIfPositionAtTheEdge(tilePosX, tilePosY) {
        return tilePosX === 0 || tilePosY === 0 || tilePosX === this.levelWidth - 1 || tilePosY === this.levelHeight - 1;
    }
    checkIfStartOrEndingLevel() {
        return this.currentLevel === 0 || this.currentLevel === WorldDataHandler.levels.length - 1;
    }
}
class Controller {
    static staticConstructor() {
        this.down = false;
        this.left = false;
        this.right = false;
        this.up = false;
        this.jump = false;
        this.jumpReleased = true;
        this.confirm = false;
        this.ctrlPressed = false;
        this.alternativeActionButton = false;
        this.alternativeActionButtonReleased = true;
        this.enter = false;
        this.enterReleased = true;
        this.pause = false;
        this.pauseReleased = true;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseXInDrawCanvas = 0;
        this.mouseYInDrawCanvas = 0;
        this.mousePressed = false;
        this.rightMousePressed = false;
        this.mouseInsideMainCanvas = false;
        this.mouseInsideDrawCanvas = false;
        this.xScroll = 0;
        this.yScroll = 0;
        this.gamepadIndex = null;
        window.addEventListener('gamepadconnected', (event) => {
            this.gamepadIndex = event.gamepad.index;
        });
        window.addEventListener('gamepaddisconnected', (event) => {
            this.gamepadIndex = null;
        });
        document.addEventListener("keyup", (e) => { this.keyUp(e); });
        document.addEventListener("keydown", (e) => { this.keyDown(e); });
        this.addMobileControls();
    }
    static getMobileControlsPositions() {
        const rect = this.mobileArrows.getBoundingClientRect();
        this.mobileControlsLeftPos = rect.left;
        this.mobileControlsTopPos = rect.top;
        this.mobileControlsWidth = 110;
        this.mobileControlsHeight = this.mobileArrows.height;
    }
    static handleMobileArrowInput(e) {
        e.preventDefault();
        if ((e.touches[0].clientX < this.mobileControlsLeftPos + (this.mobileControlsWidth / 2))
            || (e.touches[1] && e.touches[1].clientX < this.mobileControlsLeftPos + (this.mobileControlsWidth / 2))) {
            this.left = true;
            this.up = false;
            this.down = true;
            this.right = false;
        }
        if ((e.touches[0].clientX > this.mobileControlsLeftPos + (this.mobileControlsWidth / 2) && e.touches[0].clientX < this.mobileControlsWidth + 20)
            || (e.touches[1] && e.touches[1].clientX > this.mobileControlsLeftPos + (this.mobileControlsWidth / 2) && e.touches[1].clientX < this.mobileControlsWidth + 20)) {
            this.right = true;
            this.up = true;
            this.down = false;
            this.left = false;
        }
    }
    static handleMobileArrowTouchEnd(e) {
        e.preventDefault();
        this.left = false;
        this.right = false;
    }
    static addMobileControls() {
        if (!undefined) {
            this.mobileArrows = document.getElementById("mobileArrows");
            this.getMobileControlsPositions();
            window.addEventListener("resize", () => {
                this.getMobileControlsPositions();
            });
            window.addEventListener('orientationchange', () => {
                this.getMobileControlsPositions();
            });
            this.mobileArrows.addEventListener("touchstart", (e) => {
                this.handleMobileArrowInput(e);
            });
            this.mobileArrows.addEventListener("touchmove", (e) => {
                this.handleMobileArrowInput(e);
            });
            this.mobileArrows.addEventListener("touchend", (e) => {
                this.handleMobileArrowTouchEnd(e);
            });
            [{ elementName: "selectMobileControls", variableNames: ["pause"] },
                { elementName: "startMobileControls", variableNames: ["enter"] },
                { elementName: "jumpMobileControls", variableNames: ["jump", "confirm"] },
                { elementName: "alternativeMobileControls", variableNames: ["alternativeActionButton"] },
            ].forEach(control => {
                const element = document.getElementById(control.elementName);
                element?.addEventListener("touchstart", (e) => {
                    e.preventDefault();
                    if (control.variableNames.includes("enter")) {
                        this.mobileEnter = true;
                    }
                    control.variableNames.forEach((variable) => this.this_array[variable] = true);
                });
                element?.addEventListener("touchend", (e) => {
                    e.preventDefault();
                    if (control.variableNames.includes("enter")) {
                        this.enterReleased = true;
                    }
                    control.variableNames.forEach(variable => this.this_array[variable] = false);
                });
                element?.addEventListener("touchcancel", (e) => {
                    e.preventDefault();
                    this.this_array[control.variableNames.toString()] = false;
                });
            });
        }
    }
    static handleGamepadInput() {
        if (this.gamepadIndex !== null) {
            const DEADZONE = 0.5;
            const myGamepad = navigator.getGamepads()[this.gamepadIndex];
            if (myGamepad?.buttons) {
                const primaryButtonPressed = myGamepad.buttons[0].pressed;
                this.jump = primaryButtonPressed;
                this.confirm = primaryButtonPressed;
                this.alternativeActionButton = myGamepad.buttons[1].pressed || myGamepad.buttons[2].pressed;
                const enterAndPause = myGamepad.buttons[9].pressed || myGamepad.buttons[8].pressed;
                this.enter = enterAndPause;
                this.pause = enterAndPause;
                const v = this.getControllerAxesCorrectedValue(myGamepad.axes[0], DEADZONE);
                this.left = v < DEADZONE * -1 || myGamepad.buttons[14].pressed;
                this.right = v > DEADZONE || myGamepad.buttons[15].pressed;
                const h = this.getControllerAxesCorrectedValue(myGamepad.axes[1], DEADZONE);
                this.up = h < DEADZONE * -1 || myGamepad.buttons[12].pressed;
                this.down = h > DEADZONE || myGamepad.buttons[13].pressed;
            }
        }
    }
    static getControllerAxesCorrectedValue(value, DEADZONE) {
        let v = value;
        if (Math.abs(v) < DEADZONE) {
            v = 0;
        }
        else {
            v = v - Math.sign(v) * DEADZONE;
            v /= (1.0 - DEADZONE);
        }
        return v;
    }
    /*
       Checks key presses by code and sets the according variable to true or false.
       That way, the function can be reused for key-down and up
    */
    static handleKeyPresses(pressed, e) {
        const key = e.key;
        switch (key) {
            case "Enter":
                this.enter = pressed;
                break;
            case "Right":
            case "ArrowRight":
                this.right = pressed;
                e.preventDefault();
                break;
            case "d":
                this.right = pressed;
                break;
            case "Left":
            case "ArrowLeft":
                this.left = pressed;
                e.preventDefault();
                break;
            case "a":
                this.left = pressed;
                break;
            case "Up":
            case "ArrowUp":
            case "w":
                this.up = pressed;
                this.jump = pressed;
                break;
            case "c":
            case "j":
                this.jump = pressed;
                this.confirm = pressed;
                break;
            case "x":
            case "k":
                this.alternativeActionButton = pressed;
                break;
            case "Down":
            case "ArrowDown":
                this.down = pressed;
                break;
            case "Control":
                this.ctrlPressed = pressed;
                break;
            case "Escape":
            case "p": this.pause = pressed;
        }
    }
    static keyDown(e) {
        this.handleKeyPresses(true, e);
    }
    ;
    static keyUp(e) {
        this.handleKeyPresses(false, e);
    }
    static mouseLeave() {
        this.mouseInsideMainCanvas = false;
    }
    static mouseEnter() {
        this.mouseInsideMainCanvas = true;
    }
    static mouseLeaveDrawCanvas() {
        this.mouseInsideDrawCanvas = false;
    }
    static mouseEnterDrawCanvas() {
        this.mouseInsideDrawCanvas = true;
    }
    static mouseMove(e) {
        const coordinatesWithoutTranslation = Camera.worldToScreen(e.clientX, e.clientY);
        this.mouseX = coordinatesWithoutTranslation.x - canvasOffsetLeft + this.xScroll;
        this.mouseY = coordinatesWithoutTranslation.y - canvasOffsetTop + this.yScroll;
    }
    static mouseMoveDrawInCanvas(e) {
        this.mouseXInDrawCanvas = e.clientX;
        this.mouseYInDrawCanvas = e.clientY;
    }
    static mouseDown(evt) {
        switch (evt.which) {
            case 1:
                this.mousePressed = true;
                break;
            case 3:
                this.rightMousePressed = true;
                break;
            default:
                console.log('You have a strange Mouse!');
        }
    }
    static mouseUp() {
        this.mousePressed = false;
        this.rightMousePressed = false;
    }
    static onResize() {
        var myCanvas = document.getElementById("myCanvas");
        if (myCanvas != undefined) {
            canvasOffsetLeft = myCanvas.offsetLeft;
            canvasOffsetTop = myCanvas.offsetTop;
        }
    }
}
class Player {
    constructor(initialX, initialY, tileSize) {
        this.this_array = {};
        this.tileSize = tileSize;
        this.width = this.tileSize - 2;
        /*
            height minus some pixels, because chracter is 1 pixel above ground,
            and so that he can squeeze between tile exactly above head
        */
        this.height = this.tileSize - 3;
        this.initialX = initialX * this.tileSize;
        this.initialY = initialY * this.tileSize;
        this.wallJumpDirection = 1;
        this.dashDirection = AnimationHelper.facingDirections?.left;
        this.maxJumpFrames = 18;
        this.dashCooldown = 3;
        this.maxDashFrames = 10 + this.dashCooldown;
        this.coyoteDashFrames = 6;
        this.currentCoyoteDashFrame = this.coyoteDashFrames;
        this.maxFallSpeed = this.tileSize / 1.5;
        this.coyoteJumpFrames = 6;
        this.extraTrampolineJumpFrames = Math.round(this.maxJumpFrames / 6);
        this.pushToSideWhileWallJumpingFrames = this.maxJumpFrames / 2 - 4;
        this.jumpSpeed = 0.44;
        this.maxSpeed = 3.2;
        this.groundFriction = 0.65;
        this.air_friction = 0.75;
        this.groundAcceleration = 0.8;
        this.air_acceleration = this.groundAcceleration;
        this.gravity = 0.5;
        this.wallJumpGravity = this.gravity * 2;
        this.adjustSwimAttributes(this.maxJumpFrames, this.jumpSpeed);
        this.maxWaterFallSpeed = 2.25;
        this.spriteCanvas = spriteCanvas;
        this.type = "player";
        this.radians = 0;
        this.setBorderPositions();
        this.setAnimationProperties();
        this.setAbilities();
        this.resetAll();
        this.resetTemporaryAttributes();
    }
    adjustSwimAttributes(maxJumpFrames, jumpSpeed) {
        const onePerfectOfMaxJumpHeight = -(maxJumpFrames - 1) * jumpSpeed / 100;
        this.maxSwimHeight = onePerfectOfMaxJumpHeight * 90;
        this.flapHeight = onePerfectOfMaxJumpHeight * 60 * -1;
    }
    setBorderPositions() {
        this.right;
        this.left;
        this.bottom;
        this.top;
        this.top_right_pos;
        this.top_left_pos;
        this.bottom_right_pos;
        this.bottom_left_pos;
        this.top_right;
        this.top_left;
        this.bottom_left;
        this.bottom_right;
        this.prev_bottom;
        this.wallJumpLeft;
        this.wallJumpRight;
    }
    resetPosition(checkCheckpoints = false) {
        if (checkCheckpoints) {
            const activeCheckPointPos = PlayMode.checkActiveCheckPoints();
            this.x = activeCheckPointPos ? activeCheckPointPos.x : this.initialX;
            this.y = activeCheckPointPos ? activeCheckPointPos.y : this.initialY;
        }
        else {
            this.x = this.initialX;
            this.y = this.initialY;
        }
    }
    resetAttributes(resetAutoRun = true) {
        this.speed = 0;
        this.xspeed = 0;
        this.yspeed = 0;
        this.wallJumpFrames = this.maxJumpFrames;
        this.falling = false;
        this.jumping = false;
        this.jumpPressedToTheMax = false;
        this.wallJumping = false;
        this.dashing = false;
        this.forcedJumpSpeed = 0;
        this.currentDashFrame = 0;
        this.currentWallJumpCoyoteFrame = 0;
        this.walljumpReady = false;
        this.swimming = false;
        this.friction = this.air_friction;
        this.collidingWithNpcId = false;
        this.previousFrameSwimming = false;
        this.invisible = false;
        this.fixedSpeed = false;
        this.temporaryDoubleJump = false;
        if (resetAutoRun) {
            this.fixedSpeedLeft = false;
            this.fixedSpeedRight = false;
        }
        this.resetJump();
        this.resetDoubleJump();
    }
    resetTemporaryAttributes() {
        this.currentGravity = this.gravity;
        this.currentMaxFallSpeed = this.maxFallSpeed;
        this.currentWallJumpGravity = this.wallJumpGravity;
        if (this.swimming) {
            //if only the side of player is in water, we set this attribute. so next frame, we can reset coyote jump
            if (!this.bottom_left_pos_in_water && !this.top_left_pos_in_water &&
                this.top_right_pos_in_water && this.bottom_right_pos_in_water ||
                !this.top_right_pos_in_water && !this.bottom_right_pos_in_water &&
                    this.top_left_pos_in_water && this.bottom_left_pos_in_water) {
                this.previousFrameSwimming = true;
            }
            this.swimming = false;
        }
        else if (this.previousFrameSwimming) {
            this.previousFrameSwimming = false;
            if (this.falling && this.forcedJumpSpeed === 0) {
                this.hitBottom();
            }
        }
        this.top_right_pos_in_water = false;
        this.top_left_pos_in_water = false;
        this.bottom_right_pos_in_water = false;
        this.bottom_left_pos_in_water = false;
    }
    resetAll() {
        this.resetAttributes();
        this.resetPosition();
        this.resetAnimationAttributes();
        this.resetTemporaryAttributes();
    }
    setAbilities() {
        this.jumpChecked = true;
        this.wallJumpChecked = true;
        this.doubleJumpChecked = false;
        this.dashChecked = false;
        this.runChecked = false;
    }
    setAnimationProperties() {
        this.facingDirection = AnimationHelper.facingDirections?.right;
        this.spriteIndexIdle = SpritePixelArrays.getIndexOfSprite(ObjectTypes.PLAYER_IDLE);
        this.spriteIndexJump = SpritePixelArrays.getIndexOfSprite(ObjectTypes.PLAYER_JUMP);
        this.spriteIndexWalk = SpritePixelArrays.getIndexOfSprite(ObjectTypes.PLAYER_WALK);
        this.animationLengths = {
            [this.spriteIndexIdle]: SpritePixelArrays.PLAYER_IDLE_SPRITE?.animation.length,
            [this.spriteIndexJump]: SpritePixelArrays.PLAYER_JUMP_SPRITE?.animation.length,
            [this.spriteIndexWalk]: SpritePixelArrays.PLAYER_WALK_SPRITE?.animation.length,
        };
        this.spriteObject = SpritePixelArrays.PLAYER_JUMP_SPRITE;
        this.currentSpriteIndex = this.spriteIndexIdle;
        this.currentAnimationIndex = 0;
    }
    resetAnimationAttributes() {
        this.clearAnimationInterval("runningAnimationInterval");
        this.clearAnimationInterval("walljumpAnimationInterval");
        AnimationHelper.setInitialSquishValues(this);
        //AnimationHelper.setInitialSquishValues(this, this.tileSize);
    }
    setAnimationState(newAnimationState) {
        if (this.currentSpriteIndex !== newAnimationState) {
            this.currentAnimationIndex = 0;
        }
        this.currentSpriteIndex = newAnimationState;
    }
    activateAnimationInterval(intervalName, xOffset = 0, yOffset = 0, intervalTime = 200, animationIndex = 8) {
        if (!this.this_array[intervalName]) {
            this.this_array[intervalName] = setInterval(() => {
                SFXHandler.createSFX(this.x + xOffset, this.y + yOffset, animationIndex, AnimationHelper.facingDirections?.bottom, 0, 0, true, 12);
            }, intervalTime);
        }
    }
    clearAnimationInterval(intervalName) {
        if (this.this_array[intervalName]) {
            clearInterval(this.this_array[intervalName]);
            this.this_array[intervalName] = null;
        }
    }
    draw() {
        if (this.xspeed > 0) {
            this.fixedSpeedRight && this.activateAnimationInterval("runningAnimationInterval");
            this.facingDirection = AnimationHelper.facingDirections?.right;
        }
        else if (this.xspeed < 0) {
            this.fixedSpeedLeft && this.activateAnimationInterval("runningAnimationInterval");
            this.facingDirection = AnimationHelper.facingDirections?.left;
        }
        else {
            this.clearAnimationInterval("runningAnimationInterval");
        }
        if (this.xspeed === 0 && this.yspeed === 0) {
            this.setAnimationState(this.spriteIndexIdle);
        }
        else if (this.xspeed !== 0 && this.yspeed === 0) {
            this.setAnimationState(this.spriteIndexWalk);
        }
        if (this.yspeed !== 0 || this.falling) {
            //this.clearAnimationInterval("runningAnimationInterval");
            this.setAnimationState(this.spriteIndexJump);
        }
        if ((this.wallJumpRight || this.wallJumpLeft) && this.yspeed > 0) {
            //this.activateAnimationInterval("walljumpAnimationInterval", 0, -12);
        }
        else {
            //this.clearAnimationInterval("walljumpAnimationInterval");
        }
        const animationLength = this.animationLengths[this.currentSpriteIndex];
        var frameDuration = this.currentSpriteIndex === this.spriteIndexIdle
            ? AnimationHelper.defaultFrameDuration
            : AnimationHelper.walkingFrameDuration;
        if (frameDuration == undefined) {
            frameDuration = NaN;
        }
        this.currentAnimationIndex++;
        if (this.currentAnimationIndex >= frameDuration * animationLength || Game.playMode === Game.BUILD_MODE) {
            this.currentAnimationIndex = 0;
        }
        /*
            First, normal facing sprites are rendered, then mirrored sprites
            If we want to display mirrored sprites, we need to start at the end of the normal animation index
        */
        const loop = this.facingDirection === AnimationHelper.facingDirections?.left ? animationLength : 0;
        //Animation index in regards to "FPS" (animation frame duration)
        const animationIndex = (Math.floor(this.currentAnimationIndex / frameDuration) + loop) || 0;
        AnimationHelper.checkSquishUpdate(this);
        if (this.fixedSpeed) {
            this.radians += 0.25;
            this.activateAnimationInterval("fixedSpeedAnimationInterval");
            Display.drawImageWithRotation(this.spriteCanvas, animationIndex * this.tileSize, this.currentSpriteIndex * this.tileSize, this.tileSize, this.tileSize - 1, this.x - this.squishXOffset, this.y - 2 - this.squishYOffset, this.drawWidth, this.drawHeight, this.radians);
        }
        else {
            this.clearAnimationInterval("fixedSpeedAnimationInterval");
            !this.invisible && Display.drawImage(this.spriteCanvas, animationIndex * this.tileSize, this.currentSpriteIndex * this.tileSize, this.tileSize, this.tileSize - 1, this.x - this.squishXOffset, this.y - 2 - this.squishYOffset, this.drawWidth, this.drawHeight);
        }
    }
    checkWallJumpReady() {
        const wallJumpRightPos = tileMapHandler.getTileValueForPosition(this.x + this.width + 1);
        const wallJumpLeftPos = tileMapHandler.getTileValueForPosition(this.x - 1);
        const wallJumpTopRightTile = tileMapHandler.getTileLayerValueByIndex(this.top, wallJumpRightPos);
        const wallJumpBottomRightTile = tileMapHandler.getTileLayerValueByIndex(this.bottom, wallJumpRightPos);
        const wallJumpTopLeftTile = tileMapHandler.getTileLayerValueByIndex(this.top, wallJumpLeftPos);
        const wallJumpBottomLeftTile = tileMapHandler.getTileLayerValueByIndex(this.bottom, wallJumpLeftPos);
        this.wallJumpRight = wallJumpTopRightTile !== 0 && wallJumpTopRightTile !== 5 || wallJumpBottomRightTile !== 0 && wallJumpBottomRightTile !== 5;
        this.wallJumpLeft = wallJumpTopLeftTile !== 0 && wallJumpTopLeftTile !== 5 || wallJumpBottomLeftTile !== 0 && wallJumpBottomLeftTile !== 5;
    }
    hitWall(direction) {
        switch (direction) {
            case AnimationHelper.facingDirections?.bottom:
                this.hitBottom();
                break;
            case AnimationHelper.facingDirections?.top:
                this.hitTop();
                break;
            case AnimationHelper.facingDirections?.left:
                this.horizontalHit();
                break;
            case AnimationHelper.facingDirections?.right:
                this.horizontalHit();
        }
    }
    resetJump() {
        this.jumpframes = 0;
        this.currentCoyoteJumpFrame = 0;
    }
    resetDoubleJump() {
        this.doubleJumpActive = false;
        this.doubleJumpUsed = false;
        this.temporaryDoubleJump = false;
    }
    horizontalHit() {
        this.fixedSpeed = false;
        this.xspeed = 0;
    }
    verticalHit() {
        this.yspeed = 0;
        this.falling = false;
        this.wallJumpFrames = this.maxJumpFrames;
        this.fixedSpeed = false;
        this.resetJump();
    }
    hitBottom() {
        this.verticalHit();
        this.jumpframes = 0;
        this.resetDoubleJump();
        this.setSquishAnimation();
    }
    hitTop() {
        this.verticalHit();
        this.forcedJumpSpeed = 0;
        this.jumpframes = this.maxJumpFrames;
        this.jumpPressedToTheMax = true;
    }
    setSquishAnimation() {
        AnimationHelper.setSquishValues(this, this.tileSize * 1.2, this.tileSize * 0.8);
    }
    setStretchAnimation() {
        AnimationHelper.setSquishValues(this, this.tileSize * 0.8, this.tileSize * 1.2);
    }
}
class PlayMode {
    static _staticConstructor(player, tilemapHandler) {
        this.player = player;
        this.tilemapHandler = tilemapHandler;
        this.deathPauseFrames = 24;
        this.animationFrames = 48;
        this.currentPauseFrames = 0;
        this.animateToNextLevel = false;
        this.customExit;
    }
    static runStartScreenLogic() {
        this.player.x = 0;
        this.player.y = 0;
        //we need this check, because on mobile, the music will only start playing after a user interaction. A user interaction is a touch start and touch end
        if ((Controller.enter && !Controller.mobileEnter) || Controller.mobileEnterReleased) {
            Controller.enterReleased = false;
            this.startGame();
            SoundHandler.guiSelect.stopAndPlay();
        }
    }
    static startGame() {
        GameStatistics.resetPermanentObjects();
        tileMapHandler.currentLevel = 1;
        /*
        if (typeof LevelNavigationHandler === 'function') {
            LevelNavigationHandler.updateLevel();
        }
        else {*/
        if (SoundHandler?.song?.sound?.src && !undefined) {
            SoundHandler.song.stopAndPlay();
        }
        tileMapHandler.resetLevel(tileMapHandler.currentLevel);
        //}
        GameStatistics.resetPlayerStatistics();
        GameStatistics.startTimer();
    }
    static runPlayLogic() {
        const { player } = this;
        PauseHandler.checkPause();
        if (!player.death && this.currentPauseFrames === 0 && !DialogueHandler.active && !PauseHandler.paused) {
            this.updateGeneralFrameCounter();
            var walking = this.walkHandler();
            this.coyoteFrameHandler();
            this.wallJumpAllowedHandler();
            player.forcedJumpSpeed !== 0 && this.performJump(player.forcedJumpSpeed, player.maxJumpFrames + player.extraTrampolineJumpFrames);
            this.dashHandler();
            Controller.alternativeActionButtonReleased = Controller.alternativeActionButton ? false : true;
            this.jumpHandler();
            if (!player.dashing) {
                //const runButtonReleased = this.isRunButtonReleased();
                if (!walking && !player.fixedSpeed) {
                    player.xspeed *= player.friction;
                    if (Math.abs(player.xspeed) < 0.5) {
                        player.xspeed = 0;
                    }
                }
                this.fallHandler();
            }
            if (!player.falling && player.jumpframes === 0 && !player.swimming && !player.fixedSpeed) {
                player.yspeed = 0;
            }
            if (player.yspeed > player.currentMaxFallSpeed) {
                player.yspeed = player.currentMaxFallSpeed;
            }
            player.resetTemporaryAttributes();
            CharacterCollision.checkCollisionsWithWorld(player, true);
        }
    }
    static walkHandler() {
        const { player } = this;
        var walking = false;
        if (!player.dashing && !player.fixedSpeed) {
            //const newMaxSpeed = Controller.alternativeActionButton && player.runChecked ? player.maxSpeed * 1.65 : player.maxSpeed;
            const newMaxSpeed = player.currentMaxSpeed;
            //const newMaxSpeed = Controller.alternativeActionButton ? player.maxSpeed * 1.85 : player.maxSpeed;
            if ((Controller.left || player.fixedSpeedLeft) && !player.fixedSpeedRight) {
                //check should be player.xspeed + player.speed and an else with player.xspeed = player.maxSpeed
                if (player.xspeed - player.speed > newMaxSpeed * -1) {
                    player.xspeed -= player.speed;
                }
                else if (player.xspeed > newMaxSpeed * -1 && player.wallJumping) {
                    player.xspeed -= player.speed;
                }
                else {
                    player.xspeed = player.currentMaxSpeed * -1;
                }
                walking = true;
            }
            if ((Controller.right || player.fixedSpeedRight) && !player.fixedSpeedLeft) {
                if (player.xspeed + player.speed < newMaxSpeed) {
                    player.xspeed += player.speed;
                }
                else if (player.xspeed < newMaxSpeed && player.wallJumping) {
                    player.xspeed += player.speed;
                }
                else {
                    player.xspeed = player.currentMaxSpeed;
                }
                walking = true;
            }
        }
        return walking;
    }
    static coyoteFrameHandler() {
        const { player } = this;
        //if player releases jump button while in the air (doesn't matter if jumping or falling)
        if (!Controller.jump && player.falling) {
            //if he is falling, give player some extra frames where he is able to jump
            if (player.yspeed >= 0) {
                player.currentCoyoteJumpFrame++;
            }
            //if he went up once, jumping, or on trampoline, set those frames to max immediatly
            else {
                player.currentCoyoteJumpFrame = player.coyoteJumpFrames;
            }
        }
    }
    static wallJumpAllowedHandler() {
        const { player } = this;
        //if player touched a wall, allow him to walljump
        if (player.wallJumpChecked && !player.swimming && !player.jumping && !player.wallJumping && player.falling) {
            if (player.wallJumpLeft) {
                this.resetWallJump(1);
            }
            else if (player.wallJumpRight) {
                this.resetWallJump(-1);
            }
        }
    }
    static jumpHandler() {
        const { player } = this;
        if (Controller.jump && !player.collidingWithNpcId && !PauseHandler.justClosedPauseScreen && player.jumpChecked) {
            if (player.swimming) {
                this.swimHandler();
            }
            else {
                !player.fixedSpeed && this.normalJumpHandler();
                this.wallJumpHandler();
                this.checkDoubleJumpInitialization();
            }
            Controller.jumpReleased = false;
        }
        else {
            this.jumpButtonReleasedHandler();
        }
        //If player released jump button, slowly de-accelarate the jump
        if (player.yspeed < 0 && !player.jumping && !player.wallJumping && !player.fixedSpeed) {
            if (player.swimming) {
                player.yspeed *= 0.90;
                if (player.yspeed < player.maxSwimHeight) {
                    player.yspeed = player.maxSwimHeight;
                }
            }
            else if (player.forcedJumpSpeed === 0) {
                if (Math.abs(player.yspeed) < 0.5) {
                    player.yspeed = 0;
                }
                else {
                    player.yspeed *= 0.75;
                }
            }
        }
    }
    static normalJumpHandler() {
        const { player } = this;
        if ((!player.jumpPressedToTheMax && !player.dashing && player.forcedJumpSpeed === 0 && !player.flapped &&
            player.currentCoyoteJumpFrame < player.coyoteJumpFrames && player.jumpframes < player.maxJumpFrames) && !player.invisible) {
            if (!player.jumping && player.jumpframes === 0) {
                this.jumpInitialized();
            }
            this.performJump(player.jumpSpeed, player.maxJumpFrames);
            player.jumping = true;
        }
        if (player.jumpframes === player.maxJumpFrames && player.yspeed <= 0) {
            player.jumpPressedToTheMax = true;
        }
    }
    static wallJumpHandler() {
        const { player } = this;
        if (player.wallJumpChecked && !player.dashing && !player.flapped &&
            player.wallJumpFrames < player.maxJumpFrames &&
            player.currentWallJumpCoyoteFrame < player.coyoteJumpFrames) {
            if (!player.wallJumping && player.wallJumpFrames === 0) {
                player.doubleJumpUsed = false;
                this.reverseForcedRunSpeed();
                this.jumpInitialized(player.wallJumpLeft ? AnimationHelper.facingDirections.left : AnimationHelper.facingDirections.right);
            }
            player.wallJumpFrames++;
            var currentJumpSpeed = -(player.maxJumpFrames - player.wallJumpFrames) * player.jumpSpeed;
            if (currentJumpSpeed !== 0) {
                player.yspeed = currentJumpSpeed;
            }
            //push player to side while walljumping
            if (player.wallJumpFrames < player.pushToSideWhileWallJumpingFrames) {
                player.xspeed -= currentJumpSpeed * player.wallJumpDirection;
                if (player.wallJumpDirection === 1 && player.xspeed > player.maxSpeed) {
                    player.xspeed = player.maxSpeed;
                }
                else if (player.wallJumpDirection === -1 && player.xspeed < player.maxSpeed * -1) {
                    player.xspeed = player.maxSpeed * -1;
                }
            }
            player.wallJumping = true;
        }
    }
    static reverseForcedRunSpeed() {
        if (player.fixedSpeedRight) {
            player.fixedSpeedRight = false;
            player.fixedSpeedLeft = true;
        }
        else if (player.fixedSpeedLeft) {
            player.fixedSpeedRight = true;
            player.fixedSpeedLeft = false;
        }
    }
    static checkDoubleJumpInitialization() {
        const { player } = this;
        if ((player.doubleJumpChecked || player.temporaryDoubleJump) && player.doubleJumpActive && !player.doubleJumpUsed && !player.wallJumping) {
            player.jumpPressedToTheMax = false;
            player.resetJump();
            player.fixedSpeed = false;
            player.forcedJumpSpeed = 0;
            player.doubleJumpActive = false;
            player.doubleJumpUsed = true;
            player.jumping = false;
            if (player.dashing) {
                player.dashing = false;
                player.xspeed = 0;
                player.currentDashFrame = player.maxDashFrames;
            }
        }
    }
    static swimHandler() {
        player.wallJumping = false;
        player.jumping = false;
        player.jumpPressedToTheMax = true;
        //if player is swimming, but the top corners don't touch water, he is floating on the surface
        const waterAtTopOnly = !this.player.top_right_pos_in_water && !this.player.top_left_pos_in_water
            && (this.player.bottom_right_pos_in_water || this.player.bottom_left_pos_in_water);
        if (player.yspeed < 0 && waterAtTopOnly && player.forcedJumpSpeed === 0) {
            player.y = (player.top + 1) * tileMapHandler.tileSize - 4;
            SFXHandler.createSFX(player.x, player.top * tileMapHandler.tileSize, 0, AnimationHelper.facingDirections.bottom);
            player.forcedJumpSpeed = player.jumpSpeed / 1.23;
            player.jumpframes = 0;
            player.doubleJumpUsed = false;
            player.currentDashFrame = 0;
        }
        else if (!this.player.flapped && Controller.jumpReleased) {
            SoundHandler.bubble.stopAndPlay();
            if (this.player.yspeed - this.player.flapHeight > this.player.maxSwimHeight) {
                this.player.yspeed -= this.player.flapHeight;
            }
            else {
                this.player.yspeed = this.player.maxSwimHeight;
            }
            this.player.flapped = true;
        }
    }
    static jumpButtonReleasedHandler() {
        const { player } = this;
        if (player.wallJumping) {
            player.wallJumpFrames = player.maxJumpFrames;
            player.wallJumping = false;
        }
        if (player.falling && player.currentCoyoteJumpFrame >= player.coyoteJumpFrames || player.fixedSpeed || player.temporaryDoubleJump) {
            player.doubleJumpActive = true;
        }
        if (player.jumping) {
            player.jumping = false;
            if (player.yspeed !== 0 && player.forcedJumpSpeed === 0) {
                player.jumpframes = player.maxJumpFrames;
            }
        }
        Controller.jumpReleased = true;
        player.jumpPressedToTheMax = false;
        this.player.flapped = false;
    }
    static fallHandler() {
        const { player } = this;
        if (player.falling && !player.fixedSpeed) {
            //If player is falling and pressing against the wall, he will stick to the wall
            if (!player.swimming &&
                (player.wallJumpChecked && player.yspeed > 0 &&
                    (player.wallJumpLeft && (Controller.left || player.fixedSpeedLeft) ||
                        player.wallJumpRight && (Controller.right || player.fixedSpeedRight)))) {
                player.yspeed = player.currentWallJumpGravity;
            }
            else {
                !player.wallJumping && player.currentWallJumpCoyoteFrame++;
                if (player.forcedJumpSpeed === 0) {
                    player.yspeed += player.currentGravity;
                }
            }
        }
    }
    static isRunButtonReleased() {
        const { player } = this;
        return player.runChecked && !Controller.alternativeActionButton && (Math.abs(player.xspeed) > Math.abs(player.maxSpeed));
    }
    static jumpInitialized(direction = AnimationHelper.facingDirections.bottom) {
        SoundHandler.shortJump.stopAndPlay();
        SFXHandler.createSFX(player.x, player.y, 0, direction);
        this.player.setStretchAnimation();
        this.player.fixedSpeed = false;
    }
    static updateGeneralFrameCounter() {
        tileMapHandler.currentGeneralFrameCounter++;
        if (tileMapHandler.currentGeneralFrameCounter > tileMapHandler.generalFrameCounterMax) {
            tileMapHandler.currentGeneralFrameCounter = 0;
        }
    }
    static performJump(jumpSpeed, maxFrames) {
        player.jumpframes++;
        var currentJumpSpeed = -(maxFrames - player.jumpframes) * jumpSpeed;
        if (currentJumpSpeed !== 0) {
            //easing: currentJumpSpeed * currentJumpSpeed * -1 (and jumpspeed much smaller)
            player.yspeed = currentJumpSpeed;
        }
        if (this.player.forcedJumpSpeed !== 0 && this.player.jumpframes >= maxFrames) {
            this.player.forcedJumpSpeed = 0;
        }
    }
    static dashHandler() {
        const { player } = this;
        if (player.dashChecked && (!player.fixedSpeed || player.fixedSpeed && player.yspeed !== 0)) {
            player.currentCoyoteDashFrame++;
            if (Controller.alternativeActionButtonReleased && Controller.alternativeActionButton) {
                player.currentCoyoteDashFrame = 0;
            }
            if (!player.jumping && !player.falling && player.currentDashFrame >= player.maxDashFrames) {
                player.currentDashFrame = 0;
            }
            if (player.currentCoyoteDashFrame < player.coyoteDashFrames && !player.dashing && player.currentDashFrame === 0) {
                player.currentCoyoteDashFrame = player.coyoteDashFrames;
                player.dashing = true;
                player.fixedSpeed = false;
                player.forcedJumpSpeed = 0;
                player.dashDirection = AnimationHelper.facingDirections.left;
                //if player faces right, or he is stuck to the left wall and wants to push away by pressing x immediatly
                if (player.xspeed === 0 && player.facingDirection === AnimationHelper.facingDirections.right && !player.wallJumpRight
                    || Controller.right && !player.wallJumpRight
                    || player.wallJumpLeft && player.yspeed !== 0
                    || player.wallJumpRight && player.yspeed === 0
                    || player.dashing && player.xspeed > 0 && !player.wallJumpRight) {
                    player.dashDirection = AnimationHelper.facingDirections.right;
                }
                //If player dashes of wall, change auto-run direction
                if (player.wallJumpLeft && player.dashDirection === AnimationHelper.facingDirections.right ||
                    player.wallJumpRight && player.dashDirection === AnimationHelper.facingDirections.left) {
                    this.reverseForcedRunSpeed();
                }
            }
            if (player.dashing) {
                if (player.currentDashFrame < player.maxDashFrames) {
                    player.yspeed = 0;
                    if (player.currentDashFrame === 0) {
                        SoundHandler.dash.stopAndPlay();
                    }
                    if (player.currentDashFrame < player.dashCooldown) {
                        player.xspeed = 0;
                    }
                    else {
                        const dashMultiplicator = 3.7;
                        if (player.dashDirection === AnimationHelper.facingDirections.left) {
                            player.xspeed = player.maxSpeed * dashMultiplicator * -1;
                        }
                        else if (player.dashDirection === AnimationHelper.facingDirections.right) {
                            player.xspeed = player.maxSpeed * dashMultiplicator;
                        }
                        if (player.currentDashFrame % 3 === 0) {
                            SFXHandler.createSFX(player.x, player.y, 2);
                        }
                    }
                }
                if (player.currentDashFrame === player.maxDashFrames - 1) {
                    player.dashing = false;
                    player.xspeed = 0;
                    //deactivate the variables, in case they were activated shortly before dash
                    player.wallJumpFrames = player.maxJumpFrames;
                    player.jumpFrames = player.maxJumpFrames;
                }
                player.currentDashFrame++;
            }
        }
    }
    static pauseFramesHandler() {
        if (PauseHandler.paused) {
            PauseHandler.handlePause();
        }
        else if (this.currentPauseFrames > 0) {
            this.currentPauseFrames--;
            if (player.death) {
                if (this.currentPauseFrames === this.deathPauseFrames / 2) {
                    this.player.resetPosition(true);
                    this.player.death = false;
                    tileMapHandler.resetDynamicObjects();
                }
            }
            if (this.animateToNextLevel) {
                const halfAnimationFrames = this.animationFrames / 2;
                const totalBlackFrames = 4;
                if (tileMapHandler.checkIfStartOrEndingLevel()) {
                    this.currentPauseFrames = 0;
                }
                const fadeInFrames = halfAnimationFrames + totalBlackFrames;
                const fadeOutFrames = halfAnimationFrames - totalBlackFrames;
                if (this.currentPauseFrames > fadeInFrames) {
                    //fade in
                    Display.animateFade(fadeInFrames - (this.currentPauseFrames - fadeInFrames), fadeInFrames);
                }
                else if (this.currentPauseFrames < fadeOutFrames) {
                    //fade out
                    Display.animateFade(this.currentPauseFrames, fadeOutFrames);
                }
                else {
                    //stay black for some frames
                    Display.animateFade(halfAnimationFrames, halfAnimationFrames);
                }
                if (this.currentPauseFrames === halfAnimationFrames) {
                    tileMapHandler.switchToNextLevel();
                }
            }
        }
        else {
            if (this.animateToNextLevel) {
                this.animateToNextLevel = false;
            }
            this.currentPauseFrames = 0;
        }
    }
    static resetWallJump(wallJumpDirection) {
        this.player.wallJumpFrames = 0;
        this.player.currentWallJumpCoyoteFrame = 0;
        this.player.temporaryDoubleJump = false;
        //if not in dashing cooldown
        if (this.player.currentDashFrame > this.player.dashCooldown) {
            this.player.dashing = false;
            this.player.currentDashFrame = 0;
        }
        this.player.wallJumpDirection = wallJumpDirection;
    }
    static playerDeath() {
        SoundHandler.hit.stopAndPlay();
        this.currentPauseFrames = this.deathPauseFrames;
        this.player.death = true;
        const direction = AnimationHelper.facingDirections.bottom;
        for (var i = 0; i < 7; i++) {
            SFXHandler.createSFX(player.x, player.y, 2, direction, MathHelpers.getSometimesNegativeRandomNumber(0, 2, false), MathHelpers.getSometimesNegativeRandomNumber(0, 2, false), true, 22);
        }
        this.player.resetAttributes();
        GameStatistics.deathCounter++;
        tileMapHandler.currentGeneralFrameCounter = 0;
    }
    static checkActiveCheckPoints() {
        let checkPointPos = null;
        this.tilemapHandler && this.tilemapHandler.levelObjects.forEach((levelObject) => {
            if (levelObject.type === ObjectTypes.CHECKPOINT && levelObject?.active) {
                checkPointPos = {
                    x: levelObject.initialX * this.tilemapHandler.tileSize,
                    y: levelObject.initialY * this.tilemapHandler.tileSize
                };
            }
        });
        return checkPointPos;
    }
}
class LevelObject {
    constructor(x, y, tileSize, type) {
        this.this_array = {};
        this.initialX = x;
        this.initialY = y;
        this.x = x * tileSize;
        this.y = y * tileSize;
        this.width = tileSize;
        this.height = tileSize;
        this.type = type;
        this.tileSize = tileSize;
        this.xspeed = 0;
        this.yspeed = 0;
        this.setSpriteAttributes(this.type);
        AnimationHelper.setInitialSquishValues(this);
        //AnimationHelper.setInitialSquishValues(this, this.tileSize);
    }
    setSpriteAttributes(type) {
        this.spriteIndex = SpritePixelArrays.getIndexOfSprite(type);
        this.spriteObject = SpritePixelArrays.getSpritesByName(type);
        this.canvasYSpritePos = this.spriteIndex * this.tileSize;
        this.canvasXSpritePos = 0;
    }
    makeid(length) {
        return TilemapHelpers.makeid(length);
    }
    drawSingleFrame(spriteCanvas, canvasXSpritePos, canvasYSpritePos = this.canvasYSpritePos) {
        Display.drawImage(spriteCanvas, canvasXSpritePos, canvasYSpritePos, this.tileSize, this.tileSize, this.x, this.y, this.tileSize, this.tileSize);
    }
    draw(spriteCanvas, canvasYSpritePos) {
        const drawFunction = (canvasXSpritePos) => this.drawSingleFrame(spriteCanvas, canvasXSpritePos, canvasYSpritePos);
        this.checkFrameAndDraw(drawFunction);
    }
    drawSingleSquishingFrame(spriteCanvas, canvasXSpritePos) {
        AnimationHelper.checkSquishUpdate(this);
        Display.drawImage(spriteCanvas, canvasXSpritePos, this.canvasYSpritePos, this.tileSize, this.tileSize, this.x - this.squishXOffset, this.y - this.squishYOffset, this.drawWidth, this.drawHeight);
    }
    drawWithSquishing(spriteCanvas) {
        const drawFunction = (canvasXSpritePos) => this.drawSingleSquishingFrame(spriteCanvas, canvasXSpritePos);
        this.checkFrameAndDraw(drawFunction);
    }
    drawSingleAlphaFrame(spriteCanvas, alpha, canvasXSpritePos) {
        AnimationHelper.checkSquishUpdate(this);
        Display.drawImageWithAlpha(spriteCanvas, canvasXSpritePos, this.canvasYSpritePos, this.tileSize, this.tileSize, this.x, this.y, this.tileSize, this.tileSize, alpha);
    }
    drawWithAlpha(spriteCanvas, alpha) {
        const drawFunction = (canvasXSpritePos) => this.drawSingleAlphaFrame(spriteCanvas, alpha, canvasXSpritePos);
        this.checkFrameAndDraw(drawFunction);
    }
    drawWithRotation(spriteCanvas, angle = 0) {
        let drawFunction = (canvasXSpritePos) => Display.drawImageWithRotation(spriteCanvas, canvasXSpritePos, this.canvasYSpritePos, this.tileSize, this.tileSize, this.x, this.y, this.tileSize, this.tileSize, angle);
        //Included squishing function right here, because rotating enemies are so rare
        if (this.spriteObject?.[0].squishAble) {
            AnimationHelper.checkSquishUpdate(this);
            drawFunction = (canvasXSpritePos) => Display.drawImageWithRotation(spriteCanvas, canvasXSpritePos, this.canvasYSpritePos, this.tileSize, this.tileSize, this.x - this.squishXOffset, this.y - this.squishYOffset, this.drawWidth, this.drawHeight, angle);
        }
        this.checkFrameAndDraw(drawFunction);
    }
    checkFrameAndDraw(drawFunction) {
        if (this?.spriteObject?.[0].animation.length > 1 && Game.playMode === Game.PLAY_MODE) {
            const frameModulo = tileMapHandler.currentGeneralFrameCounter % 40;
            if (frameModulo < AnimationHelper.defaultFrameDuration) {
                drawFunction(this.canvasXSpritePos);
            }
            else {
                drawFunction(this.canvasXSpritePos + this.tileSize);
            }
        }
        else {
            drawFunction(this.canvasXSpritePos);
        }
    }
}
class InteractiveLevelObject extends LevelObject {
    constructor(x, y, tileSize, type, hitBoxOffset = 0, extraAttributes = {}) {
        super(x, y, tileSize, type);
        this.hitBoxOffset = hitBoxOffset;
        this.changeableInBuildMode = false;
        if (this.spriteObject?.[0]?.directions) {
            this.facingDirections = this.spriteObject?.[0]?.directions;
            this.changeableInBuildMode = true;
            this.currentFacingDirection = this.facingDirections[0];
        }
        if (this.spriteObject?.[0]?.changeableAttributes) {
            this.changeableInBuildMode = true;
            this.spriteObject?.[0]?.changeableAttributes.forEach((attribute) => {
                this.this_array[attribute.name] = attribute.defaultValue;
            });
        }
        this.extraAttributes = extraAttributes;
        if (extraAttributes) {
            for (const key of Object.keys(extraAttributes)) {
                const value = extraAttributes[key];
                this.this_array[key] = value;
                if (key === "currentFacingDirection" && this.facingDirections) {
                    this.canvasXSpritePos = this.facingDirections.indexOf(value) * this.spriteObject[0].animation.length * this.tileSize;
                }
                if (key === "customName") {
                    this.spriteObject = SpritePixelArrays.getSpritesByDescrpitiveName(value);
                    this.canvasYSpritePos = SpritePixelArrays.getIndexOfSprite(value, 0, "descriptiveName") * tileSize;
                }
            }
        }
    }
    turnObject() {
        var currentIndex = this.facingDirections.indexOf(this.currentFacingDirection);
        currentIndex++;
        if (currentIndex > this.facingDirections.length - 1) {
            currentIndex = 0;
        }
        this.canvasXSpritePos = currentIndex * this.spriteObject[0].animation.length * this.tileSize;
        this.addChangeableAttribute("currentFacingDirection", this.facingDirections[currentIndex]);
    }
    addChangeableAttribute(attribute, value, levelToChange = null) {
        const levelIndex = levelToChange || tileMapHandler.currentLevel;
        this.this_array[attribute] = value;
        if (WorldDataHandler.levels[levelIndex].levelObjects) {
            WorldDataHandler.levels[levelIndex].levelObjects.forEach((levelObject) => {
                if (levelObject.x === this.initialX && levelObject.y === this.initialY && levelObject.type === this.type) {
                    if (!levelObject.extraAttributes) {
                        levelObject.extraAttributes = {};
                    }
                    levelObject.extraAttributes = { ...levelObject.extraAttributes, [attribute]: value };
                }
            });
        }
    }
    //for now it's used for bullets (canonballs and rockets), which can be deleted during game-time
    deleteObjectFromLevel(tilemapHandler, showSfx = true) {
        showSfx && SFXHandler.createSFX(this.x, this.y, 1);
        for (var i = tilemapHandler.levelObjects.length - 1; i >= 0; i--) {
            var levelObject = tilemapHandler.levelObjects[i];
            if (this.key === levelObject.key && levelObject.initialX === this.initialX && levelObject.initialY === this.initialY && levelObject.type === this.type) {
                tilemapHandler.levelObjects.splice(i, 1);
                break;
            }
        }
    }
}
class Spike extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        const hitBoxOffset = -tileSize / 6;
        super(x, y, tileSize, type, hitBoxOffset, extraAttributes);
    }
    collisionEvent() {
        PlayMode.playerDeath();
    }
}
class FinishFlag extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, 0, extraAttributes);
        this.collidedWithPlayer = false;
        this.tilemapHandler = tilemapHandler;
        this.changeableInBuildMode = true;
        this.closedFinishedFlagSpriteIndex = SpritePixelArrays.getIndexOfSprite(ObjectTypes.FINISH_FLAG_CLOSED);
        this.closedFinishedFlagYSpritePos = this.closedFinishedFlagSpriteIndex * this.tileSize;
        this.closed = false;
        if (!undefined) {
            this.persistentCollectibles = WorldDataHandler.levels[this.tilemapHandler.currentLevel].levelObjects.filter((levelObject) => levelObject.type === ObjectTypes.COLLECTIBLE);
        }
    }
    collisionEvent() {
        if (!this.collidedWithPlayer && !this.closed) {
            this.collidedWithPlayer = true;
            SoundHandler.win.stopAndPlay();
            PlayMode.animateToNextLevel = true;
            PlayMode.currentPauseFrames = PlayMode.animationFrames;
            PlayMode.customExit = this.customExit;
            if (this.tilemapHandler.currentLevel === WorldDataHandler.levels.length - 2 && !this.customExit
                && !undefined) {
                SoundHandler.fadeAudio("mainSong");
            }
        }
    }
    changeExit(text) {
        if (text) {
            if (text === 'finishLevel') {
                this.addChangeableAttribute("customExit", { levelIndex: WorldDataHandler.levels.length - 1 });
            }
            else {
                const valueArray = text.split(",");
                valueArray.length === 2 && this.addChangeableAttribute("customExit", { levelIndex: parseInt(valueArray[0]), flagIndex: valueArray[1] });
            }
        }
        else {
            this.addChangeableAttribute("customExit", null);
        }
    }
    checkIfAllCollectiblesCollected(collectibles) {
        if (undefined) {
            return collectibles.every((collectible) => collectible.touched);
        }
        else {
            return this.persistentCollectibles.every((persistentCollectible) => persistentCollectible.extraAttributes.collected);
        }
    }
    draw(spriteCanvas) {
        if (!this.collectiblesNeeded) {
            super.draw(spriteCanvas);
            this.closed = false;
        }
        else {
            const collectibles = this.tilemapHandler.filterObjectsByTypes(ObjectTypes.COLLECTIBLE);
            if (!collectibles || this.checkIfAllCollectiblesCollected(collectibles)) {
                super.draw(spriteCanvas);
                this.closed = false;
            }
            else {
                super.draw(spriteCanvas, this.closedFinishedFlagYSpritePos);
                this.closed = true;
            }
        }
    }
}
class Checkpoint extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, 0, extraAttributes);
        this.active = false;
        this.tilemapHandler = tilemapHandler;
    }
    collisionEvent() {
        if (!this.active) {
            this.tilemapHandler.levelObjects.forEach((levelObject) => {
                if (levelObject.type === ObjectTypes.CHECKPOINT) {
                    levelObject.active = false;
                }
            });
            this.active = true;
            SoundHandler.checkpoint.play();
        }
    }
    draw(spriteCanvas) {
        const showSecond = this.active && this?.spriteObject?.[0].animation.length > 1;
        super.drawSingleFrame(spriteCanvas, showSecond ? this.canvasXSpritePos + this.tileSize : this.canvasXSpritePos);
    }
}
class StartFlag extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, 0, extraAttributes);
        this.tilemapHandler = tilemapHandler;
        this.changeableInBuildMode = true;
        const startFlagsInLevel = WorldDataHandler.levels[this.tilemapHandler.currentLevel].levelObjects.filter((levelObject) => levelObject.type === ObjectTypes.START_FLAG);
        if (!extraAttributes?.levelStartFlag && startFlagsInLevel.length === 1) {
            this.levelStartFlag = true;
            this.addChangeableAttribute("levelStartFlag", true, this.tilemapHandler.currentLevel);
        }
        if (!extraAttributes?.flagIndex) {
            this.flagIndex = this.makeid(3);
            this.addChangeableAttribute("flagIndex", this.flagIndex, this.tilemapHandler.currentLevel);
        }
        const customEntryFlag = startFlagsInLevel.find((startFlag) => PlayMode?.customExit?.flagIndex && startFlag?.extraAttributes?.flagIndex === PlayMode.customExit.flagIndex);
        const levelStartFlag = startFlagsInLevel.find((startFlag) => startFlag?.extraAttributes?.levelStartFlag);
        if (customEntryFlag?.extraAttributes?.flagIndex === this.flagIndex || levelStartFlag?.extraAttributes?.flagIndex === this.flagIndex) {
            this.setPlayerInitialPosition();
        }
        else if (!levelStartFlag && !customEntryFlag) {
            const lastFlag = startFlagsInLevel[startFlagsInLevel.length - 1];
            if (lastFlag.x === this.initialX && lastFlag.y === this.initialY) {
                this.setPlayerInitialPosition();
            }
        }
    }
    setPlayerInitialPosition() {
        if (this.tilemapHandler?.player) {
            this.tilemapHandler.player.initialX = this.x;
            this.tilemapHandler.player.initialY = this.y;
        }
    }
    updateLevelStartValue(levelStartValue) {
        const startFlagsInTileMapHandler = this.tilemapHandler.filterObjectsByTypes(ObjectTypes.START_FLAG);
        if (levelStartValue) {
            //reset all other start flags, because there can only be 1 level starting flag
            startFlagsInTileMapHandler.forEach((startFlagInTileMapHandler) => {
                startFlagInTileMapHandler.addChangeableAttribute("levelStartFlag", false);
            });
            this.addChangeableAttribute("levelStartFlag", true);
        }
        else {
            this.addChangeableAttribute("levelStartFlag", false);
        }
    }
    collisionEvent() {
    }
}
class Trampoline extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, 0, extraAttributes);
        this.player = tilemapHandler.player;
        this.tilemapHandler = tilemapHandler;
        this.unfoldedAnimationDuration = 5 * AnimationHelper.walkingFrameDuration;
        this.currentAnimationFrame = this.unfoldedAnimationDuration;
    }
    collisionEvent() {
        if (this.player.yspeed > 0) {
            this.tilemapHandler.levelObjects.forEach((levelObject) => {
                if (levelObject.type === ObjectTypes.TRAMPOLINE) {
                    levelObject.currentAnimationFrame = this.unfoldedAnimationDuration;
                }
            });
            AnimationHelper.setSquishValues(this, this.tileSize * 0.8, this.tileSize * 1.2, 7);
            this.player.setStretchAnimation();
            this.player.forcedJumpSpeed = this.player.jumpSpeed + (this.player.jumpSpeed / 3.75);
            this.player.jumpframes = 0;
            this.player.fixedSpeed = false;
            this.player.temporaryDoubleJump = false;
            this.player.doubleJumpUsed = false;
            this.player.currentDashFrame = 0;
            this.currentAnimationFrame = 0;
            SoundHandler.longJump.stopAndPlay();
        }
    }
    draw(spriteCanvas) {
        this.currentAnimationFrame++;
        if (this.currentAnimationFrame < this.unfoldedAnimationDuration) {
            if (this.currentAnimationFrame === this.player.maxJumpFrames + this.player.extraTrampolineJumpFrames || this.currentAnimationFrame === this.unfoldedAnimationDuration - 1) {
                this.player.forcedJumpSpeed = 0;
            }
            super.drawSingleSquishingFrame(spriteCanvas, this.tileSize);
        }
        else {
            super.drawSingleSquishingFrame(spriteCanvas, 0);
            this.currentAnimationFrame = this.unfoldedAnimationDuration;
        }
    }
}
class Npc extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, 0, extraAttributes);
        this.upReleased = true;
        this.key = this.makeid(5);
        this.arrowUpFrameIndex = 0;
        this.upButtonReleased = false;
    }
    collisionEvent() {
        player.collidingWithNpcId = this.key;
        this.arrowUpFrameIndex++;
        const frameModulo = this.arrowUpFrameIndex % 60;
        if (frameModulo < 30) {
            DialogueHandler.showDialogueUpArrow(this.x, this.y - this.tileSize);
        }
        if (!Controller.jump) {
            this.upButtonReleased = true;
        }
        else {
            if (this.upButtonReleased && !DialogueHandler.active) {
                const parsedDialogue = [];
                this.dialogue.forEach((singleDialogue) => {
                    const singleDialogueObject = DialogueHandler.createDialogObject(singleDialogue);
                    if (singleDialogueObject.textLength > 0) {
                        parsedDialogue.push(singleDialogueObject);
                    }
                });
                if (parsedDialogue.length > 0) {
                    DialogueHandler.dialogue = parsedDialogue;
                    DialogueHandler.active = true;
                    DialogueHandler.calculateDialogueWindowPosition();
                    SoundHandler.dialogueSound.stopAndPlay();
                    player.xspeed = 0;
                    player.yspeed = 0;
                }
            }
            this.upButtonReleased = false;
        }
    }
    draw(spriteCanvas) {
        if (player.collidingWithNpcId === this.key && !Collision.objectsColliding(player, this)) {
            player.collidingWithNpcId = null;
            this.arrowUpFrameIndex = 0;
            this.upButtonReleased = false;
        }
        super.draw(spriteCanvas);
    }
}
class ShootingObject extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, 0, extraAttributes);
        this.tileMapHandler = tilemapHandler;
    }
    getShootFrames() {
        const frequency = this.this_array[SpritePixelArrays.changeableAttributeTypes.frequency];
        const step = this.tileMapHandler.generalFrameCounterMax / frequency;
        const shootFrames = [];
        for (var i = 1; i <= frequency; i++) {
            shootFrames.push(Math.round(step * i));
        }
        this.shootFrames = shootFrames;
    }
}
class Canon extends ShootingObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, tilemapHandler, extraAttributes);
        this.tileMapHandler.tileMap[this.y / this.tileSize][this.x / this.tileSize] = ObjectTypes.SPECIAL_BLOCK_VALUES.canon;
        this.getShootFrames();
    }
    draw(spriteCanvas) {
        super.drawWithSquishing(spriteCanvas);
        if (this.shootFrames.includes(this.tileMapHandler.currentGeneralFrameCounter)) {
            var canonBallX = this.initialX - 1;
            var canonBallY = this.initialY;
            var { top, right, bottom } = AnimationHelper.facingDirections;
            if (this.currentFacingDirection === top) {
                canonBallX = this.initialX;
                canonBallY = this.initialY - 1;
            }
            else if (this.currentFacingDirection === right) {
                canonBallX = this.initialX + 1;
                canonBallY = this.initialY;
            }
            else if (this.currentFacingDirection === bottom) {
                canonBallX = this.initialX;
                canonBallY = this.initialY + 1;
            }
            var canonBallStartingTile = this.tileMapHandler.getTileLayerValueByIndex(canonBallY, canonBallX);
            if (canonBallStartingTile === 0 || canonBallStartingTile === 5) {
                const canonBall = new CanonBall(canonBallX, canonBallY, this.tileSize, ObjectTypes.CANON_BALL, this.tileMapHandler, this.currentFacingDirection, this.this_array[SpritePixelArrays.changeableAttributeTypes.speed]);
                this.tileMapHandler.levelObjects.push(canonBall);
                AnimationHelper.setSquishValues(this, this.tileSize * 1.2, this.tileSize * 0.8, 5, this.currentFacingDirection);
            }
        }
    }
}
class CanonBall extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tileMapHandler, facingDirection = {}, speed = 3) {
        const hitBoxOffset = -tileSize / 6;
        super(x, y, tileSize, type, hitBoxOffset, { currentFacingDirection: facingDirection });
        this.tileMapHandler = tileMapHandler;
        this.facingDirection = facingDirection;
        this.movingSpeed = speed;
        this.yCenter = tileSize / 2;
        this.key = this.makeid(5);
    }
    collisionEvent() {
        PlayMode.playerDeath();
    }
    draw() {
        super.draw(spriteCanvas);
        if (Game.playMode === Game.PLAY_MODE) {
            var { left, top, right } = AnimationHelper.facingDirections;
            if (this.facingDirection === left) {
                this.x -= this.movingSpeed;
                this.checkWallCollission(this.x, this.y + this.yCenter);
            }
            else if (this.facingDirection === top) {
                this.y -= this.movingSpeed;
                this.checkWallCollission(this.x + this.yCenter, this.y);
            }
            else if (this.facingDirection === right) {
                this.x += this.movingSpeed;
                this.checkWallCollission(this.x + this.tileSize, this.y + this.yCenter);
            }
            else {
                this.y += this.movingSpeed;
                this.checkWallCollission(this.x + this.yCenter, this.y + this.tileSize, [0]);
            }
        }
    }
    getTilePositions(x, y) {
        return { xPos: this.tileMapHandler.getTileValueForPosition(x), yPos: this.tileMapHandler.getTileValueForPosition(y) };
    }
    checkWallCollission(x, y, tileArray = [0, 5]) {
        const { xPos, yPos } = this.getTilePositions(x, y);
        var currentTileValue = this.tileMapHandler.getTileLayerValueByIndex(yPos, xPos);
        if (!!(typeof currentTileValue === 'undefined') || !tileArray.includes(currentTileValue)) {
            if (currentTileValue === ObjectTypes.SPECIAL_BLOCK_VALUES.redBlueSwitch) {
                const switchBlock = this.tileMapHandler.levelObjects.find((levelObject) => levelObject.initialX === xPos && levelObject.initialY === yPos);
                switchBlock && switchBlock.switchWasHit(this.facingDirection);
            }
            this.deleteObjectFromLevel(this.tileMapHandler);
        }
    }
}
class LaserCanon extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, 0, extraAttributes);
        this.currentLaserFrame = 0;
        this.currentPauseFrame = 0;
        this.tileMapHandler = tilemapHandler;
        this.tileMapHandler.tileMap[this.y / this.tileSize][this.x / this.tileSize] = ObjectTypes.SPECIAL_BLOCK_VALUES.canon;
        this.possilbeTimers = {
            laserTimer: "laserTimer",
            pauseTimer: "pauseTimer",
        };
        this.resetObject();
        this.key = this.makeid(5);
    }
    resetObject() {
        this.currentTimer = this.possilbeTimers.pauseTimer;
        this.createdLasers = [];
        this.currentLaserFrame = 0;
        this.currentPauseFrame = 0;
    }
    checkIfLasersExistsAndSet(y, x, allowedTileValues) {
        if (allowedTileValues.includes(this.tileMapHandler.tileMap[y][x])) {
            if (!this.createdLasers.find((createdLaser) => createdLaser.x === x && createdLaser.y === y)) {
                const laser = new Laser(x, y, this.tileSize, ObjectTypes.LASER, this.tileMapHandler, this.currentFacingDirection, this.this_array[SpritePixelArrays.changeableAttributeTypes.laserDuration] - this.currentLaserFrame, this.this_array[SpritePixelArrays.changeableAttributeTypes.pauseDuration], this.key);
                this.tileMapHandler.levelObjects.push(laser);
                this.createdLasers.push({ x, y });
            }
            return false;
        }
        else {
            this.removeFromCurrentCreatedLasers(x, y);
            return true;
        }
    }
    removeFromCurrentCreatedLasers(x, y) {
        const index = this.createdLasers.findIndex((laser) => laser.x === x && laser.y === y);
        if (index > -1) {
            this.createdLasers.splice(index, 1);
        }
    }
    findAndDeleteLasersAfterSolidTile(x, y) {
        const laserAtPosition = this.tileMapHandler.levelObjects.find((levelObject) => levelObject.type === ObjectTypes.LASER && levelObject.initialX === x && levelObject.initialY === y
            && levelObject.laserId === this.key);
        this.removeFromCurrentCreatedLasers(x, y);
        laserAtPosition && laserAtPosition.deleteObjectFromLevel(this.tileMapHandler, false);
    }
    handleSingleLaserPos(x, y, allowedTileValues) {
        if (!this.solidTileInbetween) {
            this.solidTileInbetween = this.checkIfLasersExistsAndSet(y, x, allowedTileValues);
        }
        else {
            this.findAndDeleteLasersAfterSolidTile(x, y);
        }
    }
    handleLasers() {
        var { top, right, bottom } = AnimationHelper.facingDirections;
        let allowedTileValues = [0, 5];
        this.solidTileInbetween = false;
        if (this.currentFacingDirection === top) {
            for (var y = this.initialY - 1; y > 0; y--) {
                this.handleSingleLaserPos(this.initialX, y, allowedTileValues);
            }
        }
        else if (this.currentFacingDirection === right) {
            const levelWidth = this.tileMapHandler.levelWidth;
            for (let x = this.initialX + 1; x < levelWidth - 1; x++) {
                this.handleSingleLaserPos(x, this.initialY, allowedTileValues);
            }
        }
        else if (this.currentFacingDirection === bottom) {
            const levelHeight = this.tileMapHandler.levelHeight;
            allowedTileValues = [0];
            for (var y = this.initialY + 1; y < levelHeight - 1; y++) {
                this.handleSingleLaserPos(this.initialX, y, allowedTileValues);
            }
        }
        else {
            for (let x = this.initialX - 1; x > 0; x--) {
                this.handleSingleLaserPos(x, this.initialY, allowedTileValues);
            }
        }
    }
    draw(spriteCanvas) {
        super.drawWithSquishing(spriteCanvas);
        if (Game.playMode === Game.BUILD_MODE) {
            return null;
        }
        if (this.currentTimer === this.possilbeTimers.laserTimer) {
            if (this.currentLaserFrame === 0) {
                AnimationHelper.setSquishValues(this, this.tileSize * 1.2, this.tileSize * 0.8, 5, this.currentFacingDirection);
            }
            this.handleLasers();
            this.currentLaserFrame++;
            if (this.currentLaserFrame === this.this_array[SpritePixelArrays.changeableAttributeTypes.laserDuration]) {
                if (this.this_array[SpritePixelArrays.changeableAttributeTypes.pauseDuration] > 0) {
                    this.currentTimer = this.possilbeTimers.pauseTimer;
                    this.currentPauseFrame = 0;
                    this.createdLasers = [];
                }
                else {
                    this.resetObject();
                }
            }
        }
        else if (this.currentTimer === this.possilbeTimers.pauseTimer) {
            this.currentPauseFrame++;
            if (this.currentPauseFrame === this.this_array[SpritePixelArrays.changeableAttributeTypes.pauseDuration]) {
                this.currentTimer = this.possilbeTimers.laserTimer;
                this.currentLaserFrame = 0;
            }
        }
    }
}
class Laser extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tileMapHandler, facingDirection = {}, lifeTime = 0, pauseTime = 0, laserId = "") {
        const hitBoxOffset = -tileSize / 6;
        super(x, y, tileSize, type, hitBoxOffset, { currentFacingDirection: facingDirection });
        this.tileMapHandler = tileMapHandler;
        this.currentLifeTime = lifeTime;
        this.totalLifeTime = lifeTime;
        this.pauseTime = pauseTime;
        this.laserId = laserId;
        this.blinkingAllowed = this.totalLifeTime > 10 && this.pauseTime > 0;
        this.key = TilemapHelpers.makeid(5);
    }
    collisionEvent() {
        PlayMode.playerDeath();
    }
    draw() {
        this.currentLifeTime--;
        const blinking = this.blinkingAllowed && this.currentLifeTime < 20 && this.currentLifeTime % 10 > 7;
        !blinking && super.draw(spriteCanvas);
        if (this.currentLifeTime === 0) {
            this.deleteObjectFromLevel(this.tileMapHandler, false);
        }
    }
}
class BarrelCannon extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, -4, extraAttributes);
        this.tilemapHandler = tilemapHandler;
        this.player = this.tilemapHandler.player;
        this.upButtonReleased = false;
        this.speed = 6;
    }
    setPlayerFlyingAttributes() {
        this.player.invisible = false;
        this.player.fixedSpeed = true;
        SFXHandler.createSFX(this.player.x, this.player.y, 1);
        SoundHandler.barrel.stopAndPlay();
    }
    setPlayerFlying() {
        if (this.currentFacingDirection === AnimationHelper.facingDirections.left) {
            this.player.x = this.x - this.tilemapHandler.tileSize;
            this.player.xspeed = this.speed * -1;
            this.setPlayerFlyingAttributes();
        }
        else if (this.currentFacingDirection === AnimationHelper.facingDirections.top) {
            this.player.y = this.y - this.tilemapHandler.tileSize;
            this.player.yspeed = this.speed * -1;
            this.setPlayerFlyingAttributes();
        }
        else if (this.currentFacingDirection === AnimationHelper.facingDirections.right) {
            this.player.x = this.x + this.tilemapHandler.tileSize;
            this.player.xspeed = this.speed;
            this.setPlayerFlyingAttributes();
        }
        else {
            this.player.y = this.y + this.tilemapHandler.tileSize;
            this.player.yspeed = this.speed;
            this.setPlayerFlyingAttributes();
        }
    }
    collisionEvent() {
        this.player.x = this.x;
        this.player.y = this.y;
        this.player.resetAttributes(false);
        this.player.jumpPressedToTheMax = true;
        this.player.invisible = Game.playMode === Game.PLAY_MODE;
        if (this.upButtonReleased && Controller.jump) {
            AnimationHelper.setSquishValues(this, this.tileSize * 1.2, this.tileSize * 0.8, 5, this.currentFacingDirection);
            this.setPlayerFlying();
            this.upButtonReleased = false;
        }
        if (!Controller.jump) {
            this.upButtonReleased = true;
        }
    }
    draw(spriteCanvas) {
        super.drawWithSquishing(spriteCanvas);
    }
}
class Stomper extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, -1, extraAttributes);
        this.goingBack = false;
        this.active = false;
        this.tilemapHandler = tilemapHandler;
        this.distanceToCheckCollission = tileSize / 2;
        this.speed = 6;
        this.pauseFrames = 20;
        this.currentPauseFrame = 0;
        this.yCheckDistance = this.distanceToCheckCollission;
        this.xCheckDistance = 0;
        this.yspeed = this.speed;
        this.xspeed = 0;
        //can't pass through other stompers
        this.unpassableObjects = [ObjectTypes.STOMPER];
        this.key = this.makeid(5);
        this.resetObject();
        this.handleFacingDirection();
    }
    collisionEvent() {
        PlayMode.playerDeath();
    }
    turnObject() {
        super.turnObject();
        this.handleFacingDirection();
        this.BuildMode.rearrangeLevelObjectsByXAndYPos();
    }
    updateMovingValues(yCheckDistance, yspeed, xCheckDistance, xspeed) {
        this.yCheckDistance = yCheckDistance;
        this.yspeed = yspeed;
        this.xCheckDistance = xCheckDistance;
        this.xspeed = xspeed;
    }
    handleFacingDirection() {
        if (this.currentFacingDirection === AnimationHelper.facingDirections.bottom) {
            this.updateMovingValues(Math.abs(this.distanceToCheckCollission), Math.abs(this.speed), 0, 0);
        }
        else if (this.currentFacingDirection === AnimationHelper.facingDirections.left) {
            this.updateMovingValues(0, 0, -Math.abs(this.distanceToCheckCollission), -Math.abs(this.speed));
        }
        else if (this.currentFacingDirection === AnimationHelper.facingDirections.top) {
            this.updateMovingValues(-Math.abs(this.distanceToCheckCollission), -Math.abs(this.speed), 0, 0);
        }
        else if (this.currentFacingDirection === AnimationHelper.facingDirections.right) {
            this.updateMovingValues(0, 0, Math.abs(this.distanceToCheckCollission), Math.abs(this.speed));
        }
    }
    getCenterPosition() {
        return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }
    checkIfSwitchWasHit() {
        let positionToCheck = this.getCenterPosition();
        if (this.currentFacingDirection === AnimationHelper.facingDirections.bottom) {
            positionToCheck.y = positionToCheck.y + this.tileSize;
        }
        else if (this.currentFacingDirection === AnimationHelper.facingDirections.left) {
            positionToCheck.x = positionToCheck.x - this.tileSize;
        }
        else if (this.currentFacingDirection === AnimationHelper.facingDirections.top) {
            positionToCheck.y = positionToCheck.y - this.tileSize;
        }
        else if (this.currentFacingDirection === AnimationHelper.facingDirections.right) {
            positionToCheck.x = positionToCheck.x + this.tileSize;
        }
        this.tilemapHandler.levelObjects.forEach((levelObject) => {
            if (levelObject.type === ObjectTypes.RED_BLUE_BLOCK_SWITCH
                && Collision.pointAndObjectColliding(positionToCheck, levelObject)) {
                levelObject.switchWasHit(this.currentFacingDirection);
            }
        });
    }
    resetObject() {
        this.resetAttributes();
        this.x = this.initialX * this.tileSize;
        this.y = this.initialY * this.tileSize;
        this.resetSpeed();
    }
    resetAttributes() {
        this.goingBack = false;
        this.active = false;
        this.currentPauseFrame = 0;
    }
    checkIfTileFree(x, y) {
        const currentTile = tileMapHandler.getTileLayerValueByIndex(tileMapHandler.getTileValueForPosition(y), tileMapHandler.getTileValueForPosition(x));
        if (this.currentFacingDirection === AnimationHelper.facingDirections.top && !this.goingBack) {
            return currentTile === 0 || currentTile === 5;
        }
        return currentTile === 0;
    }
    checkIfPlayerInTheWay() {
        const startX = this.x + this.distanceToCheckCollission;
        const startY = this.y + this.distanceToCheckCollission;
        //check 200 times if player or a solid tile is in the way. 200 because max level width and height are 99. checkdistance is half a tile
        for (let i = 0; i < 200; i++) {
            const xPosToCheck = startX + i * this.xCheckDistance;
            const yPosToCheck = startY + i * this.yCheckDistance;
            if (Collision.pointAndObjectColliding({ x: xPosToCheck, y: yPosToCheck }, player)) {
                this.active = true;
                break;
            }
            if (!this.checkIfTileFree(xPosToCheck, yPosToCheck)) {
                break;
            }
        }
    }
    resetSpeed() {
        if (this.xspeed !== 0 && Math.abs(this.xspeed) !== this.speed
            || this.yspeed !== 0 && Math.abs(this.yspeed) !== this.speed) {
            this.handleFacingDirection();
        }
    }
    reduceSpeed() {
        this.xspeed = this.xspeed * -1 / 3;
        this.yspeed = this.yspeed * -1 / 3;
    }
    hitWall() {
        if (this.active && !this.goingBack && this.currentPauseFrame === 0) {
            AnimationHelper.setSquishValues(this, this.tileSize * 1.2, this.tileSize * 0.8, 7, this.currentFacingDirection);
            SFXHandler.createSFX(this.x + this.xspeed, this.y + this.yspeed, 1);
            this.currentPauseFrame = this.pauseFrames;
            this.checkIfSwitchWasHit();
            this.reduceSpeed();
        }
        else if (this.goingBack) {
            this.resetAttributes();
            this.resetSpeed();
        }
    }
    hitUnpassableObject(direction, objectCollidedWith) {
        const attacking = this.isAttacking(this);
        const otherObjectStill = this.isStill(objectCollidedWith);
        /*  !(attacking && objectCollidedWith.currentPauseFrame === 0 &&
            this.currentFacingDirection === objectCollidedWith.currentFacingDirection)*/
        if (attacking || (this.goingBack && otherObjectStill)) {
            this.hitWall();
        }
    }
    pauseAfterWallHit() {
        this.currentPauseFrame--;
        if (this.currentPauseFrame === 0) {
            this.goingBack = true;
        }
    }
    goBack() {
        CharacterCollision.checkTileCollisions(this);
        CharacterCollision.checkMovementBasedObjectCollission(this);
        if (this.goingBack) {
            switch (this.currentFacingDirection) {
                case AnimationHelper.facingDirections.bottom:
                    this.y + this.yspeed < this.initialY * this.tileSize && this.resetObject();
                    break;
                case AnimationHelper.facingDirections.top:
                    this.y + this.yspeed > this.initialY * this.tileSize && this.resetObject();
                    break;
                case AnimationHelper.facingDirections.left:
                    this.x + this.xspeed > this.initialX * this.tileSize && this.resetObject();
                    break;
                case AnimationHelper.facingDirections.right:
                    this.x + this.xspeed < this.initialX * this.tileSize && this.resetObject();
            }
        }
    }
    drawSprite(spriteCanvas, secondSprite = false) {
        const showSecond = secondSprite && this?.spriteObject?.[0].animation.length > 1;
        super.drawSingleSquishingFrame(spriteCanvas, showSecond ? this.canvasXSpritePos + this.tileSize : this.canvasXSpritePos);
    }
    stomperActive() {
        CharacterCollision.checkTileCollisions(this);
        CharacterCollision.checkMovementBasedObjectCollission(this);
    }
    isStill(obj) {
        return !obj.active && !obj.goingBack;
    }
    isAttacking(obj) {
        return obj.active && !obj.goingBack && obj.currentPauseFrame === 0;
    }
    draw(spriteCanvas) {
        if (this.isStill(this)) {
            Game.playMode === Game.PLAY_MODE && this.checkIfPlayerInTheWay();
            this.drawSprite(spriteCanvas);
        }
        else if (this.isAttacking(this)) {
            Game.playMode === Game.PLAY_MODE && this.stomperActive();
            this.drawSprite(spriteCanvas, true);
        }
        else if (this.currentPauseFrame > 0) {
            Game.playMode === Game.PLAY_MODE && this.pauseAfterWallHit();
            this.drawSprite(spriteCanvas);
        }
        else if (this.goingBack) {
            Game.playMode === Game.PLAY_MODE && this.goBack();
            this.drawSprite(spriteCanvas);
        }
    }
}
class ToggleMine extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tileMapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, 0, extraAttributes);
        this.collidedFirstTime = true;
        this.currentPauseFrame = 0;
        this.resetObject();
        this.player = tileMapHandler.player;
        this.totalPauseFrames = 12;
    }
    collisionEvent() {
        if (!this.collidedFirstTime) {
            this.collidedFirstTime = true;
        }
        else if (this.deadly) {
            PlayMode.playerDeath();
        }
    }
    resetObject() {
        this.hitBoxOffset = Math.floor(-this.tileSize / 3);
        this.currentPauseFrame = 0;
        this.collidedFirstTime = false;
        this.deadly = false;
    }
    draw() {
        if (this.collidedFirstTime && !Collision.objectsColliding(this.player, this) && !(this.currentPauseFrame < this.totalPauseFrames)) {
            this.currentPauseFrame++;
        }
        if (this.currentPauseFrame >= this.totalPauseFrames && !this.deadly) {
            this.deadly = true;
            this.hitBoxOffset = Math.floor(-this.tileSize / 6);
        }
        super.drawSingleFrame(spriteCanvas, this.deadly ? this.canvasXSpritePos + this.tileSize : this.canvasXSpritePos);
    }
}
class RocketLauncher extends ShootingObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, tilemapHandler, extraAttributes);
        this.getShootFrames();
        this.resetObject();
        const angle = this.tileMapHandlerplayer ? MathHelpers.getAngle(this.tileMapHandlerplayer.x, this.tileMapHandler.player.y, this.x, this.y) : 0;
        this.seeingPlayer = TilemapHelpers.doTwoObjectsSeeEachOther(this, player, this.tileMapHandler, angle);
    }
    resetObject() {
        this.currentShootCounter = 0;
        this.currentShootCounterWhileInactive = this.shootFrames[0];
        this.active = false;
    }
    collisionEvent() {
    }
    draw(spriteCanvas) {
        if (Game.playMode === Game.PLAY_MODE) {
            const angle = this.tileMapHandler.player ? MathHelpers.getAngle(this.tileMapHandler.player.x, this.tileMapHandler.player.y, this.x, this.y) : 0;
            //Check if rocket launcher sees player only every x frames because it's cost-intensive
            if (this.tileMapHandler?.currentGeneralFrameCounter % 6 === 0) {
                this.seeingPlayer = TilemapHelpers.doTwoObjectsSeeEachOther(this, player, this.tileMapHandler, angle);
            }
            if (this.active) {
                this.currentShootCounter++;
                if (!this.seeingPlayer) {
                    this.active = false;
                    if (this.currentShootCounterWhileInactive === this.shootFrames[0]) {
                        this.currentShootCounterWhileInactive = 0;
                    }
                }
                if (this.currentShootCounter === this.shootFrames[0]) {
                    this.currentShootCounter = 0;
                    this.shoot(angle);
                }
            }
            else {
                if (this.seeingPlayer) {
                    this.active = true;
                    this.currentShootCounter = 0;
                    if (this.currentShootCounterWhileInactive === this.shootFrames[0]) {
                        this.shoot(angle);
                    }
                }
                if (this.currentShootCounterWhileInactive < this.shootFrames[0]) {
                    this.currentShootCounterWhileInactive++;
                }
            }
            this.spriteObject?.[0].rotateable ? super.drawWithRotation(spriteCanvas, MathHelpers.getRadians(angle)) : super.drawWithSquishing(spriteCanvas);
        }
        else {
            super.draw(spriteCanvas);
        }
    }
    shoot(angle) {
        this.currentShootCounter = 0;
        const rocket = new Rocket(this.x / this.tileSize, this.y / this.tileSize, this.tileSize, ObjectTypes.ROCKET, this.tileMapHandler, this.this_array[SpritePixelArrays.changeableAttributeTypes.speed], angle, this.this_array[SpritePixelArrays.changeableAttributeTypes.rotationSpeed]);
        this.tileMapHandler.levelObjects.push(rocket);
        AnimationHelper.setSquishValues(this, this.tileSize * 1.2, this.tileSize * 0.8, 5, AnimationHelper.facingDirections.left);
    }
}
class Rocket extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tileMapHandler, speed = 3, angle = 0, rotationSpeed = undefined) {
        const hitBoxOffset = -tileSize / 6;
        super(x, y, tileSize, type, hitBoxOffset);
        this.tileMapHandler = tileMapHandler;
        this.movingSpeed = speed;
        this.key = this.makeid(5);
        this.angle = angle;
        this.rotationSpeed = rotationSpeed;
        this.rotationCounter = 0;
        this.maxRotationCounter = 3;
        this.setInitialPosition();
    }
    setInitialPosition() {
        const radians = MathHelpers.getRadians(this.angle);
        this.x -= Math.cos(radians) * (this.tileSize / 2);
        this.y -= Math.sin(radians) * (this.tileSize / 2);
    }
    collisionEvent() {
        PlayMode.playerDeath();
    }
    checkIfRotationClockWiseFaster(currentAngle, targetAngle) {
        let aroundTheClockFaster = false;
        if (currentAngle > targetAngle) {
            const counterClockWiseDistance = currentAngle - targetAngle;
            const clockWiseDistance = 360 - counterClockWiseDistance;
            if (clockWiseDistance < counterClockWiseDistance) {
                aroundTheClockFaster = true;
            }
        }
        return (currentAngle < targetAngle && targetAngle - currentAngle < 180) || aroundTheClockFaster;
    }
    checkCornerCollission(corners, tiles) {
        const foundSolidTileInCollission = corners.find((corner) => {
            const xPos = this.tileMapHandler.getTileValueForPosition(corner.x);
            const yPos = this.tileMapHandler.getTileValueForPosition(corner.y);
            const cornerTile = this.tileMapHandler.getTileLayerValueByIndex(yPos, xPos);
            if (cornerTile === ObjectTypes.SPECIAL_BLOCK_VALUES.redBlueSwitch) {
                const switchBlock = this.tileMapHandler.levelObjects.find((levelObject) => levelObject.initialX === xPos && levelObject.initialY === yPos);
                switchBlock && switchBlock.switchWasHit();
            }
            return !tiles.includes(cornerTile);
        });
        if (foundSolidTileInCollission) {
            this.deleteObjectFromLevel(this.tileMapHandler);
            return true;
        }
        return false;
    }
    draw(spriteCanvas) {
        this.rotationCounter++;
        const newAngle = this.tileMapHandler?.player ?
            MathHelpers.getAngle(this.tileMapHandler.player.x, this.tileMapHandler.player.y, this.x, this.y) : 0;
        if (this.rotationCounter > this.maxRotationCounter) {
            this.rotationCounter = 0;
            if (Math.abs(newAngle - this.angle) < this.rotationSpeed) {
                this.angle = newAngle;
            }
            else {
                this.angle = MathHelpers.normalizeAngle(this.checkIfRotationClockWiseFaster(this.angle, newAngle) ?
                    this.angle + this.rotationSpeed : this.angle - this.rotationSpeed);
            }
        }
        const radians = MathHelpers.getRadians(this.angle);
        const left = this.x - Math.cos(radians) * this.movingSpeed;
        const top = this.y - Math.sin(radians) * this.movingSpeed;
        const right = left + this.tileSize;
        const bottom = top + this.tileSize;
        const cornerHitBox = 2;
        const corners = [
            { x: left + cornerHitBox, y: top + cornerHitBox },
            { x: right - cornerHitBox, y: top + cornerHitBox },
            { x: right - cornerHitBox, y: bottom - cornerHitBox },
            { x: left + cornerHitBox, y: bottom - cornerHitBox }
        ];
        if (!this.checkCornerCollission(corners, this.angle <= 200 || this.angle >= 340 ? [0, 5] : [0])) {
            super.drawWithRotation(spriteCanvas, radians);
            this.x = left;
            this.y = top;
        }
    }
}
class SwitchableBlock extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tilemapHandler, color = {}, extraAttributes = {}) {
        super(x, y, tileSize, type, -4, extraAttributes);
        this.active = false;
        this.tilemapHandler = tilemapHandler;
        this.color = color;
        this.activeTileIndex = ObjectTypes.SPECIAL_BLOCK_VALUES.switchableBlock;
    }
    setBlockState(tileIndex, activeState) {
        this.tilemapHandler.tileMap[this.y / this.tileSize][this.x / this.tileSize] = tileIndex;
        this.active = activeState;
        this.checkIfPlayerIsInTheWay(activeState);
    }
    checkIfPlayerIsInTheWay(activeState) {
        if (activeState) {
            const { top, right, bottom, left } = this.tilemapHandler.player;
            const positions = [{ y: top, x: right }, { y: top, x: left }, { y: bottom, x: right }, { y: bottom, x: left }];
            const playerAtPosition = positions.find(position => position.x === this.initialX && position.y === this.initialY);
            if (playerAtPosition && Collision.objectsColliding(this.tilemapHandler.player, this)) {
                PlayMode.playerDeath();
            }
        }
    }
    switchActiveState(tileIndex, activeState) {
        this.setBlockState(tileIndex, activeState);
        //Check if colliding with canons at the moment where block became solid.
        //That's more performant than checking if canon collides with it all the time
        this.tilemapHandler.levelObjects.forEach((levelObject) => {
            if ((levelObject.type === ObjectTypes.CANON_BALL || levelObject.type === ObjectTypes.ROCKET || levelObject.type === ObjectTypes.LASER) && Collision.objectsColliding(levelObject, this)) {
                levelObject.deleteObjectFromLevel(this.tilemapHandler);
            }
        });
    }
    switchChanged(color) {
        color === this.color ? this.switchActiveState(this.activeTileIndex, true) : this.switchActiveState(0, false);
    }
    collisionEvent() {
    }
    draw(spriteCanvas) {
        super.drawSingleFrame(spriteCanvas, this.active ? this.canvasXSpritePos : this.canvasXSpritePos + this.tileSize);
    }
}
class RedBlueSwitch extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, 2, extraAttributes);
        this.tilemapHandler = tilemapHandler;
        this.collided = false;
        this.bottomLineHitBox = { x: this.x, y: this.y + this.height, width: this.width, height: 2 };
        this.checkOtherSwitchesCurrentColor();
        this.tilemapHandler.tileMap[this.y / this.tileSize][this.x / this.tileSize] = ObjectTypes.SPECIAL_BLOCK_VALUES.redBlueSwitch;
        this.key = this.makeid(5);
    }
    checkOtherSwitchesCurrentColor() {
        const result = this?.tilemapHandler?.levelObjects && this.tilemapHandler.levelObjects.find((levelObject) => levelObject.type === ObjectTypes.RED_BLUE_BLOCK_SWITCH);
        this.currentlyActiveColor = result?.currentlyActiveColor ? result.currentlyActiveColor : AnimationHelper.switchableBlockColors.red;
    }
    collisionEvent() {
        if (!this.collided) {
            if (player.yspeed <= 0 &&
                (player?.top_right_pos && Collision.pointAndObjectColliding(player.top_right_pos, this.bottomLineHitBox) ||
                    player?.top_left_pos && Collision.pointAndObjectColliding(player.top_left_pos, this.bottomLineHitBox))) {
                this.switchWasHit();
            }
        }
    }
    resetObject() {
        if (this.tilemapHandler && !PlayMode.checkActiveCheckPoints()) {
            this.currentlyActiveColor = AnimationHelper.switchableBlockColors.red;
        }
    }
    switchWasHit(direction = AnimationHelper.facingDirections.top) {
        let squishWidth = this.tileSize * 1.2;
        let squishHeight = this.tileSize * 0.8;
        AnimationHelper.setSquishValues(this, squishWidth, squishHeight, 5, direction);
        const { red, blue } = AnimationHelper.switchableBlockColors;
        this.currentlyActiveColor = this.currentlyActiveColor === red ? blue : red;
        this.collided = true;
        this?.tilemapHandler?.levelObjects && this.tilemapHandler.levelObjects.forEach((levelObject) => {
            if (levelObject.type === ObjectTypes.RED_BLUE_BLOCK_SWITCH && levelObject.key !== this.key) {
                levelObject.collided = true;
                levelObject.currentlyActiveColor = this.currentlyActiveColor;
                AnimationHelper.setSquishValues(levelObject, squishWidth, squishHeight, 5, direction);
            }
            else if (levelObject.type === ObjectTypes.RED_BLOCK || levelObject.type === ObjectTypes.BLUE_BLOCK) {
                levelObject.switchChanged(this.currentlyActiveColor);
            }
        });
    }
    draw(spriteCanvas) {
        if (this.collided && !Collision.objectsColliding(player, this)) {
            this.collided = false;
        }
        const showSecond = this.currentlyActiveColor === AnimationHelper.switchableBlockColors.blue;
        super.drawSingleSquishingFrame(spriteCanvas, showSecond ? this.canvasXSpritePos + this.tileSize : this.canvasXSpritePos);
    }
}
class RedBlock extends SwitchableBlock {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, tilemapHandler, AnimationHelper.switchableBlockColors.red, extraAttributes);
        this.setBlockState(this.activeTileIndex, true);
        this.checkCurrentlyActiveBlock();
    }
    resetObject() {
        if (this.tilemapHandler && !PlayMode.checkActiveCheckPoints()) {
            this.setBlockState(this.activeTileIndex, true);
        }
    }
    checkCurrentlyActiveBlock() {
        const result = this?.tilemapHandler?.levelObjects && this.tilemapHandler.levelObjects.find((levelObject) => levelObject.type === ObjectTypes.RED_BLUE_BLOCK_SWITCH);
        if (!result) {
            this.setBlockState(this.activeTileIndex, true);
        }
        else if (result.currentlyActiveColor === this.color) {
            this.setBlockState(this.activeTileIndex, true);
        }
        else {
            this.setBlockState(0, false);
        }
    }
    collisionEvent() {
    }
}
class BlueBlock extends SwitchableBlock {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, tilemapHandler, AnimationHelper.switchableBlockColors.blue, extraAttributes);
        this.setBlockState(0, false);
        this.checkCurrentlyActiveBlock();
    }
    resetObject() {
        if (this.tilemapHandler && !PlayMode.checkActiveCheckPoints()) {
            this.setBlockState(0, false);
        }
    }
    checkCurrentlyActiveBlock() {
        const result = this?.tilemapHandler?.levelObjects && this.tilemapHandler.levelObjects.find((levelObject) => levelObject.type === ObjectTypes.RED_BLUE_BLOCK_SWITCH);
        if (result?.currentlyActiveColor === this.color) {
            this.setBlockState(this.activeTileIndex, true);
        }
    }
    collisionEvent() {
    }
}
class DisappearingBlock extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tileMapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, 2, extraAttributes);
        this.collidedWithPlayer = false;
        this.currentDisappearingFrame = 0;
        this.tileMapHandler = tileMapHandler;
        this.player = tileMapHandler.player;
        this.disappearingFrameAmount = 200;
        this.blockNotSolidAt = 40;
        this.disappearingStepsAmount = 4;
        this.disappearingFrameSteps = this.blockNotSolidAt / this.disappearingStepsAmount;
        this.disappearingBoxHeight = this.tileSize / this.disappearingStepsAmount;
        this.resetObject();
    }
    collisionEvent() {
        this.collidedWithPlayer = true;
    }
    resetObject() {
        this.tileMapHandler.tileMap[this.y / this.tileSize][this.x / this.tileSize] = ObjectTypes.SPECIAL_BLOCK_VALUES.disappearingBlock;
        this.currentDisappearingFrame = 0;
        this.collidedWithPlayer = false;
    }
    draw(spriteCanvas) {
        if (this.collidedWithPlayer) {
            this.currentDisappearingFrame++;
            let currentDisappearingDrawFrame = Math.floor((this.blockNotSolidAt - this.currentDisappearingFrame)
                / this.disappearingFrameSteps);
            if (currentDisappearingDrawFrame <= 0) {
                currentDisappearingDrawFrame = 0;
            }
            const currentHeight = currentDisappearingDrawFrame * this.disappearingBoxHeight;
            Display.drawImage(spriteCanvas, 0, this.canvasYSpritePos, this.tileSize, currentHeight, this.x, this.y, this.tileSize, currentHeight);
            if (this.currentDisappearingFrame === this.blockNotSolidAt) {
                this.tileMapHandler.tileMap[this.y / this.tileSize][this.x / this.tileSize] = 0;
            }
            if (this.currentDisappearingFrame >= this.disappearingFrameAmount) {
                let currentlyCollidingWithInteractiveObject = false;
                if (Collision.objectsColliding(this.player, this)) {
                    currentlyCollidingWithInteractiveObject = true;
                }
                this.tileMapHandler.levelObjects.forEach((levelObject) => {
                    if (levelObject?.type === ObjectTypes.STOMPER && (levelObject.active || levelObject.goingBack)) {
                        if (Collision.objectsColliding(levelObject, this)) {
                            currentlyCollidingWithInteractiveObject = true;
                        }
                    }
                });
                !currentlyCollidingWithInteractiveObject && this.resetObject();
            }
        }
        else {
            super.draw(spriteCanvas);
        }
    }
}
class Portal extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        const hitBoxOffset = -tileSize / 3;
        super(x, y, tileSize, type, hitBoxOffset);
        this.squishXOffset = 0;
        this.squishYOffset = 0;
        this.tilemapHandler = tilemapHandler;
        this.portalTypes = { blue: "blue", orange: "orange" };
        this.portalType = this.portalTypes.blue;
        this.active = true;
        this.maxInactiveFrames = 60;
        this.currentInactiveFrame = this.maxInactiveFrames;
        this.key = this.makeid(5);
        this.touchingPlayer = false;
        const portalsInLevel = this.tilemapHandler.filterObjectsByTypes([ObjectTypes.PORTAL, ObjectTypes.PORTAL2]);
        if (portalsInLevel.length % 2 !== 0 || (extraAttributes && extraAttributes?.portalType === this.portalTypes.orange)) {
            this.setSpriteAttributes(ObjectTypes.PORTAL2);
            this.portalType = this.portalTypes.orange;
        }
        this.updatePortalInWorldDataHandler();
    }
    updatePortalInWorldDataHandler() {
        const currentLevelObjects = WorldDataHandler.levels[this.tilemapHandler.currentLevel].levelObjects;
        for (var i = 0; i < currentLevelObjects.length; i++) {
            if (currentLevelObjects[i].x === this.initialX && currentLevelObjects[i].y === this.initialY) {
                currentLevelObjects[i].extraAttributes = { portalType: this.portalType };
            }
        }
    }
    findOtherExit() {
        const portalsInLevel = this.tilemapHandler.filterObjectsByTypes([ObjectTypes.PORTAL, ObjectTypes.PORTAL2]);
        let indexOfCurrentPortal = portalsInLevel.findIndex((portalInArray) => portalInArray.key === this.key);
        let otherExit;
        if (this.portalType === this.portalTypes.blue && portalsInLevel[indexOfCurrentPortal + 1]) {
            otherExit = portalsInLevel[indexOfCurrentPortal + 1];
        }
        else if (this.portalType === this.portalTypes.orange && portalsInLevel[indexOfCurrentPortal - 1]) {
            otherExit = portalsInLevel[indexOfCurrentPortal - 1];
        }
        return otherExit;
    }
    collisionEvent() {
        this.touchingPlayer = true;
        if (this.active && !this.touchingOtherPortals()) {
            AnimationHelper.setSquishValues(this, this.tileSize * 1.2, this.tileSize * 0.8, 5, this.currentFacingDirection);
            this.setToInactive();
            const otherExit = this.findOtherExit();
            if (otherExit) {
                otherExit.setToInactive();
                this.tilemapHandler.player.x = otherExit.x + 2;
                this.tilemapHandler.player.y = otherExit.y + 2;
                otherExit.touchingPlayer = true;
                AnimationHelper.setSquishValues(otherExit, this.tileSize * 1.2, this.tileSize * 0.8, 5, this.currentFacingDirection);
            }
        }
    }
    touchingOtherPortals() {
        return this.tilemapHandler.levelObjects.find((levelObject) => levelObject.type === ObjectTypes.PORTAL && levelObject.key !== this.key && levelObject.touchingPlayer);
    }
    setToInactive() {
        this.currentInactiveFrame = 0;
        this.active = false;
    }
    draw(spriteCanvas) {
        if (this.touchingPlayer && !Collision.objectsColliding(this.tilemapHandler.player, this)) {
            this.touchingPlayer = false;
        }
        if (this.currentInactiveFrame < this.maxInactiveFrames) {
            AnimationHelper.checkSquishUpdate(this);
            Display.drawImageWithAlpha(spriteCanvas, this.canvasXSpritePos, this.canvasYSpritePos, this.tileSize, this.tileSize, this.x - this.squishXOffset, this.y - this.squishYOffset, this.drawWidth, this.drawHeight, 0.5);
            if (this.currentInactiveFrame === this.maxInactiveFrames - 1) {
                this.active = true;
            }
            this.currentInactiveFrame++;
        }
        else {
            super.draw(spriteCanvas);
        }
    } /*
    drawWidth(spriteCanvas: any, canvasXSpritePos: number | undefined, canvasYSpritePos: number | undefined, tileSize: any, tileSize1: any, arg5: number, arg6: number, drawWidth: any, drawHeight: any, arg9: number) {
        throw new Error("Method not implemented.");
    }
    drawHeight(spriteCanvas: any, canvasXSpritePos: number | undefined, canvasYSpritePos: number | undefined, tileSize: any, tileSize1: any, arg5: number, arg6: number, drawWidth: any, drawHeight: any, arg9: number) {
        throw new Error("Method not implemented.");
    }*/
}
class Collectible extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, 2, extraAttributes);
        this.tileMapHandler = tilemapHandler;
        this.touched = false;
        this.hide = false;
    }
    resetObject() {
        this.hide = false;
        this.touched = false;
    }
    collisionEvent() {
        if (!this.touched && !this.collected) {
            this.playCorrectSound();
            this.touched = true;
            SFXHandler.createSFX(this.x, this.y, 4);
            AnimationHelper.setSquishValues(this, this.tileSize * 1.2, this.tileSize * 0.8, 8, AnimationHelper.facingDirections.left);
            if (undefined) {
                this.hide = true;
            }
            else {
                this.setPersistentAttribute();
            }
        }
    }
    playCorrectSound() {
        const finishFlags = this.tileMapHandler.filterObjectsByTypes(ObjectTypes.FINISH_FLAG);
        const finishFlagsNeedingCoins = finishFlags.some((finishFlag) => finishFlag.collectiblesNeeded);
        if (finishFlagsNeedingCoins) {
            const collectibles = undefined ? this.tileMapHandler.filterObjectsByTypes(ObjectTypes.COLLECTIBLE) :
                WorldDataHandler.levels[this.tileMapHandler.currentLevel].levelObjects.filter((levelObject) => levelObject.type === ObjectTypes.COLLECTIBLE);
            const untouchedCollectibles = undefined ? collectibles.filter((collectible) => !collectible.touched || collectible.collected) :
                collectibles.filter((collectible) => !collectible.extraAttributes.collected);
            untouchedCollectibles.length === 1 ? SoundHandler.allCoinsCollected.stopAndPlay() : SoundHandler.pickup.play();
        }
        else {
            SoundHandler.pickup.stopAndPlay();
        }
    }
    setPersistentAttribute() {
        WorldDataHandler.levels[this.tileMapHandler.currentLevel].levelObjects.forEach((levelObject) => {
            if (levelObject.x === this.initialX && levelObject.y === this.initialY && levelObject.type === this.type) {
                levelObject.extraAttributes = { collected: true };
            }
        });
        this.collected = true;
    }
    draw(spriteCanvas) {
        if (this.hide || this.collected) {
            super.drawWithAlpha(spriteCanvas, 0.1);
        }
        else {
            super.draw(spriteCanvas);
        }
    }
}
class JumpReset extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, -2, extraAttributes);
        this.tileMapHandler = tilemapHandler;
        this.touched = false;
        this.currentResetTimer = 0;
        this.resetAfterFrames = 120;
    }
    resetObject() {
        this.touched = false;
    }
    collisionEvent() {
        if (!this.touched) {
            player.doubleJumpUsed = false;
            player.temporaryDoubleJump = true;
            SoundHandler.jumpReset.stopAndPlay();
            this.touched = true;
        }
    }
    draw(spriteCanvas) {
        if (this.touched) {
            super.drawWithAlpha(spriteCanvas, 0.1);
            this.currentResetTimer++;
            if (this.currentResetTimer === this.resetAfterFrames) {
                this.currentResetTimer = 0;
                this.touched = false;
            }
        }
        else {
            super.draw(spriteCanvas);
        }
    }
}
class FixedSpeedRight extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tileMapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, 0, extraAttributes);
    }
    collisionEvent() {
        if (this.currentFacingDirection === AnimationHelper.facingDirections.right) {
            player.fixedSpeedLeft = false;
            player.fixedSpeedRight = true;
        }
        else {
            player.fixedSpeedLeft = true;
            player.fixedSpeedRight = false;
        }
    }
}
class FixedSpeedStopper extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, _ = null) {
        super(x, y, tileSize, type, 0);
    }
    collisionEvent() {
        player.fixedSpeedRight = false;
        player.fixedSpeedLeft = false;
    }
}
class Water extends InteractiveLevelObject {
    constructor(x, y, tileSize, type, tilemapHandler, extraAttributes = {}) {
        super(x, y, tileSize, type, 0, extraAttributes);
        this.tilemapHandler = tilemapHandler;
    }
    collisionEvent() {
        const { player } = this.tilemapHandler;
        player.currentGravity = player.gravity / 10;
        player.currentWallJumpGravity = player.wallJumpGravity / 4;
        player.currentMaxFallSpeed = player.maxWaterFallSpeed;
        player.swimming = true;
        player.fixedSpeed = false;
        player.temporaryDoubleJump = false;
        player.resetDoubleJump();
        this.checkExactCornerCollision();
    }
    checkExactCornerCollision() {
        const { player } = this.tilemapHandler;
        //we need this initial check, because when the game starts, there are no edges yet. we check if one of the edges exists
        if (player.top_right_pos) {
            ["top_right_pos", "top_left_pos", "bottom_right_pos", "bottom_left_pos"].forEach(corner => {
                if (!player.this_array[corner + "_in_water"]) {
                    player.this_array[corner + "_in_water"] = Collision.pointAndObjectColliding(player.this_array[corner], this);
                }
            });
        }
    }
}
class Deko extends LevelObject {
    constructor(x, y, tileSize, index, _ = null, __ = null) {
        super(x, y, tileSize, ObjectTypes.DEKO);
        this.spriteIndex = SpritePixelArrays.getIndexOfSprite(this.type, index);
        this.spriteObject = [SpritePixelArrays.getSpritesByIndex(this.spriteIndex)];
        this.canvasYSpritePos = this.spriteIndex * this.tileSize;
    }
}
class SFX {
    constructor(x, y, tileSize, type = ObjectTypes.SFX, sfxIndex, direction = {}, xspeed = 0, yspeed = 0, reduceAlpha = false, animationLength = 8, growByTimes = 0) {
        this.x = x;
        this.y = y;
        this.width = tileSize;
        this.height = tileSize;
        this.type = type;
        this.tileSize = tileSize;
        this.xspeed = xspeed;
        this.yspeed = yspeed;
        this.spriteIndex = SpritePixelArrays.getIndexOfSprite(this.type, sfxIndex);
        const sprite = SpritePixelArrays.getSpritesByIndex(this.spriteIndex);
        this.animationFrames = sprite.animation.length;
        this.xCanvasOffset = 0;
        if (direction && sprite.directions) {
            this.xCanvasOffset = sprite.directions.indexOf(direction) * this.animationFrames * this.tileSize;
        }
        this.canvasYSpritePos = this.spriteIndex * this.tileSize;
        this.animationLength = animationLength;
        this.totalAnimationFrames = this.animationLength * this.animationFrames;
        this.currentFrame = 0;
        this.ended = false;
        this.alpha = 1;
        this.alphaReductionStep = 1 / (this.animationFrames * this.animationLength);
        this.reduceAlpha = reduceAlpha;
        this.growByTimes = growByTimes;
        this.growStep = 0;
        this.growAmountByStep = 0;
        if (this.growByTimes > 0) {
            const widthToGrow = this.width * this.growByTimes - this.width;
            this.growAmountByStep = widthToGrow / (this.animationFrames * this.animationLength);
        }
    }
    draw(spriteCanvas) {
        if (this.currentFrame < this.totalAnimationFrames) {
            this.x += this.xspeed;
            this.y += this.yspeed;
            this.alpha -= this.alphaReductionStep;
            if (this.growAmountByStep > 0) {
                this.width += this.growAmountByStep;
                this.height += this.growAmountByStep;
                this.x -= this.growAmountByStep / 2;
                this.y -= this.growAmountByStep / 2;
            }
            this.reduceAlpha ?
                Display.drawImageWithAlpha(spriteCanvas, Math.floor(this.currentFrame / this.animationLength) * this.tileSize + this.xCanvasOffset, this.canvasYSpritePos, this.tileSize, this.tileSize, this.x, this.y, this.width, this.height, this.alpha > 0 ? this.alpha : 0) :
                Display.drawImage(spriteCanvas, Math.floor(this.currentFrame / this.animationLength) * this.tileSize + this.xCanvasOffset, this.canvasYSpritePos, this.tileSize, this.tileSize, this.x, this.y, this.width, this.height);
            this.currentFrame++;
        }
        else {
            this.ended = true;
        }
    }
}
class SpriteSheetCreator {
    constructor(tileMapHandler, spriteCanvas) {
        this.tileMapHandler = tileMapHandler;
        this.spriteCanvas = spriteCanvas;
        this.spriteCanvasWidth = this.spriteCanvas.width;
        this.spriteCanvasHeight = this.spriteCanvas.height;
        this.flipDirection = { horizontally: "horizontally", vertically: "vertically" };
        this.spriteCtx = this.spriteCanvas.getContext("2d");
        this.setCanvasSize();
        this.createSpriteSheet();
    }
    setCanvasSize() {
        const { tileSize } = WorldDataHandler;
        //4 directions, 2 max frames, 12 just a buffer to make sure
        this.spriteCanvas.width = 4 * 2 * tileSize + 12;
        //all sprites + possible 18 custom sprites + 12 for buffer
        this.spriteCanvas.height = SpritePixelArrays.allSprites.length * tileSize + (18 * tileSize) + 12;
    }
    createSpriteSheet() {
        this.spriteCtx.clearRect(0, 0, this.spriteCanvasWidth, this.spriteCanvasHeight);
        SpritePixelArrays.allSprites.forEach((SpriteObject, spriteObjectIndex) => {
            if (SpriteObject.animation) {
                this.createSprite(SpriteObject, spriteObjectIndex);
            }
        });
    }
    redrawSprite(SpriteObject, spriteObjectIndex) {
        const { tileSize } = this.tileMapHandler;
        this.spriteCtx.clearRect(0, spriteObjectIndex * tileSize, this.spriteCanvasWidth, spriteObjectIndex * tileSize + tileSize);
        this.createSpriteSheet();
        //this.createSpriteSheet(SpriteObject, spriteObjectIndex)
    }
    createSprite(SpriteObject, spriteObjectIndex) {
        if (SpriteObject?.directions) {
            const { right, left, top, bottom } = AnimationHelper.facingDirections;
            if (SpriteObject.directions[0] === bottom || SpriteObject.directions[0] === top) {
                for (var i = 0; i < SpriteObject.directions.length; i++) {
                    if (SpriteObject.directions[i] === left) {
                        let flipppedSprite = i === 0 ? SpriteObject : this.turnSprite(SpriteObject);
                        this.drawAnimation(flipppedSprite.animation, spriteObjectIndex, i);
                    }
                    if (SpriteObject.directions[i] === top) {
                        const turnedSprite = i === 0 ? SpriteObject : this.flipSprite(SpriteObject, this.flipDirection.vertically);
                        this.drawAnimation(turnedSprite.animation, spriteObjectIndex, i);
                    }
                    if (SpriteObject.directions[i] === bottom) {
                        const turnedBottomSprite = i === 0 ? SpriteObject : this.flipSprite(SpriteObject, this.flipDirection.vertically);
                        this.drawAnimation(turnedBottomSprite.animation, spriteObjectIndex, i);
                    }
                    if (SpriteObject.directions[i] === right) {
                        const flipppedSprite = i === 0 ? SpriteObject : this.turnSprite(SpriteObject, true);
                        this.drawAnimation(flipppedSprite.animation, spriteObjectIndex, i);
                    }
                }
            }
            else {
                for (var i = 0; i < SpriteObject.directions.length; i++) {
                    if (SpriteObject.directions[i] === left) {
                        let flipppedSprite = i === 0 ? SpriteObject : this.flipSprite(SpriteObject, this.flipDirection.horizontally);
                        this.drawAnimation(flipppedSprite.animation, spriteObjectIndex, i);
                    }
                    if (SpriteObject.directions[i] === top) {
                        const turnedSprite = i === 0 ? SpriteObject : this.turnSprite(SpriteObject);
                        this.drawAnimation(turnedSprite.animation, spriteObjectIndex, i);
                    }
                    if (SpriteObject.directions[i] === bottom) {
                        const turnedBottomSprite = i === 0 ? SpriteObject : this.turnSprite(SpriteObject, true);
                        this.drawAnimation(turnedBottomSprite.animation, spriteObjectIndex, i);
                    }
                    if (SpriteObject.directions[i] === right) {
                        const flipppedSprite = i === 0 ? SpriteObject : this.flipSprite(SpriteObject, this.flipDirection.horizontally);
                        this.drawAnimation(flipppedSprite.animation, spriteObjectIndex, i);
                    }
                }
            }
        }
        else {
            this.drawAnimation(SpriteObject.animation, spriteObjectIndex);
        }
    }
    //loop variable is there, so you can add more sprite on the same y-axis (f.e. for flipped sprites)
    drawAnimation(animation, yIndex, loop = 0) {
        const { tileSize, pixelArrayUnitSize, pixelArrayUnitAmount } = this.tileMapHandler;
        animation.forEach((SpritePixelArray, spriteIndex) => {
            Display.drawPixelArray(SpritePixelArray.sprite, (spriteIndex + (animation.length * loop)) * tileSize, yIndex * tileSize, pixelArrayUnitSize, pixelArrayUnitAmount, this.spriteCtx);
        });
    }
    flipSprite(SpritePixelArrayAnimation, flipDirection) {
        let flippedAnimation = [];
        SpritePixelArrayAnimation.animation.map((animationFrame) => {
            if (flipDirection === this.flipDirection.horizontally) {
                let flippedSprite = this.hflip(animationFrame.sprite);
                flippedAnimation.push({ sprite: flippedSprite });
            }
            if (flipDirection === this.flipDirection.vertically) {
                let flippedSprite = this.vflip(animationFrame.sprite);
                flippedAnimation.push({ sprite: flippedSprite });
            }
        });
        let flippedSpriteObject = JSON.parse(JSON.stringify(SpritePixelArrayAnimation));
        flippedSpriteObject.animation = flippedAnimation;
        return flippedSpriteObject;
    }
    turnSprite(SpritePixelArrayAnimation, bigRotation = false) {
        let turnedAnimation = [];
        SpritePixelArrayAnimation.animation.map((animationFrame) => {
            var newArray = [];
            if (bigRotation) {
                newArray = this.rotate270(animationFrame.sprite);
            }
            if (!bigRotation) {
                newArray = this.rotate90(animationFrame.sprite);
            }
            turnedAnimation.push({ sprite: newArray });
        });
        let turnedSpriteObject = JSON.parse(JSON.stringify(SpritePixelArrayAnimation));
        turnedSpriteObject.animation = turnedAnimation;
        return turnedSpriteObject;
    }
    hflip(a) {
        const h = a.length;
        let b = new Array(h);
        for (let y = 0; y < h; y++) {
            let w = a[y].length;
            b[y] = new Array(w);
            b[y] = a[y].slice().reverse();
        }
        return b;
    }
    vflip(a) {
        const h = a.length;
        let b = new Array(h);
        for (let y = 0; y < h; y++) {
            let w = a[y].length;
            let n = h - 1 - y;
            b[n] = new Array(w);
            for (let x = 0; x < w; x++) {
                b[n][x] = a[y][x];
            }
        }
        return b;
    }
    rotate90(a) {
        const w = a.length;
        const h = a[0].length;
        let b = new Array(h);
        for (let y = 0; y < h; y++) {
            b[y] = new Array(w);
            for (let x = 0; x < w; x++) {
                b[y][x] = a[w - 1 - x][y];
            }
        }
        return b;
    }
    rotate270(a) {
        const w = a.length;
        const h = a[0].length;
        let b = new Array(h);
        for (let y = 0; y < h; y++) {
            b[y] = new Array(w);
            for (let x = 0; x < w; x++) {
                b[y][x] = a[x][h - 1 - y];
            }
        }
        return b;
    }
}
class ObjectTypes {
    static get SPIKE() {
        return 'spike';
    }
    static get TRAMPOLINE() {
        return 'trampoline';
    }
    static get FINISH_FLAG() {
        return 'finishFlag';
    }
    static get FINISH_FLAG_CLOSED() {
        return 'finishFlagClosed';
    }
    static get START_FLAG() {
        return 'startFlag';
    }
    static get PLAYER_IDLE() {
        return 'playerIdle';
    }
    static get PLAYER_JUMP() {
        return 'playerJump';
    }
    static get PLAYER_WALK() {
        return 'playerWalk';
    }
    static get DISAPPEARING_BLOCK() {
        return 'disappearingBlock';
    }
    static get CANON() {
        return 'canon';
    }
    static get CANON_BALL() {
        return 'canonBall';
    }
    static get LASER_CANON() {
        return 'laserCanon';
    }
    static get LASER() {
        return 'laser';
    }
    static get BARREL_CANNON() {
        return 'barrelCannon';
    }
    static get JUMP_RESET() {
        return 'jumpReset';
    }
    static get DEKO() {
        return 'deco';
    }
    static get SFX() {
        return 'sfx';
    }
    static get STOMPER() {
        return 'stomper';
    }
    static get ROCKET_LAUNCHER() {
        return 'rocketLauncher';
    }
    static get ROCKET() {
        return 'rocket';
    }
    static get PORTAL() {
        return 'portal';
    }
    static get PORTAL2() {
        return 'portal2';
    }
    static get CHECKPOINT() {
        return 'checkpoint';
    }
    static get RED_BLUE_BLOCK_SWITCH() {
        return 'redblueblockswitch';
    }
    static get RED_BLOCK() {
        return 'redBlock';
    }
    static get BLUE_BLOCK() {
        return 'blueBlock';
    }
    static get WATER() {
        return 'water';
    }
    static get FIXED_SPEED_RIGHT() {
        return 'fixedSpeedRight';
    }
    static get FIXED_SPEED_STOPPER() {
        return 'fixedSpeedStopper';
    }
    static get TOGGLE_MINE() {
        return 'toggleMine';
    }
    static get NPC() {
        return 'npc';
    }
    static get PATH() {
        return 'path';
    }
    static get PATH_POINT() {
        return 'pathPoint';
    }
    static get COLLECTIBLE() {
        return 'collectible';
    }
    static get SPECIAL_BLOCK_VALUES() {
        return {
            canon: 14,
            redBlueSwitch: 13,
            switchableBlock: 12,
            disappearingBlock: 11,
        };
    }
    ;
    static get objectToClass() {
        return {
            [this.SPIKE]: Spike,
            [this.FINISH_FLAG]: FinishFlag,
            [this.CHECKPOINT]: Checkpoint,
            [this.START_FLAG]: StartFlag,
            [this.TRAMPOLINE]: Trampoline,
            [this.NPC]: Npc,
            [this.DISAPPEARING_BLOCK]: DisappearingBlock,
            [this.DEKO]: Deko,
            [this.STOMPER]: Stomper,
            [this.CANON]: Canon,
            [this.CANON_BALL]: CanonBall,
            [this.LASER_CANON]: LaserCanon,
            [this.LASER]: Laser,
            [this.BARREL_CANNON]: BarrelCannon,
            [this.JUMP_RESET]: JumpReset,
            [this.SFX]: SFX,
            [this.RED_BLUE_BLOCK_SWITCH]: RedBlueSwitch,
            [this.RED_BLOCK]: RedBlock,
            [this.BLUE_BLOCK]: BlueBlock,
            [this.FIXED_SPEED_RIGHT]: FixedSpeedRight,
            [this.FIXED_SPEED_STOPPER]: FixedSpeedStopper,
            [this.WATER]: Water,
            [this.TOGGLE_MINE]: ToggleMine,
            [this.ROCKET_LAUNCHER]: RocketLauncher,
            [this.PORTAL]: Portal,
            [this.COLLECTIBLE]: Collectible
        };
    }
}
class SpritePixelArrays {
    ;
    static staticConstructor() {
        this.pathMovementMapper = {
            1: 1,
            2: 2,
            3: 3,
            4: 4,
            5: 6,
            6: 8,
            7: 12,
        };
        this.changeableAttributeFormElements = {
            toggle: "toggle",
        };
        this.changeableAttributeTypes = {
            frequency: "frequency",
            speed: "speed",
            dialogue: "dialogue",
            stopFrames: "stopFrames",
            movementDirection: "movementDirection",
            rotationSpeed: "rotationSpeed",
            collectiblesNeeded: "collectiblesNeeded",
            laserDuration: "laserDuration",
            pauseDuration: "pauseDuration"
        };
        this.backgroundSprites = [
            ObjectTypes.WATER,
        ];
        this.customType = "custom";
        this.TILE_1 = {
            name: 1,
            descriptiveName: "Left top",
            description: "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00"],
                        ["00AA00", "005500", "005500", "005500", "005500", "005500", "005500", "005500"],
                        ["AAFF55", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["00AA00", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["00AA00", "005500", "c26241", "c26241", "e1a45b", "e1a45b", "e1a45b", "e1a45b"],
                    ]
                }
            ]
        };
        this.TILE_2 = {
            name: 2,
            descriptiveName: "Middle top",
            description: "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00"],
                        ["005500", "005500", "005500", "005500", "005500", "005500", "005500", "005500"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["c26241", "c26241", "c26241", "c26241", "e1a45b", "e1a45b", "e1a45b", "e1a45b"],
                    ]
                }
            ]
        };
        this.TILE_3 = {
            name: 3,
            descriptiveName: "Right top",
            description: "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00"],
                        ["005500", "005500", "005500", "005500", "005500", "005500", "005500", "AAFF55"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "00AA00"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "AAFF55"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "00AA00"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "AAFF55"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "00AA00"],
                        ["c26241", "c26241", "c26241", "c26241", "e1a45b", "e1a45b", "005500", "AAFF55"],
                    ]
                }
            ]
        };
        this.TILE_4 = {
            name: 4,
            descriptiveName: "Left",
            description: "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["AAFF55", "005500", "fbe7cf", "fbe7cf", "eeb39e", "eeb39e", "eeb39e", "eeb39e"],
                        ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["AAFF55", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["00AA00", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["00AA00", "005500", "c26241", "c26241", "e1a45b", "e1a45b", "e1a45b", "e1a45b"],
                    ]
                }
            ]
        };
        this.TILE_6 = {
            name: 6,
            descriptiveName: "Middle",
            description: "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["fbe7cf", "fbe7cf", "fbe7cf", "fbe7cf", "eeb39e", "eeb39e", "eeb39e", "eeb39e"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["c26241", "c26241", "c26241", "c26241", "e1a45b", "e1a45b", "e1a45b", "e1a45b"],
                    ]
                }
            ]
        };
        this.TILE_7 = {
            name: 7,
            descriptiveName: "Right",
            description: "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["fbe7cf", "fbe7cf", "fbe7cf", "fbe7cf", "eeb39e", "eeb39e", "005500", "00AA00"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "AAFF55"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "00AA00"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "AAFF55"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "00AA00"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "AAFF55"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "00AA00"],
                        ["c26241", "c26241", "c26241", "c26241", "e1a45b", "e1a45b", "005500", "AAFF55"],
                    ]
                }
            ]
        };
        this.TILE_8 = {
            name: 8,
            descriptiveName: "Left bottom",
            description: "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["AAFF55", "005500", "fbe7cf", "fbe7cf", "eeb39e", "eeb39e", "eeb39e", "eeb39e"],
                        ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["AAFF55", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["00AA00", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["AAFF55", "005500", "005500", "005500", "005500", "005500", "005500", "005500"],
                        ["00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55"],
                    ]
                }
            ]
        };
        this.TILE_9 = {
            name: 9,
            descriptiveName: "Middle bottom",
            description: "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["fbe7cf", "fbe7cf", "fbe7cf", "fbe7cf", "eeb39e", "eeb39e", "eeb39e", "eeb39e"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["005500", "005500", "005500", "005500", "005500", "005500", "005500", "005500"],
                        ["00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55"],
                    ]
                }
            ]
        };
        this.TILE_10 = {
            name: 10,
            descriptiveName: "Right bottom",
            description: "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["fbe7cf", "fbe7cf", "fbe7cf", "fbe7cf", "eeb39e", "eeb39e", "005500", "00AA00"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "AAFF55"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "00AA00"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "AAFF55"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "00AA00"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "AAFF55"],
                        ["005500", "005500", "005500", "005500", "005500", "005500", "005500", "00AA00"],
                        ["00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55"],
                    ]
                }
            ]
        };
        this.TILE_11 = {
            name: 15,
            descriptiveName: "Top and bottom",
            description: "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00"],
                        ["005500", "005500", "005500", "005500", "005500", "005500", "005500", "005500"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"],
                        ["005500", "005500", "005500", "005500", "005500", "005500", "005500", "005500"],
                        ["AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00"],
                    ]
                }
            ]
        };
        this.TILE_12 = {
            name: 16,
            descriptiveName: "Left and right",
            description: "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["AAFF55", "005500", "fbe7cf", "fbe7cf", "eeb39e", "eeb39e", "005500", "AAFF55"],
                        ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "00AA00"],
                        ["AAFF55", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "AAFF55"],
                        ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "00AA00"],
                        ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "AAFF55"],
                        ["00AA00", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "00AA00"],
                        ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "AAFF55"],
                        ["00AA00", "005500", "c26241", "c26241", "e1a45b", "e1a45b", "005500", "00AA00"],
                    ]
                }
            ]
        };
        this.TILE_13 = {
            name: 17,
            descriptiveName: "All sides",
            description: "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00"],
                        ["00AA00", "005500", "005500", "005500", "005500", "005500", "005500", "AAFF55"],
                        ["AAFF55", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "00AA00"],
                        ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "AAFF55"],
                        ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "00AA00"],
                        ["00AA00", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "AAFF55"],
                        ["AAFF55", "005500", "005500", "005500", "005500", "005500", "005500", "00AA00"],
                        ["00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55"],
                    ]
                }
            ]
        };
        this.TILE_5 = {
            name: 5,
            descriptiveName: "One way block",
            description: "The player can jump through it, but will land on it when he falls",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["transp", "e97977", "e97977", "transp", "transp", "e97977", "e97977", "transp"],
                        ["d55c5a", "d55c5a", "d55c5a", "e97977", "d55c5a", "d55c5a", "d55c5a", "e97977"],
                        ["ba3d3b", "d55c5a", "d55c5a", "e97977", "ba3d3b", "d55c5a", "d55c5a", "e97977"],
                        ["transp", "ba3d3b", "ba3d3b", "transp", "transp", "ba3d3b", "ba3d3b", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.TILE_edge = {
            name: "edge",
            descriptiveName: "Edge block",
            description: "Will display on the edge of the game screen",
            animation: [{
                    sprite: [
                        ["b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4"],
                        ["6c686c", "b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4", "6c686c"],
                        ["6c686c", "6c686c", "b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4", "6c686c", "6c686c"],
                        ["6c686c", "6c686c", "6c686c", "b3a1b4", "b3a1b4", "6c686c", "6c686c", "6c686c"],
                        ["6c686c", "6c686c", "6c686c", "524f52", "524f52", "6c686c", "6c686c", "6c686c"],
                        ["6c686c", "6c686c", "524f52", "524f52", "524f52", "524f52", "6c686c", "6c686c"],
                        ["6c686c", "524f52", "524f52", "524f52", "524f52", "524f52", "524f52", "6c686c"],
                        ["524f52", "524f52", "524f52", "524f52", "524f52", "524f52", "524f52", "524f52"],
                    ]
                }
            ]
        };
        this.PLAYER_IDLE_SPRITE = {
            name: ObjectTypes.PLAYER_IDLE,
            descriptiveName: "Player idle",
            description: "The player sprite that is shown when you are not moving.",
            directions: [AnimationHelper.facingDirections.right, AnimationHelper.facingDirections.left],
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "4080BF", "4080BF", "4080BF", "4080BF", "transp", "transp"],
                        ["transp", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF"],
                        ["transp", "transp", "EABFBF", "FFFFFF", "80552B", "EABFBF", "80552B", "transp"],
                        ["transp", "transp", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "transp"],
                        ["transp", "transp", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "transp", "transp"],
                        ["transp", "f2cbc9", "transp", "d55c5a", "d55c5a", "transp", "f2cbc9", "transp"],
                        ["transp", "transp", "BF8040", "transp", "transp", "BF8040", "transp", "transp"],
                    ]
                }
            ]
        };
        this.PLAYER_JUMP_SPRITE = {
            name: ObjectTypes.PLAYER_JUMP,
            descriptiveName: "Player jump",
            description: "The player sprite that is shown when you are jumping.<br/>" +
                "<span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'SFX 1'} }, true)\">Jump SFX</span> will be displayed underneath.",
            squishAble: true,
            directions: [AnimationHelper.facingDirections.right, AnimationHelper.facingDirections.left],
            animation: [{
                    sprite: [
                        ["transp", "transp", "4080BF", "4080BF", "4080BF", "4080BF", "transp", "4080BF"],
                        ["transp", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "transp"],
                        ["transp", "transp", "EABFBF", "FFFFFF", "80552B", "EABFBF", "80552B", "transp"],
                        ["transp", "transp", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "transp"],
                        ["transp", "EABFBF", "BF4040", "BF4040", "BF4040", "BF4040", "EABFBF", "transp"],
                        ["transp", "transp", "transp", "BF4040", "BF4040", "FFAA55", "transp", "transp"],
                        ["transp", "transp", "FFAA55", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.PLAYER_WALL_JUMP_SPRITE = {
            name: ObjectTypes.PLAYER_WALL_JUMP,
            descriptiveName: "Player wall jump",
            description: "The player sprite that is shown when you are jumping.",
            squishAble: false,
            hiddenEverywhere: true,
            directions: [AnimationHelper.facingDirections.right, AnimationHelper.facingDirections.left],
            animation: [{
                    sprite: [
                        ["transp", "transp", "4080BF", "4080BF", "4080BF", "4080BF", "transp", "4080BF"],
                        ["transp", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "transp"],
                        ["transp", "transp", "EABFBF", "FFFFFF", "80552B", "EABFBF", "80552B", "transp"],
                        ["transp", "transp", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "transp"],
                        ["transp", "EABFBF", "BF4040", "BF4040", "BF4040", "BF4040", "EABFBF", "transp"],
                        ["transp", "transp", "transp", "BF4040", "BF4040", "FFAA55", "transp", "transp"],
                        ["transp", "transp", "FFAA55", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.PLAYER_WALK_SPRITE = {
            name: ObjectTypes.PLAYER_WALK,
            descriptiveName: "Player walk",
            description: "The player sprite that is shown when you are running.",
            directions: [AnimationHelper.facingDirections.right, AnimationHelper.facingDirections.left],
            animation: [{
                    sprite: [
                        ["transp", "transp", "4080BF", "4080BF", "4080BF", "4080BF", "transp", "transp"],
                        ["transp", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF"],
                        ["transp", "transp", "EABFBF", "FFFFFF", "80552B", "EABFBF", "80552B", "transp"],
                        ["transp", "transp", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "transp"],
                        ["transp", "transp", "BF4040", "BF4040", "BF4040", "BF4040", "EABFBF", "transp"],
                        ["transp", "EABFBF", "BF4040", "BF4040", "BF4040", "BF8040", "transp", "transp"],
                        ["transp", "transp", "BF8040", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                },
                {
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "4080BF", "4080BF", "4080BF", "4080BF", "transp", "transp"],
                        ["transp", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF"],
                        ["transp", "transp", "EABFBF", "FFFFFF", "80552B", "EABFBF", "80552B", "transp"],
                        ["transp", "transp", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "transp"],
                        ["transp", "transp", "BF4040", "BF4040", "BF4040", "BF4040", "transp", "transp"],
                        ["transp", "EABFBF", "BF8040", "BF4040", "BF4040", "transp", "EABFBF", "transp"],
                        ["transp", "transp", "transp", "transp", "BF8040", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.START_FLAG_SPRITE = {
            name: ObjectTypes.START_FLAG,
            descriptiveName: "Start flag",
            description: "The starting point of a level. You also respawn here, if you die. <br/> If you create multiple start-flags, for non-linear games, you can click on a set start flag again, to declare it as the default start of a level.",
            type: this.SPRITE_TYPES.object,
            animation: [{
                    sprite: [
                        ["fdfdfd", "d55c5a", "d55c5a", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "transp", "transp", "transp"],
                        ["fdfdfd", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "transp"],
                        ["fdfdfd", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "transp", "transp", "transp"],
                        ["fdfdfd", "d55c5a", "d55c5a", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.CHECKPOINT_FLAG = {
            name: ObjectTypes.CHECKPOINT,
            descriptiveName: "Checkpoint",
            description: "If the player touches the checkpoint, he will respawn here after a death. If there are multiple checkpoints, the latest one the player touched will become the respawn point.",
            type: this.SPRITE_TYPES.object,
            animation: [{
                    sprite: [
                        ["fdfdfd", "E3E300", "E3E300", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "E3E300", "E3E300", "E3E300", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "E3E300", "E3E300", "E3E300", "E3E300", "transp", "transp", "transp"],
                        ["fdfdfd", "E3E300", "E3E300", "E3E300", "E3E300", "E3E300", "transp", "transp"],
                        ["fdfdfd", "E3E300", "E3E300", "E3E300", "E3E300", "E3E300", "E3E300", "transp"],
                        ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                },
                {
                    sprite: [
                        ["fdfdfd", "E3E300", "E3E300", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "E3E300", "E3E300", "E3E300", "E3E300", "transp", "transp", "transp"],
                        ["fdfdfd", "E3E300", "E3E300", "E3E300", "E3E300", "E3E300", "E3E300", "transp"],
                        ["fdfdfd", "E3E300", "E3E300", "E3E300", "E3E300", "transp", "transp", "transp"],
                        ["fdfdfd", "E3E300", "E3E300", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.FINISH_FLAG_SPRITE = {
            name: ObjectTypes.FINISH_FLAG,
            descriptiveName: "Finish flag",
            changeableAttributes: [
                { name: this.changeableAttributeTypes.collectiblesNeeded, defaultValue: false },
            ],
            description: "The goal of a level. If you touch it, by default you continue to the next level. If you want to specify a custom exit to a different level, click on a set finish flag again. <br/>" +
                "<span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Finish flag closed'} }, true)\">Closed finish flag sprite</span>",
            type: this.SPRITE_TYPES.object,
            animation: [{
                    sprite: [
                        ["fdfdfd", "208220", "208220", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "208220", "208220", "208220", "208220", "transp", "transp", "transp"],
                        ["fdfdfd", "208220", "208220", "208220", "208220", "208220", "208220", "transp"],
                        ["fdfdfd", "208220", "208220", "208220", "208220", "transp", "transp", "transp"],
                        ["fdfdfd", "208220", "208220", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.FINISH_FLAG_CLOSED_SPRITE = {
            name: ObjectTypes.FINISH_FLAG_CLOSED,
            descriptiveName: "Finish flag closed",
            description: "This sprite will be displayed if the player needs to collect collectibles to access the <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Finish flag'} }, true)\">Finish flag</span> (Can be configured by clicking on a set finish flag in the game screen).",
            hiddenSprite: true,
            type: this.SPRITE_TYPES.object,
            animation: [{
                    sprite: [
                        ["fdfdfd", "8E8E8E", "8E8E8E", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "8E8E8E", "8E8E8E", "8E8E8E", "8E8E8E", "transp", "transp", "transp"],
                        ["fdfdfd", "8E8E8E", "8E8E8E", "8E8E8E", "8E8E8E", "8E8E8E", "8E8E8E", "transp"],
                        ["fdfdfd", "8E8E8E", "8E8E8E", "8E8E8E", "8E8E8E", "transp", "transp", "transp"],
                        ["fdfdfd", "8E8E8E", "8E8E8E", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.SPIKE_SPRITE = {
            name: ObjectTypes.SPIKE,
            descriptiveName: "Spike",
            directions: [AnimationHelper.facingDirections.bottom, AnimationHelper.facingDirections.left, AnimationHelper.facingDirections.top, AnimationHelper.facingDirections.right],
            description: "A spike. If you touch it, you die",
            type: this.SPRITE_TYPES.object,
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "b3a1b4", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "b3a1b4", "b3a1b4", "transp", "transp", "transp"],
                        ["transp", "transp", "b3a1b4", "6c686c", "6c686c", "b3a1b4", "transp", "transp"],
                        ["b3a1b4", "b3a1b4", "6c686c", "524f52", "FFFFFF", "6c686c", "b3a1b4", "transp"],
                        ["transp", "b3a1b4", "6c686c", "524f52", "524f52", "6c686c", "b3a1b4", "b3a1b4"],
                        ["transp", "transp", "b3a1b4", "6c686c", "6c686c", "b3a1b4", "transp", "transp"],
                        ["transp", "transp", "transp", "b3a1b4", "b3a1b4", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "b3a1b4", "transp", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.TRAMPOLINE_SRPITE = {
            name: ObjectTypes.TRAMPOLINE,
            descriptiveName: "Trampoline",
            description: "A trampoline. You will jump approximately twice as high when you land on it.",
            animNotEditale: true,
            squishAble: false,
            type: this.SPRITE_TYPES.object,
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["e97977", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "e97977"],
                        ["e97977", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "e97977"],
                        ["transp", "transp", "6c686c", "6c686c", "b3a1b4", "fdfdfd", "transp", "transp"],
                        ["transp", "transp", "524f52", "524f52", "524f52", "524f52", "transp", "transp"],
                        ["transp", "transp", "6c686c", "6c686c", "b3a1b4", "fdfdfd", "transp", "transp"],
                        ["transp", "transp", "524f52", "524f52", "524f52", "524f52", "transp", "transp"],
                    ]
                },
                {
                    sprite: [
                        ["e97977", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "e97977"],
                        ["e97977", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "e97977"],
                        ["transp", "transp", "6c686c", "6c686c", "b3a1b4", "fdfdfd", "transp", "transp"],
                        ["transp", "transp", "524f52", "524f52", "524f52", "524f52", "transp", "transp"],
                        ["transp", "transp", "6c686c", "6c686c", "b3a1b4", "fdfdfd", "transp", "transp"],
                        ["transp", "transp", "524f52", "524f52", "524f52", "524f52", "transp", "transp"],
                        ["transp", "transp", "6c686c", "6c686c", "b3a1b4", "fdfdfd", "transp", "transp"],
                        ["transp", "transp", "524f52", "524f52", "524f52", "524f52", "transp", "transp"],
                    ]
                }
            ]
        };
        this.CANON_SPRITE = {
            name: ObjectTypes.CANON,
            changeableAttributes: [
                { name: this.changeableAttributeTypes.speed, defaultValue: 3, minValue: 1, maxValue: 10 },
                { name: this.changeableAttributeTypes.frequency, defaultValue: 3, minValue: 1, maxValue: 8 }
            ],
            descriptiveName: "Cannon",
            description: "A cannon. It shoots <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Cannon ball'} }, true)\">cannonballs</span> at certain time intervals. Click on it after placing it again, to change the attributes of the individual cannon.",
            type: this.SPRITE_TYPES.object,
            squishAble: false,
            directions: [AnimationHelper.facingDirections.left, AnimationHelper.facingDirections.top, AnimationHelper.facingDirections.right, AnimationHelper.facingDirections.bottom],
            animation: [{
                    sprite: [
                        ["FFFFFF", "transp", "transp", "transp", "FFFFFF", "FFFFFF", "FFFFFF", "transp"],
                        ["FFFFFF", "FFFFFF", "transp", "FFFFFF", "000000", "000000", "000000", "FFFFFF"],
                        ["FFFFFF", "000000", "FFFFFF", "000000", "000000", "000000", "000000", "FFFFFF"],
                        ["FFFFFF", "000000", "000000", "000000", "000000", "000000", "000000", "FFFFFF"],
                        ["FFFFFF", "000000", "000000", "000000", "000000", "000000", "000000", "FFFFFF"],
                        ["FFFFFF", "000000", "FFFFFF", "000000", "000000", "000000", "000000", "FFFFFF"],
                        ["FFFFFF", "FFFFFF", "transp", "FFFFFF", "000000", "000000", "000000", "FFFFFF"],
                        ["FFFFFF", "transp", "transp", "transp", "FFFFFF", "FFFFFF", "FFFFFF", "transp"],
                    ]
                }
            ]
        };
        this.STOMPER = {
            name: ObjectTypes.STOMPER,
            type: this.SPRITE_TYPES.object,
            descriptiveName: "Stomper",
            squishAble: false,
            directions: [AnimationHelper.facingDirections.bottom, AnimationHelper.facingDirections.left, AnimationHelper.facingDirections.top, AnimationHelper.facingDirections.right],
            description: "A deadly hazard, that will fly torwards the player, if he is in it's way and move back to it's initial place once it hits a solid block. Can be rotated by clicking on a placed object again.",
            animation: [{
                    sprite: [
                        ['AAAAAA', 'AAAAAA', 'transp', 'AAAAAA', 'AAAAAA', 'transp', 'AAAAAA', 'AAAAAA'],
                        ['AAAAAA', '717171', 'transp', '717171', '717171', 'transp', '717171', 'AAAAAA'],
                        ['transp', 'transp', 'AAAAAA', 'AAAAAA', 'AAAAAA', 'AAAAAA', 'transp', 'transp'],
                        ['AAAAAA', '717171', 'FFFFFF', 'AAAAAA', 'AAAAAA', 'FFFFFF', '717171', 'AAAAAA'],
                        ['AAAAAA', '717171', 'FF1C1C', 'AAAAAA', 'AAAAAA', 'FF1C1C', '717171', 'AAAAAA'],
                        ['transp', 'transp', 'AAAAAA', 'AAAAAA', 'AAAAAA', 'AAAAAA', 'transp', 'transp'],
                        ['AAAAAA', '717171', 'transp', '717171', '717171', 'transp', '717171', 'AAAAAA'],
                        ['AAAAAA', 'AAAAAA', 'transp', 'AAAAAA', 'AAAAAA', 'transp', 'AAAAAA', 'AAAAAA']
                    ]
                }
            ]
        };
        this.TOGGLE_MINE = {
            name: ObjectTypes.TOGGLE_MINE,
            type: this.SPRITE_TYPES.object,
            descriptiveName: "Toggle mine",
            description: "An object that is harmless at first, but once you step in and out of it, it becomes deadly.",
            animation: [{
                    sprite: [
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'C6C6C6', 'C6C6C6', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'C6C6C6', 'transp', 'transp', 'C6C6C6', 'transp', 'transp'],
                        ['transp', 'C6C6C6', 'transp', 'transp', 'transp', 'transp', 'C6C6C6', 'transp'],
                        ['transp', 'C6C6C6', 'transp', 'transp', 'transp', 'transp', 'C6C6C6', 'transp'],
                        ['transp', 'transp', 'C6C6C6', 'transp', 'transp', 'C6C6C6', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'C6C6C6', 'C6C6C6', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                    ]
                },
                {
                    sprite: [
                        ['transp', 'transp', 'transp', 'FF1C1C', 'FF1C1C', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'FF1C1C', 'transp', 'transp', 'FF1C1C', 'transp', 'transp'],
                        ['transp', 'FF1C1C', 'transp', 'transp', 'transp', 'transp', 'FF1C1C', 'transp'],
                        ['FF1C1C', 'transp', 'FFFFFF', 'transp', 'transp', 'FFFFFF', 'transp', 'FF1C1C'],
                        ['FF1C1C', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'FF1C1C'],
                        ['transp', 'FF1C1C', 'transp', 'transp', 'transp', 'transp', 'FF1C1C', 'transp'],
                        ['transp', 'transp', 'FF1C1C', 'transp', 'transp', 'FF1C1C', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'FF1C1C', 'FF1C1C', 'transp', 'transp', 'transp'],
                    ]
                }
            ]
        };
        this.DISAPPEARING_BLOCK_SPRITE = {
            name: ObjectTypes.DISAPPEARING_BLOCK,
            descriptiveName: "Disappearing block",
            description: "A block that will disappear upon touching it. It will reappear after a certain time.",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["804c51", "9c6853", "f6c992", "f6c992", "9c6853", "804c51", "804c51", "804c51"],
                        ["9c6853", "f6c992", "f6c992", "f6c992", "f6c992", "804c51", "f6c992", "9c6853"],
                        ["f6c992", "f6c992", "f6c992", "f6c992", "9c6853", "804c51", "9c6853", "9c6853"],
                        ["9c6853", "f6c992", "f6c992", "9c6853", "9c6853", "804c51", "804c51", "804c51"],
                        ["9c6853", "9c6853", "9c6853", "9c6853", "804c51", "9c6853", "f6c992", "9c6853"],
                        ["804c51", "9c6853", "9c6853", "804c51", "9c6853", "f6c992", "f6c992", "9c6853"],
                        ["804c51", "804c51", "804c51", "804c51", "9c6853", "9c6853", "9c6853", "804c51"],
                        ["804c51", "9c6853", "9c6853", "804c51", "804c51", "804c51", "804c51", "804c51"],
                    ]
                }
            ]
        };
        this.WATER = {
            name: ObjectTypes.WATER,
            descriptiveName: "Water",
            description: "A passable block that slows down gravity and let's you jump infinitely inside it. Every object can be placed on it.",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"],
                        ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"],
                        ["8EC6FF", "C6E3FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"],
                        ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"],
                        ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "C6E3FF", "8EC6FF", "8EC6FF"],
                        ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"],
                        ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"],
                        ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"],
                    ]
                },
                {
                    sprite: [
                        ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"],
                        ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"],
                        ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"],
                        ["8EC6FF", "C6E3FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"],
                        ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"],
                        ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "C6E3FF", "8EC6FF", "8EC6FF"],
                        ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"],
                        ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"],
                    ]
                }
            ]
        };
        this.RED_BLOCK = {
            name: ObjectTypes.RED_BLOCK,
            descriptiveName: "Red block",
            description: "There are red blocks and blue blocks. Only one them can be active at a time. By touching the switch (in the objects tab), the active tiles can be switched.",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["FF8E8E", "FF8E8E", "FF8E8E", "FF8E8E", "FF8E8E", "FF8E8E", "FF8E8E", "FF8E8E"],
                        ["FF8E8E", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "AA0000"],
                        ["FF8E8E", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "AA0000"],
                        ["FF8E8E", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "AA0000"],
                        ["FF8E8E", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "AA0000"],
                        ["FF8E8E", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "AA0000"],
                        ["FF8E8E", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "AA0000"],
                        ["FF8E8E", "AA0000", "AA0000", "AA0000", "AA0000", "AA0000", "AA0000", "AA0000"],
                    ]
                },
                {
                    sprite: [
                        ["FF1C1C", "FF1C1C", "transp", "FF1C1C", "FF1C1C", "transp", "FF1C1C", "FF1C1C"],
                        ["FF1C1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF1C1C"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["FF1C1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF1C1C"],
                        ["FF1C1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF1C1C"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["FF1C1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF1C1C"],
                        ["FF1C1C", "FF1C1C", "transp", "FF1C1C", "FF1C1C", "transp", "FF1C1C", "FF1C1C"],
                    ]
                }
            ]
        };
        this.BLUE_BLOCK = {
            name: ObjectTypes.BLUE_BLOCK,
            descriptiveName: "Blue block",
            description: "There are red blocks and blue blocks. Only one them can be active at a time. By touching the switch (in the objects tab), the active tiles can be switched.",
            type: this.SPRITE_TYPES.tile,
            animation: [{
                    sprite: [
                        ["8E8EFF", "8E8EFF", "8E8EFF", "8E8EFF", "8E8EFF", "8E8EFF", "8E8EFF", "8E8EFF"],
                        ["8E8EFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "0000AA"],
                        ["8E8EFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "0000AA"],
                        ["8E8EFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "0000AA"],
                        ["8E8EFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "0000AA"],
                        ["8E8EFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "0000AA"],
                        ["8E8EFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "0000AA"],
                        ["8E8EFF", "0000AA", "0000AA", "0000AA", "0000AA", "0000AA", "0000AA", "0000AA"],
                    ]
                },
                {
                    sprite: [
                        ["1C1CFF", "1C1CFF", "transp", "1C1CFF", "1C1CFF", "transp", "1C1CFF", "1C1CFF"],
                        ["1C1CFF", "transp", "transp", "transp", "transp", "transp", "transp", "1C1CFF"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["1C1CFF", "transp", "transp", "transp", "transp", "transp", "transp", "1C1CFF"],
                        ["1C1CFF", "transp", "transp", "transp", "transp", "transp", "transp", "1C1CFF"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["1C1CFF", "transp", "transp", "transp", "transp", "transp", "transp", "1C1CFF"],
                        ["1C1CFF", "1C1CFF", "transp", "1C1CFF", "1C1CFF", "transp", "1C1CFF", "1C1CFF"],
                    ]
                }
            ]
        };
        this.RED_BLUE_BLOCK_SWITCH = {
            name: ObjectTypes.RED_BLUE_BLOCK_SWITCH,
            descriptiveName: "Red/blue switch",
            description: "A switch for red/blue tiles. Can be activated by hitting it with your head, or if a stomper/cannon-ball/rocket hits it.",
            type: this.SPRITE_TYPES.tile,
            squishAble: false,
            animNotEditale: true,
            animation: [{
                    sprite: [
                        ['FF8E8E', 'FF8E8E', 'FF8E8E', 'FF8E8E', 'FF8E8E', 'FF8E8E', 'FF8E8E', 'FF8E8E'],
                        ['FF8E8E', 'FF1C1C', 'FF1C1C', 'FF1C1C', 'FF1C1C', 'FF1C1C', 'FF1C1C', 'AA0000'],
                        ['FF8E8E', 'FF1C1C', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FF1C1C', 'FF1C1C', 'AA0000'],
                        ['FF8E8E', 'FF1C1C', 'FFFFFF', 'FF1C1C', 'FF1C1C', 'FFFFFF', 'FF1C1C', 'AA0000'],
                        ['FF8E8E', 'FF1C1C', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FF1C1C', 'FF1C1C', 'AA0000'],
                        ['FF8E8E', 'FF1C1C', 'FFFFFF', 'FF1C1C', 'FF1C1C', 'FFFFFF', 'FF1C1C', 'AA0000'],
                        ['FF8E8E', 'FF1C1C', 'FF1C1C', 'FF1C1C', 'FF1C1C', 'FF1C1C', 'FF1C1C', 'AA0000'],
                        ['FF8E8E', 'AA0000', 'AA0000', 'AA0000', 'AA0000', 'AA0000', 'AA0000', 'AA0000']
                    ]
                },
                {
                    sprite: [
                        ['8E8EFF', '8E8EFF', '8E8EFF', '8E8EFF', '8E8EFF', '8E8EFF', '8E8EFF', '8E8EFF'],
                        ['8E8EFF', '1C1CFF', '1C1CFF', '1C1CFF', '1C1CFF', '1C1CFF', '1C1CFF', '0000AA'],
                        ['8E8EFF', '1C1CFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', '1C1CFF', '0000AA'],
                        ['8E8EFF', '1C1CFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', '1C1CFF', '1C1CFF', '0000AA'],
                        ['8E8EFF', '1C1CFF', 'FFFFFF', '1C1CFF', '1C1CFF', 'FFFFFF', '1C1CFF', '0000AA'],
                        ['8E8EFF', '1C1CFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', '1C1CFF', '1C1CFF', '0000AA'],
                        ['8E8EFF', '1C1CFF', '1C1CFF', '1C1CFF', '1C1CFF', '1C1CFF', '1C1CFF', '0000AA'],
                        ['8E8EFF', '0000AA', '0000AA', '0000AA', '0000AA', '0000AA', '0000AA', '0000AA']
                    ]
                }
            ]
        };
        this.ROCKET_LAUNCHER = {
            name: ObjectTypes.ROCKET_LAUNCHER,
            type: this.SPRITE_TYPES.object,
            descriptiveName: "Rocket launcher",
            changeableAttributes: [
                { name: this.changeableAttributeTypes.speed, defaultValue: 3, minValue: 1, maxValue: 10 },
                { name: this.changeableAttributeTypes.frequency, defaultValue: 3, minValue: 1, maxValue: 8 },
                {
                    name: this.changeableAttributeTypes.rotationSpeed, defaultValue: 8, minValue: 0, maxValue: 24, descriptiveName: "rotation speed <span data-microtip-size='large'aria-label='Determines how fast the rockets will rotate to the players direction. 0 = rockets will decide direction once and not turn at all. 24 = basically following the player everywhere.'"
                        + "data-microtip-position='top-left' role='tooltip' class='songInputInfo'>"
                        + "<img src='images/icons/info.svg' alt='info' width='16' height='16'>"
                }
            ],
            squishAble: false,
            rotateable: true,
            description: "A rocket-launcher. It shoots <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Rocket'} }, true)\">rockets</span> at certain time intervals that will follow the player. Click on it after placing it again, to change the attributes of the individual cannon.",
            animation: [{
                    sprite: [
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'AAAAAA', 'AAAAAA', 'transp', 'transp'],
                        ['AAAAAA', 'AAAAAA', 'FF1C1C', 'FF1C1C', 'AAAAAA', 'AAAAAA', '717171', 'transp'],
                        ['AAAAAA', 'AAAAAA', 'AAAAAA', 'AAAAAA', 'AAAAAA', 'AAAAAA', '717171', '717171'],
                        ['FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', '717171', '717171'],
                        ['FFFFFF', 'FFFFFF', 'FF1C1C', 'FF1C1C', 'FFFFFF', 'FFFFFF', '717171', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'FFFFFF', 'FFFFFF', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                    ]
                },
            ]
        };
        this.NPC_SPRITE = {
            name: ObjectTypes.NPC,
            changeableAttributes: [
                { name: this.changeableAttributeTypes.dialogue, defaultValue: [""] },
            ],
            descriptiveName: "Npc",
            description: "An object that can display a dialogue. Click on it again after placing it, to display the dialogue window.",
            type: this.SPRITE_TYPES.object,
            animation: [{
                    sprite: [
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['FFAA55', 'FFAA55', 'FFAA55', 'FFAA55', 'FFAA55', 'FFAA55', 'FFAA55', 'AA5500'],
                        ['FFAA55', 'FF8E1C', 'FFFFFF', 'FFFFFF', 'FF8E1C', 'FFFFFF', 'FF8E1C', 'AA5500'],
                        ['FFAA55', 'FF8E1C', 'FF8E1C', 'FF8E1C', 'FF8E1C', 'FF8E1C', 'FF8E1C', 'AA5500'],
                        ['FFAA55', 'FF8E1C', 'FFFFFF', 'FF8E1C', 'FFFFFF', 'FFFFFF', 'FF8E1C', 'AA5500'],
                        ['AA5500', 'AA5500', 'AA5500', 'AA5500', 'AA5500', 'AA5500', 'AA5500', 'AA5500'],
                        ['transp', 'transp', 'transp', '713900', '713900', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', '713900', '713900', 'transp', 'transp', 'transp'],
                    ]
                },
            ]
        };
        this.CANON_BALL_SPRITE = {
            name: ObjectTypes.CANON_BALL,
            descriptiveName: "Cannon ball",
            directions: [AnimationHelper.facingDirections.left, AnimationHelper.facingDirections.top, AnimationHelper.facingDirections.right, AnimationHelper.facingDirections.bottom],
            description: "A cannonball. The <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Cannon'} }, true)\">cannon</span> shoots it. <br/>" +
                "When it hits a wall, <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'SFX 2'} }, true)\">explosion</span> will be displayed.",
            animation: [{
                    sprite: [
                        ["transp", "transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp", "transp"],
                        ["transp", "FFFFFF", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "FFFFFF", "transp"],
                        ["FFFFFF", "ff5e7a", "ff5e7a", "ff5e7a", "FFFFFF", "ff5e7a", "ff5e7a", "FFFFFF"],
                        ["FFFFFF", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "FFFFFF", "ff5e7a", "FFFFFF"],
                        ["FFFFFF", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "FFFFFF"],
                        ["FFFFFF", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "FFFFFF"],
                        ["transp", "FFFFFF", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "FFFFFF", "transp"],
                        ["transp", "transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp", "transp"],
                    ]
                }
            ]
        };
        this.ROCKET = {
            name: ObjectTypes.ROCKET,
            descriptiveName: "Rocket",
            description: "A rocket. The <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Rocket launcher'} }, true)\">rocket launcher</span> shoots it.<br/>" +
                "When it hits a wall, <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'SFX 2'} }, true)\">explosion</span> will be displayed.",
            animation: [{
                    sprite: [
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'FFFFFF', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'FFFFFF', 'FFFFFF', 'transp', 'transp'],
                        ['FF1C1C', 'FF1C1C', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFF8E', 'FF8E1C'],
                        ['FF1C1C', 'FF1C1C', 'AAAAAA', 'AAAAAA', 'AAAAAA', 'AAAAAA', 'FFFF8E', 'FF8E1C'],
                        ['transp', 'transp', 'transp', 'transp', 'AAAAAA', 'AAAAAA', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'AAAAAA', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                    ]
                },
                {
                    sprite: [
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'FFFFFF', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'FFFFFF', 'FFFFFF', 'transp', 'transp'],
                        ['FF1C1C', 'FF1C1C', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'transp', 'FF8E1C'],
                        ['FF1C1C', 'FF1C1C', 'AAAAAA', 'AAAAAA', 'AAAAAA', 'AAAAAA', 'transp', 'FF8E1C'],
                        ['transp', 'transp', 'transp', 'transp', 'AAAAAA', 'AAAAAA', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'AAAAAA', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                    ]
                }
            ]
        };
        this.PORTAL = {
            name: ObjectTypes.PORTAL,
            type: this.SPRITE_TYPES.object,
            descriptiveName: "Portal",
            squishAble: false,
            description: "<b>Second Sprite:</b> <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Portal 2'} }, true)\">Here</span>"
                + "<br/><br/>A portal with 2 exits. <br/>"
                + "Just draw 2 portals on the game screen. The odd one will automatically be the first, the even one the second.",
            animation: [{
                    sprite: [
                        ['transp', 'transp', 'transp', 'FFFFFF', 'FFFFFF', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', '0071E3', '0071E3', '0071E3', '0071E3', 'transp', 'transp'],
                        ['transp', '0071E3', '0071E3', '55AAFF', '55AAFF', '0071E3', '0071E3', 'transp'],
                        ['FFFFFF', '0071E3', '55AAFF', '8EC6FF', '8EC6FF', '55AAFF', '0071E3', 'FFFFFF'],
                        ['FFFFFF', '0071E3', '55AAFF', '8EC6FF', '8EC6FF', '55AAFF', '0071E3', 'FFFFFF'],
                        ['transp', '0071E3', '0071E3', '55AAFF', '55AAFF', '0071E3', '0071E3', 'transp'],
                        ['transp', 'transp', '0071E3', '0071E3', '0071E3', '0071E3', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'FFFFFF', 'FFFFFF', 'transp', 'transp', 'transp'],
                    ]
                },
            ]
        };
        this.PORTAL2 = {
            name: ObjectTypes.PORTAL2,
            type: this.SPRITE_TYPES.object,
            descriptiveName: "Portal 2",
            description: "<b>First Sprite:</b> <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Portal'} }, true)\">Here</span>"
                + "<br/><br/>A portal with 2 exits. <br/>"
                + "Just draw 2 portals on the game screen. The odd one will automatically be the first, the even one the second.",
            squishAble: false,
            hiddenSprite: true,
            animation: [{
                    sprite: [
                        ['transp', 'transp', 'transp', 'FFFFFF', 'FFFFFF', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'E37100', 'E37100', 'E37100', 'E37100', 'transp', 'transp'],
                        ['transp', 'E37100', 'E37100', 'FFAA55', 'FFAA55', 'E37100', 'E37100', 'transp'],
                        ['FFFFFF', 'E37100', 'FFAA55', 'FFC68E', 'FFC68E', 'FFAA55', 'E37100', 'FFFFFF'],
                        ['FFFFFF', 'E37100', 'FFAA55', 'FFC68E', 'FFC68E', 'FFAA55', 'E37100', 'FFFFFF'],
                        ['transp', 'E37100', 'E37100', 'FFAA55', 'FFAA55', 'E37100', 'E37100', 'transp'],
                        ['transp', 'transp', 'E37100', 'E37100', 'E37100', 'E37100', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'FFFFFF', 'FFFFFF', 'transp', 'transp', 'transp'],
                    ]
                },
            ]
        };
        this.COLLECTIBLE = {
            name: ObjectTypes.COLLECTIBLE,
            type: this.SPRITE_TYPES.object,
            descriptiveName: "Collectible",
            description: "They can be placed to give the player an additional challenge. <br/> Inside the tool, the collectibles will reappear if you die or reset the level, in the exported game they are gone forever, once " +
                "<span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'SFX 4'} }, true)\">collected</span>.",
            animation: [{
                    sprite: [
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'FFFFC6', 'FFFFC6', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'FFFFC6', 'FFFF8E', 'FFFF8E', 'FFFF55', 'transp', 'transp'],
                        ['transp', 'transp', 'FFFFC6', 'FFFF8E', 'FFFF8E', 'FFFF55', 'transp', 'transp'],
                        ['transp', 'transp', 'FFFFC6', 'FFFF8E', 'FFFF8E', 'FFFF55', 'transp', 'transp'],
                        ['transp', 'transp', 'FFFFC6', 'FFFF8E', 'FFFF8E', 'FFFF55', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'FFFF55', 'FFFF55', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                    ]
                },
                {
                    sprite: [
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'FFFFC6', 'FFFFC6', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'FFFFC6', 'FFFF55', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'FFFFC6', 'FFFF55', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'FFFFC6', 'FFFF55', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'FFFFC6', 'FFFF55', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'FFFF55', 'FFFF55', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                    ]
                },
            ]
        };
        this.LASER_CANON = {
            name: ObjectTypes.LASER_CANON,
            changeableAttributes: [
                { name: this.changeableAttributeTypes.laserDuration, defaultValue: 60, minValue: 10, maxValue: 140, step: 10, descriptiveName: "laser duration" },
                { name: this.changeableAttributeTypes.pauseDuration, defaultValue: 60, minValue: 0, maxValue: 140, step: 10, descriptiveName: "pause duration" }
            ],
            descriptiveName: "Laser cannon",
            description: "A laser cannon. It shoots <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Laser'} }, true)\">lasers</span> until they hit a wall. Click on it after placing it again, to change the attributes of the individual laser cannon.",
            type: this.SPRITE_TYPES.object,
            squishAble: false,
            directions: [AnimationHelper.facingDirections.left, AnimationHelper.facingDirections.top, AnimationHelper.facingDirections.right, AnimationHelper.facingDirections.bottom],
            animation: [{
                    sprite: [
                        ["transp", "transp", "8E8E8E", "8E8E8E", "8E8E8E", "8E8E8E", "8E8E8E", "8E8E8E"],
                        ["transp", "555555", "8E8E8E", "717171", "717171", "717171", "717171", "555555"],
                        ["C6C6C6", "555555", "8E8E8E", "717171", "717171", "717171", "717171", "555555"],
                        ["FFFFFF", "555555", "8E8E8E", "393939", "FF8E8E", "FF8E8E", "393939", "555555"],
                        ["FFFFFF", "555555", "8E8E8E", "393939", "E30000", "E30000", "393939", "555555"],
                        ["C6C6C6", "555555", "8E8E8E", "717171", "717171", "717171", "717171", "555555"],
                        ["transp", "555555", "8E8E8E", "717171", "717171", "717171", "717171", "555555"],
                        ["transp", "transp", "555555", "555555", "555555", "555555", "555555", "555555"],
                    ]
                }
            ]
        };
        this.LASER = {
            name: ObjectTypes.LASER,
            descriptiveName: "Laser",
            directions: [AnimationHelper.facingDirections.left, AnimationHelper.facingDirections.top, AnimationHelper.facingDirections.right, AnimationHelper.facingDirections.bottom],
            description: "A laser. The <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Laser cannon'} }, true)\">laser cannon</span> shoots it. <br/>",
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "FFC68E", "transp", "transp", "transp", "FFC68E", "transp"],
                        ["transp", "transp", "FF1C1C", "transp", "transp", "transp", "FF1C1C", "transp"],
                        ["transp", "FF1C1C", "transp", "FF1C1C", "transp", "FF1C1C", "transp", "FF1C1C"],
                        ["FFC68E", "transp", "transp", "transp", "FFC68E", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                },
                {
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["FFC68E", "transp", "transp", "transp", "FFC68E", "transp", "transp", "transp"],
                        ["FF1C1C", "transp", "transp", "transp", "FF1C1C", "transp", "transp", "transp"],
                        ["transp", "FF1C1C", "transp", "FF1C1C", "transp", "FF1C1C", "transp", "FF1C1C"],
                        ["transp", "transp", "FFC68E", "transp", "transp", "transp", "FFC68E", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.BARREL_CANNON = {
            name: ObjectTypes.BARREL_CANNON,
            descriptiveName: "Barrel",
            description: "A barrel. When the player touches it, he gets inside of it and stays there, until he presses the jump button - then he will be launched out of it in it's direction.",
            type: this.SPRITE_TYPES.object,
            squishAble: true,
            directions: [AnimationHelper.facingDirections.left, AnimationHelper.facingDirections.top, AnimationHelper.facingDirections.right, AnimationHelper.facingDirections.bottom],
            animation: [{
                    sprite: [
                        ["transp", "transp", "717171", "FFAA55", "FFAA55", "717171", "transp", "transp"],
                        ["transp", "FFAA55", "8E8E8E", "FF8E1C", "FF8E1C", "8E8E8E", "FFAA55", "transp"],
                        ["717171", "FF8E1C", "8E8E8E", "FFFFFF", "E37100", "8E8E8E", "FF8E1C", "717171"],
                        ["8E8E8E", "FF8E1C", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FF8E1C", "8E8E8E"],
                        ["8E8E8E", "FF8E1C", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FF8E1C", "8E8E8E"],
                        ["717171", "FF8E1C", "8E8E8E", "FFFFFF", "E37100", "8E8E8E", "FF8E1C", "717171"],
                        ["transp", "FFAA55", "8E8E8E", "FF8E1C", "FF8E1C", "8E8E8E", "FFAA55", "transp"],
                        ["transp", "transp", "717171", "FFAA55", "FFAA55", "717171", "transp", "transp"]
                    ]
                }
            ]
        };
        this.JUMP_RESET = {
            name: ObjectTypes.JUMP_RESET,
            descriptiveName: "Jump reset",
            description: "It resets your jump in air. It is deactivated upon touching the ground or wall.",
            type: this.SPRITE_TYPES.object,
            animation: [{
                    sprite: [
                        ["transp", "transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp", "transp"],
                        ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"],
                        ["FFFFFF", "transp", "transp", "55AAFF", "55AAFF", "transp", "transp", "FFFFFF"],
                        ["FFFFFF", "transp", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "transp", "FFFFFF"],
                        ["FFFFFF", "transp", "transp", "55AAFF", "55AAFF", "transp", "transp", "FFFFFF"],
                        ["FFFFFF", "transp", "transp", "55AAFF", "55AAFF", "transp", "transp", "FFFFFF"],
                        ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"],
                        ["transp", "transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp", "transp"],
                    ]
                }
            ]
        };
        this.FIXED_SPEED_RIGHT = {
            name: ObjectTypes.FIXED_SPEED_RIGHT,
            descriptiveName: "Auto run",
            directions: [AnimationHelper.facingDirections.right, AnimationHelper.facingDirections.left],
            description: "Activates auto-run mode upon touching. <br/> The auto-run can be stopped by the auto-run stopper tile. <br/> Jumping off a wall will change the run direction. Click on a set object again, to change it's default direction.",
            type: this.SPRITE_TYPES.object,
            animation: [{
                    sprite: [
                        ["FF8E1C", "FF8E1C", "transp", "transp", "transp", "transp", "FF8E1C", "FF8E1C"],
                        ["FF8E1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF8E1C"],
                        ["transp", "transp", "transp", "transp", "FF8E1C", "transp", "transp", "transp"],
                        ["transp", "transp", "FF8E1C", "FF8E1C", "FF8E1C", "FF8E1C", "transp", "transp"],
                        ["transp", "transp", "FF8E1C", "FF8E1C", "FF8E1C", "FF8E1C", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "FF8E1C", "transp", "transp", "transp"],
                        ["FF8E1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF8E1C"],
                        ["FF8E1C", "FF8E1C", "transp", "transp", "transp", "transp", "FF8E1C", "FF8E1C"],
                    ]
                },
                {
                    sprite: [
                        ["FF8E1C", "FF8E1C", "transp", "transp", "transp", "transp", "FF8E1C", "FF8E1C"],
                        ["FF8E1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF8E1C"],
                        ["transp", "transp", "transp", "transp", "AA5500", "transp", "transp", "transp"],
                        ["transp", "transp", "AA5500", "AA5500", "AA5500", "AA5500", "transp", "transp"],
                        ["transp", "transp", "AA5500", "AA5500", "AA5500", "AA5500", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "AA5500", "transp", "transp", "transp"],
                        ["FF8E1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF8E1C"],
                        ["FF8E1C", "FF8E1C", "transp", "transp", "transp", "transp", "FF8E1C", "FF8E1C"],
                    ]
                }
            ]
        };
        this.FIXED_SPEED_STOPPER = {
            name: ObjectTypes.FIXED_SPEED_STOPPER,
            descriptiveName: "Auto-run stopper",
            description: "This tile stops the auto-run activated by the <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Auto run'} }, true)\">auto-run sprite</span>.",
            type: this.SPRITE_TYPES.object,
            animation: [{
                    sprite: [
                        ["transp", "transp", "FFC6C6", "FFC6C6", "FFC6C6", "FFC6C6", "transp", "transp"],
                        ["transp", "FFC6C6", "390000", "390000", "390000", "390000", "FFC6C6", "transp"],
                        ["FFC6C6", "390000", "FFC6C6", "390000", "390000", "390000", "390000", "FFC6C6"],
                        ["FFC6C6", "390000", "390000", "FFC6C6", "390000", "390000", "390000", "FFC6C6"],
                        ["FFC6C6", "390000", "390000", "390000", "FFC6C6", "390000", "390000", "FFC6C6"],
                        ["FFC6C6", "390000", "390000", "390000", "390000", "FFC6C6", "390000", "FFC6C6"],
                        ["transp", "FFC6C6", "390000", "390000", "390000", "390000", "FFC6C6", "transp"],
                        ["transp", "transp", "FFC6C6", "FFC6C6", "FFC6C6", "FFC6C6", "transp", "transp"],
                    ]
                },
                {
                    sprite: [
                        ["transp", "transp", "FFC6C6", "FFC6C6", "FFC6C6", "FFC6C6", "transp", "transp"],
                        ["transp", "FFC6C6", "710000", "710000", "710000", "710000", "FFC6C6", "transp"],
                        ["FFC6C6", "710000", "FFC6C6", "710000", "710000", "710000", "710000", "FFC6C6"],
                        ["FFC6C6", "710000", "710000", "FFC6C6", "710000", "710000", "710000", "FFC6C6"],
                        ["FFC6C6", "710000", "710000", "710000", "FFC6C6", "710000", "710000", "FFC6C6"],
                        ["FFC6C6", "710000", "710000", "710000", "710000", "FFC6C6", "710000", "FFC6C6"],
                        ["transp", "FFC6C6", "710000", "710000", "710000", "710000", "FFC6C6", "transp"],
                        ["transp", "transp", "FFC6C6", "FFC6C6", "FFC6C6", "FFC6C6", "transp", "transp"],
                    ]
                }
            ]
        };
        this.PATH_SPRITE = {
            name: ObjectTypes.PATH_POINT,
            changeableAttributes: [
                { name: this.changeableAttributeTypes.speed, defaultValue: 3, minValue: 1, maxValue: 7, mapper: this.pathMovementMapper },
                {
                    name: this.changeableAttributeTypes.stopFrames, defaultValue: 10, minValue: 0, maxValue: 80, step: 5, descriptiveName: "wait <span data-microtip-size='large'aria-label='The objects on the path will wait that amount of time, if an object reaches the path´s end.'"
                        + "data-microtip-position='top-left' role='tooltip' class='songInputInfo'>"
                        + "<img src='images/icons/info.svg' alt='info' width='16' height='16'>"
                },
                {
                    name: this.changeableAttributeTypes.movementDirection, formElement: this.changeableAttributeFormElements.toggle, defaultValue: AnimationHelper.possibleDirections.forwards,
                    options: [{ "true": AnimationHelper.possibleDirections.forwards }, { "false": AnimationHelper.possibleDirections.backwards }]
                },
            ],
            directions: [AnimationHelper.facingDirections.top, AnimationHelper.facingDirections.right],
            descriptiveName: "Path",
            description: "<div>Draw paths, put objects on top and the objects will follow them. Click on an already set path-point, while paths are selected in build-tools to adjust the path's attributes."
                + "<div class='subSection'>"
                + "<details><summary>Compatible objects</summary><div class='marginTop8'><ul style='padding-left: 16px'><li>Finish flag</li><li>Spikes</li><li>Trampolines</li><li>Toggle mine</li><li>Rocket launchers</li><li>Portals</li><li>Collectibles</li><li>Barrel cannons</li><li>Jump reset</li></ul></div></details>"
                + "<details class='marginTop8'><summary>Rules</summary><div class='marginTop8'><ul style='padding-left: 16px'><li>Draw paths in a line or in an enclosed 'circle'</li><li>Place as many different objects on them as you want</li><li>You can't draw 2 paths above or beside each other. You need to leave 1 free space inbetween</li></ul></div></details>"
                + "</div></div>",
            type: this.SPRITE_TYPES.object,
            animation: [{
                    sprite: [
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['FFFFFF', 'FFFFFF', 'transp', 'FFFFFF', 'FFFFFF', 'transp', 'FFFFFF', 'FFFFFF'],
                        ['1C1C1C', '1C1C1C', 'transp', '1C1C1C', '1C1C1C', 'transp', '1C1C1C', '1C1C1C'],
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                    ]
                },
            ]
        };
        this.DEKO_SPRITE = {
            name: ObjectTypes.DEKO,
            type: this.SPRITE_TYPES.deko,
            descriptiveName: "Deco 1",
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "40BF40", "transp", "transp", "transp", "40BF40"],
                        ["transp", "40BF40", "transp", "40BF40", "transp", "40BF40", "transp", "40BF40"],
                        ["transp", "40BF40", "40BF40", "40BF40", "40BF40", "40BF40", "transp", "40BF40"],
                        ["40BF40", "40BF40", "40BF40", "40BF40", "40BF40", "40BF40", "transp", "40BF40"],
                    ]
                }
            ]
        };
        this.DEKO_SPRITE2 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 2",
            type: this.SPRITE_TYPES.deko,
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "FF55FF", "FF55FF", "transp"],
                        ["transp", "FF5555", "FF5555", "transp", "FF00FF", "transp", "transp", "FF00FF"],
                        ["FF5555", "transp", "transp", "FF5555", "transp", "FF00FF", "FF00FF", "transp"],
                        ["transp", "FF5555", "FF5555", "transp", "transp", "2B802B", "2B802B", "transp"],
                    ]
                }
            ]
        };
        this.DEKO_SPRITE3 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 3",
            type: this.SPRITE_TYPES.deko,
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"],
                        ["FFFFFF", "FFFFFF", "transp", "FFFFFF", "FFFFFF", "transp", "FFFFFF", "FFFFFF"],
                        ["FFFFFF", "FFFFFF", "FFFFFF", "0000FF", "0000FF", "FFFFFF", "FFFFFF", "FFFFFF"],
                        ["transp", "transp", "transp", "0000FF", "0000FF", "transp", "transp", "transp"],
                        ["FFFFFF", "FFFFFF", "55AAFF", "transp", "transp", "55AAFF", "FFFFFF", "FFFFFF"],
                        ["FFFFFF", "FFFFFF", "FFFFFF", "55AAFF", "55AAFF", "FFFFFF", "FFFFFF", "FFFFFF"],
                        ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.DEKO_SPRITE4 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 4",
            type: this.SPRITE_TYPES.deko,
            animation: [{
                    sprite: [
                        ["transp", "2B8055", "transp", "15402A", "15402A", "transp", "2B8055", "transp"],
                        ["transp", "2B8055", "2B8055", "15402A", "15402A", "2B8055", "2B8055", "transp"],
                        ["transp", "transp", "2B8055", "15402A", "15402A", "2B8055", "transp", "transp"],
                        ["transp", "transp", "transp", "15402A", "15402A", "transp", "transp", "transp"],
                        ["transp", "2B8055", "transp", "15402A", "15402A", "transp", "2B8055", "transp"],
                        ["transp", "2B8055", "2B8055", "15402A", "15402A", "2B8055", "2B8055", "transp"],
                        ["transp", "transp", "2B8055", "15402A", "15402A", "2B8055", "transp", "transp"],
                        ["transp", "transp", "transp", "15402A", "15402A", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.DEKO_SPRITE5 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 5",
            type: this.SPRITE_TYPES.deko,
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["713900", "transp", "transp", "transp", "transp", "transp", "transp", "AA5500"],
                        ["713900", "E37100", "E37100", "E37100", "E37100", "E37100", "E37100", "AA5500"],
                        ["713900", "transp", "transp", "transp", "transp", "transp", "transp", "AA5500"],
                        ["713900", "E37100", "E37100", "E37100", "E37100", "E37100", "E37100", "AA5500"],
                        ["713900", "transp", "transp", "transp", "transp", "transp", "transp", "AA5500"],
                        ["713900", "E37100", "E37100", "E37100", "E37100", "E37100", "E37100", "AA5500"],
                    ]
                }
            ]
        };
        this.DEKO_SPRITE6 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 6",
            type: this.SPRITE_TYPES.deko,
            animation: [{
                    sprite: [
                        ["717171", "8E8E8E", "AAAAAA", "C6C6C6", "C6C6C6", "AAAAAA", "8E8E8E", "717171"],
                        ["transp", "717171", "8E8E8E", "AAAAAA", "AAAAAA", "8E8E8E", "717171", "transp"],
                        ["transp", "transp", "FFFF1C", "FFFF55", "FFFF55", "FFFF1C", "transp", "transp"],
                        ["transp", "717171", "710071", "AA00AA", "AA00AA", "710071", "717171", "transp"],
                        ["717171", "8E8E8E", "AAAAAA", "C6C6C6", "C6C6C6", "AAAAAA", "8E8E8E", "717171"],
                        ["717171", "8E8E8E", "AAAAAA", "C6C6C6", "C6C6C6", "AAAAAA", "8E8E8E", "717171"],
                        ["717171", "8E8E8E", "AAAAAA", "C6C6C6", "C6C6C6", "AAAAAA", "8E8E8E", "717171"],
                        ["transp", "717171", "8E8E8E", "AAAAAA", "AAAAAA", "8E8E8E", "717171", "transp"]
                    ]
                },
            ]
        };
        this.DEKO_SPRITE7 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 7",
            type: this.SPRITE_TYPES.deko,
            animation: [
                {
                    sprite: [
                        ["2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A"],
                        ["transp", "2A2A2A", "transp", "transp", "2A2A2A", "transp", "2A2A2A", "transp"],
                        ["transp", "2A2A2A", "transp", "2A2A2A", "transp", "transp", "2A2A2A", "transp"],
                        ["transp", "2A2A2A", "transp", "2A2A2A", "2A2A2A", "transp", "2A2A2A", "transp"],
                        ["transp", "2A2A2A", "transp", "transp", "2A2A2A", "transp", "2A2A2A", "transp"],
                        ["transp", "2A2A2A", "transp", "2A2A2A", "transp", "transp", "2A2A2A", "transp"],
                        ["transp", "2A2A2A", "transp", "2A2A2A", "2A2A2A", "transp", "2A2A2A", "transp"],
                        ["2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A"],
                    ]
                }
            ]
        };
        this.DEKO_SPRITE8 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 8",
            type: this.SPRITE_TYPES.deko,
            animation: [{
                    sprite: [
                        ["2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "transp", "2A2A2A", "2A2A2A"],
                        ["2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "transp", "2A2A2A", "2A2A2A"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["2A2A2A", "2A2A2A", "transp", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A"],
                        ["2A2A2A", "2A2A2A", "transp", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "transp", "2A2A2A", "2A2A2A"],
                        ["2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "transp", "2A2A2A", "2A2A2A"],
                    ]
                }
            ]
        };
        this.DEKO_SPRITE9 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 9",
            type: this.SPRITE_TYPES.deko,
            animation: [
                {
                    sprite: [
                        ['transp', 'transp', 'transp', 'FF8E1C', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'FF8E1C', 'FFC68E', 'FF8E1C', 'transp', 'transp', 'transp'],
                        ['transp', 'FF8E1C', 'FFC68E', 'FFFFC6', 'FFC68E', 'FF8E1C', 'transp', 'transp'],
                        ['transp', 'FF8E1C', 'FFC68E', 'FFFFC6', 'FFC68E', 'FF8E1C', 'transp', 'transp'],
                        ['transp', '8E8E8E', 'AAAAAA', 'AAAAAA', 'AAAAAA', '8E8E8E', 'transp', 'transp'],
                        ['transp', 'transp', '8E8E8E', 'AAAAAA', '8E8E8E', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', '8E8E8E', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', '8E8E8E', 'transp', 'transp', 'transp', 'transp']
                    ]
                },
                {
                    sprite: [
                        ["transp", "transp", "transp", "AA5500", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "AA5500", "FF8E1C", "AA5500", "transp", "transp", "transp"],
                        ["transp", "AA5500", "FF8E1C", "FFFF8E", "FF8E1C", "AA5500", "transp", "transp"],
                        ["transp", "AA5500", "FF8E1C", "FFFF8E", "FF8E1C", "AA5500", "transp", "transp"],
                        ["transp", "8E8E8E", "AAAAAA", "AAAAAA", "AAAAAA", "8E8E8E", "transp", "transp"],
                        ["transp", "transp", "8E8E8E", "AAAAAA", "8E8E8E", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "8E8E8E", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "8E8E8E", "transp", "transp", "transp", "transp"]
                    ]
                }
            ]
        };
        this.DEKO_SPRITE10 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 10",
            type: this.SPRITE_TYPES.deko,
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"],
                        ["transp", "transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp", "transp"],
                        ["transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp"],
                        ["C6E3FF", "C6E3FF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp"],
                        ["C6E3FF", "C6E3FF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
                        ["transp", "C6E3FF", "C6E3FF", "C6E3FF", "C6E3FF", "C6E3FF", "C6E3FF", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]
                    ]
                }
            ]
        };
        this.DEKO_SPRITE11 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 11",
            type: this.SPRITE_TYPES.deko,
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "FFC6FF", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "FFC6FF", "FFFFFF", "FFC6FF", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "FFC6FF", "transp", "transp", "FFC6FF", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "FFC6FF", "FFFFFF", "FFC6FF", "transp"],
                        ["transp", "transp", "FFC6FF", "transp", "transp", "FFC6FF", "transp", "transp"],
                        ["transp", "FFC6FF", "FFFFFF", "FFC6FF", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "FFC6FF", "transp", "transp", "transp", "transp", "transp"]
                    ]
                },
                {
                    sprite: [
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', '393939', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', '393939', 'FFC6FF', '393939', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', '393939', 'transp', 'transp', '393939', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', '393939', 'FFC6FF', '393939', 'transp'],
                        ['transp', 'transp', '393939', 'transp', 'transp', '393939', 'transp', 'transp'],
                        ['transp', '393939', 'FFC6FF', '393939', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', '393939', 'transp', 'transp', 'transp', 'transp', 'transp']
                    ]
                }
            ]
        };
        this.DEKO_SPRITE12 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 12",
            type: this.SPRITE_TYPES.deko,
            animation: [{
                    sprite: [
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', '0055AA', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', '8EC6FF', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', '8EC6FF', 'C6E3FF', '8EC6FF', 'transp', 'transp', 'transp'],
                        ['0055AA', '8EC6FF', 'C6E3FF', 'C6E3FF', 'C6E3FF', '8EC6FF', '0055AA', 'transp'],
                        ['transp', 'transp', '8EC6FF', 'C6E3FF', '8EC6FF', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', '8EC6FF', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', '0055AA', 'transp', 'transp', 'transp', 'transp']
                    ]
                },
                {
                    sprite: [
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', '003971', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', '0055AA', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', '0055AA', 'C6E3FF', '0055AA', 'transp', 'transp', 'transp'],
                        ['003971', '0055AA', 'C6E3FF', 'C6E3FF', 'C6E3FF', '0055AA', '003971', 'transp'],
                        ['transp', 'transp', '0055AA', 'C6E3FF', '0055AA', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', '0055AA', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', '003971', 'transp', 'transp', 'transp', 'transp']
                    ]
                }
            ]
        };
        this.DEKO_SPRITE13 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 13",
            type: this.SPRITE_TYPES.deko,
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "55AA00", "397100", "transp", "transp", "transp"],
                        ["transp", "55AA00", "transp", "55AA00", "397100", "transp", "transp", "transp"],
                        ["transp", "55AA00", "transp", "55AA00", "397100", "transp", "transp", "transp"],
                        ["transp", "55AA00", "55AA00", "55AA00", "397100", "transp", "55AA00", "transp"],
                        ["transp", "transp", "transp", "55AA00", "397100", "transp", "55AA00", "transp"],
                        ["transp", "transp", "transp", "55AA00", "55AA00", "55AA00", "55AA00", "transp"],
                        ["transp", "transp", "transp", "55AA00", "397100", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "55AA00", "397100", "transp", "transp", "transp"]
                    ]
                },
            ]
        };
        this.DEKO_SPRITE14 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 14",
            type: this.SPRITE_TYPES.deko,
            animation: [{
                    sprite: [
                        ["transp", "transp", "2B8055", "2B8055", "2B8055", "2B8055", "transp", "transp"],
                        ["transp", "2B8055", "2B8055", "15402A", "2B8055", "15402A", "2B8055", "transp"],
                        ["transp", "2B8055", "15402A", "2B8055", "15402A", "15402A", "2B8055", "transp"],
                        ["transp", "2B8055", "2B8055", "15402A", "15402A", "2B8055", "2B8055", "transp"],
                        ["transp", "2B8055", "15402A", "15402A", "391C00", "15402A", "2B8055", "transp"],
                        ["transp", "transp", "2B8055", "391C00", "713900", "2B8055", "transp", "transp"],
                        ["transp", "transp", "transp", "391C00", "713900", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "391C00", "713900", "transp", "transp", "transp"]
                    ]
                }
            ]
        };
        this.DEKO_SPRITE15 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 15",
            type: this.SPRITE_TYPES.deko,
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "393939", "transp", "transp"],
                        ["transp", "393939", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "713900", "transp", "transp", "transp"],
                        ["transp", "transp", "713900", "713900", "713900", "713900", "transp", "transp"],
                        ["transp", "713900", "713900", "713900", "713900", "713900", "713900", "transp"]
                    ]
                },
                {
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "393939", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "393939", "transp"],
                        ["transp", "transp", "transp", "transp", "713900", "transp", "transp", "transp"],
                        ["transp", "transp", "713900", "713900", "713900", "713900", "transp", "transp"],
                        ["transp", "713900", "713900", "713900", "713900", "713900", "713900", "transp"]
                    ]
                }
            ]
        };
        this.DEKO_SPRITE16 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 16",
            type: this.SPRITE_TYPES.deko,
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "transp", "transp", "transp"],
                        ["transp", "55AAFF", "55AAFF", "transp", "55AAFF", "transp", "transp", "transp"],
                        ["FFFF8E", "FFFF8E", "55AAFF", "55AAFF", "55AAFF", "transp", "transp", "transp"],
                        ["transp", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "55AAFF"],
                        ["transp", "transp", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "transp"],
                        ["transp", "transp", "transp", "FFFF8E", "FFFF8E", "transp", "transp", "transp"],
                    ]
                },
                {
                    sprite: [
                        ['transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp', 'transp'],
                        ['transp', '55AAFF', '55AAFF', '55AAFF', '55AAFF', 'transp', 'transp', 'transp'],
                        ['FFFF8E', '55AAFF', '55AAFF', 'transp', '55AAFF', 'transp', 'transp', 'transp'],
                        ['transp', 'FFFF8E', '55AAFF', '55AAFF', '55AAFF', 'transp', 'transp', 'transp'],
                        ['FFFF8E', '55AAFF', '55AAFF', '55AAFF', '55AAFF', '55AAFF', '55AAFF', '55AAFF'],
                        ['transp', 'transp', '55AAFF', '55AAFF', '55AAFF', '55AAFF', '55AAFF', 'transp'],
                        ['transp', 'transp', 'transp', 'transp', 'FFFF8E', 'transp', 'transp', 'transp'],
                        ['transp', 'transp', 'transp', 'FFFF8E', 'FFFF8E', 'transp', 'transp', 'transp']
                    ]
                }
            ]
        };
        this.DEKO_SPRITE17 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 17",
            type: this.SPRITE_TYPES.deko,
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"],
                        ["transp", "transp", "FFFFFF", "000000", "717171", "FFFFFF", "transp", "transp"],
                        ["transp", "transp", "FFFFFF", "FFFFFF", "FF8E1C", "FF8E1C", "transp", "transp"],
                        ["AA5500", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "AA5500"],
                        ["transp", "AA5500", "FFFFFF", "FFFFFF", "000000", "FFFFFF", "AA5500", "transp"],
                        ["transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp"],
                        ["transp", "FFFFFF", "FFFFFF", "FFFFFF", "000000", "FFFFFF", "FFFFFF", "transp"],
                        ["transp", "transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp", "transp"]
                    ]
                }
            ]
        };
        this.DEKO_SPRITE18 = {
            name: ObjectTypes.DEKO,
            descriptiveName: "Deco 18",
            type: this.SPRITE_TYPES.deko,
            animation: [{
                    sprite: [
                        ["E30000", "FF1C1C", "transp", "transp", "transp", "transp", "FF1C1C", "E30000"],
                        ["AA0000", "transp", "1C1CFF", "FFFFFF", "1C1CFF", "FFFFFF", "transp", "E30000"],
                        ["transp", "AA0000", "0000E3", "1C1CFF", "0000E3", "1C1CFF", "AA0000", "transp"],
                        ["transp", "transp", "AA0000", "E30000", "E30000", "E30000", "transp", "transp"],
                        ["transp", "transp", "transp", "AA0000", "E30000", "transp", "transp", "transp"],
                        ["transp", "transp", "E30000", "AA0000", "E30000", "E30000", "transp", "transp"],
                        ["transp", "transp", "transp", "AA0000", "E30000", "transp", "transp", "transp"],
                        ["transp", "transp", "E30000", "transp", "transp", "E30000", "transp", "transp"]
                    ]
                },
                {
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["E30000", "FF1C1C", "transp", "transp", "transp", "transp", "FF1C1C", "E30000"],
                        ["AA0000", "transp", "AA0000", "FF1C1C", "AA0000", "FF1C1C", "transp", "E30000"],
                        ["transp", "AA0000", "AA0000", "AA0000", "AA0000", "AA0000", "AA0000", "transp"],
                        ["transp", "transp", "AA0000", "E30000", "E30000", "E30000", "transp", "transp"],
                        ["transp", "transp", "transp", "AA0000", "E30000", "transp", "transp", "transp"],
                        ["transp", "transp", "E30000", "AA0000", "E30000", "E30000", "transp", "transp"],
                        ["transp", "transp", "E30000", "transp", "transp", "E30000", "transp", "transp"]
                    ]
                }
            ]
        };
        this.SFX1 = {
            name: ObjectTypes.SFX,
            directions: [AnimationHelper.facingDirections.bottom, AnimationHelper.facingDirections.left, AnimationHelper.facingDirections.top, AnimationHelper.facingDirections.right],
            descriptiveName: "SFX 1",
            description: "SFX that shows when the <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Player jump'} }, true)\">player jumps</span>.",
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"],
                    ]
                },
                {
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"],
                        ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"],
                    ]
                }
            ]
        };
        this.SFX2 = {
            name: ObjectTypes.SFX,
            descriptiveName: "SFX 2",
            description: "SFX when <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Cannon ball'} }, true)\">cannon ball</span> or " +
                "<span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Rocket'} }, true)\">rocket</span> hit a wall.",
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"],
                        ["transp", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "transp"],
                        ["transp", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "transp"],
                        ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                },
                {
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "transp"],
                        ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"],
                        ["transp", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.SFX3 = {
            name: ObjectTypes.SFX,
            descriptiveName: "SFX 3",
            description: "SFX when player dashes",
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "393939", "393939", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "393939", "393939", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                },
                {
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "393939", "transp", "transp", "393939", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "393939", "transp", "transp", "393939", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.SFX4 = {
            name: ObjectTypes.SFX,
            descriptiveName: "Build SFX",
            hiddenEverywhere: true,
            description: "SFX when an object is placed in build mode",
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp"],
                        ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"],
                        ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"],
                        ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"],
                        ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"],
                        ["transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                },
            ]
        };
        this.SFX5 = {
            name: ObjectTypes.SFX,
            descriptiveName: "SFX 4",
            description: "Plays when the player touches a <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Collectible'} }, true)\">collectible</span>.",
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"],
                        ["transp", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "transp"],
                        ["transp", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "transp"],
                        ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                },
                {
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "transp"],
                        ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"],
                        ["transp", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.SFX6 = {
            name: ObjectTypes.SFX,
            descriptiveName: "SFX 5",
            description: "Used for shaders",
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "8EC6FF", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "8EC6FF", "transp", "8EC6FF", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "8EC6FF", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                },
            ]
        };
        this.SFX7 = {
            name: ObjectTypes.SFX,
            descriptiveName: "SFX 6",
            description: "Used for shaders",
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "FF8EFF", "FF8EFF", "FF8EFF", "FF8EFF", "transp", "transp"],
                        ["transp", "transp", "FF8EFF", "transp", "transp", "FF8EFF", "transp", "transp"],
                        ["transp", "transp", "FF8EFF", "transp", "transp", "FF8EFF", "transp", "transp"],
                        ["transp", "transp", "FF8EFF", "FF8EFF", "FF8EFF", "FF8EFF", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                },
            ]
        };
        this.SFX8 = {
            name: ObjectTypes.SFX,
            descriptiveName: "SFX 7",
            description: "Used for shaders",
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "FFAA55", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                },
                {
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "FFFF55", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.SFX9 = {
            name: ObjectTypes.SFX,
            descriptiveName: "SFX 8",
            description: "Will be displayed behind the player, if the player is in auto-run mode.",
            animation: [{
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "FFAA55", "FFAA55", "transp", "transp", "transp"],
                        ["transp", "transp", "FFAA55", "transp", "transp", "FFAA55", "transp", "transp"],
                        ["transp", "transp", "FFAA55", "transp", "transp", "FFAA55", "transp", "transp"],
                        ["transp", "transp", "transp", "FFAA55", "FFAA55", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                },
                {
                    sprite: [
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "FFAA55", "transp", "transp", "FFAA55", "transp", "transp"],
                        ["transp", "FFAA55", "transp", "transp", "transp", "transp", "FFAA55", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                        ["transp", "FFAA55", "transp", "transp", "transp", "transp", "FFAA55", "transp"],
                        ["transp", "transp", "FFAA55", "transp", "transp", "FFAA55", "transp", "transp"],
                        ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                    ]
                }
            ]
        };
        this.allSprites = [];
        this.fillAllSprites = () => {
            this.allSprites = Object.entries(this.this_array).filter((key) => this.this_array[key[0]]?.descriptiveName).map((object) => object[1]);
        };
        this.fillAllSprites();
    }
    static allTileSprites() {
        return [
            ...this.allSprites.filter((sprite) => Number.isInteger(sprite.name)),
            this.TILE_edge
        ];
    }
    static get SPRITE_TYPES() {
        return {
            tile: "tiles",
            object: "objects",
            deko: "deco"
        };
    }
    static get EMPTY_ANIMATION_FRAME() {
        return {
            sprite: [
                ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
                ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"],
            ]
        };
    }
    static getSpritesByIndex(index) {
        return this.allSprites[index];
    }
    static getSpritesByName(name) {
        return this.allSprites.filter((sprite) => sprite.name === name);
    }
    static getCustomSprites() {
        return this.allSprites.filter((sprite) => sprite.custom);
    }
    static getSpritesByType(type) {
        return this.allSprites.filter((sprite) => sprite.type === type && !sprite.hiddenSprite);
    }
    static getSpritesByDescrpitiveName(descriptiveName) {
        return this.allSprites.filter((sprite) => sprite.descriptiveName === descriptiveName);
    }
    static getIndexOfSprite(searchValue, index = 0, searchKey = "name") {
        let indexInSpriteArray = 0;
        let currentIndexForSameSprites = 0;
        this.allSprites.every((sprite, spriteIndex) => {
            if (sprite[searchKey] === searchValue) {
                if (currentIndexForSameSprites === index) {
                    indexInSpriteArray = spriteIndex;
                    return false;
                }
                else {
                    currentIndexForSameSprites++;
                }
            }
            return true;
        });
        return indexInSpriteArray;
    }
}
SpritePixelArrays.this_array = {};
class Sound {
    constructor(src, id = "", loop = false) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        if (id) {
            this.sound.id = id;
        }
        this.errorWhileLoading = false;
        this.sound.loop = loop;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.onloadeddata = () => this.loadedSrc();
        this.sound.onerror = () => { this.errorWhileLoading = true; };
        this.loaded = false;
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
    }
    loadedSrc() {
        this.loaded = true;
    }
    stopAndPlay() {
        if (this.loaded) {
            this.sound.currentTime > 0 && this.sound.pause();
            this.sound.currentTime = 0;
            this.sound.play();
        }
    }
    play() {
        if (this.loaded) {
            this.sound.play();
        }
    }
    stop() {
        if (this.loaded) {
            this.sound.pause();
        }
    }
}
class SoundHandler {
    static _staticConstructor() {
        this.sounds = [
            { key: "shortJump", value: "https://drive.google.com/uc?export=download&id=1Q54bi8oothHVvLPrqOMT5fmJA8tpoXLa" },
            { key: "longJump", value: "https://drive.google.com/uc?export=download&id=12m9FxLjEyBORA4FP3xwb6rxjBQvBb3U2" },
            { key: "hit", value: "https://drive.google.com/uc?export=download&id=11AUmOV0mBVP6LWb6sd_g1C88rkzLIGrV" },
            { key: "win", value: "https://drive.google.com/uc?export=download&id=1xk9DMqJDWj-4urGLw6jig8H9-U_RwA_v" },
            { key: "pickup", value: "https://drive.google.com/uc?export=download&id=1U81-o2IpSH1SGN4B492ztpoq2uQLGHvt" },
            { key: "guiSelect", value: "https://drive.google.com/uc?export=download&id=13INaCaIZpL3EIXayJr-lRzCNptqFDjYp" },
            { key: "dash", value: "https://drive.google.com/uc?export=download&id=1L9FUOzkYmXwOAzHrqJTw6Rwhg6LI0hHm" },
            { key: "checkpoint", value: "https://drive.google.com/uc?export=download&id=1aM3MbC-D2lxTnIEqpLoevxsE1WiiAdKQ" },
            { key: "allCoinsCollected", value: "https://drive.google.com/uc?export=download&id=13G9ILQvGiMyBczD8K39SzYpAnHgZOElU" },
            { key: "dialogueSound", value: "https://drive.google.com/uc?export=download&id=16lQ6U0MN1xTAc263JmM-LIJnY1uI6JGx" },
            { key: "bubble", value: "https://drive.google.com/uc?export=download&id=1LLScpBZq_Ukjxl03ifdHYVIYttYv4iBo" },
            { key: "barrel", value: "https://drive.google.com/uc?export=download&id=1APTVswGa7ZD6DpmI5mo-yO5JWUnKWBdc" },
            { key: "jumpReset", value: "https://drive.google.com/uc?export=download&id=1pAl98sb2QSaAZImdGmBdcBAY_zNBFawG" },
            { key: "song", value: "" },
            //{ key: "build", value: "https://drive.google.com/uc?export=download&id=1hgwOVAX30LJ9A71xoAU8IGnXwcm6L2Fc"},
        ];
        this.sounds.forEach(sound => {
            if (sound.key === "song" && undefined) {
                this.song = new Sound("", "mainSong", true);
            }
            else {
                this.this_array[sound.key] = new Sound(sound.value);
            }
        });
    }
    static setVolume(audoElementId, volume = 1) {
        const sound = document.getElementById(audoElementId);
        if (sound) {
            sound.setAttribute("volume", volume.toString());
        }
    }
    ;
    static fadeAudio(audoElementId, interval = 200) {
        if (audoElementId) {
            const sound = document.getElementById(audoElementId);
            if (sound == null)
                return;
            let _vol = sound.getAttribute('volume');
            let vol = 0;
            if (_vol != null)
                vol = Number.parseInt(_vol.toString());
            if (sound) {
                const fadeAudio = setInterval(() => {
                    if (vol !== 0) {
                        vol -= 0.1;
                        sound.setAttribute('volume', vol.toString());
                    }
                    if (vol < 0.11) {
                        clearInterval(fadeAudio);
                    }
                }, interval);
            }
        }
    }
}
class EffectsHandler {
    static staticConstructor() {
        this.addEffectButton = document.getElementById("addEffectButton");
        this.existingEffectsEl = document.getElementById("existingEffects");
        this.editingEffects = document.getElementById("editingEffects");
        this.effectTypes = {
            SFXLayer: "SFXLayer",
            Flashlight: "Flashlight",
            BlackAndWhite: "Black and white",
            Noise: "Noise",
        };
        this.defaultAttributeObjects = {
            [this.effectTypes.SFXLayer]: () => { return this.getSfxLayerObject(); },
            [this.effectTypes.Flashlight]: () => { return this.getFlashlightObject(); },
            [this.effectTypes.Noise]: () => { return this.getNoiseObject(); },
        };
        this.parsersObject = {
            [this.effectTypes.SFXLayer]: (attributesObject) => { return this.parseSFXLayerValues(attributesObject); },
            [this.effectTypes.Flashlight]: (attributesObject) => { return this.parseFlashlightValues(attributesObject); },
            [this.effectTypes.Noise]: (attributesObject) => { return this.parseNoiseValues(attributesObject); },
        }; /*
        this.htmlTemplateObject = {
            [this.effectTypes.SFXLayer]: (effectsObject) => { return EffectHtmlRenderer.createSFXLayerTemplate(effectsObject) },
            [this.effectTypes.Flashlight]: (effectsObject) => { return EffectHtmlRenderer.createFlashlightTemplate(effectsObject) },
            [this.effectTypes.Noise]: (effectsObject) => { return EffectHtmlRenderer.createNoiseTemplate(effectsObject) },
        }*/
        this.noiseFlickerIntensities = {
            1: 32,
            2: 16,
            3: 8,
            4: 4,
        };
        this.effectsOrder = [this.effectTypes.Flashlight, this.effectTypes.SFXLayer, this.effectTypes.Noise, this.effectTypes.BlackAndWhite];
    }
    static getBasicAttributes(name) {
        return {
            type: name,
            activeLevels: [
                "allLevels"
            ],
        };
    }
    static getSfxLayerObject() {
        return {
            ...this.getBasicAttributes(this.effectTypes.SFXLayer),
            sfxIndex: 5,
            intensity: 4,
            duration: 60,
            growByStep: 1,
            xSpeed: {
                speedFrom: -2,
                speedTo: 3,
                style: "fromNegativeToPositive"
            },
            ySpeed: {
                speedFrom: 1,
                speedTo: 3,
                style: "fromNegativeToPositive"
            },
            widthDimensions: "full",
            heightDimensions: "full"
        };
    }
    static getFlashlightObject() {
        return {
            ...this.getBasicAttributes(this.effectTypes.Flashlight),
            radius: 140,
            flickerRadius: 4,
            position: "background",
            color: "#000000",
        };
    }
    static getNoiseObject() {
        return {
            ...this.getBasicAttributes(this.effectTypes.Noise),
            alpha: 0.06,
            flickerIntensity: 3,
        };
    }
    /*
    static changeTemplate() {
        var templateHandler = document.getElementById("templateHandler");
        if(templateHandler == null) return;
        const value = (<HTMLInputElement>templateHandler).value;
        const templateArea = document.getElementById("sfxTemplateSummary");
        if(templateArea == null) return;
        const attributesAccordion = document.getElementById("attributesAccordion");
        if(attributesAccordion == null) return;

        if (value in this.defaultAttributeObjects) {
            attributesAccordion.style.display = "block";
            templateArea.innerHTML = EffectHtmlRenderer.chooseSfxAttributesTemplate(this.defaultAttributeObjects[value]());
        }
        else {
            attributesAccordion.style.display = "none";
        }
    }*/
    /*
    static removeLayer(index) {
        WorldDataHandler.effects?.splice(index, 1);
        tileMapHandler.effects = this.getCurrentLevelEffects(tileMapHandler.currentLevel);
        this.updateExistingSFXSection();
    }*/
    /*
    static updateExistingSFXSection() {
        let sfxSectionHtml = "";
        WorldDataHandler.effects?.forEach((effect, index) => {
            let effectName = effect.type === this.effectTypes.SFXLayer ? "Particles" : effect.type;
            sfxSectionHtml += EffectHtmlRenderer.createExistingEffectsSection(effectName, index);
        });
        if(this.existingEffectsEl) this.existingEffectsEl.innerHTML = sfxSectionHtml;
    }*/
    static parseBasicEffectValues(type) {
        let attributesObject = { type: type, activeLevels: [] };
        WorldDataHandler.levels.forEach((_, index) => {
            if (document.getElementById("levelChecked" + index).checked) {
                attributesObject.activeLevels.push(index);
            }
        });
        return attributesObject;
    }
    static parseSFXLayerValues(attributesObject) {
        attributesObject.intensity = 61 - parseInt(document.getElementById("intensity").value) || 4;
        ["sfxIndex", "duration"].forEach(attribute => {
            attributesObject[attribute] = parseInt(document.getElementById(attribute).value) || 0;
        });
        attributesObject.growByStep = parseFloat(document.getElementById("growByStep").value) || 1;
        attributesObject.xSpeed = this.getSFXSpeed("xSpeed");
        attributesObject.ySpeed = this.getSFXSpeed("ySpeed");
        attributesObject.widthDimensions = "full";
        attributesObject.heightDimensions = "full";
        return attributesObject;
    }
    static parseFlashlightValues(attributesObject) {
        attributesObject.radius = parseInt(document.getElementById("radius").value) || 140;
        attributesObject.flickerRadius = parseInt(document.getElementById("flickerRadius")?.value) || 0;
        attributesObject.position = document.querySelector('input[name="flashlightPosition"]:checked')?.getAttribute('value');
        return attributesObject;
    }
    static parseNoiseValues(attributesObject) {
        attributesObject.alpha = parseFloat(document.getElementById("noiseAlpha").value) || 0.07;
        attributesObject.flickerIntensity = parseFloat(document.getElementById("noiseFlickerIntensity").value) || 8;
        return attributesObject;
    }
    /*
    static addEffect(event, index) {
        event.preventDefault();
        const value = (<HTMLInputElement>document.getElementById("templateHandler")).value;
        let attributesObject = this.parseBasicEffectValues(value);
        if (value in this.parsersObject) {
            attributesObject = this.parsersObject[value](attributesObject);
        }
        index !== null ? WorldDataHandler.effects[index] = attributesObject : WorldDataHandler.effects.push(attributesObject);
        tileMapHandler.effects = this.getCurrentLevelEffects(tileMapHandler.currentLevel);
        this.removeEffectTemplate();
        this.updateExistingSFXSection();
        this.existingEffectsEl.style.display = "block";
        this.changeInitialColorModalVisibility();
    }
    */
    static getSFXSpeed(speedId) {
        return {
            speedFrom: parseFloat(document.getElementById(speedId + "From").value) || 0,
            speedTo: parseFloat(document.getElementById(speedId + "To").value) || 0,
            style: "fromNegativeToPositive"
        };
    }
    /*
    static cancelEffect() {
        this.removeEffectTemplate();
        if(this.existingEffectsEl) this.existingEffectsEl.style.display = "block";
        this.changeInitialColorModalVisibility();
    }*/
    /*
    static changeInitialColorModalVisibility(display = "block") {
        document.getElementById('worldColorsSubmitButton').style.display = display;
        document.getElementById('worldColorModalColorSection').style.display = display;
    }*/
    /*
    static removeEffectTemplate() {
        this.editingEffects.innerHTML = "";
        this.addEffectButton.style.display = "block";
    }*/
    /*
    static addEffectTemplate(index = null) {
        if(this.addEffectButton) this.addEffectButton.style.display = "none";
        if(this.existingEffectsEl) this.existingEffectsEl.style.display = "none";
        if(this.editingEffects) this.editingEffects.innerHTML = "";
        const effectTemplate = EffectHtmlRenderer.createEffectTemplate(index);
        this.changeInitialColorModalVisibility("none");
        this.editingEffects.append(effectTemplate);

        const effectType = index !== null ? WorldDataHandler.effects[index].type : this.effectTypes.SFXLayer;
        const attributesAccordion = document.getElementById("attributesAccordion");
        if(attributesAccordion) attributesAccordion.style.display = effectType in this.htmlTemplateObject ? "block" : "none";
    }*/
    static getFlashlightColors(effect, color) {
        effect.color = AnimationHelper.hexToRGB(color);
        const lighterColor = AnimationHelper.lightenDarkenColor(color, 70);
        effect.lighterColor = AnimationHelper.hexToRGB(lighterColor);
    }
    static getCurrentLevelEffects(currentLevel) {
        const currentLevelEffects = WorldDataHandler.effects.filter((effect) => {
            return effect.activeLevels.includes(currentLevel);
        });
        currentLevelEffects.forEach((effect) => {
            if (effect.type === this.effectTypes.Flashlight) {
                this.getFlashlightColors(effect, currentLevelEffects.some((effect) => effect.type === this.effectTypes.BlackAndWhite)
                    ? '000000' : '000000');
            }
            else if (effect.type === this.effectTypes.Noise) {
                effect.flicker = this.noiseFlickerIntensities[effect.flickerIntensity];
            }
        });
        return currentLevelEffects.sort((a, b) => {
            const aOrder = this.effectsOrder.indexOf(a.type);
            const bOrder = this.effectsOrder.indexOf(b.type);
            return aOrder < bOrder ? -1 : 1;
        });
        ;
    }
}
class EffectsRenderer {
    static staticConstructor(tileMapHandler) {
        this.tileMapHandler = tileMapHandler;
        this.noiseCanvas = document.getElementById("noiseCanvas");
        this.createNoiseCanvas();
        this.noisePositions = {
            left: 0,
            top: 0,
        };
    }
    static displayBackgroundSFX(effect, currentFrame, tileSize = 24) {
        const { intensity, sfxIndex, growByStep, duration, xSpeed, ySpeed } = effect;
        if (currentFrame % intensity === 0) {
            let parsedXSpeed = this.getSFXSpeedFromEffect(xSpeed);
            let parsedYSpeed = this.getSFXSpeedFromEffect(ySpeed);
            const { left, top, width, height } = Camera.viewport;
            const leftPos = this.getSFXLeftPositionFromEffect(effect, tileSize, left, left + width, "widthDimensions");
            const topPos = this.getSFXLeftPositionFromEffect(effect, tileSize, top, top + height, "heightDimensions");
            SFXHandler.createSFX(leftPos, topPos, sfxIndex, AnimationHelper.facingDirections.bottom, parsedXSpeed, parsedYSpeed, true, duration, growByStep, "backgroundSFX");
        }
    }
    static getSFXLeftPositionFromEffect(effect, tileSize, standardStart, standardEnd, dimensionName) {
        return MathHelpers.getRandomNumberBetweenTwoNumbers(standardStart, standardEnd);
    }
    static getSFXSpeedFromEffect(speedObject) {
        return speedObject.speedFrom === speedObject.speedTo ? speedObject.speedFrom
            : MathHelpers.getRandomNumberBetweenTwoNumbers(speedObject.speedFrom, speedObject.speedTo + 1, false);
    }
    static displayGreyScale() {
        if (!PauseHandler.paused) {
            Display.ctx.globalCompositeOperation = "saturation";
            Display.ctx.fillStyle = "#000000";
            Display.ctx.fillRect(Camera.viewport.left, Camera.viewport.top, Camera.viewport.width, Camera.viewport.height);
        }
    }
    static displayNoise(effect) {
        if (tileMapHandler.currentGeneralFrameCounter % effect.flicker === 0) {
            this.noisePositions.left = MathHelpers.getRandomNumberBetweenTwoNumbers(0, 100);
            this.noisePositions.top = MathHelpers.getRandomNumberBetweenTwoNumbers(0, 100);
        }
        Display.drawImageWithAlpha(this.noiseCanvas, this.noisePositions.left, this.noisePositions.top, Camera.viewport.width, Camera.viewport.height, Camera.viewport.left, Camera.viewport.top, Camera.viewport.width, Camera.viewport.height, effect.alpha);
    }
    static displayFleshlight(currentLevel, playerx, playery, radius = 200, flickerIntensity = 0, orgColor = { r: 0, g: 0, b: 0 }, lighterColor = { r: 70, g: 70, b: 70 }) {
        if (currentLevel !== 0 && currentLevel !== WorldDataHandler.levels.length - 1) {
            var radius = flickerIntensity ? MathHelpers.getRandomNumberBetweenTwoNumbers(radius, radius + flickerIntensity) : radius;
            Display.ctx.fillStyle = `rgb(${orgColor.r},${orgColor.g},${orgColor.b})`;
            Display.ctx.beginPath();
            Display.ctx.rect(Camera.viewport.left, Camera.viewport.top, Camera.viewport.width, Camera.viewport.height);
            Display.ctx.arc(playerx, playery, radius, 0, 2 * Math.PI, true);
            Display.ctx.fill();
            Display.ctx.beginPath();
            var radialGradient = Display.ctx.createRadialGradient(playerx, playery, 1, playerx, playery, radius);
            radialGradient.addColorStop(0, `rgba(${lighterColor.r},${lighterColor.g},${lighterColor.b},0.1)`);
            radialGradient.addColorStop(1, `rgba(${orgColor.r},${orgColor.g},${orgColor.b},0.9)`);
            Display.ctx.fillStyle = radialGradient;
            Display.ctx.arc(playerx, playery, radius, 0, Math.PI * 2, false);
            Display.ctx.fill();
            Display.ctx.closePath();
        }
    }
    static createNoiseCanvas() {
        var ctx = (this.noiseCanvas)?.getContext("2d");
        var noiseCanvasWidth = this.noiseCanvas?.width;
        var noiseCanvasHeight = this.noiseCanvas?.height;
        var pixelSize = 3;
        if (!noiseCanvasWidth)
            noiseCanvasWidth = NaN;
        if (!noiseCanvasHeight)
            noiseCanvasHeight = NaN;
        if (!ctx)
            return;
        const horizontalSteps = Math.round(noiseCanvasWidth / pixelSize);
        const verticalSteps = Math.round(noiseCanvasHeight / pixelSize);
        for (var i = 0; i < horizontalSteps; i++) {
            for (var j = 0; j < verticalSteps; j++) {
                const xPos = i * pixelSize;
                const yPos = j * pixelSize;
                const randomBoolean = Math.random() < 0.5;
                ctx.fillStyle = randomBoolean ? '#000000' : '#FFFFFF';
                ctx.fillRect(xPos, yPos, pixelSize, pixelSize);
            }
        }
    }
    static displayEffects(layer = 0) {
        this.tileMapHandler.effects.forEach((effect) => {
            if (layer === 0) {
                if (effect.type === EffectsHandler.effectTypes.SFXLayer) {
                    EffectsRenderer.displayBackgroundSFX(effect, this.tileMapHandler.currentGeneralFrameCounter, this.tileMapHandler.tileSize);
                    SFXHandler.updateSfxAnimations("backgroundSFX");
                }
                else if (effect.type === EffectsHandler.effectTypes.Flashlight && effect.position === "background") {
                    EffectsRenderer.displayFleshlight(this.tileMapHandler.currentLevel, this.tileMapHandler.player.x + (this.tileMapHandler.player.width / 2), this.tileMapHandler.player.y + (this.tileMapHandler.player.height / 2), effect.radius, effect.flickerRadius, effect.color, effect.lighterColor);
                }
            }
            else if (layer === 1) {
                if (effect.type === EffectsHandler.effectTypes.Flashlight && effect.position === "foreground") {
                    EffectsRenderer.displayFleshlight(this.tileMapHandler.currentLevel, this.tileMapHandler.player.x + (this.tileMapHandler.player.width / 2), this.tileMapHandler.player.y + (this.tileMapHandler.player.height / 2), effect.radius, effect.flickerRadius, effect.color, effect.lighterColor);
                }
                if (effect.type === EffectsHandler.effectTypes.Noise) {
                    EffectsRenderer.displayNoise(effect);
                }
            }
            else {
                if (effect.type === EffectsHandler.effectTypes.BlackAndWhite) {
                    EffectsRenderer.displayGreyScale();
                }
            }
        });
    }
}
class DialogueHandler {
    static staticConstructor() {
        this.setDialogueWindowToInactive();
        const dialogueWidthRelativetoCamera = 90;
        const dialogueHeightRelativetoCamera = 70;
        this.dialogueWidth = Camera.viewport.width / 100 * dialogueWidthRelativetoCamera;
        this.dialogueHeight = Camera.viewport.halfHeight / 100 * dialogueHeightRelativetoCamera;
        this.paddingFromBorder = Camera.viewport.width / 100 * (100 - dialogueWidthRelativetoCamera) / 2;
        this.upButtonReleased = false;
        this.animationDurationFrames = 2;
        this.linesAmount = 4;
        this.maxLineLength = 60;
    }
    static setDialogueWindowToInactive() {
        this.active = false;
        this.dialogue = [];
        this.currentIndex = 0;
        this.currentAnimationFrame = 0;
        this.arrowUpFrameIndex = 0;
        this.calculateDialogueWindowPosition();
    }
    static calculateDialogueWindowPosition() {
        this.leftPos = Camera.viewport.left + this.paddingFromBorder;
        this.topPos = Camera.viewport.top + Camera.viewport.height - this.dialogueHeight - this.paddingFromBorder;
    }
    static handleDialogue() {
        if (this.active) {
            const animationLength = this.dialogue[this.currentIndex].textLength * this.animationDurationFrames;
            const animationPlaying = this.currentAnimationFrame <= animationLength;
            if (animationPlaying) {
                this.currentAnimationFrame++;
            }
            if (this.upButtonReleased && Controller.jump) {
                //If not all text is visible, by pressing jump all text is shown right away. Otherwise go to next dialogue
                if (animationPlaying) {
                    this.currentAnimationFrame = animationLength;
                }
                else {
                    if (this.currentIndex < this.dialogue.length - 1) {
                        SoundHandler.dialogueSound.stopAndPlay();
                        this.currentIndex++;
                        this.currentAnimationFrame = 0;
                    }
                    else {
                        this.setDialogueWindowToInactive();
                    }
                }
                this.upButtonReleased = false;
            }
            if (!Controller.jump) {
                this.upButtonReleased = true;
            }
            if (this.active) {
                this.displayDialogue();
            }
        }
    }
    static displayDialogue() {
        const { leftPos, topPos } = this;
        const currentLine = Math.floor(this.currentAnimationFrame / this.animationDurationFrames / this.maxLineLength);
        Display.drawRectangle(leftPos, topPos, this.dialogueWidth, this.dialogueHeight, "000000");
        Display.drawRectangleBorder(leftPos, topPos, this.dialogueWidth, this.dialogueHeight, "FFFFFF");
        Display.drawLine(leftPos + this.dialogueWidth - 80, topPos, leftPos + this.dialogueWidth - 20, topPos, "000000", 2);
        for (var i = 0; i <= currentLine; i++) {
            if (i < this.dialogue[this.currentIndex].lines.length) {
                this.animateText(leftPos, topPos, i);
            }
        }
        this.displayArrowUpIcon();
    }
    static displayArrowUpIcon() {
        const { leftPos, topPos } = this;
        this.arrowUpFrameIndex++;
        const frameModulo = this.arrowUpFrameIndex % 60;
        if (frameModulo < 30) {
            this.showDialogueUpArrow(leftPos + this.dialogueWidth - 60, topPos - 15);
        }
    }
    static animateText(leftPos, topPos, lineIndex) {
        let previousLinesLength = 0;
        const dialoguesLines = this.dialogue[this.currentIndex].lines;
        for (var i = 0; i < lineIndex; i++) {
            previousLinesLength += dialoguesLines[i].length;
        }
        const currentText = dialoguesLines[lineIndex].substring(0, Math.ceil(this.currentAnimationFrame / this.animationDurationFrames - previousLinesLength));
        Display.displayText(currentText, leftPos + 20, topPos + 30 + (lineIndex * 30), 17, "#FFFFFF", "left");
    }
    static calculateTextLines(dialogue) {
        let text = dialogue;
        const lines = [];
        for (var i = 0; i < this.linesAmount; i++) {
            if (text.length > 0) {
                if (text.length > this.maxLineLength) {
                    for (let j = this.maxLineLength; j >= 0; j--) {
                        if (text.charAt(j) === " ") {
                            lines.push(text.substr(0, j));
                            text = text.slice(j + 1);
                            break;
                        }
                    }
                }
                else {
                    lines.push(text.substr(0, text.length).trimEnd());
                    text = text.slice(text.length).trimEnd();
                }
            }
        }
        return lines;
    }
    static showDialogueUpArrow(xPos, yPos) {
        const { pixelArrayUnitSize, tileSize } = tileMapHandler;
        const yAnchor = yPos + tileSize - pixelArrayUnitSize;
        Display.drawRectangle(xPos + pixelArrayUnitSize, yAnchor - pixelArrayUnitSize, pixelArrayUnitSize * 6, pixelArrayUnitSize, "FFFFFF");
        Display.drawRectangle(xPos + pixelArrayUnitSize * 2, yAnchor - pixelArrayUnitSize * 2, pixelArrayUnitSize * 4, pixelArrayUnitSize, "FFFFFF");
        Display.drawRectangle(xPos + pixelArrayUnitSize * 3, yAnchor - pixelArrayUnitSize * 3, pixelArrayUnitSize * 2, pixelArrayUnitSize, "FFFFFF");
    }
    static createDialogObject(dialogue) {
        return {
            textLength: dialogue.length,
            lines: this.calculateTextLines(dialogue)
        };
    }
}
class SFXHandler {
    static staticConstructor(tileSize, spriteCanvas) {
        this.tileSize = tileSize;
        this.spriteCanvas = spriteCanvas;
        this.sfxAnimations = [];
        this.backgroundSFX = [];
    }
    static updateSfxAnimations(type = "sfxAnimations") {
        for (var i = this.this_array[type].length - 1; i >= 0; i--) {
            this.this_array[type][i].draw(this.spriteCanvas);
            if (this.this_array[type][i].ended) {
                this.this_array[type].splice(i, 1);
            }
        }
    }
    static resetSfx() {
        this.sfxAnimations = [];
        this.backgroundSFX = [];
    }
    static createSFX(x, y, sfxIndex, direction, xspeed = 0, yspeed = 0, reduceAlpha = false, animationLength = 8, growByTimes = 0, type = "sfxAnimations") {
        const sfxAnimation = new SFX(x, y, this.tileSize, ObjectTypes.SFX, sfxIndex, direction, xspeed, yspeed, reduceAlpha, animationLength, growByTimes);
        this.this_array[type].push(sfxAnimation);
    }
}
class ModalHandler {
}
class PlayerAttributesHandler {
    /*
    static staticConstructor(player) {
        this.player = player;
        this.sliderValues = ["groundAcceleration", "air_acceleration", "maxSpeed", "groundFriction", "air_friction", "jumpSpeed", "maxFallSpeed"];
        this.checkBoxValues = ["jumpChecked", "wallJumpChecked", "doubleJumpChecked", dashChecked, runChecked];

        this.sliderValues.forEach(sliderValue => {
            this.setInitialSliderValue(sliderValue);

            this[sliderValue + "Slider"].oninput = (event) => {
                let newValue = Number(event.target.value);
                //If value has decimals, put at least 2 decimals after coma
                this[sliderValue + "Value"].innerHTML = newValue % 1 != 0 ? newValue.toFixed(2) : newValue;

                if (sliderValue === "jumpSpeed") {
                    const jumpValueObj = this.mapJumpSliderValueToRealValue(newValue)[0];
                    newValue = Number(jumpValueObj.jumpSpeed);
                    this.player.maxJumpFrames = jumpValueObj.maxJumpFrames;
                    this.player.adjustSwimAttributes(this.player.maxJumpFrames, newValue);
                }
                this.player[sliderValue] = newValue;
                this.adjustAccelerationRelatedToSpeed(sliderValue, newValue);
            };
        });

        this.checkBoxValues.forEach(checkBoxValue => {
            this.setInitialCheckboxValue(checkBoxValue);
        });
        
    }*/
    /*
    static setInitialSliderValue(sliderValue) {
        let playerAttrValue = this.player[sliderValue];
        if (sliderValue === "jumpSpeed") {
            const jumpSliderValueObj = this.mapJumpValueToSliderValue(playerAttrValue)[0];
            playerAttrValue = jumpSliderValueObj.sliderValue;
        }
        this[sliderValue + "Slider"] = document.getElementById(sliderValue);
        this[sliderValue + "Slider"].value = playerAttrValue;
        this[sliderValue + "Value"] = document.getElementById(sliderValue + "Value");
        this[sliderValue + "Value"].innerHTML = playerAttrValue;
        this.adjustAccelerationRelatedToSpeed(sliderValue, playerAttrValue);
    }*/
    static adjustAccelerationRelatedToSpeed(sliderValue, playerAttrValue) {
        if (sliderValue === "maxSpeed") {
            ["groundAcceleration", "air_acceleration"].forEach(accelerationValue => {
                const sliderName = accelerationValue + "Slider";
                const sliderValueBeforeUpdate = parseFloat(this.this_array[sliderName].value).toFixed(2);
                this.this_array[sliderName].max = playerAttrValue;
                this.this_array[sliderName].min = playerAttrValue / 100;
                this.this_array[sliderName].step = playerAttrValue / 100;
                const sliderValueAfterUpdate = parseFloat(this.this_array[sliderName].value).toFixed(2);
                //if value was shrunk down, because max-speed is smaller then acceleration
                if (sliderValueBeforeUpdate !== sliderValueAfterUpdate) {
                    this.this_array[accelerationValue + "Value"].innerHTML = sliderValueAfterUpdate;
                }
            });
        }
    }
    /*
    static setInitialCheckboxValue(checkBoxValue) {
        let playerAttrValue = this.player[checkBoxValue];
        this[checkBoxValue + "CheckBox"] = document.getElementById(checkBoxValue);
        this[checkBoxValue + "CheckBox"].checked = playerAttrValue;

        this[checkBoxValue + "CheckBox"].onclick = (event) => {
            if (event.target.checked) {
                this.player[checkBoxValue] = true;
                this.updateUniqueCheckboxes(checkBoxValue);
            }
            else {
                this.player[checkBoxValue] = false;
            }
        }
    }*/
    /*
    static updateUniqueCheckboxes(checkBoxValue) {
        if (checkBoxValue === dashChecked) {
            this.updateCheckboxValueFromOutside(runChecked, false);
        }
        else if (checkBoxValue === runChecked) {
            this.updateCheckboxValueFromOutside(dashChecked, false);
        }
    }*/
    static updateCheckboxValueFromOutside(checkBoxValue, value) {
        this.this_array[checkBoxValue + "CheckBox"] = document.getElementById(checkBoxValue);
        this.this_array[checkBoxValue + "CheckBox"].checked = value;
        this.player[checkBoxValue] = value;
    }
}
class MathHelpers {
    static getRandomNumberBetweenTwoNumbers(min, max, round = true) {
        const randomNumber = Math.random() * (max - min) + min;
        return round ? Math.floor(randomNumber) : randomNumber;
    }
    static getSometimesNegativeRandomNumber(min, max, round = true) {
        let randomNumber = this.getRandomNumberBetweenTwoNumbers(min, max, round);
        return randomNumber *= Math.round(Math.random()) ? 1 : -1;
    }
    static sortNumbers(numberArray) {
        return numberArray.sort((a, b) => a - b);
    }
    static getAngle(x1, y1, x2, y2) {
        let result = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
        return result < 0 ? 360 + result : result; // range [0, 360)
    }
    static normalizeAngle(newAngle) {
        if (newAngle > 360) {
            return Math.abs(360 - newAngle);
        }
        else if (newAngle < 0) {
            return 360 - newAngle;
        }
        return newAngle;
    }
    static getRadians(angle) {
        return angle * Math.PI / 180;
    }
}
class Path {
    constructor(tileMapHandler, speed = 3, stopFrames = 10, movementDirection = AnimationHelper.possibleDirections.forwards) {
        this.movementSteps = 0;
        this.currentStopFrame = 0;
        this.tileMapHandler = tileMapHandler;
        this.tileSize = tileMapHandler.tileSize;
        this.pathPoints = [];
        this.objectsOnPath = [];
        this.speed = speed;
        this.recalculateSteps();
        this.startPointKey;
        this.endPointKey;
        this.movementDirection = movementDirection;
        this.stopFrames = stopFrames;
        this.pathVariant = AnimationHelper.pathVariants.singlePoint;
        this.key = TilemapHelpers.makeid(5);
        this.resetAttributes();
    }
    recalculateSteps() {
        this.movementSteps = this.tileSize / this.speed;
        this.currentDirection = this.movementDirection;
    }
    resetAttributes() {
        this.currentMovementStep = 0;
        this.currentDirection = this.movementDirection;
        this.currentStopFrame = this.stopFrames;
    }
    resetObjectsToInitialPosition() {
        this.objectsOnPath.forEach((objectOnPath) => {
            objectOnPath.xspeed = 0;
            objectOnPath.yspeed = 0;
            objectOnPath.x = objectOnPath.initialX * this.tileSize;
            objectOnPath.y = objectOnPath.initialY * this.tileSize;
        });
        this.resetAttributes();
    }
    rearrangePathPoints() {
        const endPoints = this.rearrangePathPointsAlignment();
        //line
        if (endPoints.length === 2) {
            const { startPoint, endPoint } = TilemapHelpers.findStartAndEndPointForLine(endPoints);
            this.startPointKey = startPoint.key;
            this.endPointKey = endPoint.key;
            this.pathVariant = AnimationHelper.pathVariants.line;
            this.pathPoints = TilemapHelpers.resortPath(this.pathPoints, startPoint, endPoint);
        }
        //enclosed
        else if (endPoints.length === 0 && this.pathPoints.length !== 1) {
            const { startPoint, endPoint } = TilemapHelpers.findStartAndEndPointForEnclosedPath(this.pathPoints);
            this.pathVariant = AnimationHelper.pathVariants.enclosed;
            this.pathPoints = TilemapHelpers.resortPath(this.pathPoints, startPoint, endPoint);
        }
        //singlepoint
        else {
            this.pathVariant = AnimationHelper.pathVariants.singlePoint;
        }
    }
    checkObjectsOnPath() {
        this.objectsOnPath = [];
        this.pathPoints.forEach((pathPoint) => {
            const objectOnPath = this.tileMapHandler?.levelObjects && this.tileMapHandler.levelObjects.find((levelObject) => levelObject.initialX === pathPoint.initialX && levelObject.initialY === pathPoint.initialY &&
                !SpritePixelArrays.backgroundSprites.includes(levelObject.type));
            objectOnPath && this.objectsOnPath.push(objectOnPath);
        });
    }
    rearrangePathPointsAlignment() {
        let endPoints = [];
        this.pathPoints.forEach((pathPoint) => {
            let rightTouched;
            let leftTouched;
            let topTouched;
            let bottomTouched;
            let neighboursAmount = 0;
            this.pathPoints.forEach((comparingPathPoint) => {
                if (pathPoint.key !== comparingPathPoint.key) {
                    if (!rightTouched && (pathPoint.initialY === comparingPathPoint.initialY && pathPoint.initialX + 1 === comparingPathPoint.initialX)) {
                        neighboursAmount++;
                        rightTouched = true;
                    }
                    if (!leftTouched && (pathPoint.initialY === comparingPathPoint.initialY && pathPoint.initialX - 1 === comparingPathPoint.initialX)) {
                        neighboursAmount++;
                        leftTouched = true;
                    }
                    if (!topTouched && (pathPoint.initialX === comparingPathPoint.initialX && pathPoint.initialY - 1 === comparingPathPoint.initialY)) {
                        neighboursAmount++;
                        topTouched = true;
                    }
                    if (!bottomTouched && (pathPoint.initialX === comparingPathPoint.initialX && pathPoint.initialY + 1 === comparingPathPoint.initialY)) {
                        bottomTouched = true;
                        neighboursAmount++;
                    }
                    if (topTouched && bottomTouched) {
                        pathPoint.alignment = AnimationHelper.alignments.vertical;
                    }
                    else if (rightTouched && leftTouched) {
                        pathPoint.alignment = AnimationHelper.alignments.horizontal;
                    }
                    else {
                        pathPoint.alignment = AnimationHelper.alignments.corner;
                    }
                }
            });
            if (this.pathPoints.length !== 1 && neighboursAmount === 1) {
                endPoints.push(pathPoint);
            }
        });
        return endPoints;
    }
    draw(spriteCanvas) {
        this.pathPoints.forEach((pathPoint) => {
            pathPoint.draw(spriteCanvas);
        });
        if (Game.playMode === Game.PLAY_MODE) {
            if (this.pathVariant !== AnimationHelper.pathVariants.singlePoint && this.currentStopFrame >= this.stopFrames) {
                if (this.currentMovementStep === 0 && this.pathVariant === AnimationHelper.pathVariants.line) {
                    this.checkIfReversalOfDirectionNeeded();
                }
                if (this.currentStopFrame >= this.stopFrames) {
                    this.getSpeedForObjectsOnPath();
                    this.currentMovementStep++;
                    if (this.currentMovementStep >= this.movementSteps) {
                        this.currentMovementStep = 0;
                    }
                }
            }
            if (this.currentStopFrame < this.stopFrames) {
                this.currentStopFrame++;
            }
        }
    }
    getSpeedForObjectsOnPath() {
        this.objectsOnPath.forEach((objectOnPath) => {
            if (this.currentMovementStep === 0) {
                const { currentPathPoint, nextPathPoint } = this.getCurrentAndNextPathPointForObject(objectOnPath);
                this.getNeededSpeedForNextPathPoint(objectOnPath, currentPathPoint, nextPathPoint);
            }
            objectOnPath.x += objectOnPath.xspeed;
            objectOnPath.y += objectOnPath.yspeed;
        });
    }
    getCurrentPathPointIndexForObject(objectOnPath) {
        const tilePosY = this.tileMapHandler.getTileValueForPosition(objectOnPath.y);
        const tilePosX = this.tileMapHandler.getTileValueForPosition(objectOnPath.x);
        return this.pathPoints.findIndex((pathPoint) => pathPoint.initialX === tilePosX && pathPoint.initialY === tilePosY);
    }
    checkIfReversalOfDirectionNeeded() {
        const { forwards, backwards } = AnimationHelper.possibleDirections;
        loop1: for (var i = 0; i < this.objectsOnPath.length; i++) {
            const currentPathIndex = this.getCurrentPathPointIndexForObject(this.objectsOnPath[i]);
            if (currentPathIndex === this.pathPoints.length - 1 && this.currentDirection === forwards
                || currentPathIndex === 0 && this.currentDirection === backwards) {
                this.currentDirection = this.currentDirection === forwards ? backwards : forwards;
                this.currentStopFrame = 0;
                break loop1;
            }
        }
    }
    getCurrentAndNextPathPointForObject(objectOnPath) {
        const { forwards, backwards } = AnimationHelper.possibleDirections;
        const currentPathIndex = this.getCurrentPathPointIndexForObject(objectOnPath);
        let nextPathIndex = this.currentDirection === forwards ?
            currentPathIndex + 1 : currentPathIndex - 1;
        //loop path if at the end
        if (this.pathVariant === AnimationHelper.pathVariants.enclosed) {
            if (currentPathIndex === this.pathPoints.length - 1 && this.currentDirection === forwards) {
                nextPathIndex = 0;
            }
            else if (currentPathIndex === 0 && this.currentDirection === backwards) {
                nextPathIndex = this.pathPoints.length - 1;
            }
        }
        return { currentPathPoint: this.pathPoints[currentPathIndex], nextPathPoint: this.pathPoints[nextPathIndex] };
    }
    getNeededSpeedForNextPathPoint(objectOnPath, currentPathPoint, nextPathPoint) {
        objectOnPath.xspeed = 0;
        objectOnPath.yspeed = 0;
        if (currentPathPoint && nextPathPoint) {
            if (currentPathPoint.initialX < nextPathPoint.initialX) {
                objectOnPath.xspeed = this.speed;
            }
            else if (currentPathPoint.initialX > nextPathPoint.initialX) {
                objectOnPath.xspeed = this.speed * -1;
            }
            else if (currentPathPoint.initialY < nextPathPoint.initialY) {
                objectOnPath.yspeed = this.speed;
            }
            else if (currentPathPoint.initialY > nextPathPoint.initialY) {
                objectOnPath.yspeed = this.speed * -1;
            }
        }
    }
}
class PathPoint extends LevelObject {
    constructor(x, y, tileSize, alignment = AnimationHelper.alignments?.horizontal) {
        super(x, y, tileSize, ObjectTypes.PATH_POINT);
        this.alignment = alignment;
        this.changeableInBuildMode = true;
        this.key = this.makeid(5);
    }
    getPath() {
        return tileMapHandler?.paths?.find((path) => {
            return path?.pathPoints.find((pathPoint) => pathPoint.key === this.key);
        });
    }
    getPathValue(attributeName) {
        return this.getPath()?.[attributeName];
    }
    addChangeableAttribute(attributeName, value) {
        const currentPath = this.getPath();
        currentPath[attributeName] = value;
        currentPath.recalculateSteps();
        WorldDataHandler?.levels[tileMapHandler.currentLevel]?.paths.forEach((path) => {
            path.pathPoints.forEach((pathPoint) => {
                if (pathPoint.initialX === this.initialX && pathPoint.initialY === this.initialY) {
                    path[attributeName] = value;
                }
            });
        });
    }
    draw(spriteCanvas) {
        const animationLength = this?.spriteObject?.[0].animation.length || 0;
        const cornerAlignment = this.alignment === AnimationHelper.alignments?.corner;
        const extraCanvasX = this.alignment === AnimationHelper.alignments?.vertical || cornerAlignment
            ? animationLength * this.tileSize : 0;
        if (animationLength > 1 && Game.playMode === Game.PLAY_MODE) {
            const frameModulo = tileMapHandler.currentGeneralFrameCounter % 40;
            if (AnimationHelper.defaultFrameDuration != undefined) {
                this.displaySprite(spriteCanvas, frameModulo < AnimationHelper.defaultFrameDuration ? this.canvasXSpritePos : this.canvasXSpritePos + this.tileSize, extraCanvasX, cornerAlignment);
            }
        }
        else {
            this.displaySprite(spriteCanvas, this.canvasXSpritePos, extraCanvasX, cornerAlignment);
        }
    }
    displaySprite(spriteCanvas, canvasXSpritePos, extraCanvasX, showBothAlignedSpritesOnTop) {
        super.drawSingleFrame(spriteCanvas, canvasXSpritePos + extraCanvasX);
        if (showBothAlignedSpritesOnTop) {
            super.drawSingleFrame(spriteCanvas, canvasXSpritePos);
        }
    }
}
class GameStatistics {
    static staticConstructor() {
        this.resetPlayerStatistics();
        this.alreadyStopped = false;
    }
    static resetPlayerStatistics() {
        this.resetTimer();
        this.deathCounter = 0;
    }
    static resetPermanentObjects() {
        WorldDataHandler.levels.forEach((level) => {
            level.levelObjects.forEach((levelObject) => {
                if (levelObject.type === ObjectTypes.COLLECTIBLE) {
                    levelObject.extraAttributes.collected = false;
                }
            });
        });
    }
    static resetTimer() {
        this.startTime = null;
        this.endTime = null;
        this.timeBetweenPauses = 0;
        this.timesPauseWasPressed = 0;
    }
    static startTimer() {
        if (!this.startTime) {
            this.startTime = new Date();
        }
    }
    static getTimeDifference() {
        const endTime = this.endTime?.getTime();
        const startTime = this.startTime.getTime();
        if (startTime > endTime) {
            return 0;
            //return null;
        }
        return endTime - startTime + this.timeBetweenPauses;
    }
    static updateTimeBetweenPauses() {
        if (!this.endTime || !this.startTimer) {
            return null;
        }
        /*
            The cost of stopping and resuming the game is approximatley 17 milliseconds. Just to initialize date
            Therefore we substract 17 milliseconds the first 3 times the player presses pause.
            If he does it more often, it's "his fault", which is not realistic
        */
        this.timesPauseWasPressed++;
        this.timeBetweenPauses = this.timesPauseWasPressed <= 3 ? this.getTimeDifference() - 17 : this.getTimeDifference();
        this.startTime = null;
        this.endTime = null;
    }
    static getFinalTime() {
        if (!this.endTime || !this.startTimer) {
            return null;
        }
        var diff = this.getTimeDifference();
        if (diff == null)
            diff = 0;
        var msec = diff;
        var hh = Math.floor(msec / 1000 / 60 / 60);
        msec -= hh * 1000 * 60 * 60;
        var mm = Math.floor(msec / 1000 / 60);
        msec -= mm * 1000 * 60;
        var ss = Math.floor(msec / 1000);
        msec -= ss * 1000;
        return hh > 0 ? `${this.leadingZero(hh)}:${this.leadingZero(mm)}:${this.leadingZero(ss)}:${msec}` :
            `${this.leadingZero(mm)}:${this.leadingZero(ss)}:${msec}`;
    }
    static leadingZero(num) {
        return `0${num}`.slice(-2);
    }
    static stopTimer() {
        this.endTime = new Date();
        this.alreadyStopped = true;
    }
}
class PauseHandler {
    static staticConstructor() {
        this.options = ["Continue", "Restart game"];
        this.resetPauseHandler();
        this.downArrowReleased = true;
        this.restartedGame = false;
        this.upArrowReleased = true;
        this.restartGameMaxFrames = 50;
        this.justClosedPauseScreen = false;
    }
    static resetPauseHandler() {
        this.paused = false;
        this.currentRestartGameFrameCounter = 0;
        this.currentOptionIndex = 0;
        this.restartedGame = false;
        this.justClosedPauseScreen = true;
    }
    static checkPause() {
        if (!this.paused) {
            if (Controller.enterReleased && Controller.enter && Controller.gamepadIndex !== null ||
                Controller.gamepadIndex === null && Controller.pause && Controller.pauseReleased) {
                this.paused = true;
                GameStatistics.stopTimer();
                GameStatistics.updateTimeBetweenPauses();
                //stop timer
            }
            Controller.pauseReleased = Controller.pause ? false : true;
            Controller.enterReleased = Controller.enter ? false : true;
            if (this.justClosedPauseScreen && !Controller.confirm) {
                this.justClosedPauseScreen = false;
            }
        }
    }
    static handlePause() {
        if (this.paused) {
            const { left, top, width, height } = Camera.viewport;
            Display.drawRectangle(left, top, width, height, WorldDataHandler.backgroundColor);
            Display.displayText("Paused", left + width / 2, top + height / 2 - 30, 30, '#' + WorldDataHandler.textColor);
            this.options.forEach((option, index) => {
                Display.displayText(option, left + width / 2, top + height / 2 + 20 + index * 30, 15, '#' + WorldDataHandler.textColor);
                if (this.currentOptionIndex === index) {
                    const optionTextLength = Display.measureText(option).width;
                    Display.displayText("►", left + width / 2 - optionTextLength / 2 - 20, top + height / 2 + 20 + index * 30, 15, '#' + WorldDataHandler.textColor);
                }
            });
            this.handleRestart();
            if (Controller.enterReleased && Controller.enter && Controller.gamepadIndex !== null ||
                Controller.gamepadIndex === null && Controller.pause && Controller.pauseReleased) {
                GameStatistics.startTimer();
                this.resetPauseHandler();
                //continue timer
            }
            Controller.pauseReleased = Controller.pause ? false : true;
            Controller.enterReleased = Controller.enter ? false : true;
            if (this.upArrowReleased && Controller.up) {
                this.currentOptionIndex--;
            }
            else if (this.downArrowReleased && Controller.down) {
                this.currentOptionIndex++;
            }
            if (this.currentOptionIndex > this.options.length - 1) {
                this.currentOptionIndex = 0;
            }
            else if (this.currentOptionIndex < 0) {
                this.currentOptionIndex = this.options.length - 1;
            }
            this.downArrowReleased = Controller.down ? false : true;
            this.upArrowReleased = Controller.up ? false : true;
            if ((Controller.confirm || (Controller.gamepadIndex === null && Controller.enter)) && !this.restartedGame) {
                if (this.currentOptionIndex === 1) {
                    this.restartedGame = true;
                    this.currentRestartGameFrameCounter = this.restartGameMaxFrames;
                    SoundHandler.setVolume("mainSong", 0.3);
                    SoundHandler.guiSelect.stopAndPlay();
                }
                else {
                    GameStatistics.startTimer();
                    this.resetPauseHandler();
                }
            }
        }
    }
    static handleRestart() {
        const { left, top, width, height, context } = Camera.viewport;
        if (this.currentRestartGameFrameCounter > 0) {
            Display.drawRectangleWithAlpha(left, top, width, height, WorldDataHandler.backgroundColor, context, 1 - this.currentRestartGameFrameCounter / 100 * 2);
            this.currentRestartGameFrameCounter--;
            if (this.currentRestartGameFrameCounter === 0) {
                PlayMode.startGame();
                this.resetPauseHandler();
                SoundHandler.song.stopAndPlay();
                SoundHandler.setVolume("mainSong", 1);
            }
        }
    }
}
class TilemapHelpers {
    static check8DirectionsNeighbours(oX, oY, nX, nY) {
        if (nX === oX && nY === oY - 1) {
            return { x: oX, y: oY - 1, alignment: AnimationHelper.alignments?.vertical };
        }
        else if (nX === oX && nY === oY + 1) {
            return { x: oX, y: oY + 1, alignment: AnimationHelper.alignments?.vertical };
        }
        else if (nX === oX - 1 && nY === oY) {
            return { x: oX - 1, y: oY + 1, alignment: AnimationHelper.alignments?.horizontal };
        }
        else if (nX === oX + 1 && nY === oY) {
            return { x: oX + 1, y: oY + 1, alignment: AnimationHelper.alignments?.horizontal };
        }
        else if (nX === oX - 1 && nY === oY - 1) {
            return { x: oX - 1, y: oY - 1, alignment: AnimationHelper.alignments?.corner };
        }
        else if (nX === oX + 1 && nY === oY - 1) {
            return { x: oX + 1, y: oY - 1, alignment: AnimationHelper.alignments?.corner };
        }
        else if (nX === oX + 1 && nY === oY + 1) {
            return { x: oX + 1, y: oY + 1, alignment: AnimationHelper.alignments?.corner };
        }
        else if (nX === oX - 1 && nY === oY + 1) {
            return { x: oX - 1, y: oY + 1, alignment: AnimationHelper.alignments?.corner };
        }
        return null;
    }
    static sortArrayByXandY(firstEl, secondEl, firstElDir, secondElDir, firstElPos, secondElPos) {
        const bothStompers = firstEl.type === ObjectTypes.STOMPER && secondEl.type === ObjectTypes.STOMPER;
        if (bothStompers && AnimationHelper.facingDirections != undefined) {
            const { left, top, right, bottom } = AnimationHelper.facingDirections;
            const bottomSame = firstElDir === bottom && secondElDir === bottom || !firstElDir && !secondElDir;
            const topSame = firstElDir === top && secondElDir === top;
            const rightSame = firstElDir === right && secondElDir === right;
            const leftSame = firstElDir === left && secondElDir === left;
            const { x: firstX, y: firstY } = firstElPos;
            const { x: secondX, y: secondY } = secondElPos;
            if (firstY < secondY && bottomSame ||
                firstY > secondY && topSame ||
                firstX < secondX && rightSame ||
                firstX > secondX && leftSame) {
                return -1;
            }
            else {
                return 1;
            }
        }
        return 0;
    }
    static splitArrayIn2(array, filter) {
        let pass = [], fail = [];
        array.forEach((e, idx, arr) => (filter(e, idx, arr) ? pass : fail).push(e));
        return [pass, fail];
    }
    static resortPath(pathPoints, startPoint, endPoint) {
        let arr = [...pathPoints];
        arr = arr.filter(item => item.key !== startPoint.key);
        arr.unshift(startPoint);
        for (var i = 0; i < arr.length - 1; i++) {
            for (var j = 0; j < arr.length; j++) {
                const neightbourAtDirection = TilemapHelpers.check8DirectionsNeighbours(arr[i].initialX, arr[i].initialY, arr[j].initialX, arr[j].initialY);
                if (!(arr[i].key === startPoint.key && arr[j].key === endPoint.key) &&
                    arr[i + 1].key !== arr[j].key && i + 1 !== j && j > i && neightbourAtDirection &&
                    (neightbourAtDirection.alignment === AnimationHelper.alignments?.horizontal || neightbourAtDirection.alignment === AnimationHelper.alignments?.vertical)) {
                    var temp = arr[j];
                    arr[j] = arr[i + 1];
                    arr[i + 1] = temp;
                }
            }
        }
        return arr;
    }
    static findStartAndEndPointForLine(endpoints) {
        let startPoint = endpoints[0];
        let endPoint = endpoints[1];
        if (startPoint.initialX > endPoint.initialX || (startPoint.initialX === endPoint.initialX && startPoint.initialY > endPoint.initialY)) {
            startPoint = endpoints[1];
            endPoint = endpoints[0];
        }
        return { startPoint, endPoint };
    }
    static findStartAndEndPointForEnclosedPath(pathPoints) {
        //find the highest lane in a path
        const sortedByY = pathPoints.sort((a, b) => a.initialY - b.initialY);
        const highestLane = sortedByY.filter((pathPoint) => pathPoint.initialY === sortedByY[0].initialY);
        //sort hightest lane by x
        const sortHightestLaneByX = highestLane.sort((a, b) => b.initialX - a.initialX);
        //idea behind that is, that the pathpoints going from left to right on the highest lane, go clockwise (forwards)
        return { startPoint: sortHightestLaneByX[0], endPoint: sortHightestLaneByX[1] };
    }
    static doTwoObjectsSeeEachOther(obj1, obj2, tilemapHandler, angle) {
        let objectsSeeEachOther = true;
        const dx = obj2.x - obj1.x;
        const dy = obj2.y - obj1.y;
        const checkDistance = tilemapHandler.tileSize / 2;
        const xFrames = Math.abs(Math.round(dx / checkDistance));
        const yFrames = Math.abs(Math.round(dy / checkDistance));
        const biggerFrames = Math.max(xFrames, yFrames);
        const incrementX = dx / biggerFrames;
        const incrementY = dy / biggerFrames;
        for (var frame = 0; frame < biggerFrames - 1; frame++) {
            const xStep = obj1.x + (incrementX * frame);
            const yStep = obj1.y + (incrementY * frame);
            const currentTile = tilemapHandler.getTileLayerValueByIndex(tilemapHandler.getTileValueForPosition(yStep), tilemapHandler.getTileValueForPosition(xStep));
            const zeroTo360 = (angle + 360) % 360;
            //if going up, can see through one-way platforms
            if (currentTile !== 0 && !(zeroTo360 > 0 && zeroTo360 < 180 && currentTile === 5)) {
                objectsSeeEachOther = false;
                break;
            }
        }
        return objectsSeeEachOther;
    }
    static makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }
}
const canvas = document.getElementById("myCanvas");
WorldDataHandler._staticConstructor();
const spriteCanvas = document.getElementById("sprites");
SoundHandler._staticConstructor();
AnimationHelper.staticConstructor();
SpritePixelArrays.staticConstructor();
const player = new Player(WorldDataHandler.initialPlayerPosition.x, WorldDataHandler.initialPlayerPosition.y, WorldDataHandler.tileSize);
//const player = new Player(WorldDataHandler.initialPlayerPosition.x,
//    WorldDataHandler.initialPlayerPosition.y, WorldDataHandler.tileSize, spriteCanvas);
Game.staticConstructor();
const version = 1.1;
//initialLevelDataStart
WorldDataHandler.levels =
    [{ "tileData": [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], "levelObjects": [], "deko": [], "paths": [] }, { "tileData": [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 12, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 1], [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], "levelObjects": [{ "x": 2, "y": 10, "type": "startFlag", "extraAttributes": { "levelStartFlag": true, "flagIndex": "FJ2" } }, { "x": 30, "y": 5, "type": "finishFlag" }, { "x": 16, "y": 10, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 10, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 10, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 10, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 10, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 10, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 10, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 10, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 10, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 10, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 10, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 10, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 10, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 9, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 9, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 9, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 9, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 9, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 9, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 9, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 9, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 9, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 9, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 9, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 9, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 9, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 8, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 8, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 8, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 8, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 8, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 8, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 8, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 8, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 8, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 8, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 8, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 8, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 8, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 7, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 7, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 7, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 7, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 7, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 7, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 7, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 7, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 7, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 7, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 7, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 7, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 7, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 6, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 6, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 6, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 6, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 6, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 6, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 6, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 6, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 6, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 6, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 6, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 6, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 6, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 5, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 5, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 5, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 5, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 5, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 5, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 5, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 5, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 5, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 5, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 5, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 5, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 5, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 4, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 3, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 2, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 2, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 2, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 2, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 2, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 2, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 2, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 2, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 2, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 2, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 2, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 2, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 2, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 1, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 1, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 1, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 1, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 1, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 1, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 1, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 1, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 1, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 1, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 1, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 1, "type": "blueBlock", "extraAttributes": {} }, { "x": 16, "y": 1, "type": "blueBlock", "extraAttributes": {} }, { "x": 20, "y": 1, "type": "redBlock", "extraAttributes": {} }, { "x": 20, "y": 2, "type": "redBlock", "extraAttributes": {} }, { "x": 20, "y": 3, "type": "redBlock", "extraAttributes": {} }, { "x": 21, "y": 3, "type": "redBlock", "extraAttributes": {} }, { "x": 21, "y": 4, "type": "redBlock", "extraAttributes": {} }, { "x": 21, "y": 5, "type": "redBlock", "extraAttributes": {} }, { "x": 21, "y": 6, "type": "redBlock", "extraAttributes": {} }, { "x": 21, "y": 7, "type": "redBlock", "extraAttributes": {} }, { "x": 21, "y": 8, "type": "redBlock", "extraAttributes": {} }, { "x": 20, "y": 8, "type": "redBlock", "extraAttributes": {} }, { "x": 20, "y": 9, "type": "redBlock", "extraAttributes": {} }, { "x": 20, "y": 10, "type": "redBlock", "extraAttributes": {} }, { "x": 18, "y": 3, "type": "redblueblockswitch", "extraAttributes": {} }, { "x": 18, "y": 4, "type": "collectible", "extraAttributes": {} }, { "x": 19, "y": 4, "type": "collectible", "extraAttributes": {} }, { "x": 17, "y": 4, "type": "collectible", "extraAttributes": {} }], "deko": [], "paths": [] }, { "tileData": [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2], [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 5, 5, 5, 5, 5, 5, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], "levelObjects": [{ "x": 2, "y": 10, "type": "startFlag", "extraAttributes": { "levelStartFlag": true, "flagIndex": "BzU" } }, { "x": 30, "y": 5, "type": "finishFlag" }, { "x": 31, "y": 1, "type": "canon", "extraAttributes": {} }, { "x": 31, "y": 2, "type": "canon", "extraAttributes": {} }], "deko": [], "paths": [] }, { "tileData": [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 15, 15, 2, 3, 0, 0, 0, 0, 0, 1], [1, 7, 0, 19, 15, 15, 15, 15, 15, 15, 15, 15, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 0, 0, 4, 7, 0, 0, 0, 0, 0, 1], [1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 7, 0, 0, 0, 0, 0, 1], [1, 6, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 0, 0, 1, 2, 2, 6, 7, 0, 0, 0, 0, 0, 1], [1, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 9, 9, 9, 9, 9, 6, 7, 0, 0, 4, 6, 6, 6, 9, 15, 15, 15, 15, 15, 2], [1, 9, 9, 9, 9, 9, 9, 9, 6, 6, 6, 6, 7, 0, 0, 0, 0, 0, 4, 7, 0, 0, 4, 6, 6, 7, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 4, 6, 6, 6, 7, 0, 0, 0, 0, 0, 4, 7, 0, 0, 4, 6, 6, 7, 0, 0, 1, 3, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 4, 6, 6, 6, 7, 0, 0, 0, 0, 0, 4, 7, 0, 0, 4, 6, 6, 7, 0, 0, 4, 7, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 4, 6, 6, 6, 7, 0, 0, 18, 0, 0, 4, 7, 0, 0, 4, 6, 6, 7, 0, 0, 4, 7, 0, 0, 1], [2, 2, 2, 2, 2, 3, 0, 0, 4, 6, 6, 6, 7, 0, 0, 16, 0, 0, 4, 7, 0, 0, 8, 9, 9, 10, 0, 0, 4, 7, 0, 0, 1], [1, 0, 0, 0, 0, 7, 0, 0, 4, 6, 6, 6, 7, 0, 0, 16, 0, 0, 4, 7, 0, 0, 0, 0, 0, 0, 0, 0, 4, 7, 0, 0, 1], [1, 0, 0, 0, 0, 7, 0, 0, 4, 6, 6, 6, 7, 0, 0, 16, 0, 0, 4, 7, 0, 0, 0, 0, 0, 0, 0, 0, 4, 7, 0, 0, 1], [1, 0, 0, 0, 0, 7, 0, 0, 8, 9, 9, 9, 10, 0, 0, 16, 0, 0, 4, 6, 2, 2, 2, 2, 2, 2, 2, 2, 6, 7, 0, 0, 1], [1, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 0, 0, 1], [1, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], "levelObjects": [{ "x": 2, "y": 10, "type": "startFlag", "extraAttributes": { "levelStartFlag": true, "flagIndex": "x7M" } }, { "x": 3, "y": 10, "type": "fixedSpeedRight", "extraAttributes": {} }, { "x": 3, "y": 9, "type": "fixedSpeedRight", "extraAttributes": {} }, { "x": 3, "y": 8, "type": "fixedSpeedRight", "extraAttributes": {} }, { "x": 30, "y": 5, "type": "finishFlag", "extraAttributes": {} }], "deko": [], "paths": [] }, { "tileData": [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], "levelObjects": [{ "x": 2, "y": 10, "type": "startFlag", "extraAttributes": { "levelStartFlag": true, "flagIndex": "IMU" } }, { "x": 30, "y": 5, "type": "finishFlag" }, { "x": 5, "y": 10, "type": "toggleMine", "extraAttributes": {} }, { "x": 6, "y": 10, "type": "toggleMine", "extraAttributes": {} }, { "x": 7, "y": 10, "type": "toggleMine", "extraAttributes": {} }, { "x": 9, "y": 9, "type": "toggleMine", "extraAttributes": {} }, { "x": 10, "y": 9, "type": "toggleMine", "extraAttributes": {} }, { "x": 11, "y": 9, "type": "toggleMine", "extraAttributes": {} }, { "x": 12, "y": 8, "type": "toggleMine", "extraAttributes": {} }, { "x": 13, "y": 8, "type": "toggleMine", "extraAttributes": {} }, { "x": 14, "y": 8, "type": "toggleMine", "extraAttributes": {} }, { "x": 15, "y": 7, "type": "toggleMine", "extraAttributes": {} }, { "x": 16, "y": 7, "type": "toggleMine", "extraAttributes": {} }, { "x": 14, "y": 7, "type": "toggleMine", "extraAttributes": {} }, { "x": 11, "y": 8, "type": "toggleMine", "extraAttributes": {} }, { "x": 17, "y": 6, "type": "toggleMine", "extraAttributes": {} }, { "x": 18, "y": 6, "type": "toggleMine", "extraAttributes": {} }, { "x": 19, "y": 6, "type": "toggleMine", "extraAttributes": {} }, { "x": 20, "y": 6, "type": "toggleMine", "extraAttributes": {} }, { "x": 21, "y": 6, "type": "toggleMine", "extraAttributes": {} }, { "x": 22, "y": 5, "type": "toggleMine", "extraAttributes": {} }, { "x": 23, "y": 5, "type": "toggleMine", "extraAttributes": {} }, { "x": 24, "y": 5, "type": "toggleMine", "extraAttributes": {} }, { "x": 25, "y": 5, "type": "toggleMine", "extraAttributes": {} }, { "x": 27, "y": 5, "type": "toggleMine", "extraAttributes": {} }, { "x": 28, "y": 5, "type": "toggleMine", "extraAttributes": {} }, { "x": 29, "y": 5, "type": "toggleMine", "extraAttributes": {} }, { "x": 8, "y": 10, "type": "trampoline", "extraAttributes": {} }, { "x": 4, "y": 10, "type": "fixedSpeedRight", "extraAttributes": {} }, { "x": 26, "y": 5, "type": "toggleMine", "extraAttributes": {} }, { "x": 22, "y": 4, "type": "collectible", "extraAttributes": {} }, { "x": 23, "y": 4, "type": "collectible", "extraAttributes": {} }, { "x": 24, "y": 4, "type": "collectible", "extraAttributes": {} }, { "x": 26, "y": 4, "type": "collectible", "extraAttributes": {} }, { "x": 27, "y": 4, "type": "collectible", "extraAttributes": {} }, { "x": 28, "y": 4, "type": "collectible", "extraAttributes": {} }], "deko": [], "paths": [] }, { "tileData": [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, 0, 0, 2, 2, 2, 2, 2, 2], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 1], [2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], "levelObjects": [{ "x": 2, "y": 10, "type": "startFlag", "extraAttributes": { "levelStartFlag": true, "flagIndex": "PP1" } }, { "x": 30, "y": 5, "type": "finishFlag" }, { "x": 6, "y": 11, "type": "water", "extraAttributes": {} }, { "x": 7, "y": 11, "type": "water", "extraAttributes": {} }, { "x": 8, "y": 11, "type": "water", "extraAttributes": {} }, { "x": 9, "y": 11, "type": "water", "extraAttributes": {} }, { "x": 10, "y": 11, "type": "water", "extraAttributes": {} }, { "x": 11, "y": 11, "type": "water", "extraAttributes": {} }, { "x": 12, "y": 11, "type": "water", "extraAttributes": {} }, { "x": 13, "y": 11, "type": "water", "extraAttributes": {} }, { "x": 14, "y": 11, "type": "water", "extraAttributes": {} }, { "x": 15, "y": 11, "type": "water", "extraAttributes": {} }, { "x": 16, "y": 11, "type": "water", "extraAttributes": {} }, { "x": 17, "y": 11, "type": "water", "extraAttributes": {} }, { "x": 18, "y": 11, "type": "water", "extraAttributes": {} }, { "x": 19, "y": 11, "type": "redBlock", "extraAttributes": {} }, { "x": 26, "y": 6, "type": "blueBlock", "extraAttributes": {} }, { "x": 26, "y": 6, "type": "blueBlock", "extraAttributes": {} }, { "x": 26, "y": 6, "type": "blueBlock", "extraAttributes": {} }, { "x": 26, "y": 5, "type": "blueBlock", "extraAttributes": {} }, { "x": 26, "y": 5, "type": "blueBlock", "extraAttributes": {} }, { "x": 23, "y": 7, "type": "disappearingBlock", "extraAttributes": {} }, { "x": 23, "y": 8, "type": "disappearingBlock", "extraAttributes": {} }, { "x": 23, "y": 9, "type": "disappearingBlock", "extraAttributes": {} }, { "x": 23, "y": 10, "type": "disappearingBlock", "extraAttributes": {} }, { "x": 23, "y": 6, "type": "redblueblockswitch", "extraAttributes": {} }], "deko": [], "paths": [] }, { "tileData": [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 2], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], "levelObjects": [{ "x": 2, "y": 10, "type": "startFlag", "extraAttributes": { "levelStartFlag": true, "flagIndex": "PnH" } }, { "x": 30, "y": 5, "type": "finishFlag" }, { "x": 28, "y": 5, "type": "stomper", "extraAttributes": {} }, { "x": 8, "y": 9, "type": "stomper", "extraAttributes": {} }, { "x": 14, "y": 10, "type": "stomper", "extraAttributes": {} }, { "x": 9, "y": 9, "type": "checkpoint", "extraAttributes": {} }, { "x": 15, "y": 10, "type": "checkpoint", "extraAttributes": {} }], "deko": [], "paths": [] }, { "tileData": [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], [2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], "levelObjects": [{ "x": 2, "y": 10, "type": "startFlag", "extraAttributes": { "levelStartFlag": true, "flagIndex": "E0Z" } }, { "x": 30, "y": 5, "type": "finishFlag" }, { "x": 26, "y": 11, "type": "rocketLauncher", "extraAttributes": {} }, { "x": 5, "y": 10, "type": "collectible", "extraAttributes": { "collected": false } }, { "x": 6, "y": 10, "type": "collectible", "extraAttributes": { "collected": false } }, { "x": 6, "y": 11, "type": "collectible", "extraAttributes": { "collected": false } }, { "x": 6, "y": 12, "type": "collectible", "extraAttributes": { "collected": false } }, { "x": 6, "y": 13, "type": "collectible", "extraAttributes": { "collected": false } }, { "x": 6, "y": 14, "type": "collectible", "extraAttributes": { "collected": false } }, { "x": 6, "y": 15, "type": "collectible", "extraAttributes": { "collected": false } }, { "x": 13, "y": 13, "type": "stomper", "extraAttributes": {} }, { "x": 12, "y": 14, "type": "stomper", "extraAttributes": {} }, { "x": 13, "y": 15, "type": "stomper", "extraAttributes": {} }, { "x": 7, "y": 11, "type": "jumpReset", "extraAttributes": {} }, { "x": 8, "y": 11, "type": "jumpReset", "extraAttributes": {} }, { "x": 9, "y": 11, "type": "jumpReset", "extraAttributes": {} }, { "x": 10, "y": 11, "type": "jumpReset", "extraAttributes": {} }, { "x": 11, "y": 11, "type": "jumpReset", "extraAttributes": {} }, { "x": 12, "y": 11, "type": "jumpReset", "extraAttributes": {} }, { "x": 13, "y": 11, "type": "jumpReset", "extraAttributes": {} }, { "x": 14, "y": 11, "type": "jumpReset", "extraAttributes": {} }, { "x": 15, "y": 11, "type": "jumpReset", "extraAttributes": {} }, { "x": 16, "y": 11, "type": "jumpReset", "extraAttributes": {} }, { "x": 17, "y": 11, "type": "jumpReset", "extraAttributes": {} }, { "x": 7, "y": 12, "type": "jumpReset", "extraAttributes": {} }, { "x": 8, "y": 12, "type": "jumpReset", "extraAttributes": {} }, { "x": 9, "y": 12, "type": "jumpReset", "extraAttributes": {} }, { "x": 10, "y": 12, "type": "jumpReset", "extraAttributes": {} }, { "x": 11, "y": 12, "type": "jumpReset", "extraAttributes": {} }, { "x": 12, "y": 12, "type": "jumpReset", "extraAttributes": {} }, { "x": 13, "y": 12, "type": "jumpReset", "extraAttributes": {} }, { "x": 14, "y": 12, "type": "jumpReset", "extraAttributes": {} }, { "x": 15, "y": 12, "type": "jumpReset", "extraAttributes": {} }, { "x": 16, "y": 12, "type": "jumpReset", "extraAttributes": {} }, { "x": 17, "y": 12, "type": "jumpReset", "extraAttributes": {} }], "deko": [], "paths": [{ "speed": 3, "stopFrames": 10, "movementDirection": "forwards", "pathVariant": "line", "pathPoints": [{ "initialX": 13, "initialY": 14, "alignment": "corner" }, { "initialX": 14, "initialY": 14, "alignment": "horizontal" }, { "initialX": 15, "initialY": 14, "alignment": "horizontal" }, { "initialX": 16, "initialY": 14, "alignment": "horizontal" }, { "initialX": 17, "initialY": 14, "alignment": "horizontal" }, { "initialX": 18, "initialY": 14, "alignment": "horizontal" }, { "initialX": 19, "initialY": 14, "alignment": "horizontal" }, { "initialX": 20, "initialY": 14, "alignment": "horizontal" }, { "initialX": 21, "initialY": 14, "alignment": "horizontal" }, { "initialX": 22, "initialY": 14, "alignment": "horizontal" }, { "initialX": 23, "initialY": 14, "alignment": "horizontal" }, { "initialX": 24, "initialY": 14, "alignment": "corner" }] }] }, { "tileData": [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], "levelObjects": [], "deko": [], "paths": [] }];
WorldDataHandler.gamesName = unescape("Example%20name");
WorldDataHandler.endingMessage = unescape("Thx%20for%20playing%21");
WorldDataHandler.effects = [];
WorldDataHandler.backgroundColor = "000000";
WorldDataHandler.textColor = "ffffff";
//initialLevelDataEnd
//changedSpritesStart
SpritePixelArrays["TILE_1"] = { "name": 1, "descriptiveName": "Left top", "description": "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.", "type": "tiles", "animation": [{ "sprite": [["AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00"], ["00AA00", "005500", "005500", "005500", "005500", "005500", "005500", "005500"], ["AAFF55", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["00AA00", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["00AA00", "005500", "c26241", "c26241", "e1a45b", "e1a45b", "e1a45b", "e1a45b"]] }] };
SpritePixelArrays["TILE_2"] = { "name": 2, "descriptiveName": "Middle top", "description": "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.", "type": "tiles", "animation": [{ "sprite": [["AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00"], ["005500", "005500", "005500", "005500", "005500", "005500", "005500", "005500"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["c26241", "c26241", "c26241", "c26241", "e1a45b", "e1a45b", "e1a45b", "e1a45b"]] }] };
SpritePixelArrays["TILE_3"] = { "name": 3, "descriptiveName": "Right top", "description": "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.", "type": "tiles", "animation": [{ "sprite": [["AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00"], ["005500", "005500", "005500", "005500", "005500", "005500", "005500", "AAFF55"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "00AA00"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "AAFF55"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "00AA00"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "AAFF55"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "00AA00"], ["c26241", "c26241", "c26241", "c26241", "e1a45b", "e1a45b", "005500", "AAFF55"]] }] };
SpritePixelArrays["TILE_4"] = { "name": 4, "descriptiveName": "Left", "description": "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.", "type": "tiles", "animation": [{ "sprite": [["AAFF55", "005500", "fbe7cf", "fbe7cf", "eeb39e", "eeb39e", "eeb39e", "eeb39e"], ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["AAFF55", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["00AA00", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["00AA00", "005500", "c26241", "c26241", "e1a45b", "e1a45b", "e1a45b", "e1a45b"]] }] };
SpritePixelArrays["TILE_6"] = { "name": 6, "descriptiveName": "Middle", "description": "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.", "type": "tiles", "animation": [{ "sprite": [["fbe7cf", "fbe7cf", "fbe7cf", "fbe7cf", "eeb39e", "eeb39e", "eeb39e", "c26241"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["c26241", "c26241", "c26241", "c26241", "e1a45b", "e1a45b", "e1a45b", "e1a45b"]] }] };
SpritePixelArrays["TILE_7"] = { "name": 7, "descriptiveName": "Right", "description": "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.", "type": "tiles", "animation": [{ "sprite": [["fbe7cf", "fbe7cf", "fbe7cf", "fbe7cf", "eeb39e", "eeb39e", "005500", "00AA00"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "AAFF55"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "00AA00"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "AAFF55"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "00AA00"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "AAFF55"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "00AA00"], ["c26241", "c26241", "c26241", "c26241", "e1a45b", "e1a45b", "005500", "AAFF55"]] }] };
SpritePixelArrays["TILE_8"] = { "name": 8, "descriptiveName": "Left bottom", "description": "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.", "type": "tiles", "animation": [{ "sprite": [["AAFF55", "005500", "fbe7cf", "fbe7cf", "eeb39e", "eeb39e", "eeb39e", "eeb39e"], ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["AAFF55", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["00AA00", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["AAFF55", "005500", "005500", "005500", "005500", "005500", "005500", "005500"], ["00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55"]] }] };
SpritePixelArrays["TILE_9"] = { "name": 9, "descriptiveName": "Middle bottom", "description": "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.", "type": "tiles", "animation": [{ "sprite": [["fbe7cf", "fbe7cf", "fbe7cf", "fbe7cf", "eeb39e", "eeb39e", "eeb39e", "eeb39e"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["005500", "005500", "005500", "005500", "005500", "005500", "005500", "005500"], ["00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55"]] }] };
SpritePixelArrays["TILE_10"] = { "name": 10, "descriptiveName": "Right bottom", "description": "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.", "type": "tiles", "animation": [{ "sprite": [["fbe7cf", "fbe7cf", "fbe7cf", "fbe7cf", "eeb39e", "eeb39e", "005500", "00AA00"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "AAFF55"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "00AA00"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "AAFF55"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "00AA00"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "AAFF55"], ["005500", "005500", "005500", "005500", "005500", "005500", "005500", "00AA00"], ["00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55"]] }] };
SpritePixelArrays["TILE_11"] = { "name": 15, "descriptiveName": "Top and bottom", "description": "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.", "type": "tiles", "animation": [{ "sprite": [["AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00"], ["005500", "005500", "005500", "005500", "005500", "005500", "005500", "005500"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["fbe7cf", "f6c992", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["eeb39e", "ee8764", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["005500", "005500", "005500", "005500", "005500", "005500", "005500", "005500"], ["AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00"]] }] };
SpritePixelArrays["TILE_12"] = { "name": 16, "descriptiveName": "Left and right", "description": "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.", "type": "tiles", "animation": [{ "sprite": [["AAFF55", "005500", "fbe7cf", "fbe7cf", "eeb39e", "eeb39e", "005500", "AAFF55"], ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "00AA00"], ["AAFF55", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "AAFF55"], ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "00AA00"], ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "AAFF55"], ["00AA00", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "00AA00"], ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "AAFF55"], ["00AA00", "005500", "c26241", "c26241", "e1a45b", "e1a45b", "005500", "00AA00"]] }] };
SpritePixelArrays["TILE_13"] = { "name": 17, "descriptiveName": "All sides", "description": "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.", "type": "tiles", "animation": [{ "sprite": [["AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00"], ["00AA00", "005500", "005500", "005500", "005500", "005500", "005500", "AAFF55"], ["AAFF55", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "00AA00"], ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "AAFF55"], ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "00AA00"], ["00AA00", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "AAFF55"], ["AAFF55", "005500", "005500", "005500", "005500", "005500", "005500", "00AA00"], ["00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55"]] }] };
SpritePixelArrays["TILE_5"] = { "name": 5, "descriptiveName": "One way block", "description": "The player can jump through it, but will land on it when he falls", "type": "tiles", "animation": [{ "sprite": [["transp", "e97977", "e97977", "transp", "transp", "e97977", "e97977", "transp"], ["d55c5a", "d55c5a", "d55c5a", "e97977", "d55c5a", "d55c5a", "d55c5a", "e97977"], ["ba3d3b", "d55c5a", "d55c5a", "e97977", "ba3d3b", "d55c5a", "d55c5a", "e97977"], ["transp", "ba3d3b", "ba3d3b", "transp", "transp", "ba3d3b", "ba3d3b", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["TILE_edge"] = { "name": "edge", "descriptiveName": "Edge block", "description": "Will display on the edge of the game screen", "animation": [{ "sprite": [["b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4"], ["6c686c", "b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4", "6c686c"], ["6c686c", "6c686c", "b3a1b4", "b3a1b4", "b3a1b4", "b3a1b4", "6c686c", "6c686c"], ["6c686c", "6c686c", "6c686c", "b3a1b4", "b3a1b4", "6c686c", "6c686c", "6c686c"], ["6c686c", "6c686c", "6c686c", "524f52", "524f52", "6c686c", "6c686c", "6c686c"], ["6c686c", "6c686c", "524f52", "524f52", "524f52", "524f52", "6c686c", "6c686c"], ["6c686c", "524f52", "524f52", "524f52", "524f52", "524f52", "524f52", "6c686c"], ["524f52", "524f52", "524f52", "524f52", "524f52", "524f52", "524f52", "524f52"]] }] };
SpritePixelArrays["PLAYER_IDLE_SPRITE"] = { "name": "playerIdle", "descriptiveName": "Player idle", "description": "The player sprite that is shown when you are not moving.", "directions": ["right", "left"], "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "4080BF", "4080BF", "4080BF", "4080BF", "transp", "transp"], ["transp", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF"], ["transp", "transp", "EABFBF", "FFFFFF", "80552B", "EABFBF", "80552B", "transp"], ["transp", "transp", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "transp"], ["transp", "transp", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "transp", "transp"], ["transp", "f2cbc9", "transp", "d55c5a", "d55c5a", "transp", "f2cbc9", "transp"], ["transp", "transp", "BF8040", "transp", "transp", "BF8040", "transp", "transp"]] }] };
SpritePixelArrays["PLAYER_JUMP_SPRITE"] = { "name": "playerJump", "descriptiveName": "Player jump", "description": "The player sprite that is shown when you are jumping.<br/><span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'SFX 1'} }, true)\">Jump SFX</span> will be displayed underneath.", "squishAble": true, "directions": ["right", "left"], "animation": [{ "sprite": [["transp", "transp", "4080BF", "4080BF", "4080BF", "4080BF", "transp", "4080BF"], ["transp", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "transp"], ["transp", "transp", "EABFBF", "FFFFFF", "80552B", "EABFBF", "80552B", "transp"], ["transp", "transp", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "transp"], ["transp", "EABFBF", "BF4040", "BF4040", "BF4040", "BF4040", "EABFBF", "transp"], ["transp", "transp", "transp", "BF4040", "BF4040", "FFAA55", "transp", "transp"], ["transp", "transp", "FFAA55", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["PLAYER_WALL_JUMP_SPRITE"] = { "descriptiveName": "Player wall jump", "description": "The player sprite that is shown when you are jumping.", "squishAble": false, "hiddenEverywhere": true, "directions": ["right", "left"], "animation": [{ "sprite": [["transp", "transp", "4080BF", "4080BF", "4080BF", "4080BF", "transp", "4080BF"], ["transp", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "transp"], ["transp", "transp", "EABFBF", "FFFFFF", "80552B", "EABFBF", "80552B", "transp"], ["transp", "transp", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "transp"], ["transp", "EABFBF", "BF4040", "BF4040", "BF4040", "BF4040", "EABFBF", "transp"], ["transp", "transp", "transp", "BF4040", "BF4040", "FFAA55", "transp", "transp"], ["transp", "transp", "FFAA55", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["PLAYER_WALK_SPRITE"] = { "name": "playerWalk", "descriptiveName": "Player walk", "description": "The player sprite that is shown when you are running.", "directions": ["right", "left"], "animation": [{ "sprite": [["transp", "transp", "4080BF", "4080BF", "4080BF", "4080BF", "transp", "transp"], ["transp", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF"], ["transp", "transp", "EABFBF", "FFFFFF", "80552B", "EABFBF", "80552B", "transp"], ["transp", "transp", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "transp"], ["transp", "transp", "BF4040", "BF4040", "BF4040", "BF4040", "EABFBF", "transp"], ["transp", "EABFBF", "BF4040", "BF4040", "BF4040", "BF8040", "transp", "transp"], ["transp", "transp", "BF8040", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }, { "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "4080BF", "4080BF", "4080BF", "4080BF", "transp", "transp"], ["transp", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF", "4080BF"], ["transp", "transp", "EABFBF", "FFFFFF", "80552B", "EABFBF", "80552B", "transp"], ["transp", "transp", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "EABFBF", "transp"], ["transp", "transp", "BF4040", "BF4040", "BF4040", "BF4040", "transp", "transp"], ["transp", "EABFBF", "BF8040", "BF4040", "BF4040", "transp", "EABFBF", "transp"], ["transp", "transp", "transp", "transp", "BF8040", "transp", "transp", "transp"]] }] };
SpritePixelArrays["START_FLAG_SPRITE"] = { "name": "startFlag", "descriptiveName": "Start flag", "description": "The starting point of a level. You also respawn here, if you die. <br/> If you create multiple start-flags, for non-linear games, you can click on a set start flag again, to declare it as the default start of a level.", "type": "objects", "animation": [{ "sprite": [["fdfdfd", "d55c5a", "d55c5a", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "transp", "transp", "transp"], ["fdfdfd", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "transp"], ["fdfdfd", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "transp", "transp", "transp"], ["fdfdfd", "d55c5a", "d55c5a", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["CHECKPOINT_FLAG"] = { "name": "checkpoint", "descriptiveName": "Checkpoint", "description": "If the player touches the checkpoint, he will respawn here after a death. If there are multiple checkpoints, the latest one the player touched will become the respawn point.", "type": "objects", "animation": [{ "sprite": [["fdfdfd", "E3E300", "E3E300", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "E3E300", "E3E300", "E3E300", "transp", "transp", "transp", "transp"], ["fdfdfd", "E3E300", "E3E300", "E3E300", "E3E300", "transp", "transp", "transp"], ["fdfdfd", "E3E300", "E3E300", "E3E300", "E3E300", "E3E300", "transp", "transp"], ["fdfdfd", "E3E300", "E3E300", "E3E300", "E3E300", "E3E300", "E3E300", "transp"], ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }, { "sprite": [["fdfdfd", "E3E300", "E3E300", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "E3E300", "E3E300", "E3E300", "E3E300", "transp", "transp", "transp"], ["fdfdfd", "E3E300", "E3E300", "E3E300", "E3E300", "E3E300", "E3E300", "transp"], ["fdfdfd", "E3E300", "E3E300", "E3E300", "E3E300", "transp", "transp", "transp"], ["fdfdfd", "E3E300", "E3E300", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["FINISH_FLAG_SPRITE"] = { "name": "finishFlag", "descriptiveName": "Finish flag", "changeableAttributes": [{ "name": "collectiblesNeeded", "defaultValue": false }], "description": "The goal of a level. If you touch it, by default you continue to the next level. If you want to specify a custom exit to a different level, click on a set finish flag again. <br/><span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Finish flag closed'} }, true)\">Closed finish flag sprite</span>", "type": "objects", "animation": [{ "sprite": [["fdfdfd", "208220", "208220", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "208220", "208220", "208220", "208220", "transp", "transp", "transp"], ["fdfdfd", "208220", "208220", "208220", "208220", "208220", "208220", "transp"], ["fdfdfd", "208220", "208220", "208220", "208220", "transp", "transp", "transp"], ["fdfdfd", "208220", "208220", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["FINISH_FLAG_CLOSED_SPRITE"] = { "name": "finishFlagClosed", "descriptiveName": "Finish flag closed", "description": "This sprite will be displayed if the player needs to collect collectibles to access the <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Finish flag'} }, true)\">Finish flag</span> (Can be configured by clicking on a set finish flag in the game screen).", "hiddenSprite": true, "type": "objects", "animation": [{ "sprite": [["fdfdfd", "8E8E8E", "8E8E8E", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "8E8E8E", "8E8E8E", "8E8E8E", "8E8E8E", "transp", "transp", "transp"], ["fdfdfd", "8E8E8E", "8E8E8E", "8E8E8E", "8E8E8E", "8E8E8E", "8E8E8E", "transp"], ["fdfdfd", "8E8E8E", "8E8E8E", "8E8E8E", "8E8E8E", "transp", "transp", "transp"], ["fdfdfd", "8E8E8E", "8E8E8E", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["fdfdfd", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["SPIKE_SPRITE"] = { "name": "spike", "descriptiveName": "Spike", "directions": ["bottom", "left", "top", "right"], "description": "A spike. If you touch it, you die", "type": "objects", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "b3a1b4", "transp", "transp", "transp"], ["transp", "transp", "transp", "b3a1b4", "b3a1b4", "transp", "transp", "transp"], ["transp", "transp", "b3a1b4", "6c686c", "6c686c", "b3a1b4", "transp", "transp"], ["b3a1b4", "b3a1b4", "6c686c", "524f52", "FFFFFF", "6c686c", "b3a1b4", "transp"], ["transp", "b3a1b4", "6c686c", "524f52", "524f52", "6c686c", "b3a1b4", "b3a1b4"], ["transp", "transp", "b3a1b4", "6c686c", "6c686c", "b3a1b4", "transp", "transp"], ["transp", "transp", "transp", "b3a1b4", "b3a1b4", "transp", "transp", "transp"], ["transp", "transp", "transp", "b3a1b4", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["TRAMPOLINE_SRPITE"] = { "name": "trampoline", "descriptiveName": "Trampoline", "description": "A trampoline. You will jump approximately twice as high when you land on it.", "animNotEditale": true, "squishAble": false, "type": "objects", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["e97977", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "e97977"], ["e97977", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "e97977"], ["transp", "transp", "6c686c", "6c686c", "b3a1b4", "fdfdfd", "transp", "transp"], ["transp", "transp", "524f52", "524f52", "524f52", "524f52", "transp", "transp"], ["transp", "transp", "6c686c", "6c686c", "b3a1b4", "fdfdfd", "transp", "transp"], ["transp", "transp", "524f52", "524f52", "524f52", "524f52", "transp", "transp"]] }, { "sprite": [["e97977", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "e97977"], ["e97977", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "d55c5a", "e97977"], ["transp", "transp", "6c686c", "6c686c", "b3a1b4", "fdfdfd", "transp", "transp"], ["transp", "transp", "524f52", "524f52", "524f52", "524f52", "transp", "transp"], ["transp", "transp", "6c686c", "6c686c", "b3a1b4", "fdfdfd", "transp", "transp"], ["transp", "transp", "524f52", "524f52", "524f52", "524f52", "transp", "transp"], ["transp", "transp", "6c686c", "6c686c", "b3a1b4", "fdfdfd", "transp", "transp"], ["transp", "transp", "524f52", "524f52", "524f52", "524f52", "transp", "transp"]] }] };
SpritePixelArrays["CANON_SPRITE"] = { "name": "canon", "changeableAttributes": [{ "name": "speed", "defaultValue": 3, "minValue": 1, "maxValue": 10 }, { "name": "frequency", "defaultValue": 3, "minValue": 1, "maxValue": 8 }], "descriptiveName": "Cannon", "description": "A cannon. It shoots <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Cannon ball'} }, true)\">cannonballs</span> at certain time intervals. Click on it after placing it again, to change the attributes of the individual cannon.", "type": "objects", "squishAble": false, "directions": ["left", "top", "right", "bottom"], "animation": [{ "sprite": [["FFFFFF", "transp", "transp", "transp", "FFFFFF", "FFFFFF", "FFFFFF", "transp"], ["FFFFFF", "FFFFFF", "transp", "FFFFFF", "000000", "000000", "000000", "FFFFFF"], ["FFFFFF", "000000", "FFFFFF", "000000", "000000", "000000", "000000", "FFFFFF"], ["FFFFFF", "000000", "000000", "000000", "000000", "000000", "000000", "FFFFFF"], ["FFFFFF", "000000", "000000", "000000", "000000", "000000", "000000", "FFFFFF"], ["FFFFFF", "000000", "FFFFFF", "000000", "000000", "000000", "000000", "FFFFFF"], ["FFFFFF", "FFFFFF", "transp", "FFFFFF", "000000", "000000", "000000", "FFFFFF"], ["FFFFFF", "transp", "transp", "transp", "FFFFFF", "FFFFFF", "FFFFFF", "transp"]] }] };
SpritePixelArrays["STOMPER"] = { "name": "stomper", "type": "objects", "descriptiveName": "Stomper", "squishAble": false, "directions": ["bottom", "left", "top", "right"], "description": "A deadly hazard, that will fly torwards the player, if he is in it's way and move back to it's initial place once it hits a solid block. Can be rotated by clicking on a placed object again.", "animation": [{ "sprite": [["AAAAAA", "AAAAAA", "transp", "AAAAAA", "AAAAAA", "transp", "AAAAAA", "AAAAAA"], ["AAAAAA", "717171", "transp", "717171", "717171", "transp", "717171", "AAAAAA"], ["transp", "transp", "AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA", "transp", "transp"], ["AAAAAA", "717171", "FFFFFF", "AAAAAA", "AAAAAA", "FFFFFF", "717171", "AAAAAA"], ["AAAAAA", "717171", "FF1C1C", "AAAAAA", "AAAAAA", "FF1C1C", "717171", "AAAAAA"], ["transp", "transp", "AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA", "transp", "transp"], ["AAAAAA", "717171", "transp", "717171", "717171", "transp", "717171", "AAAAAA"], ["AAAAAA", "AAAAAA", "transp", "AAAAAA", "AAAAAA", "transp", "AAAAAA", "AAAAAA"]] }] };
SpritePixelArrays["TOGGLE_MINE"] = { "name": "toggleMine", "type": "objects", "descriptiveName": "Toggle mine", "description": "An object that is harmless at first, but once you step in and out of it, it becomes deadly.", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "C6C6C6", "C6C6C6", "transp", "transp", "transp"], ["transp", "transp", "C6C6C6", "transp", "transp", "C6C6C6", "transp", "transp"], ["transp", "C6C6C6", "transp", "transp", "transp", "transp", "C6C6C6", "transp"], ["transp", "C6C6C6", "transp", "transp", "transp", "transp", "C6C6C6", "transp"], ["transp", "transp", "C6C6C6", "transp", "transp", "C6C6C6", "transp", "transp"], ["transp", "transp", "transp", "C6C6C6", "C6C6C6", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }, { "sprite": [["transp", "transp", "transp", "FF1C1C", "FF1C1C", "transp", "transp", "transp"], ["transp", "transp", "FF1C1C", "transp", "transp", "FF1C1C", "transp", "transp"], ["transp", "FF1C1C", "transp", "transp", "transp", "transp", "FF1C1C", "transp"], ["FF1C1C", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "FF1C1C"], ["FF1C1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF1C1C"], ["transp", "FF1C1C", "transp", "transp", "transp", "transp", "FF1C1C", "transp"], ["transp", "transp", "FF1C1C", "transp", "transp", "FF1C1C", "transp", "transp"], ["transp", "transp", "transp", "FF1C1C", "FF1C1C", "transp", "transp", "transp"]] }] };
SpritePixelArrays["DISAPPEARING_BLOCK_SPRITE"] = { "name": "disappearingBlock", "descriptiveName": "Disappearing block", "description": "A block that will disappear upon touching it. It will reappear after a certain time.", "type": "tiles", "animation": [{ "sprite": [["804c51", "9c6853", "f6c992", "f6c992", "9c6853", "804c51", "804c51", "804c51"], ["9c6853", "f6c992", "f6c992", "f6c992", "f6c992", "804c51", "f6c992", "9c6853"], ["f6c992", "f6c992", "f6c992", "f6c992", "9c6853", "804c51", "9c6853", "9c6853"], ["9c6853", "f6c992", "f6c992", "9c6853", "9c6853", "804c51", "804c51", "804c51"], ["9c6853", "9c6853", "9c6853", "9c6853", "804c51", "9c6853", "f6c992", "9c6853"], ["804c51", "9c6853", "9c6853", "804c51", "9c6853", "f6c992", "f6c992", "9c6853"], ["804c51", "804c51", "804c51", "804c51", "9c6853", "9c6853", "9c6853", "804c51"], ["804c51", "9c6853", "9c6853", "804c51", "804c51", "804c51", "804c51", "804c51"]] }] };
SpritePixelArrays["WATER"] = { "name": "water", "descriptiveName": "Water", "description": "A passable block that slows down gravity and let's you jump infinitely inside it. Every object can be placed on it.", "type": "tiles", "animation": [{ "sprite": [["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"], ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"], ["8EC6FF", "C6E3FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"], ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"], ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "C6E3FF", "8EC6FF", "8EC6FF"], ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"], ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"], ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"]] }, { "sprite": [["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"], ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"], ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"], ["8EC6FF", "C6E3FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"], ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"], ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "C6E3FF", "8EC6FF", "8EC6FF"], ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"], ["8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF", "8EC6FF"]] }] };
SpritePixelArrays["RED_BLOCK"] = { "name": "redBlock", "descriptiveName": "Red block", "description": "There are red blocks and blue blocks. Only one them can be active at a time. By touching the switch (in the objects tab), the active tiles can be switched.", "type": "tiles", "animation": [{ "sprite": [["FF8E8E", "FF8E8E", "FF8E8E", "FF8E8E", "FF8E8E", "FF8E8E", "FF8E8E", "FF8E8E"], ["FF8E8E", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "AA0000"], ["FF8E8E", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "AA0000"], ["FF8E8E", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "AA0000"], ["FF8E8E", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "AA0000"], ["FF8E8E", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "AA0000"], ["FF8E8E", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "AA0000"], ["FF8E8E", "AA0000", "AA0000", "AA0000", "AA0000", "AA0000", "AA0000", "AA0000"]] }, { "sprite": [["FF1C1C", "FF1C1C", "transp", "FF1C1C", "FF1C1C", "transp", "FF1C1C", "FF1C1C"], ["FF1C1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF1C1C"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["FF1C1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF1C1C"], ["FF1C1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF1C1C"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["FF1C1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF1C1C"], ["FF1C1C", "FF1C1C", "transp", "FF1C1C", "FF1C1C", "transp", "FF1C1C", "FF1C1C"]] }] };
SpritePixelArrays["BLUE_BLOCK"] = { "name": "blueBlock", "descriptiveName": "Blue block", "description": "There are red blocks and blue blocks. Only one them can be active at a time. By touching the switch (in the objects tab), the active tiles can be switched.", "type": "tiles", "animation": [{ "sprite": [["8E8EFF", "8E8EFF", "8E8EFF", "8E8EFF", "8E8EFF", "8E8EFF", "8E8EFF", "8E8EFF"], ["8E8EFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "0000AA"], ["8E8EFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "0000AA"], ["8E8EFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "0000AA"], ["8E8EFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "0000AA"], ["8E8EFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "0000AA"], ["8E8EFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "0000AA"], ["8E8EFF", "0000AA", "0000AA", "0000AA", "0000AA", "0000AA", "0000AA", "0000AA"]] }, { "sprite": [["1C1CFF", "1C1CFF", "transp", "1C1CFF", "1C1CFF", "transp", "1C1CFF", "1C1CFF"], ["1C1CFF", "transp", "transp", "transp", "transp", "transp", "transp", "1C1CFF"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["1C1CFF", "transp", "transp", "transp", "transp", "transp", "transp", "1C1CFF"], ["1C1CFF", "transp", "transp", "transp", "transp", "transp", "transp", "1C1CFF"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["1C1CFF", "transp", "transp", "transp", "transp", "transp", "transp", "1C1CFF"], ["1C1CFF", "1C1CFF", "transp", "1C1CFF", "1C1CFF", "transp", "1C1CFF", "1C1CFF"]] }] };
SpritePixelArrays["RED_BLUE_BLOCK_SWITCH"] = { "name": "redblueblockswitch", "descriptiveName": "Red/blue switch", "description": "A switch for red/blue tiles. Can be activated by hitting it with your head, or if a stomper/cannon-ball/rocket hits it.", "type": "tiles", "squishAble": false, "animNotEditale": true, "animation": [{ "sprite": [["FF8E8E", "FF8E8E", "FF8E8E", "FF8E8E", "FF8E8E", "FF8E8E", "FF8E8E", "FF8E8E"], ["FF8E8E", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "AA0000"], ["FF8E8E", "FF1C1C", "FFFFFF", "FFFFFF", "FFFFFF", "FF1C1C", "FF1C1C", "AA0000"], ["FF8E8E", "FF1C1C", "FFFFFF", "FF1C1C", "FF1C1C", "FFFFFF", "FF1C1C", "AA0000"], ["FF8E8E", "FF1C1C", "FFFFFF", "FFFFFF", "FFFFFF", "FF1C1C", "FF1C1C", "AA0000"], ["FF8E8E", "FF1C1C", "FFFFFF", "FF1C1C", "FF1C1C", "FFFFFF", "FF1C1C", "AA0000"], ["FF8E8E", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "FF1C1C", "AA0000"], ["FF8E8E", "AA0000", "AA0000", "AA0000", "AA0000", "AA0000", "AA0000", "AA0000"]] }, { "sprite": [["8E8EFF", "8E8EFF", "8E8EFF", "8E8EFF", "8E8EFF", "8E8EFF", "8E8EFF", "8E8EFF"], ["8E8EFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "0000AA"], ["8E8EFF", "1C1CFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "1C1CFF", "0000AA"], ["8E8EFF", "1C1CFF", "FFFFFF", "FFFFFF", "FFFFFF", "1C1CFF", "1C1CFF", "0000AA"], ["8E8EFF", "1C1CFF", "FFFFFF", "1C1CFF", "1C1CFF", "FFFFFF", "1C1CFF", "0000AA"], ["8E8EFF", "1C1CFF", "FFFFFF", "FFFFFF", "FFFFFF", "1C1CFF", "1C1CFF", "0000AA"], ["8E8EFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "1C1CFF", "0000AA"], ["8E8EFF", "0000AA", "0000AA", "0000AA", "0000AA", "0000AA", "0000AA", "0000AA"]] }] };
SpritePixelArrays["ROCKET_LAUNCHER"] = { "name": "rocketLauncher", "type": "objects", "descriptiveName": "Rocket launcher", "changeableAttributes": [{ "name": "speed", "defaultValue": 3, "minValue": 1, "maxValue": 10 }, { "name": "frequency", "defaultValue": 3, "minValue": 1, "maxValue": 8 }, { "name": "rotationSpeed", "defaultValue": 8, "minValue": 0, "maxValue": 24, "descriptiveName": "rotation speed <span data-microtip-size='large'aria-label='Determines how fast the rockets will rotate to the players direction. 0 = rockets will decide direction once and not turn at all. 24 = basically following the player everywhere.'data-microtip-position='top-left' role='tooltip' class='songInputInfo'><img src='images/icons/info.svg' alt='info' width='16' height='16'>" }], "squishAble": false, "rotateable": true, "description": "A rocket-launcher. It shoots <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Rocket'} }, true)\">rockets</span> at certain time intervals that will follow the player. Click on it after placing it again, to change the attributes of the individual cannon.", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "AAAAAA", "AAAAAA", "transp", "transp"], ["AAAAAA", "AAAAAA", "FF1C1C", "FF1C1C", "AAAAAA", "AAAAAA", "717171", "transp"], ["AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA", "717171", "717171"], ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "717171", "717171"], ["FFFFFF", "FFFFFF", "FF1C1C", "FF1C1C", "FFFFFF", "FFFFFF", "717171", "transp"], ["transp", "transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["NPC_SPRITE"] = { "name": "npc", "changeableAttributes": [{ "name": "dialogue", "defaultValue": [""] }], "descriptiveName": "Npc", "description": "An object that can display a dialogue. Click on it again after placing it, to display the dialogue window.", "type": "objects", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["FFAA55", "FFAA55", "FFAA55", "FFAA55", "FFAA55", "FFAA55", "FFAA55", "AA5500"], ["FFAA55", "FF8E1C", "FFFFFF", "FFFFFF", "FF8E1C", "FFFFFF", "FF8E1C", "AA5500"], ["FFAA55", "FF8E1C", "FF8E1C", "FF8E1C", "FF8E1C", "FF8E1C", "FF8E1C", "AA5500"], ["FFAA55", "FF8E1C", "FFFFFF", "FF8E1C", "FFFFFF", "FFFFFF", "FF8E1C", "AA5500"], ["AA5500", "AA5500", "AA5500", "AA5500", "AA5500", "AA5500", "AA5500", "AA5500"], ["transp", "transp", "transp", "713900", "713900", "transp", "transp", "transp"], ["transp", "transp", "transp", "713900", "713900", "transp", "transp", "transp"]] }] };
SpritePixelArrays["CANON_BALL_SPRITE"] = { "name": "canonBall", "descriptiveName": "Cannon ball", "directions": ["left", "top", "right", "bottom"], "description": "A cannonball. The <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Cannon'} }, true)\">cannon</span> shoots it. <br/>When it hits a wall, <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'SFX 2'} }, true)\">explosion</span> will be displayed.", "animation": [{ "sprite": [["transp", "transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp", "transp"], ["transp", "FFFFFF", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "FFFFFF", "transp"], ["FFFFFF", "ff5e7a", "ff5e7a", "ff5e7a", "FFFFFF", "ff5e7a", "ff5e7a", "FFFFFF"], ["FFFFFF", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "FFFFFF", "ff5e7a", "FFFFFF"], ["FFFFFF", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "FFFFFF"], ["FFFFFF", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "FFFFFF"], ["transp", "FFFFFF", "ff5e7a", "ff5e7a", "ff5e7a", "ff5e7a", "FFFFFF", "transp"], ["transp", "transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp", "transp"]] }] };
SpritePixelArrays["ROCKET"] = { "name": "rocket", "descriptiveName": "Rocket", "description": "A rocket. The <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Rocket launcher'} }, true)\">rocket launcher</span> shoots it.<br/>When it hits a wall, <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'SFX 2'} }, true)\">explosion</span> will be displayed.", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "FFFFFF", "transp", "transp"], ["transp", "transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp"], ["FF1C1C", "FF1C1C", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFF8E", "FF8E1C"], ["FF1C1C", "FF1C1C", "AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA", "FFFF8E", "FF8E1C"], ["transp", "transp", "transp", "transp", "AAAAAA", "AAAAAA", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "AAAAAA", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }, { "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "FFFFFF", "transp", "transp"], ["transp", "transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp"], ["FF1C1C", "FF1C1C", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp", "FF8E1C"], ["FF1C1C", "FF1C1C", "AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA", "transp", "FF8E1C"], ["transp", "transp", "transp", "transp", "AAAAAA", "AAAAAA", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "AAAAAA", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["PORTAL"] = { "name": "portal", "type": "objects", "descriptiveName": "Portal", "squishAble": false, "description": "<b>Second Sprite:</b> <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Portal 2'} }, true)\">Here</span><br/><br/>A portal with 2 exits. <br/>Just draw 2 portals on the game screen. The odd one will automatically be the first, the even one the second.", "animation": [{ "sprite": [["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"], ["transp", "transp", "0071E3", "0071E3", "0071E3", "0071E3", "transp", "transp"], ["transp", "0071E3", "0071E3", "55AAFF", "55AAFF", "0071E3", "0071E3", "transp"], ["FFFFFF", "0071E3", "55AAFF", "8EC6FF", "8EC6FF", "55AAFF", "0071E3", "FFFFFF"], ["FFFFFF", "0071E3", "55AAFF", "8EC6FF", "8EC6FF", "55AAFF", "0071E3", "FFFFFF"], ["transp", "0071E3", "0071E3", "55AAFF", "55AAFF", "0071E3", "0071E3", "transp"], ["transp", "transp", "0071E3", "0071E3", "0071E3", "0071E3", "transp", "transp"], ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"]] }] };
SpritePixelArrays["PORTAL2"] = { "name": "portal2", "type": "objects", "descriptiveName": "Portal 2", "description": "<b>First Sprite:</b> <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Portal'} }, true)\">Here</span><br/><br/>A portal with 2 exits. <br/>Just draw 2 portals on the game screen. The odd one will automatically be the first, the even one the second.", "squishAble": false, "hiddenSprite": true, "animation": [{ "sprite": [["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"], ["transp", "transp", "E37100", "E37100", "E37100", "E37100", "transp", "transp"], ["transp", "E37100", "E37100", "FFAA55", "FFAA55", "E37100", "E37100", "transp"], ["FFFFFF", "E37100", "FFAA55", "FFC68E", "FFC68E", "FFAA55", "E37100", "FFFFFF"], ["FFFFFF", "E37100", "FFAA55", "FFC68E", "FFC68E", "FFAA55", "E37100", "FFFFFF"], ["transp", "E37100", "E37100", "FFAA55", "FFAA55", "E37100", "E37100", "transp"], ["transp", "transp", "E37100", "E37100", "E37100", "E37100", "transp", "transp"], ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"]] }] };
SpritePixelArrays["COLLECTIBLE"] = { "name": "collectible", "type": "objects", "descriptiveName": "Collectible", "description": "They can be placed to give the player an additional challenge. <br/> Inside the tool, the collectibles will reappear if you die or reset the level, in the exported game they are gone forever, once <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'SFX 4'} }, true)\">collected</span>.", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "FFFFC6", "FFFFC6", "transp", "transp", "transp"], ["transp", "transp", "FFFFC6", "FFFF8E", "FFFF8E", "FFFF55", "transp", "transp"], ["transp", "transp", "FFFFC6", "FFFF8E", "FFFF8E", "FFFF55", "transp", "transp"], ["transp", "transp", "FFFFC6", "FFFF8E", "FFFF8E", "FFFF55", "transp", "transp"], ["transp", "transp", "FFFFC6", "FFFF8E", "FFFF8E", "FFFF55", "transp", "transp"], ["transp", "transp", "transp", "FFFF55", "FFFF55", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }, { "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "FFFFC6", "FFFFC6", "transp", "transp", "transp"], ["transp", "transp", "transp", "FFFFC6", "FFFF55", "transp", "transp", "transp"], ["transp", "transp", "transp", "FFFFC6", "FFFF55", "transp", "transp", "transp"], ["transp", "transp", "transp", "FFFFC6", "FFFF55", "transp", "transp", "transp"], ["transp", "transp", "transp", "FFFFC6", "FFFF55", "transp", "transp", "transp"], ["transp", "transp", "transp", "FFFF55", "FFFF55", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["LASER_CANON"] = { "name": "laserCanon", "changeableAttributes": [{ "name": "laserDuration", "defaultValue": 60, "minValue": 10, "maxValue": 140, "step": 10, "descriptiveName": "laser duration" }, { "name": "pauseDuration", "defaultValue": 60, "minValue": 0, "maxValue": 140, "step": 10, "descriptiveName": "pause duration" }], "descriptiveName": "Laser cannon", "description": "A laser cannon. It shoots <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Laser'} }, true)\">lasers</span> until they hit a wall. Click on it after placing it again, to change the attributes of the individual laser cannon.", "type": "objects", "squishAble": false, "directions": ["left", "top", "right", "bottom"], "animation": [{ "sprite": [["transp", "transp", "8E8E8E", "8E8E8E", "8E8E8E", "8E8E8E", "8E8E8E", "8E8E8E"], ["transp", "555555", "8E8E8E", "717171", "717171", "717171", "717171", "555555"], ["C6C6C6", "555555", "8E8E8E", "717171", "717171", "717171", "717171", "555555"], ["FFFFFF", "555555", "8E8E8E", "393939", "FF8E8E", "FF8E8E", "393939", "555555"], ["FFFFFF", "555555", "8E8E8E", "393939", "E30000", "E30000", "393939", "555555"], ["C6C6C6", "555555", "8E8E8E", "717171", "717171", "717171", "717171", "555555"], ["transp", "555555", "8E8E8E", "717171", "717171", "717171", "717171", "555555"], ["transp", "transp", "555555", "555555", "555555", "555555", "555555", "555555"]] }] };
SpritePixelArrays["LASER"] = { "name": "laser", "descriptiveName": "Laser", "directions": ["left", "top", "right", "bottom"], "description": "A laser. The <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Laser cannon'} }, true)\">laser cannon</span> shoots it. <br/>", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "FFC68E", "transp", "transp", "transp", "FFC68E", "transp"], ["transp", "transp", "FF1C1C", "transp", "transp", "transp", "FF1C1C", "transp"], ["transp", "FF1C1C", "transp", "FF1C1C", "transp", "FF1C1C", "transp", "FF1C1C"], ["FFC68E", "transp", "transp", "transp", "FFC68E", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }, { "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["FFC68E", "transp", "transp", "transp", "FFC68E", "transp", "transp", "transp"], ["FF1C1C", "transp", "transp", "transp", "FF1C1C", "transp", "transp", "transp"], ["transp", "FF1C1C", "transp", "FF1C1C", "transp", "FF1C1C", "transp", "FF1C1C"], ["transp", "transp", "FFC68E", "transp", "transp", "transp", "FFC68E", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["BARREL_CANNON"] = { "name": "barrelCannon", "descriptiveName": "Barrel", "description": "A barrel. When the player touches it, he gets inside of it and stays there, until he presses the jump button - then he will be launched out of it in it's direction.", "type": "objects", "squishAble": true, "directions": ["left", "top", "right", "bottom"], "animation": [{ "sprite": [["transp", "transp", "717171", "FFAA55", "FFAA55", "717171", "transp", "transp"], ["transp", "FFAA55", "8E8E8E", "FF8E1C", "FF8E1C", "8E8E8E", "FFAA55", "transp"], ["717171", "FF8E1C", "8E8E8E", "FFFFFF", "E37100", "8E8E8E", "FF8E1C", "717171"], ["8E8E8E", "FF8E1C", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FF8E1C", "8E8E8E"], ["8E8E8E", "FF8E1C", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FF8E1C", "8E8E8E"], ["717171", "FF8E1C", "8E8E8E", "FFFFFF", "E37100", "8E8E8E", "FF8E1C", "717171"], ["transp", "FFAA55", "8E8E8E", "FF8E1C", "FF8E1C", "8E8E8E", "FFAA55", "transp"], ["transp", "transp", "717171", "FFAA55", "FFAA55", "717171", "transp", "transp"]] }] };
SpritePixelArrays["JUMP_RESET"] = { "name": "jumpReset", "descriptiveName": "Jump reset", "description": "It resets your jump in air. It is deactivated upon touching the ground or wall.", "type": "objects", "animation": [{ "sprite": [["transp", "transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp", "transp"], ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"], ["FFFFFF", "transp", "transp", "55AAFF", "55AAFF", "transp", "transp", "FFFFFF"], ["FFFFFF", "transp", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "transp", "FFFFFF"], ["FFFFFF", "transp", "transp", "55AAFF", "55AAFF", "transp", "transp", "FFFFFF"], ["FFFFFF", "transp", "transp", "55AAFF", "55AAFF", "transp", "transp", "FFFFFF"], ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"], ["transp", "transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp", "transp"]] }] };
SpritePixelArrays["FIXED_SPEED_RIGHT"] = { "name": "fixedSpeedRight", "descriptiveName": "Auto run", "directions": ["right", "left"], "description": "Activates auto-run mode upon touching. <br/> The auto-run can be stopped by the auto-run stopper tile. <br/> Jumping off a wall will change the run direction. Click on a set object again, to change it's default direction.", "type": "objects", "animation": [{ "sprite": [["FF8E1C", "FF8E1C", "transp", "transp", "transp", "transp", "FF8E1C", "FF8E1C"], ["FF8E1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF8E1C"], ["transp", "transp", "transp", "transp", "FF8E1C", "transp", "transp", "transp"], ["transp", "transp", "FF8E1C", "FF8E1C", "FF8E1C", "FF8E1C", "transp", "transp"], ["transp", "transp", "FF8E1C", "FF8E1C", "FF8E1C", "FF8E1C", "transp", "transp"], ["transp", "transp", "transp", "transp", "FF8E1C", "transp", "transp", "transp"], ["FF8E1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF8E1C"], ["FF8E1C", "FF8E1C", "transp", "transp", "transp", "transp", "FF8E1C", "FF8E1C"]] }, { "sprite": [["FF8E1C", "FF8E1C", "transp", "transp", "transp", "transp", "FF8E1C", "FF8E1C"], ["FF8E1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF8E1C"], ["transp", "transp", "transp", "transp", "AA5500", "transp", "transp", "transp"], ["transp", "transp", "AA5500", "AA5500", "AA5500", "AA5500", "transp", "transp"], ["transp", "transp", "AA5500", "AA5500", "AA5500", "AA5500", "transp", "transp"], ["transp", "transp", "transp", "transp", "AA5500", "transp", "transp", "transp"], ["FF8E1C", "transp", "transp", "transp", "transp", "transp", "transp", "FF8E1C"], ["FF8E1C", "FF8E1C", "transp", "transp", "transp", "transp", "FF8E1C", "FF8E1C"]] }] };
SpritePixelArrays["FIXED_SPEED_STOPPER"] = { "name": "fixedSpeedStopper", "descriptiveName": "Auto-run stopper", "description": "This tile stops the auto-run activated by the <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Auto run'} }, true)\">auto-run sprite</span>.", "type": "objects", "animation": [{ "sprite": [["transp", "transp", "FFC6C6", "FFC6C6", "FFC6C6", "FFC6C6", "transp", "transp"], ["transp", "FFC6C6", "390000", "390000", "390000", "390000", "FFC6C6", "transp"], ["FFC6C6", "390000", "FFC6C6", "390000", "390000", "390000", "390000", "FFC6C6"], ["FFC6C6", "390000", "390000", "FFC6C6", "390000", "390000", "390000", "FFC6C6"], ["FFC6C6", "390000", "390000", "390000", "FFC6C6", "390000", "390000", "FFC6C6"], ["FFC6C6", "390000", "390000", "390000", "390000", "FFC6C6", "390000", "FFC6C6"], ["transp", "FFC6C6", "390000", "390000", "390000", "390000", "FFC6C6", "transp"], ["transp", "transp", "FFC6C6", "FFC6C6", "FFC6C6", "FFC6C6", "transp", "transp"]] }, { "sprite": [["transp", "transp", "FFC6C6", "FFC6C6", "FFC6C6", "FFC6C6", "transp", "transp"], ["transp", "FFC6C6", "710000", "710000", "710000", "710000", "FFC6C6", "transp"], ["FFC6C6", "710000", "FFC6C6", "710000", "710000", "710000", "710000", "FFC6C6"], ["FFC6C6", "710000", "710000", "FFC6C6", "710000", "710000", "710000", "FFC6C6"], ["FFC6C6", "710000", "710000", "710000", "FFC6C6", "710000", "710000", "FFC6C6"], ["FFC6C6", "710000", "710000", "710000", "710000", "FFC6C6", "710000", "FFC6C6"], ["transp", "FFC6C6", "710000", "710000", "710000", "710000", "FFC6C6", "transp"], ["transp", "transp", "FFC6C6", "FFC6C6", "FFC6C6", "FFC6C6", "transp", "transp"]] }] };
SpritePixelArrays["PATH_SPRITE"] = { "name": "pathPoint", "changeableAttributes": [{ "name": "speed", "defaultValue": 3, "minValue": 1, "maxValue": 7, "mapper": { "1": 1, "2": 2, "3": 3, "4": 4, "5": 6, "6": 8, "7": 12 } }, { "name": "stopFrames", "defaultValue": 10, "minValue": 0, "maxValue": 80, "step": 5, "descriptiveName": "wait <span data-microtip-size='large'aria-label='The objects on the path will wait that amount of time, if an object reaches the path´s end.'data-microtip-position='top-left' role='tooltip' class='songInputInfo'><img src='images/icons/info.svg' alt='info' width='16' height='16'>" }, { "name": "movementDirection", "formElement": "toggle", "defaultValue": "forwards", "options": [{ "true": "forwards" }, { "false": "backwards" }] }], "directions": ["top", "right"], "descriptiveName": "Path", "description": "<div>Draw paths, put objects on top and the objects will follow them. Click on an already set path-point, while paths are selected in build-tools to adjust the path's attributes.<div class='subSection'><details><summary>Compatible objects</summary><div class='marginTop8'><ul style='padding-left: 16px'><li>Finish flag</li><li>Spikes</li><li>Trampolines</li><li>Toggle mine</li><li>Rocket launchers</li><li>Portals</li><li>Collectibles</li><li>Barrel cannons</li><li>Jump reset</li></ul></div></details><details class='marginTop8'><summary>Rules</summary><div class='marginTop8'><ul style='padding-left: 16px'><li>Draw paths in a line or in an enclosed 'circle'</li><li>Place as many different objects on them as you want</li><li>You can't draw 2 paths above or beside each other. You need to leave 1 free space inbetween</li></ul></div></details></div></div>", "type": "objects", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["FFFFFF", "FFFFFF", "transp", "FFFFFF", "FFFFFF", "transp", "FFFFFF", "FFFFFF"], ["1C1C1C", "1C1C1C", "transp", "1C1C1C", "1C1C1C", "transp", "1C1C1C", "1C1C1C"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["DEKO_SPRITE"] = { "name": "deco", "type": "deco", "descriptiveName": "Deco 1", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "40BF40", "transp", "transp", "transp", "40BF40"], ["transp", "40BF40", "transp", "40BF40", "transp", "40BF40", "transp", "40BF40"], ["transp", "40BF40", "40BF40", "40BF40", "40BF40", "40BF40", "transp", "40BF40"], ["40BF40", "40BF40", "40BF40", "40BF40", "40BF40", "40BF40", "transp", "40BF40"]] }] };
SpritePixelArrays["DEKO_SPRITE2"] = { "name": "deco", "descriptiveName": "Deco 2", "type": "deco", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "FF55FF", "FF55FF", "transp"], ["transp", "FF5555", "FF5555", "transp", "FF00FF", "transp", "transp", "FF00FF"], ["FF5555", "transp", "transp", "FF5555", "transp", "FF00FF", "FF00FF", "transp"], ["transp", "FF5555", "FF5555", "transp", "transp", "2B802B", "2B802B", "transp"]] }] };
SpritePixelArrays["DEKO_SPRITE3"] = { "name": "deco", "descriptiveName": "Deco 3", "type": "deco", "animation": [{ "sprite": [["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"], ["FFFFFF", "FFFFFF", "transp", "FFFFFF", "FFFFFF", "transp", "FFFFFF", "FFFFFF"], ["FFFFFF", "FFFFFF", "FFFFFF", "0000FF", "0000FF", "FFFFFF", "FFFFFF", "FFFFFF"], ["transp", "transp", "transp", "0000FF", "0000FF", "transp", "transp", "transp"], ["FFFFFF", "FFFFFF", "55AAFF", "transp", "transp", "55AAFF", "FFFFFF", "FFFFFF"], ["FFFFFF", "FFFFFF", "FFFFFF", "55AAFF", "55AAFF", "FFFFFF", "FFFFFF", "FFFFFF"], ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["DEKO_SPRITE4"] = { "name": "deco", "descriptiveName": "Deco 4", "type": "deco", "animation": [{ "sprite": [["transp", "2B8055", "transp", "15402A", "15402A", "transp", "2B8055", "transp"], ["transp", "2B8055", "2B8055", "15402A", "15402A", "2B8055", "2B8055", "transp"], ["transp", "transp", "2B8055", "15402A", "15402A", "2B8055", "transp", "transp"], ["transp", "transp", "transp", "15402A", "15402A", "transp", "transp", "transp"], ["transp", "2B8055", "transp", "15402A", "15402A", "transp", "2B8055", "transp"], ["transp", "2B8055", "2B8055", "15402A", "15402A", "2B8055", "2B8055", "transp"], ["transp", "transp", "2B8055", "15402A", "15402A", "2B8055", "transp", "transp"], ["transp", "transp", "transp", "15402A", "15402A", "transp", "transp", "transp"]] }] };
SpritePixelArrays["DEKO_SPRITE5"] = { "name": "deco", "descriptiveName": "Deco 5", "type": "deco", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["713900", "transp", "transp", "transp", "transp", "transp", "transp", "AA5500"], ["713900", "E37100", "E37100", "E37100", "E37100", "E37100", "E37100", "AA5500"], ["713900", "transp", "transp", "transp", "transp", "transp", "transp", "AA5500"], ["713900", "E37100", "E37100", "E37100", "E37100", "E37100", "E37100", "AA5500"], ["713900", "transp", "transp", "transp", "transp", "transp", "transp", "AA5500"], ["713900", "E37100", "E37100", "E37100", "E37100", "E37100", "E37100", "AA5500"]] }] };
SpritePixelArrays["DEKO_SPRITE6"] = { "name": "deco", "descriptiveName": "Deco 6", "type": "deco", "animation": [{ "sprite": [["717171", "8E8E8E", "AAAAAA", "C6C6C6", "C6C6C6", "AAAAAA", "8E8E8E", "717171"], ["transp", "717171", "8E8E8E", "AAAAAA", "AAAAAA", "8E8E8E", "717171", "transp"], ["transp", "transp", "FFFF1C", "FFFF55", "FFFF55", "FFFF1C", "transp", "transp"], ["transp", "717171", "710071", "AA00AA", "AA00AA", "710071", "717171", "transp"], ["717171", "8E8E8E", "AAAAAA", "C6C6C6", "C6C6C6", "AAAAAA", "8E8E8E", "717171"], ["717171", "8E8E8E", "AAAAAA", "C6C6C6", "C6C6C6", "AAAAAA", "8E8E8E", "717171"], ["717171", "8E8E8E", "AAAAAA", "C6C6C6", "C6C6C6", "AAAAAA", "8E8E8E", "717171"], ["transp", "717171", "8E8E8E", "AAAAAA", "AAAAAA", "8E8E8E", "717171", "transp"]] }] };
SpritePixelArrays["DEKO_SPRITE7"] = { "name": "deco", "descriptiveName": "Deco 7", "type": "deco", "animation": [{ "sprite": [["2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A"], ["transp", "2A2A2A", "transp", "transp", "2A2A2A", "transp", "2A2A2A", "transp"], ["transp", "2A2A2A", "transp", "2A2A2A", "transp", "transp", "2A2A2A", "transp"], ["transp", "2A2A2A", "transp", "2A2A2A", "2A2A2A", "transp", "2A2A2A", "transp"], ["transp", "2A2A2A", "transp", "transp", "2A2A2A", "transp", "2A2A2A", "transp"], ["transp", "2A2A2A", "transp", "2A2A2A", "transp", "transp", "2A2A2A", "transp"], ["transp", "2A2A2A", "transp", "2A2A2A", "2A2A2A", "transp", "2A2A2A", "transp"], ["2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A"]] }] };
SpritePixelArrays["DEKO_SPRITE8"] = { "name": "deco", "descriptiveName": "Deco 8", "type": "deco", "animation": [{ "sprite": [["2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "transp", "2A2A2A", "2A2A2A"], ["2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "transp", "2A2A2A", "2A2A2A"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["2A2A2A", "2A2A2A", "transp", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A"], ["2A2A2A", "2A2A2A", "transp", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "transp", "2A2A2A", "2A2A2A"], ["2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "2A2A2A", "transp", "2A2A2A", "2A2A2A"]] }] };
SpritePixelArrays["DEKO_SPRITE9"] = { "name": "deco", "descriptiveName": "Deco 9", "type": "deco", "animation": [{ "sprite": [["transp", "transp", "transp", "FF8E1C", "transp", "transp", "transp", "transp"], ["transp", "transp", "FF8E1C", "FFC68E", "FF8E1C", "transp", "transp", "transp"], ["transp", "FF8E1C", "FFC68E", "FFFFC6", "FFC68E", "FF8E1C", "transp", "transp"], ["transp", "FF8E1C", "FFC68E", "FFFFC6", "FFC68E", "FF8E1C", "transp", "transp"], ["transp", "8E8E8E", "AAAAAA", "AAAAAA", "AAAAAA", "8E8E8E", "transp", "transp"], ["transp", "transp", "8E8E8E", "AAAAAA", "8E8E8E", "transp", "transp", "transp"], ["transp", "transp", "transp", "8E8E8E", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "8E8E8E", "transp", "transp", "transp", "transp"]] }, { "sprite": [["transp", "transp", "transp", "AA5500", "transp", "transp", "transp", "transp"], ["transp", "transp", "AA5500", "FF8E1C", "AA5500", "transp", "transp", "transp"], ["transp", "AA5500", "FF8E1C", "FFFF8E", "FF8E1C", "AA5500", "transp", "transp"], ["transp", "AA5500", "FF8E1C", "FFFF8E", "FF8E1C", "AA5500", "transp", "transp"], ["transp", "8E8E8E", "AAAAAA", "AAAAAA", "AAAAAA", "8E8E8E", "transp", "transp"], ["transp", "transp", "8E8E8E", "AAAAAA", "8E8E8E", "transp", "transp", "transp"], ["transp", "transp", "transp", "8E8E8E", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "8E8E8E", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["DEKO_SPRITE10"] = { "name": "deco", "descriptiveName": "Deco 10", "type": "deco", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"], ["transp", "transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp", "transp"], ["transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp"], ["C6E3FF", "C6E3FF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp"], ["C6E3FF", "C6E3FF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"], ["transp", "C6E3FF", "C6E3FF", "C6E3FF", "C6E3FF", "C6E3FF", "C6E3FF", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["DEKO_SPRITE11"] = { "name": "deco", "descriptiveName": "Deco 11", "type": "deco", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "FFC6FF", "transp", "transp", "transp", "transp", "transp"], ["transp", "FFC6FF", "FFFFFF", "FFC6FF", "transp", "transp", "transp", "transp"], ["transp", "transp", "FFC6FF", "transp", "transp", "FFC6FF", "transp", "transp"], ["transp", "transp", "transp", "transp", "FFC6FF", "FFFFFF", "FFC6FF", "transp"], ["transp", "transp", "FFC6FF", "transp", "transp", "FFC6FF", "transp", "transp"], ["transp", "FFC6FF", "FFFFFF", "FFC6FF", "transp", "transp", "transp", "transp"], ["transp", "transp", "FFC6FF", "transp", "transp", "transp", "transp", "transp"]] }, { "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "393939", "transp", "transp", "transp", "transp", "transp"], ["transp", "393939", "FFC6FF", "393939", "transp", "transp", "transp", "transp"], ["transp", "transp", "393939", "transp", "transp", "393939", "transp", "transp"], ["transp", "transp", "transp", "transp", "393939", "FFC6FF", "393939", "transp"], ["transp", "transp", "393939", "transp", "transp", "393939", "transp", "transp"], ["transp", "393939", "FFC6FF", "393939", "transp", "transp", "transp", "transp"], ["transp", "transp", "393939", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["DEKO_SPRITE12"] = { "name": "deco", "descriptiveName": "Deco 12", "type": "deco", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "0055AA", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "8EC6FF", "transp", "transp", "transp", "transp"], ["transp", "transp", "8EC6FF", "C6E3FF", "8EC6FF", "transp", "transp", "transp"], ["0055AA", "8EC6FF", "C6E3FF", "C6E3FF", "C6E3FF", "8EC6FF", "0055AA", "transp"], ["transp", "transp", "8EC6FF", "C6E3FF", "8EC6FF", "transp", "transp", "transp"], ["transp", "transp", "transp", "8EC6FF", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "0055AA", "transp", "transp", "transp", "transp"]] }, { "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "003971", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "0055AA", "transp", "transp", "transp", "transp"], ["transp", "transp", "0055AA", "C6E3FF", "0055AA", "transp", "transp", "transp"], ["003971", "0055AA", "C6E3FF", "C6E3FF", "C6E3FF", "0055AA", "003971", "transp"], ["transp", "transp", "0055AA", "C6E3FF", "0055AA", "transp", "transp", "transp"], ["transp", "transp", "transp", "0055AA", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "003971", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["DEKO_SPRITE13"] = { "name": "deco", "descriptiveName": "Deco 13", "type": "deco", "animation": [{ "sprite": [["transp", "transp", "transp", "55AA00", "397100", "transp", "transp", "transp"], ["transp", "55AA00", "transp", "55AA00", "397100", "transp", "transp", "transp"], ["transp", "55AA00", "transp", "55AA00", "397100", "transp", "transp", "transp"], ["transp", "55AA00", "55AA00", "55AA00", "397100", "transp", "55AA00", "transp"], ["transp", "transp", "transp", "55AA00", "397100", "transp", "55AA00", "transp"], ["transp", "transp", "transp", "55AA00", "55AA00", "55AA00", "55AA00", "transp"], ["transp", "transp", "transp", "55AA00", "397100", "transp", "transp", "transp"], ["transp", "transp", "transp", "55AA00", "397100", "transp", "transp", "transp"]] }] };
SpritePixelArrays["DEKO_SPRITE14"] = { "name": "deco", "descriptiveName": "Deco 14", "type": "deco", "animation": [{ "sprite": [["transp", "transp", "2B8055", "2B8055", "2B8055", "2B8055", "transp", "transp"], ["transp", "2B8055", "2B8055", "15402A", "2B8055", "15402A", "2B8055", "transp"], ["transp", "2B8055", "15402A", "2B8055", "15402A", "15402A", "2B8055", "transp"], ["transp", "2B8055", "2B8055", "15402A", "15402A", "2B8055", "2B8055", "transp"], ["transp", "2B8055", "15402A", "15402A", "391C00", "15402A", "2B8055", "transp"], ["transp", "transp", "2B8055", "391C00", "713900", "2B8055", "transp", "transp"], ["transp", "transp", "transp", "391C00", "713900", "transp", "transp", "transp"], ["transp", "transp", "transp", "391C00", "713900", "transp", "transp", "transp"]] }] };
SpritePixelArrays["DEKO_SPRITE15"] = { "name": "deco", "descriptiveName": "Deco 15", "type": "deco", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "393939", "transp", "transp"], ["transp", "393939", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "713900", "transp", "transp", "transp"], ["transp", "transp", "713900", "713900", "713900", "713900", "transp", "transp"], ["transp", "713900", "713900", "713900", "713900", "713900", "713900", "transp"]] }, { "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "393939", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "393939", "transp"], ["transp", "transp", "transp", "transp", "713900", "transp", "transp", "transp"], ["transp", "transp", "713900", "713900", "713900", "713900", "transp", "transp"], ["transp", "713900", "713900", "713900", "713900", "713900", "713900", "transp"]] }] };
SpritePixelArrays["DEKO_SPRITE16"] = { "name": "deco", "descriptiveName": "Deco 16", "type": "deco", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "transp", "transp", "transp"], ["transp", "55AAFF", "55AAFF", "transp", "55AAFF", "transp", "transp", "transp"], ["FFFF8E", "FFFF8E", "55AAFF", "55AAFF", "55AAFF", "transp", "transp", "transp"], ["transp", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "55AAFF"], ["transp", "transp", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "transp"], ["transp", "transp", "transp", "FFFF8E", "FFFF8E", "transp", "transp", "transp"]] }, { "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "transp", "transp", "transp"], ["FFFF8E", "55AAFF", "55AAFF", "transp", "55AAFF", "transp", "transp", "transp"], ["transp", "FFFF8E", "55AAFF", "55AAFF", "55AAFF", "transp", "transp", "transp"], ["FFFF8E", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "55AAFF"], ["transp", "transp", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "55AAFF", "transp"], ["transp", "transp", "transp", "transp", "FFFF8E", "transp", "transp", "transp"], ["transp", "transp", "transp", "FFFF8E", "FFFF8E", "transp", "transp", "transp"]] }] };
SpritePixelArrays["DEKO_SPRITE17"] = { "name": "deco", "descriptiveName": "Deco 17", "type": "deco", "animation": [{ "sprite": [["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"], ["transp", "transp", "FFFFFF", "000000", "717171", "FFFFFF", "transp", "transp"], ["transp", "transp", "FFFFFF", "FFFFFF", "FF8E1C", "FF8E1C", "transp", "transp"], ["AA5500", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "AA5500"], ["transp", "AA5500", "FFFFFF", "FFFFFF", "000000", "FFFFFF", "AA5500", "transp"], ["transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp"], ["transp", "FFFFFF", "FFFFFF", "FFFFFF", "000000", "FFFFFF", "FFFFFF", "transp"], ["transp", "transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp", "transp"]] }] };
SpritePixelArrays["DEKO_SPRITE18"] = { "name": "deco", "descriptiveName": "Deco 18", "type": "deco", "animation": [{ "sprite": [["E30000", "FF1C1C", "transp", "transp", "transp", "transp", "FF1C1C", "E30000"], ["AA0000", "transp", "1C1CFF", "FFFFFF", "1C1CFF", "FFFFFF", "transp", "E30000"], ["transp", "AA0000", "0000E3", "1C1CFF", "0000E3", "1C1CFF", "AA0000", "transp"], ["transp", "transp", "AA0000", "E30000", "E30000", "E30000", "transp", "transp"], ["transp", "transp", "transp", "AA0000", "E30000", "transp", "transp", "transp"], ["transp", "transp", "E30000", "AA0000", "E30000", "E30000", "transp", "transp"], ["transp", "transp", "transp", "AA0000", "E30000", "transp", "transp", "transp"], ["transp", "transp", "E30000", "transp", "transp", "E30000", "transp", "transp"]] }, { "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["E30000", "FF1C1C", "transp", "transp", "transp", "transp", "FF1C1C", "E30000"], ["AA0000", "transp", "AA0000", "FF1C1C", "AA0000", "FF1C1C", "transp", "E30000"], ["transp", "AA0000", "AA0000", "AA0000", "AA0000", "AA0000", "AA0000", "transp"], ["transp", "transp", "AA0000", "E30000", "E30000", "E30000", "transp", "transp"], ["transp", "transp", "transp", "AA0000", "E30000", "transp", "transp", "transp"], ["transp", "transp", "E30000", "AA0000", "E30000", "E30000", "transp", "transp"], ["transp", "transp", "E30000", "transp", "transp", "E30000", "transp", "transp"]] }] };
SpritePixelArrays["SFX1"] = { "name": "sfx", "directions": ["bottom", "left", "top", "right"], "descriptiveName": "SFX 1", "description": "SFX that shows when the <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Player jump'} }, true)\">player jumps</span>.", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"], ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"]] }, { "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"], ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"]] }] };
SpritePixelArrays["SFX2"] = { "name": "sfx", "descriptiveName": "SFX 2", "description": "SFX when <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Cannon ball'} }, true)\">cannon ball</span> or <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Rocket'} }, true)\">rocket</span> hit a wall.", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"], ["transp", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "transp"], ["transp", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "transp"], ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }, { "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "transp"], ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"], ["transp", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["SFX3"] = { "name": "sfx", "descriptiveName": "SFX 3", "description": "SFX when player dashes", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "393939", "393939", "transp", "transp", "transp"], ["transp", "transp", "transp", "393939", "393939", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }, { "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "393939", "transp", "transp", "393939", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "393939", "transp", "transp", "393939", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["SFX4"] = { "name": "sfx", "descriptiveName": "Build SFX", "hiddenEverywhere": true, "description": "SFX when an object is placed in build mode", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp"], ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"], ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"], ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"], ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"], ["transp", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["SFX5"] = { "name": "sfx", "descriptiveName": "SFX 4", "description": "Plays when the player touches a <span class='textAsLink' onclick=\"DrawSectionHandler.changeSelectedSprite({ target: { value:  'Collectible'} }, true)\">collectible</span>.", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"], ["transp", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "transp"], ["transp", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "transp"], ["transp", "transp", "transp", "FFFFFF", "FFFFFF", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }, { "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "transp"], ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "FFFFFF", "transp", "transp", "transp", "transp", "FFFFFF", "transp"], ["transp", "transp", "FFFFFF", "transp", "transp", "FFFFFF", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["SFX6"] = { "name": "sfx", "descriptiveName": "SFX 5", "description": "Used for shaders", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "8EC6FF", "transp", "transp", "transp", "transp"], ["transp", "transp", "8EC6FF", "transp", "8EC6FF", "transp", "transp", "transp"], ["transp", "transp", "transp", "8EC6FF", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["SFX7"] = { "name": "sfx", "descriptiveName": "SFX 6", "description": "Used for shaders", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "FF8EFF", "FF8EFF", "FF8EFF", "FF8EFF", "transp", "transp"], ["transp", "transp", "FF8EFF", "transp", "transp", "FF8EFF", "transp", "transp"], ["transp", "transp", "FF8EFF", "transp", "transp", "FF8EFF", "transp", "transp"], ["transp", "transp", "FF8EFF", "FF8EFF", "FF8EFF", "FF8EFF", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["SFX8"] = { "name": "sfx", "descriptiveName": "SFX 7", "description": "Used for shaders", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "FFAA55", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }, { "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "FFFF55", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays["SFX9"] = { "name": "sfx", "descriptiveName": "SFX 8", "description": "Will be displayed behind the player, if the player is in auto-run mode.", "animation": [{ "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "FFAA55", "FFAA55", "transp", "transp", "transp"], ["transp", "transp", "FFAA55", "transp", "transp", "FFAA55", "transp", "transp"], ["transp", "transp", "FFAA55", "transp", "transp", "FFAA55", "transp", "transp"], ["transp", "transp", "transp", "FFAA55", "FFAA55", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }, { "sprite": [["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "FFAA55", "transp", "transp", "FFAA55", "transp", "transp"], ["transp", "FFAA55", "transp", "transp", "transp", "transp", "FFAA55", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"], ["transp", "FFAA55", "transp", "transp", "transp", "transp", "FFAA55", "transp"], ["transp", "transp", "FFAA55", "transp", "transp", "FFAA55", "transp", "transp"], ["transp", "transp", "transp", "transp", "transp", "transp", "transp", "transp"]] }] };
SpritePixelArrays.this_array["Customtile1"] = { "name": 18, "descriptiveName": "Custom tile 1", "description": "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.", "type": "tiles", "animation": [{ "sprite": [["AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00"], ["00AA00", "005500", "005500", "005500", "005500", "005500", "005500", "AAFF55"], ["AAFF55", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "00AA00"], ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "005500", "AAFF55"], ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "00AA00"], ["00AA00", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "AAFF55"], ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "005500", "00AA00"], ["00AA00", "005500", "c26241", "c26241", "e1a45b", "e1a45b", "005500", "AAFF55"]] }], "custom": true };
SpritePixelArrays.this_array["Customtile2"] = { "name": 19, "descriptiveName": "Custom tile 2", "description": "Just a solid block. <br/><br/> Hold CTRL in game screen to draw bigger areas.", "type": "tiles", "animation": [{ "sprite": [["AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00"], ["00AA00", "005500", "005500", "005500", "005500", "005500", "005500", "005500"], ["AAFF55", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["00AA00", "005500", "f6c992", "f6c992", "ee8764", "ee8764", "ee8764", "c26241"], ["AAFF55", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["00AA00", "005500", "ee8764", "ee8764", "f6c992", "f6c992", "f6c992", "e1a45b"], ["00AA00", "005500", "005500", "005500", "005500", "005500", "005500", "005500"], ["AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00", "AAFF55", "00AA00"]] }], "custom": true };
player.setAnimationProperties();
SpritePixelArrays.fillAllSprites();
//changedSpritesEnd
//changedPlayerAttributesStart
player["groundAcceleration"] = 0.8;
player["air_acceleration"] = 0.8;
player["maxSpeed"] = 3.2;
player["groundFriction"] = 0.65;
player["air_friction"] = 0.75;
player["jumpSpeed"] = 0.44;
player["maxFallSpeed"] = 16;
player["maxJumpFrames"] = 18;
player["maxJumpFrames"] = 18;
player["jumpChecked"] = true;
player["wallJumpChecked"] = true;
player["doubleJumpChecked"] = true;
player["dashChecked"] = true;
player["runChecked"] = false;
//changedPlayerAttributesEnd
//putMainSongHere
let startLevel = 0;
const canvasSize = WorldDataHandler.calucalteCanvasSize();
if (canvas)
    canvas.width = canvasSize.width;
if (canvas)
    canvas.height = canvasSize.height;
const canvasWidth = canvasSize.width;
const canvasHeight = canvasSize.height;
if (canvas)
    canvas.style.backgroundColor = WorldDataHandler.backgroundColor;
var canvasOffsetLeft = canvas.offsetLeft;
var canvasOffsetTop = canvas.offsetTop;
const ctx = canvas.getContext("2d");
Camera.staticConstructor(ctx, canvasSize.width, canvasHeight, WorldDataHandler.levels[startLevel].tileData[0].length * WorldDataHandler.tileSize, WorldDataHandler.levels[startLevel].tileData.length * WorldDataHandler.tileSize);
EffectsHandler.staticConstructor();
let tileMapHandler = new TileMapHandler(WorldDataHandler.tileSize, startLevel, spriteCanvas, player);
//DialogueHandler.staticConstructor(tileMapHandler);
DialogueHandler.staticConstructor();
if (ctx)
    Display.staticConstructor(ctx, canvasWidth, canvasHeight);
Controller.staticConstructor();
Collision.staticConstructor(tileMapHandler);
const spriteSheetCreator = spriteCanvas ? new SpriteSheetCreator(tileMapHandler, spriteCanvas) : 0;
CharacterCollision.staticConstructor(tileMapHandler);
PlayMode._staticConstructor(player, tileMapHandler);
SFXHandler.staticConstructor(tileMapHandler.tileSize, spriteCanvas);
GameStatistics.staticConstructor();
PauseHandler.staticConstructor();
EffectsRenderer.staticConstructor(tileMapHandler);
function play(timestamp) {
    Game.updateFPSInterval(timestamp);
    // if enough time has elapsed, draw the next frame
    if (!Game.refreshRateHigher60 || Game.elapsed > Game.fpsInterval) {
        ctx?.clearRect(0, 0, canvasWidth, canvasHeight);
        Camera.begin();
        tileMapHandler.displayLevel();
        if (tileMapHandler.currentLevel === 0) {
            Controller.handleGamepadInput();
            PlayMode.runStartScreenLogic();
            Display.displayStartScreen(tileMapHandler.currentGeneralFrameCounter, tileMapHandler.generalFrameCounterMax);
            EffectsRenderer.displayEffects(1);
        }
        else if (tileMapHandler.currentLevel === WorldDataHandler.levels.length - 1) {
            Display.displayEndingScreen(spriteCanvas, tileMapHandler.currentGeneralFrameCounter, tileMapHandler.generalFrameCounterMax);
        }
        else {
            Controller.handleGamepadInput();
            PlayMode.runPlayLogic();
            SFXHandler.updateSfxAnimations();
            player.draw();
            EffectsRenderer.displayEffects(1);
            DialogueHandler.handleDialogue();
            PlayMode.pauseFramesHandler();
            EffectsRenderer.displayEffects(2);
            Camera.followObject(player.x, player.y);
        }
        Camera.end();
        Game.resetFpsInterval();
    }
    if (Game.playMode === Game.PLAY_MODE) {
        window.requestAnimationFrame(play);
    }
}
function loading() {
    let loadedAssets = 0;
    SoundHandler.sounds.forEach(soundRawData => {
        const sound = SoundHandler.this_array[soundRawData.key];
        if (sound.loaded || sound.errorWhileLoading) {
            loadedAssets++;
        }
    });
    if (loadedAssets === SoundHandler.sounds.length) {
        Game.startAnimating(60);
        //undefined ? Game.changeGameMode(true) : Game.executeGameMode();
        Game.executeGameMode();
    }
    else {
        ctx?.clearRect(0, 0, canvasWidth, canvasHeight);
        Display.displayLoadingScreen(loadedAssets, SoundHandler.sounds.length);
        window.requestAnimationFrame(loading);
    }
}
window.requestAnimationFrame(loading);
