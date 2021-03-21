import React from 'react'
import { Layout, Menu } from 'antd';
import { useHistory } from 'react-router-dom'
import routes from '../../routes'
const { Sider } = Layout;
const { SubMenu } = Menu;
export default function SiderComponent() {
    const history = useHistory();
    return (
        <Sider width={200} >
            <Menu
                mode="inline"
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                style={{ height: '100%', borderRight: 0 }}
            >
                {
                    routes
                        .filter(item => item.parent === -1)
                        .map(item =>
                            <SubMenu key={item.key} icon={item.icon} title={item.title} >
                                {
                                    routes
                                        .filter(i => i.parent === item.key && i.isMenu)
                                        .map((sub, index) =>
                                            <Menu.Item key={index} icon={sub.icon} onClick={() => history.push(sub.path)}>
                                                {sub.title}
                                            </Menu.Item>
                                        )
                                }
                            </SubMenu>
                        )

                }

            </Menu>
        </Sider>
    )
}