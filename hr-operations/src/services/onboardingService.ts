import { onboardingRepository } from '../repositories';
import type { OnboardingRequest, OnboardingStep } from '../types/entities';

export async function getOnboardingRequest(employeeId: string): Promise<OnboardingRequest | null> {
  return onboardingRepository.getByEmployeeId(employeeId);
}

export async function getOnboardingTimeline(employeeId: string): Promise<OnboardingStep[]> {
  const request = await onboardingRepository.getByEmployeeId(employeeId);
  if (!request) return [];
  const steps = await onboardingRepository.getStepsByRequestId(request.id);
  return [...steps].sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''));
}

export async function getAllOnboardingRequests(): Promise<OnboardingRequest[]> {
  return onboardingRepository.getAll();
}
