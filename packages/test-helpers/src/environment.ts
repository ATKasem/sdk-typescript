import type { LocalTestWorkflowEnvironmentOptions } from '@temporalio/testing';
import { workflowInterceptorModules as defaultWorkflowInterceptorModules } from '@temporalio/testing';
import { loadClientConnectConfig } from '@temporalio/envconfig';
import type {
  BundlerPlugin,
  WorkflowBundleWithSourceMap,
  BundleOptions,
  NativeConnectionOptions,
} from '@temporalio/worker';
import { bundleWorkflowCode, DefaultLogger } from '@temporalio/worker';
import { defineSearchAttributeKey, SearchAttributeType } from '@temporalio/common/lib/search-attributes';
import { TestWorkflowEnvironment } from './wrappers';
import { baseBundlerIgnoreModules } from './bundler';
import { isSet } from './flags';

export const defaultDynamicConfigOptions = [
  'system.enableActivityEagerExecution=true',
  'history.enableRequestIdRefLinks=true',
  'frontend.activityAPIsEnabled=true',
  'activity.enableStandalone=true',
  'history.enableChasm=true',
  'history.enableTransitionHistory=true',
];

export const defaultSAKeys = {
  CustomIntField: defineSearchAttributeKey('CustomIntField', SearchAttributeType.INT),
  CustomBoolField: defineSearchAttributeKey('CustomBoolField', SearchAttributeType.BOOL),
  CustomKeywordField: defineSearchAttributeKey('CustomKeywordField', SearchAttributeType.KEYWORD),
  CustomTextField: defineSearchAttributeKey('CustomTextField', SearchAttributeType.TEXT),
  CustomDatetimeField: defineSearchAttributeKey('CustomDatetimeField', SearchAttributeType.DATETIME),
  CustomDoubleField: defineSearchAttributeKey('CustomDoubleField', SearchAttributeType.DOUBLE),
};

/**
 * Options for creating test workflow bundles.
 */
export interface TestWorkflowBundleOptions {
  workflowsPath: string;
  workflowInterceptorModules?: string[];
  additionalIgnoreModules?: string[];
  plugins?: BundlerPlugin[];
}

/**
 * Create a test workflow bundle with standard configuration.
 */
export async function createTestWorkflowBundle({
  workflowsPath,
  workflowInterceptorModules,
  additionalIgnoreModules = [],
  plugins,
}: TestWorkflowBundleOptions): Promise<WorkflowBundleWithSourceMap> {
  const bundlerOptions: Partial<BundleOptions> = {
    ignoreModules: [...baseBundlerIgnoreModules, ...additionalIgnoreModules],
  };

  return await bundleWorkflowCode({
    ...bundlerOptions,
    workflowInterceptorModules: [...defaultWorkflowInterceptorModules, ...(workflowInterceptorModules ?? [])],
    workflowsPath,
    logger: new DefaultLogger('WARN'),
    plugins: plugins ?? [],
  });
}

/**
 * Create a local test environment with default search attributes and dynamic config.
 */
export async function createLocalTestEnvironment(
  opts?: LocalTestWorkflowEnvironmentOptions
): Promise<TestWorkflowEnvironment> {
  return await TestWorkflowEnvironment.createLocal({
    ...(opts || {}),
    server: {
      searchAttributes: Object.values(defaultSAKeys),
      ...(opts?.server || {}),
      extraArgs: [
        ...defaultDynamicConfigOptions.flatMap((opt) => ['--dynamic-config-value', opt]),
        ...(opts?.server?.extraArgs ?? []),
      ],
    },
  });
}

export function isExternalTestServerConfigSet(): boolean {
  return isSet(process.env.TEMPORAL_TEST_EXTERNAL_SERVER, false);
}

function getExternalServerConfig(): {
  address: string;
  namespace: string;
  connectionOptions: Pick<NativeConnectionOptions, 'apiKey' | 'metadata' | 'tls'>;
} {
  const { connectionOptions, namespace } = loadClientConnectConfig();
  if (connectionOptions.address === undefined) {
    throw new TypeError('External test server mode requires TEMPORAL_TEST_EXTERNAL_SERVER=true and an envconfig address');
  }
  if (namespace === undefined) {
    throw new TypeError('External test server mode requires TEMPORAL_TEST_EXTERNAL_SERVER=true and an envconfig namespace');
  }
  const { address, apiKey, metadata, tls } = connectionOptions;
  return {
    address,
    namespace,
    connectionOptions: { apiKey, metadata, tls },
  };
}

/**
 * Create a test workflow environment, using an existing server if TEMPORAL_TEST_EXTERNAL_SERVER is truthy,
 * otherwise creating a local one.
 */
export async function createTestWorkflowEnvironment(
  opts?: LocalTestWorkflowEnvironmentOptions
): Promise<TestWorkflowEnvironment> {
  let env: TestWorkflowEnvironment;
  if (isExternalTestServerConfigSet()) {
    const { address, namespace, connectionOptions } = getExternalServerConfig();
    env = await TestWorkflowEnvironment.createFromExistingServer({
      address,
      namespace,
      connectionOptions,
      client: opts?.client,
      plugins: opts?.plugins,
    });
  } else {
    env = await createLocalTestEnvironment(opts);
  }
  return env;
}
