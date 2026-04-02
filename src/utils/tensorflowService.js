/**
 * TensorFlow.js服务模块
 * 提供机器学习算法的底层支持
 */

export class TensorFlowService {
  constructor() {
    this.isTFLoaded = false;
    this.tf = null;
    this.availableModels = {
      'mobilenet_v2': {
        inputSize: [224, 224]
      },
      'resnet50': {
        inputSize: [224, 224]
      }
    };
  }

  /**
   * 异步加载TensorFlow.js
   */
  async loadTensorFlow() {
    if (this.isTFLoaded) return this.tf;
    
    try {
      // 动态加载TensorFlow.js
      const tfModule = await import('@tensorflow/tfjs');
      this.tf = tfModule;
      this.isTFLoaded = true;
      
      console.log('TensorFlow.js加载成功');
      return this.tf;
    } catch (error) {
      console.error('加载TensorFlow.js失败:', error);
      throw error;
    }
  }

  /**
   * 加载预训练模型
   */
  async loadPretrainedModel(modelName) {
    const tf = await this.loadTensorFlow();
    
    if (!this.availableModels[modelName]) {
      throw new Error(`不支持的模型: ${modelName}`);
    }

    try {
      let model;
      
      switch (modelName) {
        case 'mobilenet_v2':
          // 加载MobileNetV2模型
          const mobilenet = await import('@tensorflow-models/mobilenet');
          model = await mobilenet.load();
          break;
        case 'resnet50':
          // 加载ResNet50模型（简化版）
          model = await this.loadCustomResNet();
          break;
        default:
          throw new Error(`未知模型: ${modelName}`);
      }
      
      return model;
    } catch (error) {
      console.error(`加载模型 ${modelName} 失败:`, error);
      throw error;
    }
  }

  /**
   * 加载自定义的简化ResNet模型
   */
  async loadCustomResNet() {
    const tf = await this.loadTensorFlow();
    
    // 创建简化的ResNet模型用于特征提取
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: [224, 224, 3],
          filters: 32,
          kernelSize: 7,
          strides: 2,
          activation: 'relu'
        }),
        tf.layers.maxPooling2d({ poolSize: 3, strides: 2 }),
        
        // 简化残差块
        this.createResidualBlock(32),
        this.createResidualBlock(64),
        
        tf.layers.globalAveragePooling2d(),
        tf.layers.dense({ units: 512, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 })
      ]
    });
    
    return model;
  }

  /**
   * 创建残差块
   */
  createResidualBlock(filters) {
    const tf = this.tf;
    
    return tf.sequential({
      layers: [
        tf.layers.conv2d({ filters, kernelSize: 3, padding: 'same', activation: 'relu' }),
        tf.layers.conv2d({ filters, kernelSize: 3, padding: 'same' }),
        tf.layers.add() // 残差连接
      ]
    });
  }

  /**
   * 移除模型的分类层，保留特征提取器
   */
  removeClassificationLayers(model) {
    // 获取除最后几层外的所有层（移除分类层）
    const layers = model.layers.slice(0, -2); // 移除最后的全连接层和softmax
    
    const featureExtractor = this.tf.sequential();
    layers.forEach(layer => {
      featureExtractor.add(layer);
    });
    
    return featureExtractor;
  }

  /**
   * 图像预处理
   */
  preprocessImage(image, targetSize = [224, 224]) {
    const tf = this.tf;
    
    // 将图像转换为tensor
    let tensor;
    if (image instanceof HTMLCanvasElement || image instanceof HTMLImageElement) {
      tensor = tf.browser.fromPixels(image);
    } else if (image instanceof ImageData) {
      tensor = tf.browser.fromPixels(image);
    } else {
      throw new Error('不支持的图像格式');
    }
    
    // 调整尺寸
    const resized = tf.image.resizeBilinear(tensor, targetSize);
    
    // 归一化到[-1, 1]
    const normalized = tf.div(resized, 127.5).sub(1.0);
    
    // 添加batch维度
    const batched = normalized.expandDims(0);
    
    // 清理临时tensor
    tensor.dispose();
    resized.dispose();
    normalized.dispose();
    
    return batched;
  }

  /**
   * 训练SVM分类器
   */
  async trainSVM(features, labels, config = {}) {
    const tf = await this.loadTensorFlow();
    
    // 简化版的SVM实现（使用逻辑回归近似）
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [features[0].length],
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: this.getNumUniqueLabels(labels),
          activation: 'softmax'
        })
      ]
    });
    
    // 编译模型
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'sparseCategoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    // 准备训练数据
    const featureTensor = tf.tensor2d(features);
    const labelTensor = tf.tensor1d(this.encodeLabels(labels));
    
    // 训练模型
    const history = await model.fit(featureTensor, labelTensor, {
      epochs: 100,
      batchSize: 16,
      validationSplit: 0.2,
      verbose: 0
    });
    
    // 清理临时tensor
    featureTensor.dispose();
    labelTensor.dispose();
    
    return {
      model,
      trainingHistory: history,
      config
    };
  }

  /**
   * 使用SVM进行预测
   */
  async predictSVM(modelConfig, features) {
    const featureTensor = this.tf.tensor2d(features);
    const predictions = modelConfig.model.predict(featureTensor);
    const predictedIndices = predictions.argMax(-1).dataSync();
    
    featureTensor.dispose();
    predictions.dispose();
    
    return Array.from(predictedIndices).map(idx => 
      this.decodeLabel(idx, Object.keys(modelConfig.config.labelMapping || {}))
    );
  }

  /**
   * SVM的增量更新
   */
  async incrementalSVMUpdate(existingModel, newSamples, newLabels) {
    const tf = await this.loadTensorFlow();
    
    // 获取现有模型的配置
    const model = existingModel.model;
    const features = await this.extractFeatures(newSamples, model);
    
    // 增量训练
    const featureTensor = tf.tensor2d(features);
    const labelTensor = tf.tensor1d(this.encodeLabels(newLabels));
    
    await model.fit(featureTensor, labelTensor, {
      epochs: 20,
      batchSize: 8,
      verbose: 0
    });
    
    featureTensor.dispose();
    labelTensor.dispose();
    
    return {
      ...existingModel,
      model
    };
  }

  /**
   * 从图像中提取特征
   */
  async extractFeatures(images, featureExtractor) {
    const features = [];
    
    for (const image of images) {
      const tensor = this.preprocessImage(image);
      const feature = featureExtractor.predict(tensor);
      features.push(feature.dataSync());
      tensor.dispose();
    }
    
    return features;
  }

  /**
   * 导出SVM权重
   */
  async exportSVMWeights(modelConfig) {
    const weights = await modelConfig.model.getWeights();
    return weights.map(weight => weight.dataSync());
  }

  /**
   * 获取唯一标签数量
   */
  getNumUniqueLabels(labels) {
    return new Set(labels).size;
  }

  /**
   * 标签编码
   */
  encodeLabels(labels) {
    const uniqueLabels = [...new Set(labels)];
    const labelMap = {};
    uniqueLabels.forEach((label, index) => {
      labelMap[label] = index;
    });
    
    return labels.map(label => labelMap[label]);
  }

  /**
   * 标签解码
   */
  decodeLabel(index, uniqueLabels) {
    return uniqueLabels[index] || 'unknown';
  }

  /**
   * 验证TensorFlow.js是否可用
   */
  async validateEnvironment() {
    const tf = await this.loadTensorFlow();
    
    try {
      // 创建简单的张量运算测试
      const a = tf.tensor1d([1, 2, 3]);
      const b = tf.tensor1d([4, 5, 6]);
      const result = a.add(b);
      
      const isValid = Array.from(result.dataSync()).every(val => !isNaN(val));
      
      a.dispose();
      b.dispose();
      result.dispose();
      
      return isValid;
    } catch (error) {
      console.error('TensorFlow.js环境验证失败:', error);
      return false;
    }
  }

  /**
   * 性能监控
   */
  monitorPerformance() {
    const tf = this.tf;
    
    // 启用内存监控
    tf.engine().startScope();
    
    return {
      memoryInfo: tf.memory(),
      backend: tf.getBackend(),
      version: tf.version.tfjs
    };
  }

  /**
   * 清理内存
   */
  cleanup() {
    if (this.tf) {
      this.tf.disposeVariables();
    }
  }
}