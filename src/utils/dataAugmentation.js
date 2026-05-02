/**
 * 数据增强工具类
 * 用于小样本学习场景下的数据扩充
 */
export class DataAugmentation {
  constructor() {
    this.augmentationMethods = {
      rotation: this.rotateImage,
      flip: this.flipImage,
      brightness: this.adjustBrightness,
      crop: this.randomCrop,
      noise: this.addNoise,
      blur: this.applyBlur
    };
  }

  /**
   * 增强样本数据
   * @param {Array} samples - 原始样本
   * @param {Array} labels - 对应标签
   * @param {Object} options - 增强选项
   */
  augmentSamples(samples, labels, options = {}) {
    const config = {
      targetPerClass: 20, // 每类目标样本数
      augmentations: ['rotation', 'flip', 'brightness'],
      ...options
    };

    const augmentedSamples = [...samples];
    const augmentedLabels = [...labels];
    
    const labelCounts = this.countLabels(labels);
    
    // 对每个类别进行数据增强
    Object.keys(labelCounts).forEach(label => {
      const currentCount = labelCounts[label];
      const neededSamples = config.targetPerClass - currentCount;
      
      if (neededSamples > 0) {
        const classSamples = samples.filter((_, index) => labels[index] === label);
        const newSamples = this.generateAugmentedSamples(classSamples, neededSamples, config.augmentations);
        
        augmentedSamples.push(...newSamples);
        augmentedLabels.push(...Array(newSamples.length).fill(label));
      }
    });

    return {
      samples: augmentedSamples,
      labels: augmentedLabels
    };
  }

  /**
   * 统计每个标签的样本数量
   */
  countLabels(labels) {
    const counts = {};
    labels.forEach(label => {
      counts[label] = (counts[label] || 0) + 1;
    });
    return counts;
  }

  /**
   * 生成增强样本
   */
  generateAugmentedSamples(samples, count, augmentations) {
    const augmented = [];
    
    while (augmented.length < count) {
      const sample = samples[Math.floor(Math.random() * samples.length)];
      const augmentedSample = this.applyRandomAugmentation(sample, augmentations);
      augmented.push(augmentedSample);
    }
    
    return augmented;
  }

  /**
   * 应用随机增强方法
   */
  applyRandomAugmentation(sample, augmentations) {
    const method = augmentations[Math.floor(Math.random() * augmentations.length)];
    
    if (this.augmentationMethods[method]) {
      return this.augmentationMethods[method](sample);
    }
    
    return sample; // 默认返回原样本
  }

  /**
   * 图像旋转
   */
  rotateImage(image, angle = null) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const rotationAngle = angle !== null ? angle : Math.random() * 60 - 30; // -30到30度随机旋转
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotationAngle * Math.PI / 180);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    
    return canvas;
  }

  /**
   * 图像翻转
   */
  flipImage(image, direction = null) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    const flipType = direction || (Math.random() > 0.5 ? 'horizontal' : 'vertical');
    
    if (flipType === 'horizontal') {
      ctx.translate(image.width, 0);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(0, image.height);
      ctx.scale(1, -1);
    }
    
    ctx.drawImage(image, 0, 0);
    
    return canvas;
  }

  /**
   * 调整亮度
   */
  adjustBrightness(image, factor = null) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    const brightnessFactor = factor !== null ? factor : 0.7 + Math.random() * 0.6; // 0.7到1.3倍亮度
    
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * brightnessFactor);     // Red
      data[i + 1] = Math.min(255, data[i + 1] * brightnessFactor); // Green
      data[i + 2] = Math.min(255, data[i + 2] * brightnessFactor); // Blue
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    return canvas;
  }

  /**
   * 随机裁剪
   */
  randomCrop(image, cropRatio = null) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const ratio = cropRatio !== null ? cropRatio : 0.7 + Math.random() * 0.2; // 70%到90%裁剪
    const cropWidth = Math.floor(image.width * ratio);
    const cropHeight = Math.floor(image.height * ratio);
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    const x = Math.floor(Math.random() * (image.width - cropWidth));
    const y = Math.floor(Math.random() * (image.height - cropHeight));
    
    ctx.drawImage(image, x, y, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    
    return canvas;
  }

  /**
   * 添加噪声
   */
  addNoise(image, noiseLevel = null) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    const level = noiseLevel !== null ? noiseLevel : Math.random() * 20; // 0到20的噪声强度
    
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * level * 2;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));     // Red
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // Green
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // Blue
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    return canvas;
  }

  /**
   * 应用模糊
   */
  applyBlur(image, radius = null) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    const blurRadius = radius !== null ? radius : Math.random() * 2; // 0到2像素模糊
    
    ctx.filter = `blur(${blurRadius}px)`;
    ctx.drawImage(image, 0, 0);
    ctx.filter = 'none';
    
    return canvas;
  }
}