function AuthLayout({ children }) {
  return (
    <div className='grid place-items-center h-[calc(100vh-64px)] md:h-[calc(100vh-72px)]'>
      <div className='w-full max-w-md mx-auto px-5 sm:px-8'>{children}</div>
    </div>
  );
}

export default AuthLayout;
