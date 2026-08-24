import Loader from './Loader';

const withLoading = (WrappedComponent, loaderProps = {}) => {
  const WithLoading = (props) => {
    const { loading, ...rest } = props;

    if (loading) {
      return <Loader {...loaderProps} />;
    }

    return <WrappedComponent {...rest} />;
  };

  WithLoading.displayName = `withLoading(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithLoading;
};

export default withLoading;
