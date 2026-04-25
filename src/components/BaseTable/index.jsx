import { Table } from "antd";
import { useState, useMemo, useCallback } from "react";
import { useFetch } from "../../hooks/useFetch";

const BaseTable = ({ columns, request, params , rowSelection = false , isRefresh = false }) => {
    const [pagination, setPagination] = useState({ pageNum: 1, pageSize: 10 });
    const [prevParams, setPrevParams] = useState(params);

    if (prevParams !== params) {
        setPrevParams(params);
        setPagination((prev) => ({ ...prev, pageNum: 1 }));
    }

    const fetchParams = useMemo(
        () => ({
            ...params,
            pageNum: pagination.pageNum,
            pageSize: pagination.pageSize,
            _refresh: isRefresh,
        }),
        [params, pagination, isRefresh],
    );

    const { data, loading } = useFetch(
        () => request(fetchParams),
        [fetchParams],
    );
    const { records, total } = data || {};

    const handleTableChange = useCallback((paginationInfo) => {
        setPagination({
            pageNum: paginationInfo.current,
            pageSize: paginationInfo.pageSize,
        });
    }, []);

    const paginationConfig = {
                current: pagination.pageNum,
                pageSize: pagination.pageSize,
                total,
                showQuickJumper: true,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total) => `共 ${total} 条`,
            }


    return (
        <Table
            rowKey="id"
            columns={columns}
            dataSource={records || []}
            loading={loading}
            scroll={{ x: "max-content" }}
            pagination={paginationConfig}
            onChange={handleTableChange}
            rowSelection={rowSelection}
        />
    );
};

export default BaseTable;
