import { RecurringPayment } from "../models/RecurringPayment.js";

export async function listRecurringPayments(ownerId) {
  const payments = await RecurringPayment.find({ ownerId }).sort({ nextPaymentDate: 1 });
  return payments.map((payment) => payment.toJSON());
}

export async function createRecurringPayment(payment) {
  const created = await RecurringPayment.create(payment);
  return created.toJSON();
}

export async function findRecurringPaymentById(ownerId, id) {
  return RecurringPayment.findOne({ _id: id, ownerId });
}

export async function updateRecurringPayment(ownerId, id, updates) {
  const updated = await RecurringPayment.findOneAndUpdate({ _id: id, ownerId }, updates, {
    new: true,
    runValidators: true
  });
  return updated ? updated.toJSON() : null;
}

export async function deleteRecurringPayment(ownerId, id) {
  return RecurringPayment.findOneAndDelete({ _id: id, ownerId });
}
