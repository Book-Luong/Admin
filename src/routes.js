import ListBook from './components/ListBook';
import AddBook from './components/AddBook';
import ListUser from './components/ListUser'
import AddUser from './components/AddUser'
import { AppstoreOutlined, ReadOutlined, UserOutlined,UnorderedListOutlined  } from '@ant-design/icons'
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
    {
        path: 'nopath',
        key: 10,
        parent: -1,
        icon: <UserOutlined />,
        title: 'Users',
    },
    {
        path: '/account',
        exact: true,
        key: 11,
        parent: 10,
        component: ListUser,
        icon: <UnorderedListOutlined />,
        title: 'Quản lý tài khoản',
        isMenu: true,
    },
    {
        path: '/account/add',
        exact: true,
        component: AddUser,
        key: 12,
        parent: 10,
        isMenu: false,
    },
    {
        path: '/account/:accIdUpdate',
        exact: true,
        component: AddUser,
        key: 13,
        parent: 10,
        isMenu: false,
    },
]

export default router;