/**
 * 基于迁移学习的小样本识别算法
 * 专为普惠农业AI设计，支持少量样本训练个性化的疾病识别模型
 */

import { TensorFlowService } from './tensorflowService';
import { DataAugmentation } from './dataAugmentation';

export class FewShotLearning {
  constructor() {
    this.tfService = new TensorFlowService();
    this.dataAugmentor = new DataAugmentation();
    this.baseModel = null;
    this.customModels = new Map(); // 存储各养殖场的定制化模型
  }

  /**
   * 加载预训练的基础模型
   * 基于ImageNet预训练权重，适配畜禽相关特征
   */
  async loadBaseModel() {
    try {
      // 加载预训练的MobileNetV2作为特征提取器
      this.baseModel = await this.tfService.loadPretrainedModel('mobilenet_v2');
      
      // 移除最后的分类层，保留特征提取部分
      const featureExtractor = this.tfService.removeClassificationLayers(this.baseModel);
      
      console.log('基础特征提取器加载完成');
      return featureExtractor;
    } catch (error) {
      console.error('加载基础模型失败:', error);
      throw error;
    }
  }

  /**
   * 使用极少量样本训练自定义分类器
   * @param {Array} samples - 样本数据，每个类别1-5个样本
   * @param {Array} labels - 对应标签
   * @param {string} farmId - 养殖场ID，用于模型标识
   * @param {number} numShots - 每个类别的样本数量（默认3样本）
   */
  async trainWithFewSamples(samples, labels, farmId, numShots = 3) {
    if (!this.baseModel) {
      await this.loadBaseModel();
    }

    const uniqueLabels = [...new Set(labels)];
    console.log(`为 ${farmId} 训练模型，类别数: ${uniqueLabels.length}, 每类样本数: ${numShots}`);

    // 1. 数据增强 - 扩充样本数量
    const augmentedData = this.dataAugmentor.augmentSamples(samples, labels, {
      targetPerClass: 20, // 扩充到每类20个样本
      augmentations: ['rotation', 'flip', 'brightness', 'crop']
    });

    // 2. 提取特征向量
    const features = await this.extractFeatures(augmentedData.samples);
    
    // 3. 训练支持向量机(SVM)分类器
    const customModel = await this.trainSVMModel(features, augmentedData.labels);
    
    this.customModels.set(farmId, {
      classifier: customModel,
      featureExtractor: this.baseModel,
      trainingTime: new Date(),
      sampleCount: samples.length
    });

    return this.evaluateFewShotModel(customModel, features, augmentedData.labels);
  }

  /**
   * 从图像中提取特征向量
   */
  async extractFeatures(images) {
    const features = [];
    
    for (const image of images) {
      const tensor = this.tfService.preprocessImage(image);
      const feature = await this.baseModel.predict(tensor);
      features.push(feature.dataSync());
      tensor.dispose();
    }
    
    return features;
  }

  /**
   * 训练SVM分类器（小样本场景下效果较好）
   */
  async trainSVMModel(features, labels, options = {}) {
    const config = {
      kernel: 'rbf',
      C: 1.0,
      gamma: 'scale',
      ...options
    };

    // 使用TensorFlow.js实现简化的SVM训练
    return await this.tfService.trainSVM(features, labels, config);
  }

  /**
   * 评估小样本模型的性能
   */
  async evaluateFewShotModel(model, features, labels) {
    const predictions = await this.tfService.predictSVM(model, features);
    
    const accuracy = this.calculateAccuracy(predictions, labels);
    const confusionMatrix = this.calculateConfusionMatrix(predictions, labels);
    
    return {
      accuracy,
      confusionMatrix,
      precision: this.calculatePrecision(confusionMatrix),
      recall: this.calculateRecall(confusionMatrix),
      f1Score: this.calculateF1Score(confusionMatrix)
    };
  }

  /**
   * 使用训练好的模型进行预测
   */
  async predict(image, farmId) {
    if (!this.customModels.has(farmId)) {
      throw new Error(`未找到养殖场 ${farmId} 的训练模型`);
    }

    const farmModel = this.customModels.get(farmId);
    const feature = await this.extractFeatures([image]);
    const prediction = await this.tfService.predictSVM(farmModel.classifier, feature);
    
    return {
      predictedClass: prediction[0],
      confidence: this.calculateConfidence(prediction),
      modelVersion: farmModel.trainingTime.toISOString(),
      sampleCount: farmModel.sampleCount
    };
  }

  /**
   * 持续学习 - 增量更新模型
   */
  async incrementalLearning(newSamples, newLabels, farmId) {
    if (!this.customModels.has(farmId)) {
      return await this.trainWithFewSamples(newSamples, newLabels, farmId);
    }

    const farmModel = this.customModels.get(farmId);
    
    // 增量训练逻辑
    const updatedModel = await this.tfService.incrementalSVMUpdate(
      farmModel.classifier,
      newSamples,
      newLabels
    );

    farmModel.classifier = updatedModel;
    farmModel.trainingTime = new Date();
    farmModel.sampleCount += newSamples.length;

    return {
      success: true,
      updatedSampleCount: farmModel.sampleCount,
      updateTime: farmModel.trainingTime
    };
  }

  /**
   * 计算模型性能指标
   */
  calculateAccuracy(predictions, labels) {
    let correct = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i] === labels[i]) correct++;
    }
    return correct / predictions.length;
  }

  calculateConfusionMatrix(predictions, labels) {
    const uniqueLabels = [...new Set(labels)];
    const matrix = {};
    
    uniqueLabels.forEach(label => {
      matrix[label] = {};
      uniqueLabels.forEach(pred => {
        matrix[label][pred] = 0;
      });
    });

    for (let i = 0; i < predictions.length; i++) {
      matrix[labels[i]][predictions[i]]++;
    }

    return matrix;
  }

  calculatePrecision(matrix) {
    // 计算每个类别的精确率
    const precisions = {};
    Object.keys(matrix).forEach(actual => {
      const truePositives = matrix[actual][actual] || 0;
      const falsePositives = Object.keys(matrix)
        .filter(pred => pred !== actual)
        .reduce((sum, pred) => sum + (matrix[pred][actual] || 0), 0);
      
      precisions[actual] = truePositives / (truePositives + falsePositives) || 0;
    });
    return precisions;
  }

  calculateRecall(matrix) {
    // 计算每个类别的召回率
    const recalls = {};
    Object.keys(matrix).forEach(actual => {
      const truePositives = matrix[actual][actual] || 0;
      const falseNegatives = Object.keys(matrix[actual])
        .filter(pred => pred !== actual)
        .reduce((sum, pred) => sum + (matrix[actual][pred] || 0), 0);
      
      recalls[actual] = truePositives / (truePositives + falseNegatives) || 0;
    });
    return recalls;
  }

  calculateF1Score(matrix) {
    const precision = this.calculatePrecision(matrix);
    const recall = this.calculateRecall(matrix);
    const f1Scores = {};
    
    Object.keys(precision).forEach(label => {
      const p = precision[label];
      const r = recall[label];
      f1Scores[label] = (2 * p * r) / (p + r) || 0;
    });
    
    return f1Scores;
  }

  calculateConfidence(prediction) {
    // 计算预测置信度
    return Math.max(...prediction) / prediction.reduce((sum, val) => sum + val, 0);
  }

  /**
   * 获取模型统计信息
   */
  getModelInfo(farmId) {
    if (!this.customModels.has(farmId)) {
      return null;
    }

    const model = this.customModels.get(farmId);
    return {
      farmId,
      trainingTime: model.trainingTime,
      sampleCount: model.sampleCount,
      modelType: 'SVM_with_FeatureExtractor',
      performance: 'evaluation_pending'
    };
  }

  /**
   * 导出模型供离线使用
   */
  async exportModel(farmId) {
    if (!this.customModels.has(farmId)) {
      throw new Error(`未找到养殖场 ${farmId} 的训练模型`);
    }

    const model = this.customModels.get(farmId);
    return {
      featureExtractorConfig: this.baseModel.getConfig(),
      classifierWeights: await this.tfService.exportSVMWeights(model.classifier),
      metadata: {
        farmId,
        exportTime: new Date(),
        sampleCount: model.sampleCount
      }
    };
  }
}