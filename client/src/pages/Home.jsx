import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import SwiperCore from 'swiper';
import ListingSection from '../components/ListingSection';
import { listingApi } from '../api/listings';
import 'swiper/css/bundle';
import 'swiper/css/effect-fade';

const heroImages = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  src: new URL(`../assets/hero-img-${i + 1}.jpg`, import.meta.url).href,
}));

function SearchBar() {
  return (
    <Link
      to='/search'
      className='flex items-center gap-3 bg-brand-secondary pr-5 pl-2 py-2 rounded-full hover:bg-brand-tertiary transition-all duration-200 w-full shadow-md'
    >
      <div className='h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-md'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={2.5}
          stroke='currentColor'
          className='w-5 h-5 text-brand-main'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
          />
        </svg>
      </div>
      <div className='flex-1 text-left'>
        <span className='block text-brand-main font-medium text-base sm:text-lg'>
          Search destinations
        </span>
      </div>
    </Link>
  );
}

function ImageSwiper() {
  return (
    <div className='overflow-hidden h-full w-full'>
      {heroImages && heroImages.length > 0 ? (
        <Swiper
          effect='fade'
          autoplay={{
            delay: 1000,
            disableOnInteraction: false,
          }}
          speed={1000}
          loop={true}
          className='h-full w-full'
        >
          {heroImages.map((image) => (
            <SwiperSlide key={image.id}>
              <div
                style={{
                  background: `url(${image.src}) center no-repeat`,
                  backgroundSize: 'cover',
                }}
                className='h-full w-full transition-opacity duration-300'
              ></div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className='h-full w-full bg-brand-secondary flex items-center justify-center'>
          <p className='text-brand-main text-center'>No images available</p>
        </div>
      )}
    </div>
  );
}

function Home() {
  const sharedQueryOptions = {
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
  };

  const {
    data: offers,
    isLoading: isOffersLoading,
    error: offersError,
  } = useQuery({
    queryKey: ['offers'],
    queryFn: listingApi.getOffers,
    ...sharedQueryOptions,
  });

  const {
    data: sales,
    isLoading: isSalesLoading,
    error: salesError,
  } = useQuery({
    queryKey: ['sales'],
    queryFn: listingApi.getSales,
    ...sharedQueryOptions,
  });

  const {
    data: rentals,
    isLoading: isRentalsLoading,
    error: rentalsError,
  } = useQuery({
    queryKey: ['rentals'],
    queryFn: listingApi.getRentals,
    ...sharedQueryOptions,
  });

  const isLoading = isOffersLoading || isSalesLoading || isRentalsLoading;
  const error = offersError || salesError || rentalsError;

  SwiperCore.use([Autoplay, EffectFade]);

  return (
    <main>
      {/* Hero Section */}
      <section className='bg-brand-white max-w-6xl mx-auto'>
        {/* Mobile Layout */}
        <div className='md:hidden relative w-full h-[70vh]'>
          <div className='absolute inset-0 w-full h-full z-0'>
            <ImageSwiper />
          </div>

          <div className='absolute inset-0 w-full h-full bg-black opacity-50 z-10'></div>

          {/* Text Content */}
          <div className='relative z-20 h-full flex flex-col items-center justify-center px-5 text-center'>
            <h1 className='font-bricolage font-extrabold text-4xl md:text-5xl lg:text-6xl text-white mb-4'>
              Find it. Love it. Live in it.
            </h1>
            <p className='text-white text-base sm:text-lg lg:text-xl leading-relaxed mb-16'>
              Houzeo connects people with places they love.
              <br />
              Discover homes, apartments, and rentals tailored to your lifestyle
              and location.
            </p>

            <SearchBar />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className='hidden md:grid grid-cols-2 gap-10 items-center px-8 pt-12'>
          <div className='flex flex-col text-left max-w-md'>
            <h1 className='font-bricolage font-extrabold text-4xl lg:text-6xl text-brand-main mb-4'>
              Find it.
              <br />
              Love it.
              <br />
              Live in it.
            </h1>
            <p className='text-brand-main/80 text-base lg:text-lg xl:text-xl leading-relaxed mb-10 lg:mb-16'>
              Houzeo connects people with places they love.
              <br />
              Discover homes, apartments, and rentals tailored to your lifestyle
              and location.
            </p>

            <SearchBar />
          </div>

          <div className='aspect-square w-full overflow-hidden rounded-lg shadow-lg'>
            <ImageSwiper />
          </div>
        </div>
      </section>

      {/* Listing Sections */}
      {isLoading ? (
        <div className='flex justify-center items-center min-h-[200px]'>
          <div className='w-8 h-8 border-4 border-brand-main border-t-transparent rounded-full animate-spin'></div>
        </div>
      ) : error ? (
        <div className='text-center py-8'>
          <p className='text-gray-600 mb-3'>Failed to load listings</p>
          <button
            onClick={() => window.location.reload()}
            className='text-brand-main hover:text-brand-main/80'
          >
            Try again
          </button>
        </div>
      ) : (
        <section className='flex flex-col gap-12 md:gap-16 max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 md:pt-24 lg:pt-32 xl:pt-36'>
          <ListingSection
            title='Recent Offers'
            linkUrl='/search?offer=true'
            listings={offers}
            type='offer'
          />
          <ListingSection
            title='Recent Sales'
            linkUrl='/search?type=sale'
            listings={sales}
            type='sale'
          />
          <ListingSection
            title='Recent Rentals'
            linkUrl='/search?type=rent'
            listings={rentals}
            type='rent'
          />
        </section>
      )}
    </main>
  );
}

export default Home;
