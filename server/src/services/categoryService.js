import { defaultExpenseCategories, defaultIncomeCategories } from "../constants.js";
import {
  createCategory,
  deleteCategory,
  listCategories,
  countCategories,
  insertManyCategories
} from "../repositories/categoryRepository.js";
import { categorySchema } from "../validation.js";

export async function seedDefaultCategories(ownerId) {
  const existing = await countCategories(ownerId);
  if (existing > 0) return;

  const docs = [
    ...defaultExpenseCategories.map((category) => ({ ownerId, type: "expense", ...category })),
    ...defaultIncomeCategories.map((category) => ({ ownerId, type: "income", ...category }))
  ];

  await insertManyCategories(docs);
}

export async function getCategories(ownerId, type) {
  let categories = await listCategories(ownerId, type);
  if (categories.length === 0) {
    await seedDefaultCategories(ownerId);
    categories = await listCategories(ownerId, type);
  }
  return categories;
}

export async function addCategory(ownerId, payload) {
  const validated = categorySchema.parse(payload);
  return createCategory({ ownerId, ...validated });
}

export async function removeCategory(ownerId, id) {
  return Boolean(await deleteCategory(ownerId, id));
}
