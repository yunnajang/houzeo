import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css/bundle';
import 'swiper/css/effect-fade';
import SwiperCore from 'swiper';
import ListingSection from '../components/ListingSection';

const heroImages = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  src: new URL(`../assets/hero-img-${i + 1}.jpg`, import.meta.url).href,
}));

function SearchBar() {
  return (
    <Link
      to='/search'
      className='flex items-center gap-3 bg-brand-tertiary pr-5 pl-2 py-2 rounded-full hover:bg-brand-highlight transition-all duration-200 w-full shadow-md'
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
          <p className='text-brand-paragraph text-center'>
            No images available
          </p>
        </div>
      )}
    </div>
  );
}

function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);

  SwiperCore.use([Autoplay, EffectFade]);

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch(`/api/listing/get?offer=true&limit=4`);
        const data = await res.json();
        setOfferListings(data);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSaleListings = async () => {
      try {
        const res = await fetch(`/api/listing/get?type=sale&limit=4`);
        const data = await res.json();
        setSaleListings(data);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchRentListings = async () => {
      try {
        const res = await fetch(`/api/listing/get?type=rent&limit=4`);
        const data = await res.json();
        setRentListings(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchOfferListings();
  }, []);

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
            <p className='text-white text-base sm:text-lg md:text-xl leading-relaxed mb-16'>
              Houzeo connects people with places they love.
              <br />
              Discover homes, apartments, and rentals tailored to your lifestyle
              and location.
            </p>

            <SearchBar />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className='hidden md:grid grid-cols-2 gap-10 items-center px-8 py-12'>
          <div className='flex flex-col text-left max-w-md'>
            <h1 className='font-bricolage font-extrabold text-4xl md:text-5xl lg:text-6xl text-brand-main mb-4'>
              Find it.
              <br />
              Love it.
              <br />
              Live in it.
            </h1>
            <p className='text-brand-paragraph/80 text-base sm:text-lg md:text-xl leading-relaxed mb-16'>
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
      <ListingSection
        title='Recent offers'
        linkText='Show more offers'
        linkUrl='/search?offer=true'
        listings={offerListings}
      />

      <ListingSection
        title='Recent places for sale'
        linkText='Show more places for sale'
        linkUrl='/search?type=sale'
        listings={saleListings}
      />

      <ListingSection
        title='Recent places for rent'
        linkText='Show more places for rent'
        linkUrl='/search?type=rent'
        listings={rentListings}
      />
    </main>
  );
}

export default Home;
