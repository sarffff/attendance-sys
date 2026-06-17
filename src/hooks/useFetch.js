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
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await handlerRef.current();

        if (!cancelled && res) {
          setData(res.data || res);
        }
      } catch (error) {
        if (!cancelled) {
          message.error(error.message || "请求失败");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading };
}
