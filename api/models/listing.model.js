import mongoose from 'mongoose';
const { Schema } = mongoose;

const listingSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters long'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: ['sale', 'rent'],
    },
    offer: {
      type: Boolean,
      required: [true, 'Offer status is required'],
      default: false,
    },
    parking: {
      type: Boolean,
      required: [true, 'Parking information is required'],
      default: false,
    },
    furnished: {
      type: Boolean,
      required: [true, 'Furnished information is required'],
      default: false,
    },
    bedrooms: {
      type: Number,
      required: [true, 'Number of bedrooms is required'],
      min: [0, 'Bedrooms cannot be negative'],
    },
    bathrooms: {
      type: Number,
      required: [true, 'Number of bathrooms is required'],
      min: [0, 'Bathrooms cannot be negative'],
    },
    regularPrice: {
      type: Number,
      required: [true, 'Regular price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      required: [
        function () {
          return this.offer === true;
        },
        'Discount price is required when offer is true',
      ],
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    imageUrls: {
      type: [String],
      required: [true, 'At least one image is required'],
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one image is required',
      },
    },
    userRef: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
  },
  { timestamps: true }
);

listingSchema.index({ userRef: 1 });
listingSchema.index({ type: 1 });

listingSchema.pre('save', function (next) {
  if (this.offer && this.discountPrice >= this.regularPrice) {
    next(new Error('Discount price must be less than regular price'));
  }
  next();
});

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
