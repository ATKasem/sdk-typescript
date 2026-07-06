# `@temporalio/test`

## External Server Test Coverage

`pnpm run test:external` runs the subset of SDK integration tests that currently use the shared configurable test
harness and are expected to work against an existing Temporal server.

When `TEMPORAL_TEST_ENV_CONFIG_SERVER` is truthy (`1`, `t`, or `true`), the shared harness uses envconfig to
configure the test server connection. Envconfig resolves settings from environment variables, `TEMPORAL_CONFIG_FILE`,
`TEMPORAL_PROFILE`, and default TOML discovery.

- `TEMPORAL_TEST_ENV_CONFIG_SERVER`
- `TEMPORAL_ADDRESS`
- `TEMPORAL_NAMESPACE`
- `TEMPORAL_API_KEY`
- `TEMPORAL_CONFIG_FILE`
- `TEMPORAL_PROFILE`
- `TEMPORAL_TLS_CLIENT_CERT_PATH`
- `TEMPORAL_TLS_CLIENT_KEY_PATH`
- `TEMPORAL_TLS_CLIENT_CERT_DATA`
- `TEMPORAL_TLS_CLIENT_KEY_DATA`
- `TEMPORAL_TLS_SERVER_CA_CERT_PATH`
- `TEMPORAL_TLS_SERVER_CA_CERT_DATA`
- `TEMPORAL_TLS_SERVER_NAME`
- `TEMPORAL_GRPC_META_*`

`TEMPORAL_TEST_RUN_ID` can be set to suffix generated task queues for shared namespaces.

Example:

```sh
pnpm run build
TEMPORAL_TEST_ENV_CONFIG_SERVER=true \
TEMPORAL_ADDRESS=namespace.account.tmprl.cloud:7233 \
TEMPORAL_NAMESPACE=namespace.account \
TEMPORAL_API_KEY=... \
TEMPORAL_TEST_RUN_ID=release-2026-06-29 \
pnpm run test:external
```

TOML example:

```sh
pnpm run build
TEMPORAL_TEST_ENV_CONFIG_SERVER=true \
TEMPORAL_CONFIG_FILE=/path/to/temporal.toml \
TEMPORAL_TEST_RUN_ID=release-2026-06-29 \
pnpm run test:external
```

`workflowEnvironmentOpts.server.extraArgs` only apply when the harness starts a local server. In external mode, the
target server must already have equivalent dynamic config and feature flags enabled.

## Current External Runner

| Test file | Notes |
| --- | --- |
| `test-default-activity.ts` | Shared harness. |
| `test-integration-activities.ts` | Shared harness. |
| `test-integration-cancellation-scopes.ts` | Shared harness. |
| `test-integration-replay-and-flags.ts` | Shared harness; time-skipping-only block is local-only. |
| `test-integration-reserved-prefixes.ts` | Shared harness. |
| `test-integration-update.ts` | Shared harness; assumes external server long-poll behavior is compatible with the assertions. |
| `test-integration-update-interceptors.ts` | Shared harness. |
| `test-integration-workflows-with-recorded-logs.ts` | Shared harness. |
| `test-isolation.ts` | Shared harness. |
| `test-nexus-operation-timeouts.ts` | Requires Nexus endpoint creation/operator permission. |
| `test-nexus-signal-linking.ts` | Requires Nexus and CHASM signal backlink server support. |
| `test-nexus-standalone.ts` | Requires standalone Nexus operation server support. |
| `test-nexus-temporal-operation.ts` | Requires standalone Nexus operation and CHASM callback server support. |
| `test-random-stream-reset.ts` | Shared harness. |
| `test-worker-tuner.ts` | Shared harness. |
| `test-workflow-async-local-storage.ts` | Shared harness. |
| `test-workflow-cancellation.ts` | Shared harness. |
| `test-workflow-fail-on-errors-policy.ts` | Shared harness. |
| `test-workflow-nexus-cancellation.ts` | Requires Nexus endpoint creation/operator permission. |

## Follow-Up Coverage Inventory

| Test file | Status / notes |
| --- | --- |
| `test-async-completion.ts` | Uses default `Connection.connect()` in integration setup; needs shared harness connection. |
| `test-bundler.ts` | Uses default client/worker connection in integration block; needs shared harness connection. |
| `test-client-connection.ts` | Tests client behavior against local fake gRPC servers; not a cloud server test. |
| `test-client-errors.ts` | Direct `TestWorkflowEnvironment.createLocal()`. |
| `test-custom-payload-codec.ts` | Uses default client/worker connection in integration block. |
| `test-custom-payload-converter.ts` | Uses default client/worker connection in integration block. |
| `test-default-workflow.ts` | Direct `TestWorkflowEnvironment.createLocal()`. |
| `test-ephemeral-server.ts` | Intentionally tests local ephemeral/time-skipping servers. |
| `test-failure-converter.ts` | Direct `TestWorkflowEnvironment.createLocal()`. |
| `test-integration-split-one.ts` | Shared harness, but multi-codec environments share task queues; also has custom Search Attribute and hard-coded `default` namespace assertions. |
| `test-integration-split-two.ts` | Shared harness, but multi-codec environments share task queues and require custom Search Attributes. |
| `test-integration-split-three.ts` | Shared harness, but multi-codec environments share task queues; otherwise likely addable after validation. |
| `test-integration-workflow-info.ts` | Mostly shared harness; one test uses `createLocalTestEnvironment()` for custom Search Attribute setup. |
| `test-integration-workflow-start.ts` | Shared harness; has extra native worker connections and eager activity/start-delay behavior that need external validation. |
| `test-interceptors.ts` | Uses default client/worker connection in integration block. |
| `test-local-activities.ts` | Direct local environment setup; local activities do not require a local server but this file needs shared harness conversion. |
| `test-metrics-custom.ts` | Shared harness with local Prometheus scrape endpoint; likely addable after external validation. |
| `test-native-connection.ts` | Primarily local fake gRPC/default-connection behavior; not a cloud release test. |
| `test-native-connection-headers.ts` | Local fake gRPC server tests; not a cloud release test. |
| `test-nexus-codec-converter-errors.ts` | Shared harness; requires Nexus endpoint creation/operator permission and external validation. |
| `test-nexus-handler.ts` | Direct local environment with Nexus dynamic config; needs shared harness conversion or local-only classification. |
| `test-nexus-workflow-caller.ts` | Shared harness; has a hard-coded `default` namespace request and requires Nexus endpoint creation/operator permission. |
| `test-nyc-coverage.ts` | Uses default client/worker connection in integration block. |
| `test-patch-and-condition.ts` | Uses default client/worker connection in integration block. |
| `test-payload-converter.ts` | Uses default client/worker connection in integration block. |
| `test-plugins.ts` | Direct local environments and plugin-specific local connection assertions. |
| `test-runtime.ts` | Mixes shared harness and default native connections; runtime-focused tests need local-only review. |
| `test-runtime-otel.ts` | Direct local environment with local telemetry endpoint. |
| `test-runtime-prometheus.ts` | Direct local environment with local Prometheus endpoint. |
| `test-schedules.ts` | Uses default connection and operator Search Attribute registration; needs envconfig connection and pre-provisioned/managed Search Attributes. |
| `test-serialization-context.ts` | Shared harness but has hard-coded `workflow.default.*` expectations. |
| `test-serialization-context-codec.ts` | Shared harness but has hard-coded `workflow.default.*` and `activity.default.*` expectations. |
| `test-signal-query-patch.ts` | Direct `TestWorkflowEnvironment.createLocal()`. |
| `test-signals-are-always-delivered.ts` | Uses default client/worker connection in integration block. |
| `test-sinks.ts` | Uses default connection, operator Search Attribute registration, and hard-coded `default` namespace expectations. |
| `test-standalone-activities.ts` | Shared harness but has fixed task queue and local-only server dynamic config assumptions. |
| `test-temporal-cloud.ts` | Separate cloud smoke tests with bespoke cloud env vars; not part of envconfig external runner. |
| `test-testenvironment.ts` | Intentionally tests time-skipping test environment. |
| `test-typed-search-attributes.ts` | Uses local namespace/server Search Attribute setup through operator service. |
| `test-worker-connection-replacement.ts` | Intentionally creates a second local environment. |
| `test-worker-debug-mode.ts` | Uses default client/worker connection in integration block. |
| `test-worker-deployment-versioning.ts` | Shared harness; extra native connections now use env auth/TLS, but server feature support needs validation. |
| `test-worker-exposes-abortcontroller.ts` | Uses default client/worker connection in integration block. |
| `test-worker-exposes-textencoderdecoder.ts` | Uses default client/worker connection in integration block. |
| `test-worker-lifecycle.ts` | Uses default client/worker connection in integration block and has runtime/lifecycle-local assertions. |
| `test-worker-no-activities.ts` | Uses default client/worker connection in integration block. |
| `test-worker-no-workflows.ts` | Uses default client/worker connection in integration block. |
| `test-worker-poller-autoscale.ts` | Direct local environment with local Prometheus endpoint. |
| `test-worker-versioning.ts` | Uses default client/worker connection in integration block. |
| `test-workflow-log-interceptor.ts` | Direct `TestWorkflowEnvironment.createLocal()`. |
| `test-workflow-unhandled-rejection-crash.ts` | Uses default client/worker connection in integration block. |
