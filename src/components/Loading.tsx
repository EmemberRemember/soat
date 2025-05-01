export default function Loading({
  size,
  className,
}: {
  size?: string;
  className?: string;
}) {
  if (size === "small") {
    return (
      <div className={`${className ? className : "absolute"}`}>
        <img
          src="/images/icons/loading-spinner.svg"
          alt="loading"
          width={30}
          height={30}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex justify-center items-center w-full my-40 ${className}`}
    >
      <img
        src="/images/icons/loading-spinner.svg"
        alt="loading"
        width={50}
        height={50}
      />
    </div>
  );
}
