import { useState, useEffect, useRef } from "react";
import { message } from "antd";

/**
 * @param {Function} handler 异步请求函数
 * @param {Array} deps 触发请求更新的依赖项，默认为空数组（仅挂载时执行）
 */
export function useFetch(handler, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await handlerRef.current();

        if (isMounted && res) {
          setData(res.data || res);
        }
      } catch (error) {
        if (isMounted) {
          message.error(error.message || "请求失败");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading };
}
