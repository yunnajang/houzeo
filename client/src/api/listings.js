// API functions for listings
export const listingApi = {
  getOffers: async () => {
    const response = await fetch('/api/listing/get?offer=true&limit=3');
    return response.json();
  },

  getSales: async () => {
    const response = await fetch('/api/listing/get?type=sale&limit=3');
    return response.json();
  },

  getRentals: async () => {
    const response = await fetch('/api/listing/get?type=rent&limit=3');
    return response.json();
  },
};
