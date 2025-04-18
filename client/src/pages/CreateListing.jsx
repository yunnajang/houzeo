import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useAuthStore } from '../store/authStore';

const storage = getStorage(app);

const schema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(50, "Name can't be longer than 50 characters.")
    .required('Name is required'),
  description: yup
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, "Description can't be longer than 1000 characters")
    .required('Description is required'),
  address: yup
    .string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .required('Address is required'),
  type: yup
    .string()
    .oneOf(['rent', 'sale'], 'Type must be rent or sale')
    .required('Type is required'),
  offer: yup.boolean(),
  parking: yup.boolean(),
  furnished: yup.boolean(),
  bedrooms: yup
    .number()
    .typeError('Bedrooms is required')
    .min(1, 'At least 1 bedroom required')
    .required('Bedrooms is required'),
  bathrooms: yup
    .number()
    .typeError('Bathrooms is required')
    .min(1, 'At least 1 bathroom required')
    .required('Bathrooms is required'),
  regularPrice: yup
    .number()
    .typeError('Regular price is required')
    .min(1, 'Price must be at least 1')
    .required('Regular price is required'),
  discountPrice: yup.lazy((value, context) => {
    const { offer, regularPrice } = context.parent;
    if (offer) {
      return yup
        .number()
        .typeError('Discount price must be a number')
        .required('Discount price is required when offer is enabled')
        .min(0, 'Discount must be 0 or greater')
        .max(regularPrice, 'Discount must be lower than regular price');
    }
    return yup.mixed().notRequired();
  }),
});

function CreateListing() {
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  const user = useAuthStore((state) => state.user);

  const navigate = useNavigate();

  const offer = watch('offer');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const uniqueFiles = files.filter(
      (file) =>
        !imageFiles.find(
          (existing) =>
            existing.name === file.name &&
            existing.lastModified === file.lastModified
        )
    );

    const MAX_FILE_SIZE_MB = 10;
    const isValidType = (file) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);

    for (let file of uniqueFiles) {
      if (!isValidType(file)) {
        setError('images', {
          message: 'Only JPEG, PNG, and WEBP images are allowed',
        });
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError('images', {
          message: `Each file must be smaller than ${MAX_FILE_SIZE_MB}MB`,
        });
        return;
      }
    }

    if (imageFiles.length + uniqueFiles.length > 8) {
      setError('images', { message: 'You can only upload up to 8 images' });
      return;
    }

    clearErrors('images');
    setUploading(true);
    uniqueFiles.forEach((file) => uploadImage(file));
  };

  const uploadImage = (file) => {
    const fileRef = ref(storage, `listings/${file.name}-${file.lastModified}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
      },
      (error) => {
        console.error(error);
        setError('images', {
          message: 'Image upload failed. Please try again.',
        });
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUrls((prev) => [...prev, downloadURL]);
          setImageFiles((prev) => [...prev, file]);
          setUploading(false);
        });
      }
    );
  };

  const onSubmit = async (data) => {
    if (imageUrls.length < 1) {
      setError('images', { message: 'Please upload at least one image' });
      return;
    }

    setIsSubmitting(true);

    const listingData = {
      ...data,
      imageUrls,
      userRef: 'user_id_placeholder',
    };

    try {
      console.log('Listing submitted:', listingData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='max-w-lg mx-auto px-5 sm:px-8 my-10 sm:my-20'>
      <h1 className='text-3xl font-bold text-center text-brand-main mb-8'>
        Create a Listing
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div className='flex flex-col gap-2'>
          <label htmlFor='name' className='font-semibold'>
            Name
          </label>
          <input
            id='name'
            type='text'
            placeholder='Name'
            className='form-input'
            aria-label='Name'
            {...register('name')}
          />
          {errors.name && (
            <p className='text-red-600 text-sm'>{errors.name.message}</p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='description' className='font-semibold'>
            Description
          </label>
          <textarea
            id='description'
            type='text'
            placeholder='Description'
            className='form-input'
            aria-label='Description'
            {...register('description')}
          />
          {errors.description && (
            <p className='text-red-600 text-sm'>{errors.description.message}</p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='address' className='font-semibold'>
            Address
          </label>
          <input
            id='address'
            type='text'
            placeholder='Address'
            className='form-input'
            aria-label='Address'
            {...register('address')}
          />
          {errors.address && (
            <p className='text-red-600 text-sm'>{errors.address.message}</p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='type' className='font-semibold'>
            Type
          </label>
          <select
            id='type'
            className='form-input'
            {...register('type')}
            aria-label='Type'
          >
            <option value='rent'>Rent</option>
            <option value='sale'>Sale</option>
          </select>
          {errors.type && (
            <p className='text-red-600 text-sm'>{errors.type.message}</p>
          )}
        </div>
        <div className='flex flex-wrap gap-6'>
          <label htmlFor='offer' className='flex items-center gap-2'>
            <input
              id='offer'
              type='checkbox'
              className='w-5 h-5'
              {...register('offer')}
              aria-label='Offer'
            />
            <span>Offer</span>
          </label>
          <label htmlFor='parking' className='flex items-center gap-2'>
            <input
              id='parking'
              type='checkbox'
              className='w-5 h-5'
              {...register('parking')}
              aria-label='Parking'
            />
            <span>Parking</span>
          </label>
          <label htmlFor='furnished' className='flex items-center gap-2'>
            <input
              id='furnished'
              type='checkbox'
              className='w-5 h-5'
              {...register('furnished')}
              aria-label='Furnished'
            />
            <span>Furnished</span>
          </label>
        </div>
        <div className='flex gap-6 w-full'>
          <div className='flex flex-col gap-2 w-full'>
            <label htmlFor='bedrooms' className='font-semibold'>
              Bedrooms
            </label>
            <input
              id='bedrooms'
              type='number'
              className='form-input w-full'
              {...register('bedrooms')}
              placeholder='Bedrooms'
              aria-label='Bedrooms'
            />
            {errors.bedrooms && (
              <p className='text-red-600 text-sm'>{errors.bedrooms.message}</p>
            )}
          </div>
          <div className='flex flex-col gap-2 w-full'>
            <label htmlFor='bathrooms' className='font-semibold'>
              Bathrooms
            </label>
            <input
              id='bathrooms'
              type='number'
              className='form-input w-full'
              {...register('bathrooms')}
              placeholder='Bathrooms'
              aria-label='Bathrooms'
            />
            {errors.bathrooms && (
              <p className='text-red-600 text-sm'>{errors.bathrooms.message}</p>
            )}
          </div>
        </div>
        <div className='flex gap-6 w-full'>
          <div className='flex flex-col gap-2 flex-1 w-full'>
            <label htmlFor='regularPrice' className='font-semibold'>
              Regular Price
            </label>
            <input
              id='regularPrice'
              type='number'
              className='form-input w-full'
              {...register('regularPrice')}
              placeholder='Regular Price'
              aria-label='Regular Price'
            />
            {errors.regularPrice && (
              <p className='text-red-600 text-sm'>
                {errors.regularPrice.message}
              </p>
            )}
          </div>
          {offer && (
            <div className='flex flex-col gap-2 flex-1 w-full'>
              <label htmlFor='discountPrice' className='font-semibold'>
                Discount Price
              </label>
              <input
                id='discountPrice'
                type='number'
                className='form-input w-full'
                {...register('discountPrice')}
                placeholder='Discount Price'
                aria-label='Discount Price'
              />
              {errors.discountPrice && (
                <p className='text-red-600 text-sm'>
                  {errors.discountPrice.message}
                </p>
              )}
            </div>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='images' className='font-semibold'>
            Images
          </label>
          <p className='text-sm text-gray-600'>
            The first image will be the cover (max 8)
          </p>
          <input
            id='images'
            type='file'
            multiple
            accept='image/*'
            onChange={handleImageChange}
            className='p-3 border border-gray-300 rounded w-full'
            aria-label='Upload Images'
          />
          {errors.images && (
            <p className='text-red-600 text-sm'>{errors.images.message}</p>
          )}
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
            {imageUrls.map((url, idx) => (
              <motion.div
                key={idx}
                className='relative w-full aspect-square overflow-hidden rounded-lg border'
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={url}
                  alt='uploaded'
                  className='object-cover w-full h-full'
                />
                <button
                  type='button'
                  onClick={() => {
                    setImageUrls(imageUrls.filter((_, i) => i !== idx));
                    setImageFiles(imageFiles.filter((_, i) => i !== idx));
                  }}
                  className='absolute top-1 right-1 bg-white/80 rounded-full p-1 text-sm'
                  aria-label='Remove image'
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </div>
        </div>
        <button
          type='submit'
          disabled={isSubmitting || uploading}
          className='button-full loading-disabled'
          aria-label='Submit Listing'
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default CreateListing;
