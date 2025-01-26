export interface IVpcConfig {
  maxAzs: number;
  natGateways: number;
}

export interface IConfig {
  Vpc: IVpcConfig;
}
