import { Usage } from './usage';

export interface AppVersionUsage extends Usage {
  readonly crashFreeRate: number | null;
}

export interface CountryUsage extends Usage {
  readonly code: string;
}

export interface Reach {
  readonly platforms: readonly Usage[];
  readonly versions: readonly AppVersionUsage[];
  readonly operatingSystems: readonly Usage[];
  readonly devices: readonly Usage[];
  readonly countries: readonly CountryUsage[];
}
