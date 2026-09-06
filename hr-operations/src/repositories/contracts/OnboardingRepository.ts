import type { OnboardingRequest, OnboardingStep } from '../../types/entities';

export interface OnboardingRepository {
  getAll(): Promise<OnboardingRequest[]>;
  getByEmployeeId(employeeId: string): Promise<OnboardingRequest | null>;
  create(request: OnboardingRequest): Promise<OnboardingRequest>;
  update(id: string, patch: Partial<OnboardingRequest>): Promise<OnboardingRequest>;
  getStepsByRequestId(requestId: string): Promise<OnboardingStep[]>;
  addStep(step: OnboardingStep): Promise<OnboardingStep>;
}
