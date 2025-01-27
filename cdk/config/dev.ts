import * as inf from './interface';

export const Env: inf.IEnv = {
  envName: 'dev',
  serviceName: 'webapp',
};

export const VpcConfig: inf.IVpcConfig = {
  maxAzs: 2,
  natGateways: 2,
};

export const config: inf.IConfig = {
  Env: Env,
  Vpc: VpcConfig,
};
