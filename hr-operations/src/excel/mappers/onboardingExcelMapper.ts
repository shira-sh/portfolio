import type { OnboardingRequest, OnboardingStep } from '../../types/entities';
import type { OnboardingStepStatus } from '../../types/enums';
import { str, strOrNull } from '../mapperUtils';

export function rowToOnboardingRequest(row: Record<string, unknown>): OnboardingRequest {
  return {
    id: str(row.id),
    employeeId: str(row.employeeId),
    currentStep: str(row.currentStep) as OnboardingStepStatus,
    createdAt: str(row.createdAt),
    updatedAt: str(row.updatedAt),
    createdBy: str(row.createdBy),
  };
}

export function onboardingRequestToRow(request: OnboardingRequest): Record<string, unknown> {
  return { ...request };
}

export function rowToOnboardingStep(row: Record<string, unknown>): OnboardingStep {
  return {
    id: str(row.id),
    onboardingRequestId: str(row.onboardingRequestId),
    step: str(row.step) as OnboardingStepStatus,
    completedAt: strOrNull(row.completedAt),
    completedBy: strOrNull(row.completedBy),
    notes: strOrNull(row.notes),
  };
}

export function onboardingStepToRow(step: OnboardingStep): Record<string, unknown> {
  return {
    ...step,
    completedAt: step.completedAt ?? '',
    completedBy: step.completedBy ?? '',
    notes: step.notes ?? '',
  };
}
