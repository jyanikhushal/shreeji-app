export const getData = async <T>(
  res: Response,
  options?: { expectArray?: boolean }
): Promise<T> => {
  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || "API error");
  }

  let data = json.data;

  // 🔥 NORMALIZATION LOGIC
  if (options?.expectArray) {
    // ensure array
    if (!Array.isArray(data)) {
      data = data ? [data] : [];
    }
  } else {
    // ensure object
    if (Array.isArray(data)) {
      data = data[0] || null;
    }
  }

  return data;
};