// 示例图代码用的是如下
// document.querySelector('#app').innerHTML = `recommendList.js`
// 为了方便返回请使用下面的提示

import { getRecommendList } from "../service/ajax.js";
import { formatCreateTime, formatSongTime, songListFilter } from "../util/util.js";
import { PlayerCoverBackMode, initPlayerControl, playerListRender } from "../home/control.js";

const recommendDetail = {
  playlist: [],
  detail: {},
  listActive: 0,
};

// 推荐歌单详情初始化
export const recommendListPage = async ({ params = "" }) => {
  document.querySelector("#app").innerHTML = `加载中`;
  const result = await getRecommendList(params);
  if (result.code == 404) {
    document.querySelector("#app").innerHTML = `未找到资源`;
  } else {
    recommendDetail.detail = result.playlist;
    recommendDetail.playlist = result.playlist.tracks;
    initDescribe();
    initList();
    initEvent();
    initPlayerControl(isPlayProxy.isPlay);
  }
  const musicId = window.localStorage.getItem("musicId");
  window.localStorage.setItem("lastRecommendId", params);
  PlayerCoverBackMode("player", musicId);
};

function initDescribe() {
  //推荐歌单描述初始化
  let tagsTemplate = "";
  recommendDetail.detail.tags.forEach((tag, index) => {
    index == recommendDetail.detail.tags.length - 1
      ? (tagsTemplate += `<span class="tag">${tag}  </span>`)
      : (tagsTemplate += `<span class="tag">${tag} / </span>`);
  });
  let time = formatCreateTime(recommendDetail.detail.createTime);
  document.querySelector("#app").innerHTML = `
<div class="w">
    <div class="recommend-header">
        <a href="#home">首页</a>/
        <span>推荐歌单页</span>
    </div>
    <div class="recommend-wrapper">
    <!-- 此处为推荐页，内容主要包括两个部分：歌单介绍和歌单列表 -->
        <div class="recommend-describe d-flex justify-content-start">
        <!-- 歌单介绍 -->
            <div class="recommend-describe-left">
                <img src="${recommendDetail.detail.coverImgUrl}" alt="">
            </div>
            <div class="recommend-describe-right d-flex flex-column align-items-start">
                <h4 class="recommend-describe-right-title single-text-omitted">
                    ${recommendDetail.detail.name}
                </h4>
                <div class="recommend-describe-right-creator d-flex">
                    <img class="avatar"
                        src="${recommendDetail.detail.creator.avatarUrl}"
                        alt="">
                    <span class="creator">${recommendDetail.detail.creator.detailDescription}</span>
                    <span class="create-time">${time}</span>
                </div>
                <div class="recommend-describe-right-add d-flex">
                    <span class="btn">播放全部</span><span class="add">+</span>
                </div>
                <div class="recommend-describe-right-info">
                    <div class="info">
                        <span class="label">标签：</span>
                        ${tagsTemplate}
                    </div>
                    <div class="info">
                        <span class="label">歌曲：</span>
                        <span class="label-info">${recommendDetail.detail.trackCount}</span>
                        <span class="label">播放：</span>
                        <span class="label-info">${recommendDetail.detail.playCount}</span>
                    </div>
                    <div class="info single-text-omitted ">
                        <span class="label">简介：</span>
                        <span class="label-info ">${recommendDetail.detail.description}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="recommend-list">
            <!-- 歌单列表  -->
            <h4 class="recommend-list-title">
            歌曲列表
            </h4>
            <ul class="recommend-list-songlist-header d-flex justify-content-start">
                <li class="songlist-header-name">歌曲</li>
                <li class="songlist-header-author">歌手</li>
                <li class="songlist-header-album">专辑</li>
                <li class="songlist-header-time">时长</li>
            </ul>
            <ul class="recommend-list-songlist-body">
            </ul>
        </div>
    </div>
</div>
<div class='player-list-div display-none'>
    <h3 class='player-list-header'>播放列表</h3>
    <ul class='player-list-ul'>
        <!-- 播放器列表需要动态生成 -->
    </ul>
</div>
`;
}

// 歌单列表初始化
function initList() {
  const listDom = document.getElementsByClassName(
    "recommend-list-songlist-body"
  )[0];
  let listTemplate = "";
  let isEvenOrOdd = "";
  recommendDetail.playlist.forEach((item, index) => {
    isEvenOrOdd = index % 2 == 0 ? "even" : "odd";
    listTemplate += `
        <li class="songlist-item ${isEvenOrOdd} ${activeProxy.active == item.id ? 'active' : ''} d-flex justify-content-start" data-index=${item.id
      }>
            <div class="songlist-number font-color">
                <span class="index">${index + 1}</span>
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-shoucang"></use>
                </svg>
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-xiazai"></use>
                </svg>
            </div>
            <div class="songlist-songname">
                ${item.name}
            </div>
            <div class="songlist-artist font-color">
                ${item.ar[0].name}
            </div>
            <div class="songlist-album font-color">
                ${item.al.name}
            </div>
            <div class="songlist-time font-color">
            ${Math.floor(item.dt / 1000 / 60)}:${Math.round(
        (item.dt / 1000) % 60
      )}
            </div>
        </li>
        `;
  });
  listDom.innerHTML = listTemplate;

}

import { reactive } from "../util/reactive.js";
//响应式数据：当数据改变时，执行歌单列表初始化函数
const activeProxy = reactive(
  {
    active: recommendDetail.listActive,
  },
  initList
);

function initEvent() {
  const songListWrap = document.querySelector(".recommend-list-songlist-body");
  let mouseEnterTimer;
  function handleMouseEnter(e) {
    clearTimeout(mouseEnterTimer);
    mouseEnterTimer = setTimeout(() => {
      const targetName = e.target.nodeName.toLocaleLowerCase();
      if (targetName == "li") {
        const id = e.target.getAttribute("data-index");
        activeProxy.active = id;
      }
    }, 1); // 100 毫秒的延迟，可以根据实际情况调整
  }
  songListWrap.addEventListener(
    "mouseenter",
    handleMouseEnter,
    true
  );
  songListWrap.addEventListener(
    "dblclick",
    async (e) => {
      //修改列表的播放图标
      const targetName = e.target.nodeName.toLocaleLowerCase();
      if (targetName == "li") {
        const id = e.target.getAttribute("data-index");
        isPlayProxy.active = id;
        window.localStorage.setItem("musicId", id);
      } else if (targetName == "div") {
        const id = e.target.parentNode.getAttribute("data-index");
        isPlayProxy.active = id;
        window.localStorage.setItem("musicId", id);
      }
      isPlayProxy.isPlay = true;
      initPlayerControl(!isPlayProxy.isPlay);
    },
    true
  );
  /* 点击将歌曲列表添加到播放列表中 */
  const addSongList = document.querySelector(".recommend-describe-right-add");
  addSongList.addEventListener("click", () => {
    // 添加不重复的歌曲列表
    const arr = songListFilter(recommendDetail.playlist);
    //将数组加入到localStorage中
    window.localStorage.setItem("songList", JSON.stringify(arr));
    //动态生成播放列表
    playerListRender();
  });
}

//渲染播放器
// 双击播放音乐涉及到的变量，变量改变前面的播放标志也改变
const isPlayProxy = reactive(
  {
    active: recommendDetail.listActive, //存放音乐的id
    isPlay: false, //歌曲是否在播放
  },
  initList
);