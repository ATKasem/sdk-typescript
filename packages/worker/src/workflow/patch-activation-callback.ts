import { IllegalStateError } from '@temporalio/common';
import type { WorkflowInfo } from '@temporalio/workflow';
import type { PatchActivationCallback, PatchActivationInput } from '../worker-options';

export const PATCH_ACTIVATION_CALLBACK_BUFFER_SIZE = 64 * 1024;
export const PATCH_ACTIVATION_CALLBACK_HEADER_SIZE = 3 * Int32Array.BYTES_PER_ELEMENT;

export const enum PatchActivationCallbackStatus {
  Pending = 0,
  True = 1,
  False = 2,
  Error = 3,
}

export type WorkflowPatchActivationCallback = (workflowInfo: WorkflowInfo, patchId: string) => boolean;

function disabledWorkflowRandom(): never {
  throw new IllegalStateError('Workflow randomness cannot be used from patchActivationCallback');
}

function disabledWorkflowNow(): never {
  throw new IllegalStateError('Workflow unsafe time cannot be used from patchActivationCallback');
}

const disabledRandomSource = Object.freeze({
  random: disabledWorkflowRandom,
  uuid4: disabledWorkflowRandom,
  fillRandom: disabledWorkflowRandom,
}) as WorkflowInfo['unsafe']['random'];

export function makePatchActivationInput(workflowInfo: WorkflowInfo, patchId: string): PatchActivationInput {
  const info = Object.freeze({
    ...workflowInfo,
    unsafe: Object.freeze({
      ...workflowInfo.unsafe,
      now: disabledWorkflowNow,
      random: disabledRandomSource,
    }),
  });
  return Object.freeze({ workflowInfo: info, patchId });
}

export function invokePatchActivationCallback(
  callback: PatchActivationCallback,
  workflowInfo: WorkflowInfo,
  patchId: string
): boolean {
  const result = callback(makePatchActivationInput(workflowInfo, patchId));
  if (typeof result !== 'boolean') {
    throw new TypeError(`patchActivationCallback must return a boolean, got ${typeof result}`);
  }
  return result;
}
