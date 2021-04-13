import ListBook from './components/ListBook';
import AddBook from './components/AddBook';
import ListUser from './components/ListUser'
import AddUser from './components/AddUser'
import ListCategory from './components/ListCategory'
import AddCategory from './components/AddCategory'
import OrderingCategory from './components/OrderingCategory'
import ListPublishingHouse from './components/ListPublishingHouse'
import AddPublishingHouse from './components/AddPublishingHouse'

import {
    AppstoreOutlined,
    ReadOutlined,
    UserOutlined,
    UnorderedListOutlined,
    ApartmentOutlined,
    BankOutlined

} from '@ant-design/icons'
const router = [
    //book
    {
        path: 'nopath',
        key: 1,
        parent: -1,
        icon: <AppstoreOutlined />,
        title: 'Quản lý nội dung',
    },
    {
        path: '/book',
        exact: true,
        component: ListBook,
        key: 2,
        parent: 1,
        isMenu: true,
        icon: <ReadOutlined />,
        title: 'Quản lý sách'
    },
    {
        path: '/book/add',
        exact: true,
        component: AddBook,
        key: 3,
        parent: 1,
        isMenu: false,
    },
    {
        path: '/book/edit/:bookIdUpdate',
        exact: true,
        component: AddBook,
        key: 4,
        parent: 1,
        isMenu: false,
    },
    //category
    {
        path: '/category',
        exact: true,
        component: ListCategory,
        key: 10,
        parent: 1,
        isMenu: true,
        icon: <ApartmentOutlined />,
        title: 'Quản lý danh mục sách'
    },
    {
        path: '/category/add',
        exact: true,
        component: AddCategory,
        key: 11,
        parent: 10,
        isMenu: false,
    },
    {
        path: '/category/edit/:catIdUpdate',
        exact: true,
        component: AddCategory,
        key: 12,
        parent: 10,
        isMenu: false,
    },
    {
        path: '/category/arrange',
        exact: true,
        component: OrderingCategory,
        key: 13,
        parent: 10,
        isMenu: false,
    },//publishing-house
    {
        path: '/publishing-house',
        exact: true,
        component: ListPublishingHouse,
        key: 20,
        parent: 1,
        isMenu: true,
        icon: <BankOutlined />,
        title: 'Quản lý nhà phát hành'
    },
    {
        path: '/publishing-house/add',
        exact: true,
        component: AddPublishingHouse,
        key: 21,
        parent: 20,
        isMenu: false,
    },
    {
        path: '/publishing-house/edit/:pubIdUpdate',
        exact: true,
        component: AddPublishingHouse,
        key: 22,
        parent: 20,
        isMenu: false,
    },
    //users
    {
        path: 'nopath',
        key: 50,
        parent: -1,
        icon: <UserOutlined />,
        title: 'Users',
    },
    {
        path: '/account',
        exact: true,
        key: 51,
        parent: 50,
        component: ListUser,
        icon: <UnorderedListOutlined />,
        title: 'Quản lý tài khoản',
        isMenu: true,
    },
    {
        path: '/account/add',
        exact: true,
        component: AddUser,
        key: 52,
        parent: 50,
        isMenu: false,
    },
    {
        path: '/account/:accIdUpdate',
        exact: true,
        component: AddUser,
        key: 53,
        parent: 10,
        isMenu: false,
    }
]

export default router;