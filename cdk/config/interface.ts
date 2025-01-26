export interface IEnv {
  envName: string;
  account?: string;
  region?: string;
}

export interface IVpcConfig {
  maxAzs: number;
  natGateways: number;
}

export interface IConfig {
  Env: IEnv;
  Vpc: IVpcConfig;
}
