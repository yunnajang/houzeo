import { Link } from 'react-router-dom';
import ListingItem from './ListingItem';

function ListingSection({ title, linkUrl, listings, type }) {
  if (!listings?.length) return null;

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <Link to={linkUrl} className='flex items-center justify-between w-full'>
          <h2 className='text-2xl lg:text-3xl font-bold text-brand-main font-bricolage'>
            {title}
          </h2>
          <span className='button-hover text-brand-main bg-brand-secondary hover:bg-brand-tertiary shadow-sm'>
            Show all
          </span>
        </Link>
      </div>

      {/* Mobile - Horizontal Scroll */}
      <div className='lg:hidden overflow-x-auto'>
        <div className='flex gap-4 pb-4'>
          {listings.map((listing) => (
            <div key={listing._id} className='min-w-[320px]'>
              <ListingItem listing={listing} type={type} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop - Grid */}
      <div className='hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {listings.map((listing) => (
          <ListingItem key={listing._id} listing={listing} type={type} />
        ))}
      </div>
    </div>
  );
}

export default ListingSection;
