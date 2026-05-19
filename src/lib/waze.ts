type WazeLinkInput = {
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
};

export function generateWazeLink({ lat, lng, address }: WazeLinkInput) {
  if (typeof lat === "number" && typeof lng === "number") {
    return `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  }

  const query = encodeURIComponent(address?.trim() || "Costa Rica");
  return `https://www.waze.com/ul?q=${query}&navigate=yes`;
}
