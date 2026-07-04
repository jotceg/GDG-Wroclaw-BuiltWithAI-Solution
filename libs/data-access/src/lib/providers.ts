import {
  EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import { PIPELINE_GATEWAY } from './gateway/pipeline-gateway';
import { MockPipelineGateway } from './gateway/mock-pipeline.gateway';
import { HttpPipelineGateway } from './gateway/http-pipeline.gateway';

export interface PipelineConfig {
  /** Defaults to true — the backend REST endpoints are not live yet. */
  useMock?: boolean;
}

/**
 * Wires the pipeline gateway. Flip `useMock: false` (one line in app.config)
 * to switch every screen from the mock to the real backend — no other change.
 */
export function providePipeline(config: PipelineConfig = {}): EnvironmentProviders {
  const useHttp = config.useMock === false;
  return makeEnvironmentProviders([
    {
      provide: PIPELINE_GATEWAY,
      useClass: useHttp ? HttpPipelineGateway : MockPipelineGateway,
    },
  ]);
}
