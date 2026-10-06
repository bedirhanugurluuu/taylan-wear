type IconProps = {
  className?: string;
  size?: number;
};

export function IconSearch({className, size = 20}: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function IconCart({className, size = 20}: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 7h15l-1.5 9h-12z" />
      <path d="M6 7L5 3H2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

export function IconWishlist({
  className,
  size = 20,
  filled = false,
}: IconProps & {filled?: boolean}) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 9 9"
      fill="none"
      aria-hidden="true"
    >
      {filled ? (
        <path
          d="M1.125 1.125C1.125 0.826631 1.24353 0.540483 1.4545 0.329505C1.66548 0.118526 1.95163 0 2.25 0H6.75C7.04837 0 7.33452 0.118526 7.5455 0.329505C7.75647 0.540483 7.875 0.826631 7.875 1.125V8.71875C7.87497 8.76962 7.86115 8.81954 7.835 8.86317C7.80885 8.90681 7.77135 8.94254 7.7265 8.96655C7.68165 8.99057 7.63113 9.00196 7.58031 8.99953C7.5295 8.9971 7.48029 8.98093 7.43794 8.95275L4.5 7.36931L1.56206 8.95275C1.51971 8.98093 1.4705 8.9971 1.41969 8.99953C1.36887 9.00196 1.31835 8.99057 1.2735 8.96655C1.22865 8.94254 1.19115 8.90681 1.165 8.86317C1.13885 8.81954 1.12503 8.76962 1.125 8.71875V1.125Z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M1.125 1.125C1.125 0.826631 1.24353 0.540483 1.4545 0.329505C1.66548 0.118526 1.95163 0 2.25 0L6.75 0C7.04837 0 7.33452 0.118526 7.5455 0.329505C7.75647 0.540483 7.875 0.826631 7.875 1.125V8.71875C7.87497 8.76962 7.86115 8.81954 7.835 8.86317C7.80885 8.90681 7.77135 8.94254 7.7265 8.96655C7.68165 8.99057 7.63113 9.00196 7.58031 8.99953C7.5295 8.9971 7.48029 8.98093 7.43794 8.95275L4.5 7.36931L1.56206 8.95275C1.51971 8.98093 1.4705 8.9971 1.41969 8.99953C1.36887 9.00196 1.31835 8.99057 1.2735 8.96655C1.22865 8.94254 1.19115 8.90681 1.165 8.86317C1.13885 8.81954 1.12503 8.76962 1.125 8.71875V1.125ZM2.25 0.5625C2.10082 0.5625 1.95774 0.621763 1.85225 0.727252C1.74676 0.832742 1.6875 0.975816 1.6875 1.125V8.19337L4.34419 6.79725C4.39035 6.76653 4.44455 6.75014 4.5 6.75014C4.55545 6.75014 4.60965 6.76653 4.65581 6.79725L7.3125 8.19337V1.125C7.3125 0.975816 7.25324 0.832742 7.14775 0.727252C7.04226 0.621763 6.89918 0.5625 6.75 0.5625H2.25Z"
          fill="currentColor"
        />
      )}
    </svg>
  );
}

/** @deprecated Use IconWishlist */
export function IconHeart(props: IconProps & {filled?: boolean}) {
  return <IconWishlist {...props} />;
}

export function IconUser({className, size = 20}: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19.5c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
    </svg>
  );
}

export function IconMenu({className, size = 20}: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
