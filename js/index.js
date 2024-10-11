window.addEventListener('load', () => {
  console.log('load')
  const script = document.createElement('SCRIPT')
  script.src = './js/home/home.js'
  script.setAttribute('type', 'module')
  document.querySelector('body').appendChild(script)
  // 监听页面 load 和 hashchange 事件，事件触发后对代理对象赋值
  hashProxy.hash = window.location.hash;
  changeComponent();
  //加载音乐
  initControl();
})
//导入对应的页面初始化函数
import { homePage } from "./home/home.js";
import { recommendListPage } from "./recommendList/recommendList.js";
import { reactive } from "./util/reactive.js"
import { playerPage } from "./playser/player.js";
import { PlayerCoverBackMode } from "./home/control.js"

//路由表
const routers = [
  {
    name: "home",
    path: "/home",
    component: homePage,
  },
  {
    name: "recommendList",
    path: "/recommendList",
    component: recommendListPage,
  },
  {
    name: 'player',
    path: '/player',
    component: playerPage
  }
];
//数据响应式执行函数
let effective = () => changeComponent();
// 数据响应式处理
export const hashProxy = reactive(
  {
    hash: "",
  },
  effective
);

//导入hash信息提取函数
import { getRouterOptions } from "./util/util.js"

// let hash;

function changeComponent() {
  let options = getRouterOptions(hashProxy.hash);
  const [{ component }] = routers.filter(
    (router) => router.name == options.name
  );
  component(options);
  document.querySelector("#header-title").innerHTML = options.name;
}

window.addEventListener("hashchange", () => {
  localStorage.setItem('backPage', JSON.stringify(hashProxy.hash.match(/#\/(.*)\//) == null ? 'home' : hashProxy.hash.match(/#\/(.*)\//)[1]))
  hashProxy.hash = window.location.hash;
  changeComponent();
});

import { initPlayerControl, initPlayerEvent } from "./home/control.js";

function initControl() {
  //初始化的时候加载歌曲
  window.localStorage.setItem("songList", JSON.stringify([]));
  initPlayerControl(true);
  //绑定底部控制栏的事件
  initPlayerEvent();

}
