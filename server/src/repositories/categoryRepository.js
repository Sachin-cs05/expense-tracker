import { Category } from "../models/Category.js";

export async function listCategories(ownerId, type) {
  const query = { ownerId };
  if (type) query.type = type;
  const categories = await Category.find(query).sort({ name: 1 });
  return categories.map((category) => category.toJSON());
}

export async function createCategory(category) {
  const created = await Category.create(category);
  return created.toJSON();
}

export async function deleteCategory(ownerId, id) {
  return Category.findOneAndDelete({ _id: id, ownerId });
}

export async function findCategoryByName(ownerId, name, type) {
  const category = await Category.findOne({ ownerId, name, type });
  return category ? category.toJSON() : null;
}

export async function countCategories(ownerId) {
  return Category.countDocuments({ ownerId });
}

export async function insertManyCategories(categories) {
  if (!categories.length) return [];
  const created = await Category.insertMany(categories, { ordered: false }).catch(() => []);
  return created.map((category) => category.toJSON());
}
