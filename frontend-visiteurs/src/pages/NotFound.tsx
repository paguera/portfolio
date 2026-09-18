function NotFound() {
  return (
    <div className="min-h-50vh w-full h-full relative">
      <div className="my-50 m-auto relative flex flex-col items-center justify-center z-10 p-14 sm:p-10 text-center max-w-xl w-full">
        <h2 className="text-6xl font-bold text-white mb-4"> 404</h2>
        <h2 className="text-white text-3xl sm:text-4xl font-bold mb-4">
          Page not found !
        </h2>
        <p className="text-white max-w-lg text-lg sm:text-xl">
          La page que vous recherchez n'existe pas ou a été supprimée.
        </p>
      </div>
    </div>
  );
}

export default NotFound;
