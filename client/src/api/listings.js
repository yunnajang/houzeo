// API functions for listings
export const listingApi = {
  getOffers: async () => {
    const response = await fetch('/api/listing/get?offer=true&limit=4');
    return response.json();
  },

  getSales: async () => {
    const response = await fetch('/api/listing/get?type=sale&limit=4');
    return response.json();
  },

  getRentals: async () => {
    const response = await fetch('/api/listing/get?type=rent&limit=4');
    return response.json();
  },
};
