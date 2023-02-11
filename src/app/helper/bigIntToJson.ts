export const bigIntToJson = (obj: object) => {
  const object = JSON.stringify(
    obj,
    (_, v) => (typeof v === "bigint" ? v.toString() : v)
  );

  return object;
};
