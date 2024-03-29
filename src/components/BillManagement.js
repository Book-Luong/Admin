import React, { useEffect, useState } from 'react'
import {
    useHistory,
    // useLocation 
} from 'react-router-dom'
import {
    Button,
    Table,
    message,
    Select,
    Form,
    Pagination,
    Row,
    Col,
    Input,
    DatePicker,
    Statistic,
    Card,
    Tag,
} from 'antd';
import { timestampToDate, momentObjectToDateString } from '../utils/common'
import { DATE_FORMAT, ORDER_STATUS } from '../constants/config'
import { callApi } from '../utils/callApi'
import ViewHandleHistory from './ViewHandleHistory'
import HandleClientRequest from './HandleClientRequest'
import BillDetails from './BillDetails'
const { Option } = Select;

const findStatusOrder = (status) => {
    const order = ORDER_STATUS.find(item => item.status === status);
    return order || { color: 'white', name: '' };
}

function BillManagement() {
    const history = useHistory();
    const [form] = Form.useForm();
    const [data, setData] = useState();
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [updateCount, setUpdateCount] = useState(0);
    //handle history
    const [showHistory, setShowHistory] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    //handle a bill
    const [note, setNote] = useState('');
    const [status, setStatus] = useState();
    const [isPaid, setIsPaid] = useState(false);
    const [isReallyPaid, setIsReallyPaid] = useState(false);
    const [showChangePaid, setShowChangePaid] = useState(false);
    const [currentBillId, setCurrentBillId] = useState();
    const [showHandleBill, setShowHandleBill] = useState(false);
    //bill detail
    const [showBillDetail, setShowBillDetail] = useState(false);
    const params = new URLSearchParams();

    useEffect(() => {
        handleSearch();
        // eslint-disable-next-line
    }, [updateCount])

    async function handleSearch(page = 1) {
        setCurrentPage(page);
        const {
            query = '',
            status,
            startTime,
            endTime
        } = form.getFieldsValue(true);
        const dataParams = {
            current_page: page || currentPage || 1,
            q: query
        };
        if (query) dataParams.q = query;
        if (status > -2) dataParams.status = status;
        if (startTime) dataParams.date_start = momentObjectToDateString(startTime, 'MM-DD-YYYY');
        if (endTime) dataParams.date_end = momentObjectToDateString(endTime, 'MM-DD-YYYY');
        const res = await callApi('bill', 'GET', dataParams);
        if (res && res.status === 1) {
            const data = res.data.rows;
            console.log(res.data)
            for (let item of data) {
                item.handle_history = item.handle_history ? JSON.parse(item.handle_history) : [];
            }
            setData(data);
            setTotal(res.data.count);
        }
    }

    const handleSearchSubmit = (values) => {
        const {
            status,
            query
        } = values;
        params.append('q', query);
        if (status !== -2) params.append('status', status);
        history.push({ search: params.toString() });
        setUpdateCount(pre => pre + 1);
        setCurrentPage(1);
    }
    //handle bill
    const handleClickHandleReq = (billId, status, is_paid, payment_method) => {
        setNote('');
        setCurrentBillId(billId);
        setStatus(status);
        setIsPaid(is_paid);
        if(payment_method > 0)
            setShowChangePaid(true);
        else setShowChangePaid(false);
        if (is_paid === 1) setIsReallyPaid(true);
        setShowHandleBill(true);
    }
    const handleSubmitBill = async () => {
        const dataHandle = {
            note,
            status
        }
        if (isPaid) dataHandle.is_paid = 1;
        try {
            const res = await callApi(`/bill/${currentBillId}`, 'PUT', dataHandle);
            if (res && res.status === 1) {
                message.success('Xử lý thành công');
            }
            else {
                message.error('Something wrong');
                console.log(res);
            }
            setUpdateCount(pre => pre + 1);
            setShowHandleBill(false);
        } catch (error) {
            message.error('Hệ thống đang gặp sự cố. Bạn vui lòng thử lại sau!')
        }
    }
    const columns = [
        {
            title: 'Mã đơn hàng',
            key: 'bill_id',
            align: 'center',
            dataIndex: 'bill_id',
            render: text => (
                <>
                    <strong>#{text}</strong>
                    <br />
                    <span
                        onClick={() => {
                            setCurrentBillId(text);
                            setShowBillDetail(true);
                        }}
                        style={{ color: 'blueviolet', cursor: 'pointer' }}
                    >
                        Xem chi tiết
                    </span>
                </>
            )
        },
        {
            title: 'Thông tin người đặt hàng',
            key: 'user_info',
            align: 'left',
            width: '30%',
            render: record => {
                return (
                    <>
                        <b>Họ tên: </b>{record.user_name} <br />
                        <b>Sđt: </b>{record.phone} <br />
                        <b>Địa chỉ: </b>{record.address} <br />
                        {record.user_note && <span><b>KH ghi chú: </b>{record.user_note}</span>}
                    </>
                )
            }
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            align: 'center',
            render: (text, record) => (
                <>
                    <Tag color={findStatusOrder(text).color}>{findStatusOrder(text).name}</Tag>
                    <br />
                    {
                        record.is_paid !== null && record.is_paid === 1
                        && <><strong>Đã thanh toán </strong>
                            {`[${timestampToDate(record.paid_time, 'DD/MM/YYYY HH:mm')}]`}
                        </>
                    }
                </>
            )
        },
        {
            title: 'Tổng tiền',
            key: 'total_price',
            dataIndex: 'total_price',
            align: 'center',
            render: (text) => (
                <>
                    <Statistic value={text} valueStyle={{ fontSize: '14px' }} />
                </>
            )
        },
        {
            title: 'Đặt hàng lúc',
            key: 'order_time',
            align: 'center',
            render: record => (
                <>
                    {timestampToDate(record.created_at, 'DD/MM/YYYY hh:mm a')}
                </>
            )
        },
        {
            title: 'Xử lý bởi',
            key: 'handle_by',
            align: 'center',
            width: '22%',
            render: record => (
                <>
                    <Row justify='space-between'>
                        <Button
                            onClick={() => handleClickHandleReq(record.bill_id, record.status, record.is_paid, record.payment_method)}
                            style={{ marginRight: '20px', background: 'lightgreen' }}
                            disabled={record.status === 3}
                        >
                            Xử lý
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                setHistoryData(record.handle_history);
                                setShowHistory(true);
                            }}
                        >
                            Xem lịch sử
                        </Button>
                    </Row>
                </>
            )
        },
    ]
    return (
        <>
            <HandleClientRequest
                note={note}
                setNote={setNote}
                status={status}
                setStatus={setStatus}
                setIsPaid={setIsPaid}
                isPaid={isPaid}
                isReallyPaid={isReallyPaid}
                showChangePaid={showChangePaid}
                allStatus={ORDER_STATUS.filter(item => item.status !== -2)}
                showHandleReq={showHandleBill}
                setShowHandleReq={setShowHandleBill}
                handleSubmitHandleReq={handleSubmitBill}
            />
            <ViewHandleHistory
                allStatus={ORDER_STATUS}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                historyData={historyData}
            />
            <BillDetails
                showBillDetail={showBillDetail}
                setShowBillDetail={setShowBillDetail}
                id={currentBillId}
            />
            <Card style={{ margin: '20px 0' }}>
                <Form
                    form={form}
                    onFinish={handleSearchSubmit}
                    className="ant-advanced-search-form"
                    initialValues={{ status: -2 }}
                >
                    <Row gutter={24} >
                        <Col span={6}>
                            <Form.Item label='Từ khóa' name='query'>
                                <Input
                                    style={{ width: '100%', marginRight: '20px', marginLeft: '10px' }}
                                    placeholder='mã hóa đơn, tên KH, sđt khách hàng'
                                    autoFocus={true}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label='Trạng thái' name='status'>
                                <Select>
                                    {ORDER_STATUS.map(item => <Option key={item.status} value={item.status}>{item.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={5}>
                            <Form.Item label='Từ' name='startTime'>
                                <DatePicker format={DATE_FORMAT} ></DatePicker>
                            </Form.Item>
                        </Col>
                        <Col span={5}>
                            <Form.Item label='Đến' name='endTime'>
                                <DatePicker format={DATE_FORMAT} ></DatePicker>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button type='primary' htmlType="submit">Tìm kiếm</Button>
                </Form>
            </Card>
             Tìm thấy <strong>{total}</strong> đơn hàng
            <Pagination
                onChange={(page) => handleSearch(page)}
                total={total}
                current={currentPage}
            />
            <Table
                rowKey={record => record.bill_id}
                bordered={true}
                columns={columns}
                dataSource={data}
                pagination={false}
                style={{ paddingBottom: '20px', paddingTop: '20px' }}
            />
            <Pagination
                onChange={(page) => handleSearch(page)}
                total={total}
                current={currentPage}
            />
        </>
    )
}

export default BillManagement;