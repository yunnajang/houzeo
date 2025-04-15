import mongoose from 'mongoose';
const { Schema } = mongoose;

const listingSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    offer: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    regularPrice: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    imageUrls: [{ type: String }],
    userRef: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

listingSchema.index({ userRef: 1 });
listingSchema.index({ type: 1 });

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
