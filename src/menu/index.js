import { uniqueId } from 'lodash'

/**
 * @description 给菜单数据补充上 path 字段
 * @description https://github.com/d2-projects/d2-admin/issues/209
 * @param {Array} menu 原始的菜单数据
 */
function supplementPath (menu) {
  return menu.map(e => ({
    ...e,
    path: e.path || uniqueId('d2-menu-empty-'),
    ...e.children ? {
      children: supplementPath(e.children)
    } : {}
  }))
}

export const menuHeader = supplementPath([
  { path: '/index', title: '首页', icon: 'home' },
  {
    title: '房东管理',
    icon: 'folder-o'
  },
  {
    title: '物业管理',
    icon: 'folder-o',
    children: [
      { path: '/page1', title: 'fang管理' },
      { path: '/page2', title: '房间管理' },
      { path: '/page2', title: '房客管理' }

    ]
  }
])

export const menuAside = supplementPath([
  { path: '/index', title: '首页', icon: 'home' },
  {
    title: '房东管理',
    icon: 'folder-o',
    path: '/fds'
  },
  {
    title: '物业管理',
    icon: 'folder-o',
    children: [
      { path: '/fang', title: 'fang管理' },
      { path: '/room', title: '房间管理' },
      { path: '/live', title: '房客管理' }
    ]
  }
])
