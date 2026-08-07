import { createSavingsGoal, deleteSavingsGoal, listSavingsGoals } from "../repositories/savingsGoalRepository.js";
import { savingsGoalSchema } from "../validation.js";

export async function getSavingsGoals(ownerId) {
  return listSavingsGoals(ownerId);
}

export async function addSavingsGoal(ownerId, payload) {
  const validated = savingsGoalSchema.parse(payload);
  return createSavingsGoal({ ownerId, ...validated });
}

export async function removeSavingsGoal(ownerId, id) {
  return Boolean(await deleteSavingsGoal(ownerId, id));
}
