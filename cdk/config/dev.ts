import * as inf from './interface';

export const VpcConfig: inf.IVpcConfig = {
  maxAzs: 2,
  natGateways: 2,
};

export const config: inf.IConfig = {
  Vpc: VpcConfig,
};
