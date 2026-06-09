import { useState, useCallback } from "react";

// Lightweight hook to run async calls with loading and error states
const useAsync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fn();
      setLoading(false);
      return { data };
    } catch (err) {
      setError(err);
      setLoading(false);
      return { error: err };
    }
  }, []);

  return { loading, error, run, setError };
};

export default useAsync;
