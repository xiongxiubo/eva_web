export class Gazer {
  performancePresets: any;
  sensitivityPresets: any;
  config: any;
  constructor(videoElementId: any, options: any = {}) {
    //性能模式预设
    this.performancePresets = {
      low: {
        targetFps: 10,
        frameSkip: 3,
        pauseOnIdle: true,
        reducedCanvas: true,
        description: "Low CPU usage - Basic tracking",
      },
      medium: {
        targetFps: 15,
        frameSkip: 2,
        pauseOnIdle: true,
        reducedCanvas: false,
        description: "Balanced performance - Recommended",
      },
      high: {
        targetFps: 25,
        frameSkip: 1,
        pauseOnIdle: false,
        reducedCanvas: false,
        description: "High performance - Smooth tracking",
      },
    };
    //凝视灵敏度预设
    this.sensitivityPresets = {
      strict: {
        horizontalThreshold: 0.2,
        verticalThreshold: 0.1,
        gazeHistorySize: 3,
        description: "Strict detection - Requires precise gaze alignment",
      },
      medium: {
        horizontalThreshold: 0.3,
        verticalThreshold: 0.15,
        gazeHistorySize: 5,
        description: "Balanced sensitivity - Recommended for most users",
      },
      relaxed: {
        horizontalThreshold: 0.5,
        verticalThreshold: 0.25,
        gazeHistorySize: 7,
        description: "Relaxed detection - More forgiving gaze tracking",
      },
    };
    //默认配置
    this.config = {
      performanceMode: "medium",
      sensitivityMode: "medium",
    };
  }
}
