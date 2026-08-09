import { createSavingsGoal, deleteSavingsGoal, listSavingsGoals, updateSavingsGoal } from "../repositories/savingsGoalRepository.js";
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

export async function editSavingsGoal(ownerId, id, payload) {
  const validated = savingsGoalSchema.parse(payload);
  return updateSavingsGoal(ownerId, id, validated);
}
