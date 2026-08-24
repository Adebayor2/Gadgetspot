const Loader = ({
  text = 'Loading...',
  size = 'md',
  fullscreen = false,
  className = '',
}) => {
  const ringSizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const imgSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`relative ${ringSizes[size]}`}>
        <div className="absolute inset-0 rounded-full border-[3px] border-sky-100 border-t-sky-500 border-r-sky-500/30 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/gadgetspot-logo.png"
            alt="GadgetSpot"
            className={`${imgSizes[size]} object-contain animate-logo-pulse`}
          />
        </div>
      </div>
      {text && (
        <p className={`${textSizes[size]} font-semibold text-slate-500 tracking-wide`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Loader;
