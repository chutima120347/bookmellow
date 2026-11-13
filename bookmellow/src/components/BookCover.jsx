const BookCover = ({ src, title, className = "" }) => {
  const defaultPlaceholder = "https://placehold.co/300x400/FFDFDF/4A3E3D?text=BookMellow";

  return (
    <img
      src={src || defaultPlaceholder}
      alt={title || "Book Cover"}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = defaultPlaceholder;
      }}
      className={className || "w-full h-full object-cover group-hover:scale-105 transition duration-300"}
    />
  );
};
export default BookCover;