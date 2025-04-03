import { Link } from 'react-router-dom';
import { FaBed, FaBath, FaParking, FaChair } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';

export default function ListingItem({ listing, type }) {
  return (
    <div className='group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100'>
      <Link to={`/listing/${listing._id}`}>
        <div className='relative'>
          <div className='aspect-[4/3] overflow-hidden'>
            <img
              src={listing.imageUrls[0]}
              alt={listing.name}
              className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
            />
          </div>
          {type === 'offer' && (
            <div className='absolute top-3 left-3 text-white bg-brand-main/80 px-4 py-2 rounded-full text-xs font-semibold shadow-md'>
              {Math.round(
                ((listing.regularPrice - listing.discountPrice) /
                  listing.regularPrice) *
                  100
              )}
              % OFF
            </div>
          )}
        </div>
        <div className='p-5'>
          <h3 className='font-semibold text-lg text-brand-main truncate pr-2'>
            {listing.name}
          </h3>
          <div className='my-2 mb-4'>
            <div className='flex items-center gap-1'>
              <span className='text-brand-main text-xl font-medium'>$</span>
              <p className='text-2xl font-bold text-brand-main'>
                {type === 'offer'
                  ? listing.discountPrice.toLocaleString()
                  : listing.regularPrice.toLocaleString()}
              </p>
              {listing.type === 'rent' && (
                <span className='text-sm font-normal text-gray-500 ml-1'>
                  /month
                </span>
              )}
            </div>
            {type === 'offer' && (
              <div className='flex items-baseline gap-1 mt-1'>
                <span className='text-gray-500 text-sm'>$</span>
                <p className='text-sm text-gray-500 line-through'>
                  {listing.regularPrice.toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <div className='flex items-center text-sm mb-4'>
            <MdLocationOn className='text-brand-main/50 mr-1' />
            <p className='line-clamp-2 truncate text-brand-main'>
              {listing.address}
            </p>
          </div>
          <div className='flex items-center gap-4 text-sm'>
            <div className='flex items-center gap-1.5'>
              <FaBed className='text-brand-main/50 text-base' />
              <span className='font-medium text-brand-main'>
                {listing.bedrooms}
              </span>
            </div>
            <div className='flex items-center gap-1.5'>
              <FaBath className='text-brand-main/50 text-base' />
              <span className='font-medium text-brand-main'>
                {listing.bathrooms}
              </span>
            </div>
            {listing.parking && (
              <div className='flex items-center gap-1.5'>
                <FaParking className='text-brand-main/50 text-base' />
                <span className='font-medium text-brand-main'>Parking</span>
              </div>
            )}
            {listing.furnished && (
              <div className='flex items-center gap-1.5'>
                <FaChair className='text-brand-main/50 text-base' />
                <span className='font-medium text-brand-main'>Furnished</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
