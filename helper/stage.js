const { Scenes } = require('telegraf');
const path = require('path');
const Logger = require("../utils/Logger.js");

class SceneLoader {
  constructor() {
    this.scenes = [];
  }
  
  load() {
    const logger = new Logger();
    const scenesDir = path.join(__dirname, '../Scenes');
    const files = require('fs').readdirSync(scenesDir);

    files.forEach(file => {
      const scene = require(path.join(scenesDir, file));
      this.scenes.push(scene);
    });

    const flatedScenes = this.scenes.flat()

    this.scenes.forEach((scene, index) => {
        logger.info(`${index + 1}. Сцена ${scene[index].id} успешно запущен`)
    });

    return new Scenes.Stage(flatedScenes);
  }
}

module.exports = SceneLoader;
