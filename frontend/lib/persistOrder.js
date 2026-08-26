/** Swap two items in a list and re-index order values from `start`. */
export function reorderList(items, fromIndex, toIndex, orderKey = 'orden') {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return items
  if (fromIndex >= items.length || toIndex >= items.length) return items

  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)

  return next.map((item, index) => ({
    ...item,
    [orderKey]: index,
  }))
}

/** Persist order field changes via individual update calls. */
export async function persistOrderChanges(items, previousItems, { orderKey = 'orden', getId, update }) {
  const prevMap = new Map(previousItems.map((item) => [getId(item), item[orderKey]]))
  const changed = items.filter((item) => prevMap.get(getId(item)) !== item[orderKey])

  await Promise.all(
    changed.map((item) => update(getId(item), { [orderKey]: item[orderKey] })),
  )

  return changed.length
}
