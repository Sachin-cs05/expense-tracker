import {
  createRecurringPayment,
  deleteRecurringPayment,
  findRecurringPaymentById,
  listRecurringPayments,
  updateRecurringPayment
} from "../repositories/recurringRepository.js";
import { recurringPaymentSchema } from "../validation.js";

export async function getRecurringPayments(ownerId) {
  return listRecurringPayments(ownerId);
}

export async function addRecurringPayment(ownerId, payload) {
  const validated = recurringPaymentSchema.parse(payload);
  return createRecurringPayment({ ownerId, ...validated });
}

export async function editRecurringPayment(ownerId, id, payload) {
  if (!(await findRecurringPaymentById(ownerId, id))) {
    return null;
  }
  const validated = recurringPaymentSchema.parse(payload);
  return updateRecurringPayment(ownerId, id, validated);
}

export async function toggleRecurringPayment(ownerId, id) {
  const payment = await findRecurringPaymentById(ownerId, id);
  if (!payment) return null;
  return updateRecurringPayment(ownerId, id, { active: !payment.active });
}

export async function removeRecurringPayment(ownerId, id) {
  return Boolean(await deleteRecurringPayment(ownerId, id));
}
