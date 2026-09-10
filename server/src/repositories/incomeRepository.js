import { Income } from "../models/Income.js";

export async function listIncomes(ownerId, filters = {}) {
  const query = { ownerId };

  if (filters.category) query.category = filters.category;
  if (filters.spaceId) query.spaceId = filters.spaceId;

  if (filters.month) {
    query.date = { ...(query.date || {}), $regex: `^${filters.month}` };
  }
  if (filters.startDate) {
    query.date = { ...(query.date || {}), $gte: filters.startDate };
  }
  if (filters.endDate) {
    query.date = { ...(query.date || {}), $lte: filters.endDate };
  }
  if (filters.search) {
    query.source = { $regex: filters.search, $options: "i" };
  }

  const incomes = await Income.find(query).sort({ date: -1, createdAt: -1 }).lean();
  return incomes.map((income) => ({
    id: income._id.toString(),
    ownerId: income.ownerId.toString(),
    amount: income.amount,
    source: income.source,
    category: income.category,
    paymentMethod: income.paymentMethod,
    date: income.date,
    notes: income.notes,
    spaceId: income.spaceId ? income.spaceId.toString() : null,
    createdAt: income.createdAt,
    updatedAt: income.updatedAt
  }));
}

export async function findIncomeById(ownerId, id) {
  return Income.findOne({ _id: id, ownerId });
}

export async function createIncome(income) {
  const created = await Income.create(income);
  return created.toJSON();
}

export async function updateIncome(ownerId, id, updates) {
  const updated = await Income.findOneAndUpdate({ _id: id, ownerId }, updates, {
    new: true,
    runValidators: true
  });
  return updated ? updated.toJSON() : null;
}

export async function deleteIncome(ownerId, id) {
  return Income.findOneAndDelete({ _id: id, ownerId });
}
