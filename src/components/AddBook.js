import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
    Form,
    Input,
    Button,
    TreeSelect,
    Select,
    Tag,
    DatePicker,
    Upload,
    message,
    Row,
    Col,
    InputNumber,
    Space,
} from 'antd'
import { Editor } from '@tinymce/tinymce-react';
import { UploadOutlined } from '@ant-design/icons'
import { useHistory, useParams } from 'react-router-dom'
import { callApi, getImageURL } from '../utils/callApi'
import { getAuthor, getPublishingHouse, getSales, getCategories } from '../actions/index'
import { timestampToDate, momentObjectToDateString, timestampToMomentObject } from '../utils/common'
import { LANGUAGES, BOOK_FORMATS, TINY_API_KEY } from '../constants/config'

import UnFindPage from './UnFindPage'
const formItemLayout = {
    labelCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 8,
        },
    },
    wrapperCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 32,
        },
    },
};
const tailFormItemLayout = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 16,
            offset: 8,
        },
    },
};
const { Option } = Select;
const AddBook = (props) => {
    const { author, sale, publishing_house, category } = props;
    const { onGetAuthors, onGetPublishingHouse, onGetSales, onGetCategories } = props;
    const { bookIdUpdate } = useParams();
    const [form] = Form.useForm();
    const [coverImgFile, setCoverImgFile] = useState(null);
    const [validPage, setValidPage] = useState(true);
    const [bookDescription, setBookDescription] = useState('');
    const history = useHistory();

    useEffect(() => {
        const getAuthors = async () => {
            const res = await callApi('author', 'GET', { row_per_page: 100000 });
            if (res && res.status === 1) {
                onGetAuthors(res.data.rows)
            }
        }
        const getSalesAPI = async () => {
            const res = await callApi('sale', 'GET', { row_per_page: 100000 });
            if (res && res.status === 1) {
                onGetSales(res.data.rows)
            }
        }
        const getPublishingHouseAPI = async () => {
            const res = await callApi('publishing_house', 'GET', { row_per_page: 100000 });
            if (res && res.status === 1) {
                onGetPublishingHouse(res.data.rows)
            }
        }
        const getCategoriesAPI = async () => {
            const res = await callApi('category', 'GET', { row_per_page: 1000000 });
            if (res && res.status === 1) {
                onGetCategories(res.data.rows)
            }
        }
        getAuthors();
        getSalesAPI();
        getPublishingHouseAPI();
        getCategoriesAPI();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (bookIdUpdate) {
            const getBookUpdate = async () => {
                const res = await callApi(`book/${bookIdUpdate}`, 'GET');
                if (res && res.status === 1) {
                    const {
                        name,
                        dimension,
                        cover_image,
                        format,
                        language,
                        weight,
                        pages,
                        quantity,
                        sale_id,
                        price,
                        book_translator,
                        category_details,
                        publishing_id,
                        published_date,
                        publisher,
                        author_id,
                        description,
                    } = res.data;
                    const dimensionArr = dimension.split(' ');
                    const languageArr = language.split(',');
                    const categoryArr = category_details.map(item => item.category_id);
                    const momentPublishedDate = timestampToMomentObject(published_date);
                    setCoverImgFile(cover_image);
                    setBookDescription(description);
                    form.setFieldsValue({
                        name,
                        format,
                        dimensionX: dimensionArr[0],
                        dimensionY: dimensionArr[2],
                        language: languageArr,
                        weight,
                        pages,
                        quantity,
                        sale_id,
                        price,
                        book_translator,
                        publishing_id,
                        published_date: momentPublishedDate,
                        publisher,
                        author_id,
                        categories: categoryArr
                    })

                }
                else {
                    setValidPage(false);
                }
            }
            getBookUpdate();
        }
    }, [bookIdUpdate, form])
    const categoryTree = () => {
        return category.filter(item =>
            item.group_id === -1
        ).map((i) => {
            const newItem = {
                title: <Space>{i.name}{i.active === 0 && <Tag color='red'>Inactive</Tag>}</Space>,
                value: i.category_id, key: i.category_id
            };
            const filterChildren = category
                .filter(item => item.group_id === i.category_id)
                .map((item) => {
                    const itemChildren = {
                        title: <Space>{item.name}{item.active === 0 && <Tag color='red'>Inactive</Tag>}</Space>,
                        value: item.category_id,
                        key: item.category_id
                    }
                    return itemChildren;
                });
            newItem.children = filterChildren;
            return newItem;
        })
    }
    const onFinish = async (values) => {
        const {
            name,
            format,
            language,
            weight,
            dimensionY,
            dimensionX,
            pages,
            quantity,
            sale_id,
            price,
            book_translator,
            categories,
            publishing_id,
            published_date,
            publisher,
            author_id,
        } = values;
        const dimension = `${dimensionX} x ${dimensionY} cm`;
        const languageStr = language.join(',');
        const data = {
            image_file_name: coverImgFile,
            name,
            author_id,
            description: bookDescription,
            pages,
            dimension,
            weight,
            publisher,
            published_date: momentObjectToDateString(published_date, 'MM-DD-YYYY'),
            publishing_id,
            format,
            book_translator,
            quantity,
            price,
            sale_id,
            language: languageStr,
        }
        try {
            if (!bookIdUpdate) {
                const res = await callApi('book', 'POST', data);
                if (res && res.status === 1) {
                    const { book_id } = res.data;
                    const resAddBookCate = await callApi(`book/${book_id}/categories`, 'POST', { category: categories });
                    if (resAddBookCate && resAddBookCate.status === 1) {
                        message.success('Đã thêm sách thành công!');
                        setCoverImgFile(null);
                        setBookDescription('');
                       // form.resetFields();
                    }
                }
                if (res && res.status === 0) {
                    message.warn(res.msg);
                }
            }
            else {
                const res = await callApi(`book/${bookIdUpdate}`, 'PUT', data);
                if (res && res.status === 1) {
                    const resAddBookCate = await callApi(`book/${bookIdUpdate}/categories`, 'POST', { category: categories });
                    if (resAddBookCate && resAddBookCate.status === 1) {
                        message.success('Đã cập nhật sách thành công!');
                        history.push('/book');
                    }
                }
            }
        } catch (err) {
            console.log(err);
            message.error('Rất tiếc. Hiện tại không thể thêm sách.')
        }
    }
    const onImagePreview = () => {
        window.open(getImageURL(coverImgFile), '_blank');
    }
    const customRequest = async ({ file, onSuccess }) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await callApi('upload', 'POST', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res) {
                setCoverImgFile(res);
                onSuccess('ok');
            }
        } catch (err) {
            message.error('Không thể upload file lúc này.')
        }
    };

    const onCoverImageChange = (info) => {
        switch (info.file.status) {
            case "uploading":
                break;
            case "done":
                // message.success(`${info.file.name} file được tải lên thành công`);
                break;
            case "removed":
                setCoverImgFile(null);
                break;
            default:
                // error or removed
                setCoverImgFile(null);
        }
    }

    return (
        <>
            {
                !validPage ? <UnFindPage /> :
                    <Form
                        {...formItemLayout}
                        form={form}
                        name="addbook"
                        onFinish={onFinish}
                        initialValues={{ language: [LANGUAGES[0]], format: BOOK_FORMATS[0] }}
                        scrollToFirstError
                    >
                        <Row gutter={24}>
                            <Col lg={12}>
                                <Form.Item
                                    name="name"
                                    label='Tên sách'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập tên sách!',
                                            whitespace: true,
                                        }
                                    ]}
                                    hasFeedback
                                >
                                    <Input autoFocus />
                                </Form.Item>
                    Giới thiệu sách:
                    <Editor
                                    apiKey={TINY_API_KEY}
                                    value={bookDescription}
                                    init={{
                                        height: 400,
                                        menubar: false,
                                        plugins: [
                                            'advlist autolink lists link image charmap print preview anchor',
                                            'searchreplace visualblocks code fullscreen',
                                            'image code',
                                            'insertdatetime media table paste code help wordcount'
                                        ],
                                        toolbar: 'bold italic underline | alignleft aligncenter alignright alignjustify table bullist | link image editimage preview | fontsizeselect',
                                        images_reuse_filename: true,
                                        images_upload_handler: async function (blobInfo, success, failure) {
                                            const formData = new FormData();
                                            formData.append('image', blobInfo.blob());
                                            try {
                                                const res = await callApi('upload', 'POST', formData);
                                                if (res) {
                                                    success(getImageURL(res));
                                                }
                                            } catch (err) {
                                                failure('Không thể upload ảnh');
                                            }

                                        },
                                    }}
                                    onEditorChange={(content) => { setBookDescription(content) }}
                                />
                                {!bookDescription ? <p style={{ color: 'red' }}>Giới thiệu sách không được bỏ trống</p>
                                    : <br />
                                }

                                <Form.Item
                                    name="author_id"
                                    label="Tác giả"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng chọn tác giả!',
                                        },
                                    ]}
                                    hasFeedback
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) => {
                                            return option.children.props.children[0].toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                        }
                                    >
                                        {
                                            author.map(item =>
                                                <Option key={item.author_id} value={item.author_id}>
                                                    <Space>
                                                        {item.name}
                                                        {!item.active && <Tag color='error' style={{ fontWeight: 600 }}>Inactive</Tag>}
                                                    </Space>
                                                </Option>)
                                        }
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    name='book_translator'
                                    label='Người dịch'
                                >
                                    <Input />
                                </Form.Item>

                                <Form.Item
                                    name="publisher"
                                    label='Nhà xuất bản'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập tên nhà xuất bản',
                                            whitespace: true,
                                        }
                                    ]}
                                    hasFeedback
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="price"
                                    label='Giá bìa'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập giá bìa',
                                        }
                                    ]}
                                    hasFeedback
                                >
                                    <InputNumber
                                        min={0}
                                        style={{ width: '100%' }}
                                        formatter={value => `${value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col lg={12} >
                                <Form.Item
                                    label="Ảnh bìa"
                                >
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <Form.Item
                                            noStyle
                                            name="cover_img"
                                            rules={[
                                                {
                                                    validator: () => {
                                                        if (!coverImgFile) return Promise.reject('Ảnh bìa không được để trống');
                                                        else
                                                            return Promise.resolve();
                                                    }
                                                }
                                            ]}
                                        >
                                            <Upload
                                                listType="picture-card"
                                                className="avatar-uploader"
                                                onChange={onCoverImageChange}
                                                maxCount={1}
                                                customRequest={customRequest}
                                                onPreview={onImagePreview}
                                                progress={{
                                                    strokeColor: {
                                                        '0%': '#108ee9',
                                                        '100%': '#87d068',
                                                    },
                                                    strokeWidth: 3,
                                                    format: percent => `${parseFloat(percent.toFixed(2))}%`,
                                                }}
                                            >
                                                <UploadOutlined />
                                    Upload
                                </Upload>
                                        </Form.Item>
                                        {coverImgFile && <img src={getImageURL(coverImgFile)} alt="avatar" width={100} height='auto' style={{ float: 'left' }} />}
                                    </div>
                                </Form.Item>
                                <Form.Item
                                    name="publishing_id"
                                    label="Nhà phát hành"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng chọn Nhà phát hành!',
                                        },
                                    ]}
                                    hasFeedback
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.children.props.children[0].toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {
                                            publishing_house.map(item =>
                                                <Option key={item.publishing_id} value={item.publishing_id}>
                                                    <Space>
                                                        {item.name}
                                                        {!item.active && <Tag color='error' style={{ fontWeight: 600 }}>Inactive</Tag>}
                                                    </Space>
                                                </Option>)
                                        }
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    name="published_date"
                                    label='Ngày phát hành'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập ngày phát hành',
                                        }
                                    ]}
                                    hasFeedback
                                >
                                    <DatePicker format='DD/MM/YYYY' placeholder='DD/MM/YYYY' />
                                </Form.Item>
                                <Form.Item
                                    name='categories'
                                    label='Loại sách'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng chọn loại sách!',
                                        },
                                    ]}
                                    hasFeedback
                                >
                                    <TreeSelect
                                        treeData={categoryTree()}
                                        showSearch
                                        allowClear
                                        multiple
                                        filterTreeNode={(input, cate) => cate.title.props.children[0].toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        placeholder='Please select'
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="sale_id"
                                    label="Khuyến mại"
                                >
                                    <Select
                                        showSearch
                                        allowClear={true}
                                        optionFilterProp="saleItem"
                                        filterOption={(input, option) => {
                                            return option.children[1].props.children[0].toString().indexOf(input) >= 0;
                                        }}
                                    >
                                        {
                                            sale.map(item =>
                                                <Option key={item.sale_id} value={item.sale_id}>
                                                    Giảm:
                                                     <span style={{ color: 'green', fontWeight: 600 }}>
                                                        {item.percent}%
                                                    </span>
                                                    <Space>
                                                        <span style={{ color: 'tomato' }}>
                                                            [{timestampToDate(item.date_start)}-{timestampToDate(item.date_end)}]
                                                    </span>
                                                        {!item.active && <Tag color='error' style={{ fontWeight: 600 }}>Inactive</Tag>}
                                                    </Space>
                                                </Option>)
                                        }
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    name='quantity'
                                    label='Số lượng'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập số lượng sách',
                                        }
                                    ]}
                                    hasFeedback
                                >
                                    <InputNumber min={0} />
                                </Form.Item>
                                <Form.Item
                                    name='pages'
                                    label='Số trang sách'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập số trang sách',
                                        }
                                    ]}
                                    hasFeedback
                                >
                                    <InputNumber min={0} />
                                </Form.Item>
                                <Form.Item
                                    name='dimension'
                                    label='Kích thước sách(cm)'
                                >
                                    <Input.Group compact>
                                        <Form.Item
                                            name='dimensionX'
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Vui lòng nhập chiều dài sách',
                                                }
                                            ]}
                                            hasFeedback
                                            noStyle
                                        >
                                            <InputNumber style={{ width: 100, textAlign: 'center' }} placeholder="Chiều dài" min={0} />
                                        </Form.Item>
                                        <Input
                                            className="site-input-split"
                                            style={{
                                                width: 30,
                                                borderLeft: 0,
                                                borderRight: 0,
                                                pointerEvents: 'none',
                                            }}
                                            value='X'
                                            disabled
                                        />
                                        <Form.Item
                                            name='dimensionY'
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Vui lòng nhập chiều rộng sách',
                                                }
                                            ]}
                                            hasFeedback
                                            noStyle
                                        >
                                            <InputNumber
                                                className="site-input-right"
                                                style={{
                                                    width: 100,
                                                    textAlign: 'center',
                                                }}
                                                placeholder="Chiều rộng"
                                                min={0}
                                            />

                                        </Form.Item>
                                    </Input.Group>
                                </Form.Item>
                                <Form.Item
                                    name='weight'
                                    label='Khối lượng sách(gam)'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập khối lượng sách',
                                        }
                                    ]}
                                    hasFeedback
                                >
                                    <InputNumber min={0} />
                                </Form.Item>

                                <Form.Item
                                    name='language'
                                    label='Ngôn ngữ'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng chọn ngôn ngữ sách',
                                        }
                                    ]}
                                    hasFeedback
                                >
                                    <Select
                                        showSearch
                                        mode='multiple'
                                        allowClear={true}
                                    >
                                        {
                                            LANGUAGES.map((item, index) =>
                                                <Option key={index} value={item}>
                                                    {item}
                                                </Option>)
                                        }
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    name='format'
                                    label='Định dạng'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng chọn định dạng sách',
                                        }
                                    ]}
                                    hasFeedback

                                >
                                    <Select
                                        showSearch
                                        allowClear={true}
                                    >
                                        {
                                            BOOK_FORMATS.map((item, index) =>
                                                <Option key={index} value={item}>
                                                    {item}
                                                </Option>)
                                        }
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item {...tailFormItemLayout}>
                            <Button type="primary" htmlType="submit" size="large">
                                {!bookIdUpdate ? 'Thêm' : 'Cập nhật'}
                            </Button>
                        </Form.Item>
                    </Form >
            }</>
    )
}

const mapStateToProps = ({ author, sale, publishing_house, category }) => {
    return { author, sale, publishing_house, category }
}
const mapDispatchToProps = (dispatch) => {
    return {
        onGetAuthors: (author) => dispatch(getAuthor(author)),
        onGetSales: (sales) => dispatch(getSales(sales)),
        onGetPublishingHouse: (publishing_house) => dispatch(getPublishingHouse(publishing_house)),
        onGetCategories: (category) => dispatch(getCategories(category))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddBook);