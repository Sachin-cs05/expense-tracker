import {
  createSpace,
  deleteSpace,
  findSpaceById,
  getSpaceTotals,
  listSpaces,
  updateSpace
} from "../repositories/spaceRepository.js";
import { spaceSchema } from "../validation.js";

export async function getSpaces(ownerId) {
  const spaces = await listSpaces(ownerId);

  return Promise.all(
    spaces.map(async (space) => ({
      ...space,
      totals: await getSpaceTotals(ownerId, space.id)
    }))
  );
}

export async function addSpace(ownerId, payload) {
  const validated = spaceSchema.parse(payload);
  return createSpace({ ownerId, ...validated });
}

export async function editSpace(ownerId, id, payload) {
  if (!(await findSpaceById(ownerId, id))) {
    return null;
  }
  const validated = spaceSchema.parse(payload);
  return updateSpace(ownerId, id, validated);
}

export async function removeSpace(ownerId, id) {
  return Boolean(await deleteSpace(ownerId, id));
}
