import { useCallback, useState } from "react";

const useAsync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (asyncFn, ...params) => {
    setLoading(true);
    setError(null);

    try {
      const data = await asyncFn(...params);
      return { data, error: null };
    } catch (err) {
      setError(err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, run, setError };
};

export default useAsync;
