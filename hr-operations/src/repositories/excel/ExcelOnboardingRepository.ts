import type { OnboardingRepository } from '../contracts/OnboardingRepository';
import type { OnboardingRequest, OnboardingStep } from '../../types/entities';
import { getDatabase, touch } from '../../excel/dbState';

export class ExcelOnboardingRepository implements OnboardingRepository {
  async getAll(): Promise<OnboardingRequest[]> {
    return [...getDatabase().onboardingRequests];
  }

  async getByEmployeeId(employeeId: string): Promise<OnboardingRequest | null> {
    return getDatabase().onboardingRequests.find((r) => r.employeeId === employeeId) ?? null;
  }

  async create(request: OnboardingRequest): Promise<OnboardingRequest> {
    getDatabase().onboardingRequests.push(request);
    await touch();
    return request;
  }

  async update(id: string, patch: Partial<OnboardingRequest>): Promise<OnboardingRequest> {
    const db = getDatabase();
    const index = db.onboardingRequests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`OnboardingRequest not found: ${id}`);
    const updated = { ...db.onboardingRequests[index], ...patch };
    db.onboardingRequests[index] = updated;
    await touch();
    return updated;
  }

  async getStepsByRequestId(requestId: string): Promise<OnboardingStep[]> {
    return getDatabase().onboardingSteps.filter((s) => s.onboardingRequestId === requestId);
  }

  async addStep(step: OnboardingStep): Promise<OnboardingStep> {
    getDatabase().onboardingSteps.push(step);
    await touch();
    return step;
  }
}
